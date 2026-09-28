
import * as THREE from 'three';
import { RocketState, PhysicsDerivative } from './RocketState';
import { RocketConfig } from '../../rocket/rocketMath';
import { RocketForces } from './RocketForces';

export class RocketIntegrator {
    
    private static evaluate(
        initial: RocketState, 
        config: RocketConfig, 
        dt: number, 
        d: PhysicsDerivative
    ): PhysicsDerivative {
        const state: RocketState = {
            ...initial,
            position: initial.position.clone().add(d.dPos.clone().multiplyScalar(dt)),
            velocity: initial.velocity.clone().add(d.dVel.clone().multiplyScalar(dt)),
            mass: Math.max(config.mass.dry + config.mass.payload, initial.mass + d.dMass * dt),
            fuel: Math.max(0, initial.fuel + d.dMass * dt)
        };

        const { totalForce, massFlow } = RocketForces.compute(state, config);
        
        return {
            dPos: state.velocity.clone(),
            dVel: totalForce.divideScalar(state.mass),
            dMass: massFlow
        };
    }

    static step(state: RocketState, config: RocketConfig, dt: number): RocketState {
        // k1
        const { totalForce: f1, massFlow: m1 } = RocketForces.compute(state, config);
        const k1: PhysicsDerivative = {
            dPos: state.velocity.clone(),
            dVel: f1.divideScalar(state.mass),
            dMass: m1
        };

        // k2
        const k2 = this.evaluate(state, config, dt * 0.5, k1);
        // k3
        const k3 = this.evaluate(state, config, dt * 0.5, k2);
        // k4
        const k4 = this.evaluate(state, config, dt, k3);

        const dPos = k1.dPos.add(k2.dPos.multiplyScalar(2)).add(k3.dPos.multiplyScalar(2)).add(k4.dPos).multiplyScalar(dt / 6);
        const dVel = k1.dVel.add(k2.dVel.multiplyScalar(2)).add(k3.dVel.multiplyScalar(2)).add(k4.dVel).multiplyScalar(dt / 6);
        const dMass = (k1.dMass + 2 * k2.dMass + 2 * k3.dMass + k4.dMass) * (dt / 6);

        return {
            ...state,
            position: state.position.clone().add(dPos),
            velocity: state.velocity.clone().add(dVel),
            mass: Math.max(config.mass.dry + config.mass.payload, state.mass + dMass),
            fuel: Math.max(0, state.fuel + dMass),
            acceleration: dVel.clone().divideScalar(dt)
        };
    }
}
