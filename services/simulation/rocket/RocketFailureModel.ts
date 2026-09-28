
import { RocketState } from './RocketState';
import { CONSTANTS } from '../../physics/physicsConstants';

export class RocketFailureModel {
    
    static check(state: RocketState, dynamicPressurePa: number): string | null {
        // 1. Impact Check
        const r = state.position.length();
        if (r <= CONSTANTS.R_EARTH_M) {
            // Allow small tolerance for launch pad (altitude 0)
            // If velocity is high, it's a crash. If low (< 5 m/s) and upright, it's landed (or sitting).
            if (state.velocity.length() > 5.0) {
                return 'IMPACT_TERRAIN';
            }
        }

        // 2. Max Q (Dynamic Pressure) Structural Failure
        // Typical Max Q limit ~35-40 kPa for civilian rockets
        if (dynamicPressurePa > 45000) {
            return 'STRUCTURAL_OVERPRESSURE';
        }

        // 3. G-Force Limit
        // a / g0
        // Calculate acceleration magnitude from physics state
        // (Forces are re-calculated in core for telemetry, passed here ideally, or derived)
        // Simple check: If T/W > 10 it's likely crushing payload
        // Omitted for simplicity unless we pass forces explicitly.
        
        return null;
    }
}
