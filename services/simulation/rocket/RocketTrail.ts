
import { RocketState } from './RocketState';
import { CONSTANTS } from '../../physics/physicsConstants';

export class RocketTrail {
    static getColor(state: RocketState, status: string): number {
        if (status === 'IMPACT') return 0x94a3b8; // Gray Scrap

        const alt = state.position.length() - CONSTANTS.R_EARTH_M;
        const v = state.velocity.length();
        const mu = CONSTANTS.G * CONSTANTS.M_EARTH;
        const specificEnergy = (v * v) / 2 - mu / state.position.length();
        
        const isStable = specificEnergy > -1e6; // Approximation for orbital/escape stability
        const hasFuel = state.fuel > 0.1;
        const isFalling = state.velocity.dot(state.position.clone().normalize()) < -10;

        if (hasFuel) {
            if (isStable) return 0x22c55e; // Green: Stable + Burning
            return 0x38bdf8; // Sky Blue: Ascent
        } else {
            if (isStable) return 0x0f172a; // Dark Blue: Stable + Empty
            if (isFalling || alt < 100000) return 0xef4444; // Red: Empty + Crash
            return 0xeab308; // Yellow: Suborbital + Empty
        }
    }
}
