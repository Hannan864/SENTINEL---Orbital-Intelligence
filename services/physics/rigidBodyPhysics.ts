
import * as THREE from 'three';
import { CONSTANTS, toMeters, toUnits, getAtmosphericDensity, getAtmosphericPressure } from './physicsConstants';
import { RocketConfig } from '../rocket/rocketMath';

export interface RigidBodyState {
    position: THREE.Vector3; // Units (Visual Space)
    velocity: THREE.Vector3; // Units/s
    mass: number;            // kg
    fuel: number;            // kg
    orientation: THREE.Quaternion;
    angularVelocity: THREE.Vector3; // rad/s
    throttle: number;        // 0.0 to 1.0
    status: 'READY' | 'IGNITION' | 'ASCENT' | 'FLIGHT' | 'COAST' | 'CRASHED' | 'ORBIT' | 'TERMINATED' | 'IDLE';
    forces: {
        gravity: THREE.Vector3;
        drag: THREE.Vector3;
        thrust: THREE.Vector3;
        total: THREE.Vector3;
    };
}

export class PhysicsEngine {
    
    // Compute all forces acting on the body
    // Returns Acceleration in Units/s^2 AND the breakdown of forces
    static computeForces(state: RigidBodyState, config: RocketConfig, dt: number): { accel: THREE.Vector3, forces: RigidBodyState['forces'] } {
        const forces = {
            gravity: new THREE.Vector3(0,0,0),
            drag: new THREE.Vector3(0,0,0),
            thrust: new THREE.Vector3(0,0,0),
            total: new THREE.Vector3(0,0,0)
        };

        if (state.status === 'CRASHED' || state.status === 'READY') {
            return { accel: new THREE.Vector3(0,0,0), forces };
        }

        const posMeters = state.position.clone().multiplyScalar(CONSTANTS.VISUAL_SCALE);
        const r = posMeters.length();
        const altitude = r - CONSTANTS.R_EARTH_M;

        // 1. GRAVITY (Newtonian)
        // Fg = G * M * m / r^2
        // Direction: Towards center (0,0,0)
        const gravityDir = state.position.clone().normalize().negate();
        const gravityForceMag = (CONSTANTS.G * CONSTANTS.M_EARTH * state.mass) / (r * r);
        forces.gravity = gravityDir.multiplyScalar(gravityForceMag);

        // 2. DRAG
        // Fd = 0.5 * rho * v^2 * Cd * A
        // Velocity must be relative to atmosphere (Earth rotation)
        const omegaEarth = 7.2921159e-5; // rad/s
        const vAtmosphereM = new THREE.Vector3(-posMeters.z, 0, posMeters.x).multiplyScalar(omegaEarth); // Approx tangential
        const velMeters = state.velocity.clone().multiplyScalar(CONSTANTS.VISUAL_SCALE);
        const vRel = velMeters.clone().sub(vAtmosphereM);
        
        const speedRel = vRel.length();
        
        if (altitude < 200000) {
            const rho = getAtmosphericDensity(altitude);
            const Cd = 0.5; // Average drag coeff
            const Area = Math.PI * Math.pow(1.5, 2); // 3m diameter approx
            const dragMag = 0.5 * rho * (speedRel * speedRel) * Cd * Area;
            forces.drag = vRel.clone().normalize().negate().multiplyScalar(dragMag);
        }

        // 3. THRUST
        if (state.fuel > 0 && state.throttle > 0) {
            // Isp Interpolation
            const pressure = getAtmosphericPressure(altitude);
            const pressureRatio = pressure / CONSTANTS.SEA_LEVEL_PRESSURE;
            const isp = config.engine.isp + (380 - config.engine.isp) * (1 - pressureRatio); // Vacuum ISP interpolation
            
            const thrustN = (config.engine.thrust * 1000) * state.throttle; // kN -> N
            
            const forward = new THREE.Vector3(0, 1, 0).applyQuaternion(state.orientation).normalize();
            forces.thrust = forward.multiplyScalar(thrustN);
            
            // Mass Flow: dm/dt = F / (Isp * g0)
            const dM = (thrustN / (isp * CONSTANTS.G0)) * dt;
            state.fuel = Math.max(0, state.fuel - dM);
            state.mass = config.mass.dry + config.mass.payload + state.fuel;
        } else if (state.fuel <= 0 && state.status === 'FLIGHT') {
            state.status = 'COAST';
        }

        // SUM FORCES
        forces.total.addVectors(forces.gravity, forces.drag).add(forces.thrust);
        
        // F = ma -> a = F/m
        const accelMeters = forces.total.clone().divideScalar(state.mass);
        
        // Convert back to Units/s^2
        const accel = accelMeters.divideScalar(CONSTANTS.VISUAL_SCALE);

        return { accel, forces };
    }

    // Semi-Implicit Euler Integration
    static update(state: RigidBodyState, config: RocketConfig, dt: number) {
        if (state.status === 'CRASHED' || state.status === 'READY') return;

        // 1. Calculate Acceleration & Forces
        const { accel, forces } = this.computeForces(state, config, dt);
        
        // Update State Forces for Debugging
        state.forces = forces;

        // 2. Integrate Velocity
        state.velocity.add(accel.clone().multiplyScalar(dt));

        // 3. Integrate Position
        state.position.add(state.velocity.clone().multiplyScalar(dt));

        // 4. Crash Detection
        if (state.position.length() <= CONSTANTS.EARTH_RADIUS_UNITS) {
            state.status = 'CRASHED';
            state.position.setLength(CONSTANTS.EARTH_RADIUS_UNITS);
            state.velocity.set(0,0,0);
            state.forces.total.set(0,0,0); // Zero out forces on crash
        }
        
        // 5. Orbit/Escape Logic
        // Simple orbital energy check: E = v^2/2 - mu/r
        if (state.status === 'COAST' || state.status === 'FLIGHT') {
            const r = state.position.length() * CONSTANTS.VISUAL_SCALE;
            const v = state.velocity.length() * CONSTANTS.VISUAL_SCALE;
            const mu = CONSTANTS.G * CONSTANTS.M_EARTH;
            const energy = (v * v) / 2 - mu / r;
            
            // If Energy >= 0, it's escape trajectory. If Energy < 0 but perigee > earth radius, it's orbit.
            // Simplified status update:
            if (energy >= 0) {
                // Technically "Escape", but let's call it Orbit for visual status in this simplified enum
                // or keep it COAST but we know it's green.
            } else {
                // Check if perigee is above surface
                // Estimation for circularization
                if (r > CONSTANTS.R_EARTH_M + 150000 && v > 7000) {
                     state.status = 'ORBIT';
                }
            }
        }
    }
}
