
import { CONSTANTS } from '../../physics/physicsConstants';

export class RocketAtmosphere {
    /**
     * Calculates atmospheric density (kg/m^3) at a given altitude (meters).
     * Uses a simplified scale height model suitable for LEO simulations.
     * Scale Height (H) approx 8500m.
     */
    static getDensity(altitudeM: number): number {
        if (altitudeM < 0) return CONSTANTS.SEA_LEVEL_DENSITY;
        
        // Karman line cutoff (100km) - density becomes negligible for simple drag
        // but we simulate up to 150km for aerobraking effects.
        if (altitudeM > 150000) return 0;

        return CONSTANTS.SEA_LEVEL_DENSITY * Math.exp(-altitudeM / CONSTANTS.SCALE_HEIGHT);
    }

    /**
     * Calculates atmospheric pressure (Pa).
     * Critical for Engine ISP interpolation (Sea Level vs Vacuum performance).
     */
    static getPressure(altitudeM: number): number {
        if (altitudeM < 0) return CONSTANTS.SEA_LEVEL_PRESSURE;
        if (altitudeM > 100000) return 0;

        return CONSTANTS.SEA_LEVEL_PRESSURE * Math.exp(-altitudeM / CONSTANTS.SCALE_HEIGHT);
    }
}
