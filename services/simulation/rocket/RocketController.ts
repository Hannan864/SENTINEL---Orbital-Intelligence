
import * as THREE from 'three';
import { RocketState, RocketParameters } from './RocketState';
import { RocketPhysicsEngine } from './RocketPhysicsEngine';
import { CONSTANTS } from '../../physics/physicsConstants';
import { TRAJECTORY_COLORS } from '../missionRules';

export class RocketController {
    public state: RocketState;
    public config: RocketParameters;
    public status: 'IDLE' | 'COUNTDOWN' | 'ASCENT' | 'COAST' | 'ORBIT' | 'CRASHED' = 'IDLE';
    
    // Simulation Control
    public timeWarp: number = 1.0;
    public elapsedTime: number = 0;
    
    // Telemetry Buffer for Plots
    public history: { t: number, alt: number, vel: number, q: number }[] = [];

    constructor(config: RocketParameters) {
        this.config = config;
        this.reset();
    }

    public reset() {
        // Init Position based on Launch Lat/Lon
        // Convert Geodetic (Lat, Lon, Alt) to Cartesian ECEF/ECI
        const r = CONSTANTS.R_EARTH_M + (this.config.launch.altitude || 10); 
        const latRad = this.config.launch.lat * (Math.PI / 180);
        const lonRad = this.config.launch.lon * (Math.PI / 180);

        // Standard Math for Sphere surface point
        // In Three.js: Y is Up. 
        // We map Lat/Lon to a Sphere where Y is Polar Axis? No, usually Y is Up in 3D scene.
        // Let's assume standard ThreeJS sphere mapping:
        // x = r * cos(lat) * cos(lon)
        // z = -r * cos(lat) * sin(lon)
        // y = r * sin(lat)
        
        const x = r * Math.cos(latRad) * Math.cos(lonRad);
        const y = r * Math.sin(latRad);
        const z = -r * Math.cos(latRad) * Math.sin(lonRad);

        const pos = new THREE.Vector3(x, y, z);
        
        // Init Velocity (Earth Rotation at this latitude)
        const omega = 7.2921159e-5; 
        const vTangential = new THREE.Vector3(-z, 0, x).multiplyScalar(omega);

        // Init Orientation (Upright relative to surface normal)
        const up = pos.clone().normalize();
        const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);

        this.state = {
            position: pos,
            velocity: vTangential,
            orientation: orientation,
            angularVelocity: new THREE.Vector3(0, 0, 0),
            mass: this.config.mass.dry + this.config.mass.fuel + this.config.mass.payload,
            fuel: this.config.mass.fuel,
            throttle: 0,
            stage: 1,
            acceleration: new THREE.Vector3(0,0,0),
            status: 'IDLE',
            timestamp: 0
        };
        
        this.status = 'IDLE';
        this.elapsedTime = 0;
        this.history = [];
    }

    public launch() {
        if (this.status === 'IDLE') {
            this.status = 'ASCENT';
            this.state.throttle = 1.0;
            console.log("[MC] LAUNCH COMMIT. CLOCK START.");
        }
    }

    public stop() {
        this.state.throttle = 0;
        this.status = 'COAST';
    }

    public update(dt: number) {
        if (this.status === 'IDLE' || this.status === 'CRASHED') return;

        const maxStep = 0.05; 
        const totalSimTime = dt * this.timeWarp;
        let remainingTime = totalSimTime;
        
        while (remainingTime > 0) {
            const step = Math.min(remainingTime, maxStep);
            
            this.runGuidanceSystem(step);
            this.state = RocketPhysicsEngine.integrate(this.state, this.config, step);
            this.checkEvents();

            remainingTime -= step;
            this.elapsedTime += step;
        }

        if (this.elapsedTime % 1.0 < totalSimTime) {
            this.logTelemetry();
        }
    }

    /**
     * TARGET GUIDANCE LOGIC
     * 1. Launch Vertical (0-1km)
     * 2. Pitch towards Target Azimuth (Calculated in LaunchPadView and passed in config.launch.azimuth)
     * 3. Hold Heading and Pitch Down based on Altitude (Gravity Turn)
     */
    private runGuidanceSystem(dt: number) {
        if (this.status !== 'ASCENT') return;

        const pos = this.state.position;
        
        const alt = pos.length() - CONSTANTS.R_EARTH_M;
        const up = pos.clone().normalize();
        
        let targetVector = up.clone();

        if (alt < 200) {
            // VERTICAL CLEARANCE
            targetVector = up;
        } else if (alt < 150000) {
            // GRAVITY TURN TOWARDS TARGET AZIMUTH
            // The azimuth is already calculated in the config relative to North.
            // We need to convert that Bearing (0-360) into a vector in the local tangent plane.
            
            const north = new THREE.Vector3(0, 1, 0); // Global Y is roughly North-ish in ECI context? 
            // In ECI, Z is axis of rotation usually? 
            // Let's rely on Cross Products to find Local North/East.
            
            // Local Up = pos.normalize()
            // Local East = Cross(NorthPole, Up).normalize()
            const northPole = new THREE.Vector3(0, 1, 0);
            const east = new THREE.Vector3().crossVectors(northPole, up).normalize();
            const northSurf = new THREE.Vector3().crossVectors(up, east).normalize();
            
            // Bearing (Azimuth) in Radians
            const azRad = this.config.launch.azimuth * (Math.PI / 180);
            
            // Heading Vector on surface
            // x = sin(az), y = cos(az)
            const heading = northSurf.clone().multiplyScalar(Math.cos(azRad))
                                     .add(east.clone().multiplyScalar(Math.sin(azRad)))
                                     .normalize();

            // Pitch Program (Tilt down as we go up)
            // 90 deg at 0km -> 0 deg (Horizontal) at 120km
            // Using a power curve for smoother turn
            const turnEnd = 120000; // 120km
            const progress = Math.min(1, Math.max(0, (alt - 200) / (turnEnd - 200)));
            const pitchDownAngle = Math.pow(progress, 0.5) * (Math.PI / 2); // 0 to 90 deg
            
            // Rotate 'Up' vector towards 'Heading' vector by pitchDownAngle
            // Slerp is easiest way to interpolate vectors on sphere
            targetVector = up.clone().lerp(heading, Math.sin(pitchDownAngle)).normalize();

        } else {
            // VACUUM / COAST PHASE
            // Lock to Velocity Vector (Prograde) to minimize drag/stress if any atmosphere left
            // Or maintain inertial attitude
            if (this.state.velocity.length() > 100) {
                targetVector = this.state.velocity.clone().normalize();
            }
        }

        // Apply Control
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetVector);
        const rotationSpeed = 0.8; // rad/s
        this.state.orientation.slerp(targetQuat, rotationSpeed * dt);
    }

    private checkEvents() {
        const r = this.state.position.length();
        
        // MECO
        if (this.state.fuel <= 0 && this.state.throttle > 0) {
            this.state.throttle = 0;
            console.log("[MC] MECO - MAIN ENGINE CUTOFF");
            this.status = 'COAST';
        }

        // CRASH / IMPACT
        // 50m tolerance
        if (r < CONSTANTS.R_EARTH_M - 50) {
            this.status = 'CRASHED';
            this.state.position.setLength(CONSTANTS.R_EARTH_M);
            this.state.velocity.set(0,0,0);
            this.state.throttle = 0;
            console.warn("[MC] IMPACT CONFIRMED");
        }
    }

    private logTelemetry() {
        const alt = (this.state.position.length() - CONSTANTS.R_EARTH_M) / 1000;
        const vel = this.state.velocity.length();
        if (this.history.length > 500) this.history.shift();
        this.history.push({ t: this.elapsedTime, alt, vel, q: 0 });
    }

    // --- VIEWPORT BRIDGE ---
    public getVisualState() {
        const scale = 1 / CONSTANTS.VISUAL_SCALE;
        
        return {
            position: this.state.position.clone().multiplyScalar(scale),
            orientation: this.state.orientation.clone(),
            status: this.status,
            altitude: (this.state.position.length() - CONSTANTS.R_EARTH_M) / 1000, // km
            speed: this.state.velocity.length(),
            fuel: this.state.fuel,
            color: this.status === 'ASCENT' ? TRAJECTORY_COLORS.NOMINAL_POWERED : TRAJECTORY_COLORS.COAST
        };
    }
}
