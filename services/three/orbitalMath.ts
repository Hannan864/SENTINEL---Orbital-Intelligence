
import * as THREE from 'three';

// CONSTANTS FOR VISUAL SCALE
// 3D Scene: Earth Radius = 10.0 units
// Real World: Earth Radius = 6371 km
const R_EARTH_3D = 10.0;
const R_EARTH_KM = 6371;
const KM_TO_UNIT = R_EARTH_3D / R_EARTH_KM;

// Interface for realistic orbital parameters
export interface OrbitalElements {
  id: string;
  semiMajorAxis: number; // 3D Units
  eccentricity: number; 
  inclination: number; // Radians
  ascendingNode: number; // RAAN (Radians)
  anomaly: number; // True Anomaly (Radians)
  speed: number; // Angular velocity factor
  color: number;
}

// Helper to convert km altitude to 3D radius
const altToRadius = (altKm: number) => R_EARTH_3D + (altKm * KM_TO_UNIT);

// Generate plausible Keplerian elements based on sector rules
export const generateOrbitalElements = (id: string, sector: string, index: number, total: number): OrbitalElements => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const prng = (offset: number) => {
      const x = Math.sin(hash + offset + index) * 10000;
      return x - Math.floor(x);
  };

  const s = sector.toUpperCase();
  
  // --- ORBITAL REGIME DEFINITIONS ---
  let altitudeKm = 500; // Default LEO
  let inclinationDeg = 45;
  let eccentricity = 0.001; // Circular
  let raanSpread = true; // Spread satellites around the equator?

  // 1. GEOSTATIONARY (GEO)
  if (s.includes('GEO')) {
      altitudeKm = 35786;
      inclinationDeg = 0 + (prng(1) * 2); // Near 0
      eccentricity = 0.0;
      raanSpread = true; // Ring
  }
  // 2. HIGH ELLIPTICAL (HEO / MOLNIYA)
  else if (s.includes('HEO') || s.includes('MOLNIYA')) {
      altitudeKm = 20000; // Semi-major axis proxy
      inclinationDeg = 63.4; // Critical inclination
      eccentricity = 0.7; // Highly elliptical
      raanSpread = false; // Grouped planes usually
  }
  // 3. MEDIUM EARTH ORBIT (MEO / GPS)
  else if (s.includes('MEO') || s.includes('NAV')) {
      altitudeKm = 20200;
      inclinationDeg = 55;
      eccentricity = 0.02;
  }
  // 4. POLAR LEO
  else if (s.includes('POLAR') || s.includes('SUN-SYNC')) {
      altitudeKm = 600 + (index * 50); // Stacked shells
      inclinationDeg = 98; // Sun-synchronous
      eccentricity = 0.001;
  }
  // 5. STANDARD LEO (ISS, Starlink)
  else {
      // Spread altitudes between 400km and 1200km to prevent overlap
      altitudeKm = 400 + (prng(2) * 800) + (index * 20); 
      inclinationDeg = 28 + (prng(3) * 60); // Variable inclination
  }

  // --- CALCULATION ---
  
  // Radius in 3D Units
  // For HEO, altitudeKm is treated as semi-major axis length adjustment
  const semiMajorAxis = s.includes('HEO') 
      ? R_EARTH_3D * 3.5 // Visual tweak for large ellipse fitting in view
      : altToRadius(altitudeKm);

  // Inclination
  const inclination = inclinationDeg * (Math.PI / 180);

  // RAAN (Longitude of Ascending Node)
  // If spread is true, distribute satellites evenly around the earth (0 to 360)
  // If false, group them in similar planes with slight variance
  let ascendingNode = 0;
  if (raanSpread) {
      ascendingNode = (index / total) * Math.PI * 2 + (prng(4) * 0.5);
  } else {
      ascendingNode = (prng(5) * Math.PI * 2); // Random plane, sharedish
  }

  // True Anomaly (Position along orbit)
  // Distribute distinct satellites apart from each other
  const anomaly = (index / total) * Math.PI * 2 + prng(6);

  // Visual Speed Factor (Kepler's 3rd Law approx: closer = faster)
  // Visual scale tweaked for aesthetics, not 1:1 physics time
  const speed = (0.05 / Math.sqrt(semiMajorAxis)) * (s.includes('GEO') ? 0.2 : 1.0); 

  return {
      id,
      semiMajorAxis,
      eccentricity,
      inclination,
      ascendingNode,
      anomaly,
      speed,
      color: 0xffffff
  };
};

// Calculate 3D position from Keplerian elements
export const getOrbitPosition = (elements: OrbitalElements, angle: number): THREE.Vector3 => {
    const { semiMajorAxis, eccentricity, inclination, ascendingNode } = elements;
    
    // 1. Solve Ellipse in 2D (Perifocal Coord System)
    // r = a(1-e^2) / (1 + e*cos(theta))
    const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(angle));
    
    const px = r * Math.cos(angle);
    const py = r * Math.sin(angle);

    // 2. Rotate to 3D ECI Frame
    // Standard orbital rotation matrix application
    
    // Start with position on orbital plane
    const v = new THREE.Vector3(px, py, 0);

    // Apply Inclination (Rotate around X axis)
    // Note: In ThreeJS Y is Up. We treat Z as normal to equator initially?
    // Let's assume initial plane is X-Z (Equatorial), so Inclination is rotation around X.
    // Wait, standard ellipse calc above puts it in X-Y. 
    // Let's map: X->X, Y->Z (depth), Z->Y (up).
    
    // Re-map to Flat Equatorial Plane (X, Z)
    const xEq = px;
    const zEq = py;
    const yEq = 0;
    
    const pos = new THREE.Vector3(xEq, yEq, zEq);

    // Apply Argument of Periapsis (omitted/randomized via anomaly for simplicity)
    
    // Apply Inclination (Tilt the plane) - Rotate around X axis
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);

    // Apply RAAN (Rotate around World Y / Pole)
    pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), ascendingNode);

    return pos;
};

export const getOrbitPoints = (elements: OrbitalElements, segments: number = 128): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(getOrbitPosition(elements, angle));
    }
    return points;
};
