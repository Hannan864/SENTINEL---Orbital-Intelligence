
import { RocketConfig } from './rocketMath';

export type RocketType = 'VECTOR-1' | 'TITAN-HEAVY';

export const ROCKET_PRESETS: Record<RocketType, Partial<RocketConfig>> = {
    'VECTOR-1': {
        name: "VECTOR-1 (INTERCEPTOR)",
        mass: { dry: 25000, fuel: 450000, payload: 5000 },
        engine: { thrust: 8500, isp: 320, burnTime: 280 }
    },
    'TITAN-HEAVY': {
        name: "TITAN-HEAVY (CARGO)",
        mass: { dry: 120000, fuel: 1200000, payload: 100000 },
        engine: { thrust: 22000, isp: 380, burnTime: 400 }
    }
};

export const LAUNCH_SITES = {
    KARACHI: { lat: 24.793, lon: 66.975, name: "CLIFTON BEACH, KARACHI (PK)" },
    CANAVERAL: { lat: 28.5721, lon: -80.6480, name: "CAPE CANAVERAL (US)" },
    VANDENBERG: { lat: 34.7420, lon: -120.5724, name: "VANDENBERG SFB (US)" }
};

export const LANDING_ZONES = {
    SYDNEY: { lat: -33.8688, lon: 151.2093, name: "SYDNEY HARBOUR (AU)" },
    ANTARCTICA: { lat: -75.00, lon: 0.00, name: "MCMURDO STATION (AQ)" },
    ATLANTIC: { lat: 0, lon: -20, name: "ATLANTIC DRONE SHIP" }
};
