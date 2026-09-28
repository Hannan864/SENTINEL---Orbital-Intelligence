
import * as THREE from 'three';
import { PhysicsEngine, RigidBodyState } from '../physics/rigidBodyPhysics';
import { RocketConfig } from '../rocket/rocketMath';
import { CONSTANTS } from '../physics/physicsConstants';
import { checkImpact } from './missionRules';

/**
 * Runs a fast-forward simulation to predict the rocket's path.
 * strictly uses the PhysicsEngine to ensure accuracy.
 */
export const predictTrajectory = (
    startState: RigidBodyState,
    config: RocketConfig,
    durationSeconds: number = 300, // Look ahead 5 minutes
    stepSizeSeconds: number = 1.0  // Resolution
): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    
    // 1. Deep Clone State to avoid mutating the live rocket
    const ghostState: RigidBodyState = {
        position: startState.position.clone(),
        velocity: startState.velocity.clone(),
        mass: startState.mass,
        fuel: startState.fuel,
        orientation: startState.orientation.clone(),
        angularVelocity: startState.angularVelocity.clone(),
        throttle: startState.throttle, // Assume constant throttle for prediction
        status: startState.status,
        forces: {
            gravity: new THREE.Vector3(),
            drag: new THREE.Vector3(),
            thrust: new THREE.Vector3(),
            total: new THREE.Vector3()
        }
    };

    // 2. Simulation Loop
    let t = 0;
    while (t < durationSeconds) {
        // Physics Step
        PhysicsEngine.update(ghostState, config, stepSizeSeconds);
        
        // Store Point
        points.push(ghostState.position.clone());

        // Check Termination Conditions
        if (checkImpact(ghostState.position)) {
            break; // Stop at impact
        }
        
        t += stepSizeSeconds;
    }

    return points;
};
