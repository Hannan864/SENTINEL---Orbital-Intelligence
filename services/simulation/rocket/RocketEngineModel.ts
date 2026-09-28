
import { RocketConfig } from '../../rocket/rocketMath';
import { CONSTANTS } from '../../physics/physicsConstants';

export class RocketEngineModel {
    /**
     * Calculates current engine performance based on throttle and ambient pressure.
     */
    static computePerformance(
        config: RocketConfig, 
        throttle: number, 
        ambientPressure: number,
        hasFuel: boolean
    ): { thrustN: number, massFlow: number } {
        if (!hasFuel || throttle <= 0) {
            return { thrustN: 0, massFlow: 0 };
        }

        // 1. Interpolate ISP
        // Pressure Ratio: 1.0 @ Sea Level, 0.0 @ Vacuum
        const pRatio = Math.max(0, Math.min(1, ambientPressure / CONSTANTS.SEA_LEVEL_PRESSURE));
        
        // Vacuum ISP is typically 10-20% higher than Sea Level. 
        // If config only has one ISP, we assume it's SL and estimate Vac.
        const ispSL = config.engine.isp;
        const ispVac = ispSL * 1.15; 
        
        const currentIsp = ispVac - (ispVac - ispSL) * pRatio;

        // 2. Thrust Calculation
        // Standard Rocket Equation Model: Thrust scales with Throttle
        const thrustN = (config.engine.thrust * 1000) * throttle; // kN -> N

        // 3. Mass Flow Rate (dm/dt)
        // F = Isp * g0 * m_dot  =>  m_dot = F / (Isp * g0)
        const massFlow = thrustN / (currentIsp * CONSTANTS.G0);

        return { thrustN, massFlow };
    }
}
