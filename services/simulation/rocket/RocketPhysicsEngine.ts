
import * as THREE from 'three';
import { RocketState, RocketParameters, PhysicsDerivatives, EnvironmentalConditions } from './RocketState';
import { CONSTANTS } from '../../physics/physicsConstants';

export class RocketPhysicsEngine {
    
    // --- ENVIRONMENTAL MODELS ---

    static getEnvironment(position: THREE.Vector3): EnvironmentalConditions {
        const r = position.length(); // Radius from center of Earth
        const altitude = r - CONSTANTS.R_EARTH_M;

        // 1. Gravity (Newtonian Point Mass)
        // g = - (G * M) / r^2 * r_hat
        const gravityMag = (CONSTANTS.G * CONSTANTS.M_EARTH) / (r * r);
        const gravity = position.clone().normalize().multiplyScalar(-gravityMag);

        // 2. Atmosphere (US Standard Atmosphere 1976 - Simplified Curve)
        let density = 0;
        let pressure = 0;

        if (altitude < 200000 && altitude > -100) { // Atmosphere up to 200km
            // Accurate exponential decay model based on scale heights
            const rho0 = 1.225; // Sea level density kg/m^3
            const P0 = 101325; // Sea level pressure Pa
            
            // Scale height H varies with temp, but 8500m is a good average for LEO simulation
            const H = 7400; // Lower scale height for denser lower atmo effect
            
            const exponent = -altitude / H;
            density = rho0 * Math.exp(exponent);
            pressure = P0 * Math.exp(exponent);
        }

        // Wind (Simplified: Eastward rotation of atmosphere)
        // Atmosphere rotates with Earth
        const omegaEarth = 7.2921159e-5; // rad/s
        const windVelocity = new THREE.Vector3(-position.z, 0, position.x).multiplyScalar(omegaEarth);

        return { density, pressure, gravity, wind: windVelocity };
    }

    // --- FORCES CALCULATION ---

    static computeDerivatives(
        state: RocketState, 
        config: RocketParameters,
        t: number
    ): PhysicsDerivatives {
        const env = this.getEnvironment(state.position);
        
        // 1. GRAVITY FORCE
        const fGravity = env.gravity.clone().multiplyScalar(state.mass);

        // 2. AERODYNAMIC DRAG
        // We need velocity relative to the rotating atmosphere (Airspeed)
        const vRel = state.velocity.clone().sub(env.wind);
        const speedRel = vRel.length();
        
        // Drag acts opposite to relative velocity
        let fDrag = new THREE.Vector3(0,0,0);
        if (speedRel > 0.1 && env.density > 0) {
            // Dynamic Pressure q = 0.5 * rho * v^2
            const q = 0.5 * env.density * (speedRel * speedRel);
            
            // Fd = q * Cd * A
            // Supersonic drag correction: Cd typically rises at Transonic (Mach 0.8-1.2) then drops
            const mach = speedRel / 343; // Approx speed of sound
            let cd = config.aero.cd;
            if (mach > 0.8 && mach < 1.2) cd *= 2.5; // Transonic spike
            else if (mach > 1.2) cd *= 1.5; // Supersonic wave drag
            
            const dragMag = q * cd * config.aero.area;
            fDrag = vRel.clone().normalize().multiplyScalar(-dragMag);
        }

        // 3. THRUST
        let fThrust = new THREE.Vector3(0, 0, 0);
        let mDot = 0;

        if (state.fuel > 0 && state.throttle > 0) {
            // ISP Interpolation based on ambient pressure
            const pRatio = Math.min(1, Math.max(0, env.pressure / 101325));
            // Linear interpolation between SL and Vac ISP
            const currentIsp = config.engine.ispVac - (config.engine.ispVac - config.engine.ispSL) * pRatio;
            
            // Calculate Force
            // Thrust = F_vac - (P_atm * A_exit) -- Simplified to ISP interpolation here
            // F = Isp * g0 * m_dot
            // We drive thrust from Engine Max Thrust * Throttle
            
            // Thrust usually slightly lower at SL due to backpressure
            const maxThrustCurrent = config.engine.thrustVac - (config.engine.thrustVac - config.engine.thrustSL) * pRatio;
            const thrustN = (maxThrustCurrent * 1000) * state.throttle; // kN -> N
            
            // Thrust Vector (Body Forward transformed to World)
            // Rocket "Up" is Y in local space
            const forward = new THREE.Vector3(0, 1, 0).applyQuaternion(state.orientation);
            fThrust = forward.multiplyScalar(thrustN);

            // Mass Flow Rate (kg/s)
            // m_dot = F / (Isp * g0)
            mDot = -thrustN / (currentIsp * 9.80665);
        }

        // 4. TOTAL FORCE & ACCELERATION
        const fTotal = new THREE.Vector3().add(fGravity).add(fDrag).add(fThrust);
        const acceleration = fTotal.divideScalar(state.mass);

        return {
            dPos: state.velocity.clone(),
            dVel: acceleration,
            dMass: mDot,
            dQuat: new THREE.Quaternion(), // Handled in Controller via Guidance
            dAngVel: new THREE.Vector3()
        };
    }

    // --- INTEGRATOR (Runge-Kutta 4) ---

    static integrate(
        state: RocketState, 
        config: RocketParameters, 
        dt: number
    ): RocketState {
        // RK4 Helpers
        const k1 = this.computeDerivatives(state, config, 0);
        const s2 = this.applyStep(state, k1, dt * 0.5);
        
        const k2 = this.computeDerivatives(s2, config, dt * 0.5);
        const s3 = this.applyStep(state, k2, dt * 0.5);
        
        const k3 = this.computeDerivatives(s3, config, dt * 0.5);
        const s4 = this.applyStep(state, k3, dt);
        
        const k4 = this.computeDerivatives(s4, config, dt);

        // Combine
        const dPos = k1.dPos.add(k2.dPos.multiplyScalar(2)).add(k3.dPos.multiplyScalar(2)).add(k4.dPos).multiplyScalar(dt / 6);
        const dVel = k1.dVel.add(k2.dVel.multiplyScalar(2)).add(k3.dVel.multiplyScalar(2)).add(k4.dVel).multiplyScalar(dt / 6);
        const dMass = (k1.dMass + 2 * k2.dMass + 2 * k3.dMass + k4.dMass) * (dt / 6);

        const newMass = Math.max(config.mass.dry + config.mass.payload, state.mass + dMass);
        const newFuel = Math.max(0, state.fuel + dMass);

        return {
            ...state,
            position: state.position.clone().add(dPos),
            velocity: state.velocity.clone().add(dVel),
            // Orientation handled externally by Guidance System for stability
            mass: newMass,
            fuel: newFuel,
            acceleration: k1.dVel, // Use k1 accel for telemetry
            status: state.status,
            timestamp: state.timestamp + dt
        };
    }

    private static applyStep(state: RocketState, d: PhysicsDerivatives, dt: number): RocketState {
        return {
            ...state,
            position: state.position.clone().add(d.dPos.clone().multiplyScalar(dt)),
            velocity: state.velocity.clone().add(d.dVel.clone().multiplyScalar(dt)),
            mass: state.mass + d.dMass * dt,
            fuel: state.fuel + d.dMass * dt
        };
    }
}
