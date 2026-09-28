
import * as THREE from 'three';
import { PhysicsEngine, RigidBodyState } from '../physics/rigidBodyPhysics';
import { RocketConfig } from '../rocket/rocketMath';
import { evaluateMissionState, checkImpact, TRAJECTORY_COLORS } from './missionRules';
import { CONSTANTS } from '../physics/physicsConstants';

export interface SimulationResult {
    active: boolean;
    color: number;
    altitude: number; // km
    speed: number; // km/s
    events: string[];
}

/**
 * Advances the rocket simulation by one timestep.
 */
export const advanceRocketSimulation = (
    state: RigidBodyState,
    config: RocketConfig,
    dt: number
): SimulationResult => {
    const events: string[] = [];

    // 1. Physics Integration (The Source of Truth)
    PhysicsEngine.update(state, config, dt);

    // 2. Post-Integration Rule Checks
    
    // Impact Check
    if (state.status !== 'CRASHED' && checkImpact(state.position)) {
        state.status = 'CRASHED';
        state.position.setLength(CONSTANTS.EARTH_RADIUS_UNITS); // Clamp to surface
        state.velocity.set(0,0,0);
        state.forces.total.set(0,0,0);
        events.push('IMPACT_CONFIRMED');
    }

    // Fuel Check
    if (state.fuel <= 0 && state.throttle > 0) {
        state.throttle = 0;
        if (state.status === 'FLIGHT') state.status = 'COAST';
        events.push('MECO'); // Main Engine Cut Off
    }

    // 3. Compute Metrics
    const altitudeUnits = state.position.length() - CONSTANTS.EARTH_RADIUS_UNITS;
    const altitudeKm = (altitudeUnits * CONSTANTS.VISUAL_SCALE) / 1000;
    
    const speedUnits = state.velocity.length();
    const speedKms = (speedUnits * CONSTANTS.VISUAL_SCALE) / 1000;

    // 4. Determine Visual State
    const color = evaluateMissionState(state);

    return {
        active: state.status !== 'CRASHED' && state.status !== 'READY',
        color,
        altitude: altitudeKm,
        speed: speedKms,
        events
    };
};
