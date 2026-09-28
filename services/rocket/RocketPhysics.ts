
import * as THREE from 'three';
import { RocketState, RocketParams, GM, EARTH_RADIUS } from './RocketState';

export class RocketPhysics {
  static getAtmosphericDensity(altitude: number): number {
    if (altitude < 0) return 1.225;
    if (altitude > 120000) return 0;
    // Simple exponential model (H = 8500m)
    return 1.225 * Math.exp(-altitude / 8500);
  }

  static computeForces(state: RocketState, params: RocketParams): { force: THREE.Vector3, massFlow: number } {
    const totalForce = new THREE.Vector3(0, 0, 0);
    const r = state.pos.length();
    const altitude = r - EARTH_RADIUS;

    // --- 1. GRAVITY (Newtonian) ---
    const gravityMag = (GM * state.mass) / (r * r);
    const gravityDir = state.pos.clone().normalize().negate();
    const fGravity = gravityDir.multiplyScalar(gravityMag);
    totalForce.add(fGravity);

    // --- 2. PSEUDO-FORCES (ECEF CORRECTION) ---
    // Since we simulate in a rotating frame (Earth Fixed), we must add Coriolis and Centrifugal forces.
    // Earth rotation vector (Omega) is along Y axis (North)
    const omega = 7.2921159e-5; // rad/s
    const omegaVector = new THREE.Vector3(0, omega, 0);

    // Coriolis Force: F_cor = -2 * m * (Omega x v)
    const v = state.vel.clone();
    const coriolis = omegaVector.clone().cross(v).multiplyScalar(-2 * state.mass);
    totalForce.add(coriolis);

    // Centrifugal Force: F_cen = -m * (Omega x (Omega x r))
    // This pushes outward from the axis of rotation
    const rVec = state.pos.clone();
    const centrifugal = omegaVector.clone().cross(omegaVector.clone().cross(rVec)).multiplyScalar(-state.mass);
    totalForce.add(centrifugal);

    // --- 3. THRUST ---
    let massFlow = 0;
    if (state.fuel > 0 && state.throttle > 0) {
      const thrustN = params.thrust * 1000 * state.throttle;
      const forwardDir = new THREE.Vector3(0, 1, 0).applyQuaternion(state.orientation).normalize();
      const fThrust = forwardDir.multiplyScalar(thrustN);
      totalForce.add(fThrust);

      // m_dot = F / (Isp * g0)
      massFlow = thrustN / (params.isp * 9.80665);
    }

    // --- 4. DRAG ---
    // In ECEF, the atmosphere is static relative to the frame (mostly).
    // So drag opposes velocity directly (assuming no wind).
    if (altitude < 120000) {
      const rho = this.getAtmosphericDensity(altitude);
      const Cd = 0.5;
      const Area = 12.0; // m^2
      const speed = state.vel.length();
      if (speed > 0.1) {
        const dragMag = 0.5 * rho * speed * speed * Cd * Area;
        const fDrag = state.vel.clone().normalize().negate().multiplyScalar(dragMag);
        totalForce.add(fDrag);
      }
    }

    return { force: totalForce, massFlow };
  }
}
