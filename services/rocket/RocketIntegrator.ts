
import * as THREE from 'three';
import { RocketState, RocketParams } from './RocketState';
import { RocketPhysics } from './RocketPhysics';

export class RocketIntegrator {
  static step(state: RocketState, params: RocketParams, dt: number): RocketState {
    const k1 = this.getDerivatives(state, params);
    const k2 = this.getDerivatives(this.apply(state, k1, dt * 0.5), params);
    const k3 = this.getDerivatives(this.apply(state, k2, dt * 0.5), params);
    const k4 = this.getDerivatives(this.apply(state, k3, dt), params);

    const dPos = k1.vel.add(k2.vel.multiplyScalar(2)).add(k3.vel.multiplyScalar(2)).add(k4.vel).multiplyScalar(dt / 6);
    const dVel = k1.accel.add(k2.accel.multiplyScalar(2)).add(k3.accel.multiplyScalar(2)).add(k4.accel).multiplyScalar(dt / 6);
    const dMass = (k1.mDot + 2 * k2.mDot + 2 * k3.mDot + k4.mDot) * (dt / 6);

    return {
      ...state,
      pos: state.pos.clone().add(dPos),
      vel: state.vel.clone().add(dVel),
      mass: Math.max(params.dryMass + params.payloadMass, state.mass + dMass),
      fuel: Math.max(0, state.fuel + dMass),
      time: state.time + dt
    };
  }

  private static getDerivatives(s: RocketState, p: RocketParams) {
    const { force, massFlow } = RocketPhysics.computeForces(s, p);
    return {
      vel: s.vel.clone(),
      accel: force.divideScalar(s.mass),
      mDot: massFlow ? -massFlow : 0
    };
  }

  private static apply(s: RocketState, d: any, dt: number): RocketState {
    return {
      ...s,
      pos: s.pos.clone().add(d.vel.clone().multiplyScalar(dt)),
      vel: s.vel.clone().add(d.accel.clone().multiplyScalar(dt)),
      mass: s.mass + d.mDot * dt
    };
  }
}
