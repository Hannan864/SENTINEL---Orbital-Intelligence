
import * as THREE from 'three';
import { CONSTANTS, getAtmosphericDensity, getAtmosphericPressure } from '../../physics/physicsConstants';
import { RocketConfig } from '../../rocket/rocketMath';
import { RocketState, PhysicsDerivative } from './RocketState';

export class RocketPhysics {
    static computeDerivatives(state: RocketState, config: RocketConfig, throttle: number): PhysicsDerivative {
        const rMeters = state.position.length();
        const altitude = rMeters - CONSTANTS.R_EARTH_M;

        // 1. Gravity (Inverse Square)
        const gravityMag = (CONSTANTS.G * CONSTANTS.M_EARTH * state.mass) / (rMeters * rMeters);
        const gravityForce = state.position.clone().normalize().multiplyScalar(-gravityMag);

        // 2. Drag (Exponential)
        const rho = getAtmosphericDensity(altitude);
        const Cd = 0.42; // Aerodynamic drag coefficient for rocket
        const Area = Math.PI * Math.pow(1.8, 2); // 3.6m diameter
        const vRel = state.velocity.clone(); // Simplified: assuming static atmosphere
        const speed = vRel.length();
        const dragMag = 0.5 * rho * speed * speed * Cd * Area;
        const dragForce = vRel.normalize().multiplyScalar(-dragMag);

        // 3. Thrust & Mass Flow
        let thrustForce = new THREE.Vector3(0, 0, 0);
        let mDot = 0;
        if (state.fuel > 0 && throttle > 0) {
            const pAtm = getAtmosphericPressure(altitude);
            const pRatio = pAtm / CONSTANTS.SEA_LEVEL_PRESSURE;
            const currentIsp = config.engine.isp * (1.15 - (0.15 * pRatio)); // 15% vac efficiency gain
            const thrustMag = (config.engine.thrust * 1000) * throttle;
            const forward = new THREE.Vector3(0, 1, 0).applyQuaternion(state.orientation);
            thrustForce = forward.multiplyScalar(thrustMag);
            mDot = thrustMag / (currentIsp * CONSTANTS.G0);
        }

        const totalForce = new THREE.Vector3().add(gravityForce).add(dragForce).add(thrustForce);
        return {
            dPos: state.velocity.clone(),
            dVel: totalForce.divideScalar(state.mass),
            dMass: -mDot
        };
    }

    static applyDerivative(state: RocketState, d: PhysicsDerivative, dt: number): RocketState {
        return {
            ...state,
            position: state.position.clone().add(d.dPos.multiplyScalar(dt)),
            velocity: state.velocity.clone().add(d.dVel.multiplyScalar(dt)),
            mass: Math.max(0, state.mass + d.dMass * dt),
            fuel: Math.max(0, state.fuel + d.dMass * dt),
            orientation: state.orientation.clone(),
            // Maintain throttle value in projected state
            throttle: state.throttle
        };
    }
}
