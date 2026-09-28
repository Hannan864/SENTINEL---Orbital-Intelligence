
import * as THREE from 'three';
import { RocketState, RocketParams, EARTH_RADIUS } from './RocketState';

export class RocketGuidance {
  static getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
    
    return (THREE.MathUtils.radToDeg(Math.atan2(y, x)) + 360) % 360;
  }

  static updateOrientation(state: RocketState, params: RocketParams, dt: number): THREE.Quaternion {
    const altitude = state.pos.length() - EARTH_RADIUS;
    const up = state.pos.clone().normalize();
    
    // Default: Radial Up
    let targetDir = up.clone();

    // Guidance Program (Gravity Turn)
    if (altitude > 1000) {
      const north = new THREE.Vector3(0, 1, 0);
      const east = new THREE.Vector3().crossVectors(north, up).normalize();
      const localNorth = new THREE.Vector3().crossVectors(up, east).normalize();
      
      const bearing = this.getBearing(params.launchLat, params.launchLon, params.targetLat, params.targetLon);
      const azRad = (bearing * Math.PI) / 180;
      
      const heading = localNorth.clone().multiplyScalar(Math.cos(azRad))
                                .add(east.clone().multiplyScalar(Math.sin(azRad)))
                                .normalize();

      // Pitch program: 90 deg -> 0 deg between 1km and 150km
      const progress = Math.min(1, Math.max(0, (altitude - 1000) / 149000));
      const pitchAngle = Math.pow(progress, 0.5) * (Math.PI / 2);
      
      targetDir = up.clone().lerp(heading, Math.sin(pitchAngle)).normalize();
    }

    const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetDir);
    const newQuat = state.orientation.clone();
    newQuat.slerp(targetQuat, Math.min(1.0, dt * 0.5)); // Limited pitch rate
    return newQuat;
  }
}
