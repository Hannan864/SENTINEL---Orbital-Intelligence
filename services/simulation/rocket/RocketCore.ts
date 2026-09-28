
import { RocketController } from './RocketController';
import { RocketConfig } from '../../rocket/rocketMath';

// Bridge class to maintain compatibility with useThreeScene while using new Engine
// Effectively just wraps RocketController
export class RocketSimulationCore extends RocketController {
    constructor(config: RocketConfig) {
        // Map old config format to new robust format
        const robustConfig = {
            name: config.name,
            mass: config.mass,
            engine: {
                thrust: config.engine.thrust,
                isp: config.engine.isp,
                burnTime: config.engine.burnTime,
                thrustSL: config.engine.thrust * 0.9, // Estimate
                thrustVac: config.engine.thrust,
                ispSL: config.engine.isp * 0.85, // Estimate
                ispVac: config.engine.isp
            },
            aero: {
                cd: 0.5,
                area: 10.0 // m^2
            },
            launch: {
                lat: config.launch.lat,
                lon: config.launch.lon,
                altitude: config.launch.altitude,
                azimuth: config.launch.azimuth
            },
            target: config.target
        };
        super(robustConfig);
    }
}
