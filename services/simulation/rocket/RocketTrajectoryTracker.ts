
import * as THREE from 'three';
import { CONSTANTS } from '../../physics/physicsConstants';
import { TRAJECTORY_COLORS } from '../missionRules';

export class RocketTrajectoryTracker {
    /**
     * LOGIC:
     * 1. Powered Ascent: Sky Blue
     * 2. Powered but Crash Destiny: Yellow
     * 3. Powered Escape/Further: Green
     * 4. Unpowered Crash/Falling: Red
     * 5. Unpowered Safe/Orbit: Deep Dark Blue
     */
    static getColor(
        status: string, 
        fuel: number, 
        throttle: number, 
        positionM: THREE.Vector3, 
        velocityM: THREE.Vector3
    ): number {
        if (status === 'CRASHED') return TRAJECTORY_COLORS.CRASHED;
        
        const r = positionM.length();
        const v = velocityM.length();
        const mu = CONSTANTS.G * CONSTANTS.M_EARTH;
        const specificEnergy = (v * v) / 2 - mu / r;
        
        const up = positionM.clone().normalize();
        const verticalVel = velocityM.dot(up);
        const isFalling = verticalVel < -10;
        const hasFuel = fuel > 0.1;
        const isPowered = throttle > 0 && hasFuel;

        // "Further than Target" logic approx via energy
        // LEO energy approx -3e7 J/kg. Escape is 0.
        const isGoingFurther = specificEnergy > -2.5e7;

        if (isPowered) {
            if (isFalling) return 0xffff00; // YELLOW: Fighting gravity but losing
            if (isGoingFurther) return 0x00ff00; // GREEN: High energy ascent
            return 0x00bfff; // SKY BLUE: Standard powered ascent
        } else {
            // UNPOWERED (Fuel end or engines off)
            if (isGoingFurther) return 0x00008b; // DEEP DARK BLUE: Coasting stable
            return 0xff0000; // RED: Ballistic descent / No fuel
        }
    }
}
