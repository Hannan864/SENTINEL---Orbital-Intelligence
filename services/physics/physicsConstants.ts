
// STRICT PHYSICAL CONSTANTS
// Reference Frame: ECI (Earth Centered Inertial) for Physics
// Visual Frame: 1 Unit = 637.1 km (Earth Radius = 10 Units)

export const CONSTANTS = {
    G: 6.67430e-11,          // Gravitational Constant (m^3 kg^-1 s^-2)
    M_EARTH: 5.972e24,       // Mass of Earth (kg)
    R_EARTH_M: 6371000,      // Radius of Earth (m)
    G0: 9.80665,             // Standard Gravity (m/s^2)
    
    // VISUAL SCALING
    VISUAL_SCALE: 637100,    // Meters per Visual Unit (1 Unit = 637.1 km)
    EARTH_RADIUS_UNITS: 10,  // Visual Radius of Earth
    
    // ATMOSPHERE (US Standard Atmosphere 1976 Simplification)
    ATMOSPHERE_HEIGHT_M: 140000, // Effective drag limit
    SEA_LEVEL_PRESSURE: 101325,  // Pa
    SEA_LEVEL_DENSITY: 1.225,    // kg/m^3
    SCALE_HEIGHT: 8500,          // m (Scale height for density approx)
};

// HELPER: Convert Simulation Units <-> Real Meters
export const toMeters = (units: number) => units * CONSTANTS.VISUAL_SCALE;
export const toUnits = (meters: number) => meters / CONSTANTS.VISUAL_SCALE;

// HELPER: Atmospheric Density at Altitude (m)
export const getAtmosphericDensity = (altitudeM: number): number => {
    if (altitudeM < 0) return CONSTANTS.SEA_LEVEL_DENSITY;
    if (altitudeM > CONSTANTS.ATMOSPHERE_HEIGHT_M) return 0;
    
    // Exponential decay model: rho = rho0 * exp(-h/H)
    return CONSTANTS.SEA_LEVEL_DENSITY * Math.exp(-altitudeM / CONSTANTS.SCALE_HEIGHT);
};

// HELPER: Atmospheric Pressure at Altitude (m) - for ISP calculations
export const getAtmosphericPressure = (altitudeM: number): number => {
    if (altitudeM < 0) return CONSTANTS.SEA_LEVEL_PRESSURE;
    if (altitudeM > CONSTANTS.ATMOSPHERE_HEIGHT_M) return 0;
    
    return CONSTANTS.SEA_LEVEL_PRESSURE * Math.exp(-altitudeM / CONSTANTS.SCALE_HEIGHT);
};
