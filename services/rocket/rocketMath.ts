
export interface RocketConfig {
    name: string;
    mass: {
        dry: number; // kg
        fuel: number; // kg
        payload: number; // kg
    };
    engine: {
        thrust: number; // kN
        isp: number; // s
        burnTime: number; // s
    };
    launch: {
        lat: number;
        lon: number;
        altitude: number; // km
        azimuth: number; // Calculated heading
    };
    target: {
        lat: number; // New: Target Lat
        lon: number; // New: Target Lon
        altitude: number; // km
        inclination: number; // deg (derived)
    };
    // Physics overrides for Sphere
    aero?: {
        cd: number; // Sphere = 0.47
        area: number; // Cross section
    };
}

export interface MissionAnalysis {
    deltaV_available: number;
    deltaV_required: number;
    margin: number;
    orbit_velocity: number;
    is_feasible: boolean;
    gravity_loss: number;
    drag_loss: number;
    flight_time: number;
    bearing: number;
    distance: number;
}

const G0 = 9.80665;
const G = 6.67430e-11;
const M_EARTH = 5.972e24;
const R_EARTH = 6371000;

const toRad = (deg: number) => deg * Math.PI / 180;
const toDeg = (rad: number) => rad * 180 / Math.PI;

export const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const dLam = toRad(lon2 - lon1);

    const y = Math.sin(dLam) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) -
              Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLam);
    
    const bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export const calculateRocketMission = (config: RocketConfig): MissionAnalysis => {
    const { dry, fuel, payload } = config.mass;
    const { isp } = config.engine;
    const { lat, lon, altitude: launchAlt } = config.launch;
    const { lat: targetLat, lon: targetLon, altitude: targetAlt } = config.target;

    const bearing = calculateBearing(lat, lon, targetLat, targetLon);
    const distance = calculateDistance(lat, lon, targetLat, targetLon);

    const m_initial = dry + fuel + payload;
    const m_final = dry + payload;

    const deltaV_available = isp * G0 * Math.log(m_initial / m_final);

    const r_orbit = R_EARTH + (targetAlt * 1000);
    const v_orbit = Math.sqrt((G * M_EARTH) / r_orbit);

    const omega = 7.2921159e-5; 
    const r_launch = R_EARTH + (launchAlt * 1000);
    const v_earth_rot = omega * r_launch * Math.cos(toRad(lat));
    const v_assist = v_earth_rot * Math.sin(toRad(bearing));

    const base_drag_loss = 100; 
    const drag_loss = base_drag_loss * Math.exp(-launchAlt / 10);
    const gravity_loss = Math.max(1000, 1400 - (launchAlt * 2)); 
    const steering_loss = 200; 

    const deltaV_required = v_orbit - v_assist + gravity_loss + drag_loss + steering_loss;
    const margin = ((deltaV_available - deltaV_required) / deltaV_required) * 100;
    const flight_time = config.engine.burnTime + 300; 

    return {
        deltaV_available,
        deltaV_required,
        margin,
        orbit_velocity: v_orbit,
        is_feasible: margin > 0,
        gravity_loss,
        drag_loss,
        flight_time,
        bearing,
        distance
    };
};
