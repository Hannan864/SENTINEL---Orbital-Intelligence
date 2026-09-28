
import * as THREE from 'three';
import { RocketConfig } from '../../rocket/rocketMath';
import { RocketState } from './RocketState';
import { CONSTANTS, getAtmosphericDensity, getAtmosphericPressure } from '../../physics/physicsConstants';

export class RocketForces {
    /**
     * Calculates the net force vector acting on the rocket.
     */
    static compute(state: RocketState, config: RocketConfig): { 
        totalForce: THREE.Vector3, 
        gravity: THREE.Vector3, 
        drag: THREE.Vector3, 
        thrust: THREE.Vector3,
        massFlow: number
    } {
        const r = state.position.length();
        const altitude = r - CONSTANTS.R_EARTH_M;

        // 1. GRAVITY (Newtonian Point Mass)
        // F = - (G * M * m) / r^2 * r_hat
        const gravityMag = (CONSTANTS.G * CONSTANTS.M_EARTH * state.mass) / (r * r);
        const gravity = state.position.clone().normalize().multiplyScalar(-gravityMag);

        // 2. AERODYNAMIC DRAG
        // Fd = -0.5 * rho * v^2 * Cd * A * v_hat
        // Velocity must be relative to the atmosphere (Earth rotates!)
        const omegaEarth = 7.2921159e-5; // rad/s
        // Velocity of atmosphere at this position (tangential)
        const vAtmosphere = new THREE.Vector3(-state.position.z, 0, state.position.x).multiplyScalar(omegaEarth);
        const vRel = state.velocity.clone().sub(vAtmosphere);
        const speedRel = vRel.length();

        let drag = new THREE.Vector3(0, 0, 0);
        if (altitude < CONSTANTS.ATMOSPHERE_HEIGHT_M) {
            const rho = getAtmosphericDensity(altitude);
            // Approx drag coefficient (Cd) and Area (A)
            const Cd = 0.5; 
            const A = 10.0; // m^2
            const dragMag = 0.5 * rho * speedRel * speedRel * Cd * A;
            drag = vRel.normalize().multiplyScalar(-dragMag);
        }

        // 3. THRUST
        let thrust = new THREE.Vector3(0, 0, 0);
        let massFlow = 0;

        if (state.fuel > 0 && state.throttle > 0) {
            // Calculate specific impulse based on pressure
            const pressure = getAtmosphericPressure(altitude);
            const pRatio = Math.max(0, Math.min(1, pressure / CONSTANTS.SEA_LEVEL_PRESSURE));
            
            // Interpolate Isp between Sea Level and Vacuum
            const ispSL = config.engine.isp; 
            const ispVac = config.engine.isp * 1.2; // Estimation if not provided
            const currentIsp = ispVac - (ispVac - ispSL) * pRatio;

            // Thrust = Throttle * MaxThrust
            const thrustMag = (config.engine.thrust * 1000) * state.throttle; // kN -> N
            
            // Direction: Local "Up" (Y) rotated by orientation
            const thrustDir = new THREE.Vector3(0, 1, 0).applyQuaternion(state.orientation);
            thrust = thrustDir.multiplyScalar(thrustMag);

            // Mass Flow: dm/dt = F / (Isp * g0)
            massFlow = -thrustMag / (currentIsp * CONSTANTS.G0);
        }

        const totalForce = new THREE.Vector3().add(gravity).add(drag).add(thrust);

        return { totalForce, gravity, drag, thrust, massFlow };
    }
}
