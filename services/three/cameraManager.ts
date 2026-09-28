
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CONSTANTS } from '../physics/physicsConstants';

/**
 * Manages the camera behavior during different flight phases.
 * Enforces "Rocket Moves, Camera Tracks" realism.
 */
export const updateChaseCamera = (
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    targetPosition: THREE.Vector3, // Visual Units
    targetOrientation: THREE.Quaternion,
    dt: number,
    rocketStatus: string
) => {
    // Current Altitude in Visual Units
    const r = targetPosition.length();
    const earthRadius = CONSTANTS.EARTH_RADIUS_UNITS; // 10
    const altitude = r - earthRadius; // Units
    
    // Scale factor to make sense of units (1 unit = 637km)
    // 1 km = 0.0015 units.
    // 10 km = 0.015 units.
    
    // --- PHASE 1: LAUNCH PAD (Fixed Ground View) ---
    // Camera sits on the ground near the pad, looking UP at the rocket.
    // The rocket physically moves away from the camera.
    if (altitude < 0.005) { // < 3km approx
        // 1. Calculate Launch Pad Position (Project rocket position to surface)
        const surfacePos = targetPosition.clone().normalize().multiplyScalar(earthRadius);
        
        // 2. Camera Stand Offset (e.g., 200m away, 10m up)
        // We need a tangent vector for "Away"
        const up = surfacePos.clone().normalize();
        const north = new THREE.Vector3(0,1,0);
        let east = new THREE.Vector3().crossVectors(north, up).normalize();
        if (east.length() === 0) east = new THREE.Vector3(1,0,0); // Pole fix
        
        // Position camera 200m East of pad
        // 200m = 0.2km = 0.0003 units. 
        // Let's exaggerate for visibility: 0.002 units
        const camPos = surfacePos.clone().add(east.multiplyScalar(0.002)).add(up.multiplyScalar(0.0005));
        
        // Smoothly move camera to this fixed ground spot (in case of jitter)
        camera.position.lerp(camPos, dt * 2.0);
        
        // Look at rocket (Tracking shot)
        // We look slightly above the rocket center
        controls.target.lerp(targetPosition, dt * 5.0);
    }
    
    // --- PHASE 2: ASCENT TRACKING (Telescopic Tracking) ---
    // Camera stays relatively close to ground but tracks the rocket high up
    else if (altitude < 0.1) { // < 60km
        // Keep camera near launch site but allow it to rise slightly to clear terrain
        const surfacePos = targetPosition.clone().normalize().multiplyScalar(earthRadius);
        const up = surfacePos.clone().normalize();
        const north = new THREE.Vector3(0,1,0);
        const east = new THREE.Vector3().crossVectors(north, up).normalize();

        // Pull back as it gets higher
        const pullback = 0.002 + (altitude * 0.1); 
        const camPos = surfacePos.clone().add(east.multiplyScalar(pullback)).add(up.multiplyScalar(altitude * 0.2));

        camera.position.lerp(camPos, dt * 1.0);
        controls.target.lerp(targetPosition, dt * 5.0);
    }

    // --- PHASE 3: ORBITAL CHASE (Locked to Rocket) ---
    else {
        // Standard Chase Cam behind rocket
        const relativeOffset = new THREE.Vector3(0, 0.05, 0.15); // Behind and up
        relativeOffset.applyQuaternion(targetOrientation);
        const desiredCameraPos = targetPosition.clone().add(relativeOffset);
        
        camera.position.lerp(desiredCameraPos, dt * 2.0);
        controls.target.lerp(targetPosition, dt * 5.0);
    }

    controls.update();
};
