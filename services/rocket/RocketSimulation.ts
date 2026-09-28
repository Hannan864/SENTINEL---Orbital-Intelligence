
import * as THREE from 'three';
import { RocketState, RocketParams, FlightState, geoToECEF, EARTH_RADIUS, VISUAL_SCALE } from './RocketState';
import { RocketIntegrator } from './RocketIntegrator';
import { RocketGuidance } from './RocketGuidance';

export class RocketSimulation {
  public state: RocketState;
  public params: RocketParams;
  public events: string[] = [];
  public isPaused: boolean = false;

  constructor(params: RocketParams) {
    this.params = params;
    // Use the user-defined launch altitude
    const startPos = geoToECEF(params.launchLat, params.launchLon, params.launchAlt || 10);
    
    // Initial orientation is purely radial up
    const up = startPos.clone().normalize();
    const startQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);

    this.state = {
      pos: startPos,
      // In ECEF, initial velocity on launch pad is 0 (relative to Earth).
      // The Physics engine adds Centrifugal force to account for rotation.
      vel: new THREE.Vector3(0, 0, 0), 
      accel: new THREE.Vector3(0, 0, 0),
      orientation: startQuat,
      mass: params.dryMass + params.fuelMass + params.payloadMass,
      fuel: params.fuelMass,
      throttle: 0,
      time: 0,
      status: 'IDLE'
    };

    console.log(`[ROCKET] Launch Commit: 
      Origin: ${params.launchLat}, ${params.launchLon}, ${params.launchAlt}m
      Target: ${params.targetLat}, ${params.targetLon}, ${params.targetAlt}m
      Bearing: ${RocketGuidance.getBearing(params.launchLat, params.launchLon, params.targetLat, params.targetLon).toFixed(2)} deg
    `);
  }

  public launch() {
    this.state.status = 'ASCENT';
    this.state.throttle = 1.0;
    this.events.push("T-0: IGNITION");
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
    this.events.push(this.isPaused ? "SIMULATION PAUSED" : "SIMULATION RESUMED");
  }

  public step(dt: number, simSpeed: number) {
    if (this.isPaused || ['CRASHED', 'ENDED', 'IDLE'].includes(this.state.status)) return;

    const scaledDt = dt * simSpeed;
    const subSteps = 10;
    const subDt = scaledDt / subSteps;

    for (let i = 0; i < subSteps; i++) {
      this.state.orientation = RocketGuidance.updateOrientation(this.state, this.params, subDt);
      this.state = RocketIntegrator.step(this.state, this.params, subDt);
      
      const r = this.state.pos.length();
      const altitude = r - EARTH_RADIUS;

      if (r < EARTH_RADIUS) {
        this.state.status = 'CRASHED';
        this.state.pos.setLength(EARTH_RADIUS);
        this.state.vel.set(0,0,0);
        this.events.push("IMPACT CONFIRMED");
        break;
      }

      if (altitude > 10000000) {
        this.state.status = 'ESCAPE';
      }

      if (this.state.fuel <= 0 && this.state.throttle > 0) {
        this.state.throttle = 0;
        this.state.status = 'BALLISTIC';
        this.events.push("MECO (Fuel Depleted)");
      }
    }
  }

  public getVisualData() {
    const altitude = this.state.pos.length() - EARTH_RADIUS;
    return {
      position: this.state.pos.clone().multiplyScalar(1 / VISUAL_SCALE),
      quaternion: this.state.orientation.clone(),
      altitude: this.state.status === 'ESCAPE' ? Infinity : altitude / 1000,
      velocity: this.state.vel.length(),
      status: this.state.status,
      fuel: this.state.fuel,
      isPaused: this.isPaused,
      events: [...this.events]
    };
  }
}
