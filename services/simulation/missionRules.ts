
import * as THREE from 'three';
import { CONSTANTS } from '../physics/physicsConstants';
import { RigidBodyState } from '../physics/rigidBodyPhysics';

// --- STRICT COLOR PALETTE ---
export const TRAJECTORY_COLORS = {
    NOMINAL_POWERED: 0x00bfff, // Sky Blue (Standard Ascent)
    FAILURE_POWERED: 0xffff00, // Yellow (Powered but Crashing/Doomed)
    ESCAPE: 0x00ff00,          // Green (High Energy / Going Further)
    COAST: 0x00008b,           // Deep Dark Blue (Safe Coasting)
    BALLISTIC_DESCENT: 0xff0000, // Red (Falling + No Fuel)
    CRASHED: 0x94a3b8,         // Gray (Debris)
    PREDICTION_GHOST: 0x555555 // Faint gray for future path
};

export type FlightPhase = 'READY' | 'IGNITION' | 'ASCENT' | 'MECO' | 'COAST' | 'APOGEE' | 'DESCENT' | 'IMPACT' | 'ORBIT';

// --- PHYSICS RULES ---
export const MISSION_RULES = {
    MIN_ORBIT_VELOCITY: 7600, // m/s (approx LEO)
    KARMAN_LINE: 100000,      // m
    MAX_Q_DYNAMIC_PRESSURE: 35000, // Pa
    CRASH_VELOCITY_TOLERANCE: 50, // m/s (Survivable landing speed - generous)
    ESCAPE_ENERGY_THRESHOLD: 0    // J
};

/**
 * Evaluates the current physics state to determine the Mission Status Color.
 * STRICT ADHERENCE TO USER "REAL WORLD SCENARIO" REQUEST:
 * 1. Launch -> Target: Sky Blue
 * 2. Crash Destiny (with fuel): Yellow
 * 3. Crash Destiny (no fuel): Red
 * 4. Go Further (with fuel): Green
 * 5. Go Further (no fuel): Deep Dark Blue
 */
export const evaluateMissionState = (state: RigidBodyState): number => {
    const r = state.position.length() * CONSTANTS.VISUAL_SCALE;
    const v = state.velocity.length() * CONSTANTS.VISUAL_SCALE;
    const altitude = r - CONSTANTS.R_EARTH_M;
    const verticalSpeed = state.velocity.dot(state.position.clone().normalize()) * CONSTANTS.VISUAL_SCALE;

    // 1. CRASHED (Visual Cleanup)
    if (state.status === 'CRASHED') {
        return TRAJECTORY_COLORS.CRASHED;
    }

    // Determine "Destiny": Are we going to orbit/escape (Go Further) or falling (Crash)?
    // Specific Energy Check: E = v^2/2 - mu/r
    const mu = CONSTANTS.G * CONSTANTS.M_EARTH;
    const specificEnergy = (v*v)/2 - mu/r;
    
    // "Go Further" Threshold: Somewhat generous, assumes if Energy is near 0 or positive, or periapsis is high
    const isGoingFurther = specificEnergy >= -2.0e7; // Arbitrary high-energy threshold for "Good/Green"
    const isFalling = verticalSpeed < -10; // Moving down significantly

    const hasFuel = state.fuel > 0;
    const isPowered = state.throttle > 0 && hasFuel;

    // --- LOGIC TREE ---

    if (isPowered) {
        // POWERED FLIGHT (Fuel Burning)
        
        if (isFalling && altitude < 100000) {
            // "IF CRASH IS DESTINY, THEN TILL FUEL YELLOW TRAIL"
            // We are burning but falling fast near ground -> Doomed
            return TRAJECTORY_COLORS.FAILURE_POWERED; // Yellow
        }
        
        if (isGoingFurther || altitude > 200000) {
            // "IF AFTER TARGET IT WILL GO FURTHER THEN: TILL FUEL GREEN"
            // High altitude or high energy
            return TRAJECTORY_COLORS.ESCAPE; // Green
        }

        // Standard Ascent ("Launch -> Target")
        return TRAJECTORY_COLORS.NOMINAL_POWERED; // Sky Blue
    } 
    else {
        // UNPOWERED (Coast / Fuel Gone)
        
        if (isGoingFurther || (altitude > 150000 && !isFalling)) {
            // "AFTER FUEL ENDS THEN DEEP DARK BLUE" (Stable/Space)
            return TRAJECTORY_COLORS.COAST; // Deep Dark Blue
        }
        
        // "IF FUEL IS GONE AND IT IS CRASHING THEN RED"
        return TRAJECTORY_COLORS.BALLISTIC_DESCENT; // Red
    }
};

/**
 * Checks if the rocket has impacted the surface.
 */
export const checkImpact = (positionUnits: THREE.Vector3): boolean => {
    // Simple sphere check
    return positionUnits.length() <= CONSTANTS.EARTH_RADIUS_UNITS;
};
