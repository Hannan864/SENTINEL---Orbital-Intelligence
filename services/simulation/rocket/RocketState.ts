
import * as THREE from 'three';
import { RocketConfig } from '../../rocket/rocketMath';

export type RocketStatus = 'READY' | 'IGNITION' | 'ASCENT' | 'COAST' | 'ORBIT' | 'TERMINATED' | 'IDLE' | 'CRASHED' | 'COUNTDOWN';

export interface RocketState {
    // KINEMATICS (SI Units: Meters, m/s)
    position: THREE.Vector3;    // Position relative to Earth Center
    velocity: THREE.Vector3;    // Velocity relative to Earth Center (Inertial)
    acceleration: THREE.Vector3;// Current frame acceleration
    
    // ORIENTATION
    orientation: THREE.Quaternion; // World orientation
    angularVelocity: THREE.Vector3; // rad/s (Simplified for guidance)

    // MASS PROPERTIES
    mass: number; // Current total mass (kg)
    fuel: number; // Current fuel mass (kg)

    // CONTROL
    throttle: number; // 0.0 to 1.0
    stage: number;    // Active stage index

    // METADATA
    status: RocketStatus;
    timestamp: number; // Simulation time
}

// Derivative structure for RK4 integrator
export interface PhysicsDerivative {
    dPos: THREE.Vector3;
    dVel: THREE.Vector3;
    dMass: number; // Mass flow rate (negative)
}

// --- EXTENDED TYPES FOR PHYSICS ENGINE COMPATIBILITY ---

export type PhysicsDerivatives = PhysicsDerivative & { 
    dQuat?: THREE.Quaternion, 
    dAngVel?: THREE.Vector3 
};

export interface EnvironmentalConditions {
    density: number;
    pressure: number;
    gravity: THREE.Vector3;
    wind: THREE.Vector3;
}

// Extended configuration used by some engines
export interface RocketParameters extends RocketConfig {
    aero: { cd: number, area: number };
    engine: { 
        thrust: number; 
        isp: number; 
        burnTime: number; 
        thrustSL: number; 
        thrustVac: number; 
        ispSL: number; 
        ispVac: number; 
    };
}
