
// Physics constants based on Earth
const EARTH_RADIUS_KM = 6371;
const GRAVITY_SURFACE = 9.807; // m/s^2
const MAGNETIC_SURFACE = 31000; // nT (average)
const DRAG_SURFACE = 1.225; // kg/m^3

export interface PhysicsData {
  gravity: number; // m/s^2
  magnetic: number; // nT
  drag: number; // kg/m^3 (scientific notation usually)
}

/**
 * Calculates environmental physics values for a given altitude.
 * @param altitudeKm Altitude in kilometers
 */
export const calculatePhysicsData = (altitudeKm: number): PhysicsData => {
  const r = EARTH_RADIUS_KM + altitudeKm;
  
  // 1. Gravity: Inverse Square Law
  // g = g0 * (re / r)^2
  const gravity = GRAVITY_SURFACE * Math.pow(EARTH_RADIUS_KM / r, 2);

  // 2. Magnetic Field: Dipole Model (Inverse Cube)
  // B = B0 * (re / r)^3
  const magnetic = MAGNETIC_SURFACE * Math.pow(EARTH_RADIUS_KM / r, 3);

  // 3. Atmospheric Drag/Density: Exponential Decay
  // rho = rho0 * exp(-h / H) where H is scale height (~8.5km)
  // Note: This drops to near zero very fast, so we might scale it for "Enterprise" display readability at orbit
  const scaleHeight = 50; // Artificially increased scale height for visual feedback at LEO
  const drag = DRAG_SURFACE * Math.exp(-altitudeKm / scaleHeight);

  return {
    gravity,
    magnetic,
    drag
  };
};
