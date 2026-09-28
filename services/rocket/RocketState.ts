
import * as THREE from 'three';

export const EARTH_RADIUS = 6371000; // Meters
export const G = 6.67430e-11;
export const M_EARTH = 5.972e24;
export const GM = 3.986004418e14;
export const VISUAL_SCALE = 637100; // 10 units = 1 Earth Radius

export type FlightState = 
  | 'IDLE' 
  | 'ASCENT' 
  | 'POWERED_FLIGHT' 
  | 'BALLISTIC' 
  | 'CRASHED' 
  | 'ESCAPE' 
  | 'ENDED';

export interface RocketState {
  pos: THREE.Vector3;      // ECEF Position (Meters)
  vel: THREE.Vector3;      // Velocity (m/s)
  accel: THREE.Vector3;    // Acceleration (m/s^2)
  orientation: THREE.Quaternion;
  mass: number;            // Current Total Mass (kg)
  fuel: number;            // Current Fuel Mass (kg)
  throttle: number;        // 0 to 1
  time: number;            // Mission Time (s)
  status: FlightState;
}

export interface RocketParams {
  dryMass: number;
  fuelMass: number;
  payloadMass: number;
  thrust: number;          // kN
  isp: number;             // s
  launchLat: number;
  launchLon: number;
  launchAlt: number;       // Meters
  targetLat: number;
  targetLon: number;
  targetAlt: number;       // Meters
}

/**
 * Convert Geodetic to ECEF (Meters)
 * Three.js Mapping: Y is Polar Axis
 */
export function geoToECEF(lat: number, lon: number, alt: number = 0): THREE.Vector3 {
  const r = EARTH_RADIUS + alt;
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180;

  const x = r * Math.cos(phi) * Math.cos(theta);
  const y = r * Math.sin(phi);
  const z = -r * Math.cos(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
}
