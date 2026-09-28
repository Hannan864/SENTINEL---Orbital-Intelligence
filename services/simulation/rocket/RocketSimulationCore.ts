
import * as THREE from 'three';
import { RocketConfig } from '../../rocket/rocketMath';
import { CONSTANTS } from '../../physics/physicsConstants';
import { RocketState } from './RocketState';
import { RocketIntegrator } from './RocketIntegrator';
import { RocketForces } from './RocketForces';
import { RocketFailureModel } from './RocketFailureModel';
import { RocketTrajectoryTracker } from './RocketTrajectoryTracker';

export class RocketSimulationCore {
    public state: RocketState;
    public config: RocketConfig;
    public elapsedTime: number = 0;
    
    // Telemetry Buffer
    public lastForces = {
        gravity: new THREE.Vector3(),
        drag: new THREE.Vector3(),
        thrust: new THREE.Vector3(),
        total: new THREE.Vector3()
    };
    public lastEvents: string[] = [];
    public predictionPoints: THREE.Vector3[] = [];
    private maxAltitudeReached: number = 0;

    constructor(config: RocketConfig) {
        this.config = config;
        
        // 1. POSITIONING: Precise Geodetic to ECI Cartesian
        const r = CONSTANTS.R_EARTH_M + (config.launch.altitude || 20); 
        const latRad = (config.launch.lat * Math.PI) / 180;
        const lonRad = (config.launch.lon * Math.PI) / 180;

        // ThreeJS Coordinate Mapping: Y is Polar Axis (Up/Down)
        const x = r * Math.cos(latRad) * Math.cos(lonRad);
        const y = r * Math.sin(latRad);
        const z = -r * Math.cos(latRad) * Math.sin(lonRad);
        
        const startPos = new THREE.Vector3(x, y, z);
        
        // 2. INITIAL VELOCITY: Earth Rotation Assist
        // Earth rotation speed varies by latitude: v = omega * r * cos(lat)
        const omega = 7.2921159e-5; 
        const vRot = new THREE.Vector3(-z, 0, x).multiplyScalar(omega);

        // 3. INITIAL ORIENTATION: Surface Normal (Vertical)
        const up = startPos.clone().normalize();
        const startQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);

        this.state = {
            position: startPos,
            velocity: vRot, 
            acceleration: new THREE.Vector3(),
            orientation: startQuat,
            angularVelocity: new THREE.Vector3(),
            mass: config.mass.dry + config.mass.fuel + config.mass.payload,
            fuel: config.mass.fuel,
            throttle: 0,
            stage: 1,
            status: 'READY',
            timestamp: 0
        };
    }

    public launch() {
        const twr = (this.config.engine.thrust * 1000) / (this.state.mass * 9.81);
        this.state.status = 'IGNITION';
        this.state.throttle = 1.0;
        this.elapsedTime = 0;
        this.lastEvents.push("MISSION START: T-0:00");
        this.lastEvents.push(`LAUNCH PAD LAT/LON: ${this.config.launch.lat.toFixed(2)} / ${this.config.launch.lon.toFixed(2)}`);
        this.lastEvents.push(`VEHICLE MASS: ${Math.round(this.state.mass)} KG`);
        
        if (twr < 1.0) {
            this.lastEvents.push("WARNING: THRUST < WEIGHT. VEHICLE WILL NOT CLEAR PAD.");
        }
    }

    public stop() {
        if (this.state.status !== 'TERMINATED') {
            this.state.status = 'TERMINATED';
            this.state.throttle = 0;
            this.lastEvents.push("MANUAL ABORT SIGNAL RECEIVED");
        }
    }

    public step(dt: number, speedMultiplier: number = 1.0) {
        if (['READY', 'IDLE', 'TERMINATED', 'CRASHED'].includes(this.state.status)) return;

        const MAX_PHYSICS_STEP = 0.05; 
        let timeLeft = dt * speedMultiplier;

        while (timeLeft > 0) {
            const stepDt = Math.min(timeLeft, MAX_PHYSICS_STEP);
            this.updatePhysics(stepDt);
            timeLeft -= stepDt;
        }

        this.updateTelemetry();
        if (this.elapsedTime % 1.0 < dt * speedMultiplier) {
            this.updatePrediction();
        }
    }

    private updatePhysics(dt: number) {
        // 1. GUIDANCE: Steering based on dynamic Great Circle bearing to target
        if (['ASCENT', 'IGNITION'].includes(this.state.status)) {
            this.runGuidance(dt);
        }

        // 2. INTEGRATION
        this.state = RocketIntegrator.step(this.state, this.config, dt);
        this.elapsedTime += dt;

        // 3. FLIGHT LOGIC
        const altitude = this.state.position.length() - CONSTANTS.R_EARTH_M;
        if (altitude > this.maxAltitudeReached) this.maxAltitudeReached = altitude;

        if (this.state.status === 'IGNITION' && altitude > 50) {
            this.state.status = 'ASCENT';
            this.lastEvents.push("LIFTOFF CONFIRMED");
        }

        if (this.state.fuel <= 0 && this.state.throttle > 0) {
            this.state.throttle = 0;
            this.state.status = 'COAST';
            this.lastEvents.push("MECO: FUEL DEPLETED");
        }

        // Failure/Crash Checks
        const { drag } = RocketForces.compute(this.state, this.config);
        const qPa = 0.5 * drag.length(); 
        const failure = RocketFailureModel.check(this.state, qPa);
        
        if (failure) {
            this.lastEvents.push(`FAILURE: ${failure}`);
            this.state.status = 'CRASHED';
            this.state.position.setLength(CONSTANTS.R_EARTH_M);
            this.state.velocity.set(0,0,0);
        }
    }

    private runGuidance(dt: number) {
        const altitude = this.state.position.length() - CONSTANTS.R_EARTH_M;
        const up = this.state.position.clone().normalize();
        
        let targetVector = up.clone();

        // Standard Gravity Turn Logic
        if (altitude > 1500) {
            const northPole = new THREE.Vector3(0, 1, 0);
            const east = new THREE.Vector3().crossVectors(northPole, up).normalize();
            const northSurf = new THREE.Vector3().crossVectors(up, east).normalize();
            
            // Bearing to target (azimuth)
            const azRad = (this.config.launch.azimuth * Math.PI) / 180;
            const heading = northSurf.clone().multiplyScalar(Math.cos(azRad))
                                     .add(east.clone().multiplyScalar(Math.sin(azRad)))
                                     .normalize();

            // Pitch Program: 90 deg -> 0 deg (Horizontal towards target)
            const turnEnd = 160000;
            const progress = Math.min(1, (altitude - 1500) / (turnEnd - 1500));
            const pitchDownAngle = Math.pow(progress, 0.5) * (Math.PI / 2.1);
            
            targetVector = up.clone().lerp(heading, Math.sin(pitchDownAngle)).normalize();
        }

        const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetVector);
        this.state.orientation.slerp(targetQuat, dt * 0.8);
    }

    private updateTelemetry() {
        const { gravity, drag, thrust, totalForce } = RocketForces.compute(this.state, this.config);
        this.lastForces = { gravity, drag, thrust, total: totalForce };
    }

    private updatePrediction() {
        let ghost = JSON.parse(JSON.stringify(this.state));
        ghost.position = new THREE.Vector3().copy(this.state.position);
        ghost.velocity = new THREE.Vector3().copy(this.state.velocity);
        ghost.orientation = new THREE.Quaternion().copy(this.state.orientation);
        
        const pts: THREE.Vector3[] = [];
        const step = 5.0;
        for(let i=0; i<60; i++) {
            ghost = RocketIntegrator.step(ghost, this.config, step);
            pts.push(ghost.position.clone().multiplyScalar(1/CONSTANTS.VISUAL_SCALE));
            if (ghost.position.length() < CONSTANTS.R_EARTH_M) break;
        }
        this.predictionPoints = pts;
    }

    public getVisualState() {
        const scale = 1 / CONSTANTS.VISUAL_SCALE;
        const altM = this.state.position.length() - CONSTANTS.R_EARTH_M;
        const color = RocketTrajectoryTracker.getColor(this.state.status, this.state.fuel, this.state.throttle, this.state.position, this.state.velocity);

        return {
            position: this.state.position.clone().multiplyScalar(scale),
            orientation: this.state.orientation.clone(),
            status: this.state.status,
            time: this.elapsedTime,
            altitude: altM / 1000,
            apogee: this.maxAltitudeReached / 1000,
            speed: this.state.velocity.length() / 1000,
            fuel: this.state.fuel,
            prediction: this.predictionPoints,
            color: color,
            events: [...this.lastEvents]
        };
    }
}
