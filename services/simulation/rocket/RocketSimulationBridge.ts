
import * as THREE from 'three';
import { RocketSimulation } from '../../rocket/RocketSimulation';
import { TRAJECTORY_COLORS } from '../missionRules';

export interface RocketTelemetry {
    active: boolean;
    color: number;
    time: number;
    altitude: number;
    speed: number;
    status: string;
    positionUnits: THREE.Vector3;
    orientation: THREE.Quaternion;
    fuel: number;
}

export const getSimulationTelemetry = (sim: RocketSimulation): RocketTelemetry => {
    const visual = sim.getVisualData();
    
    // Determine trail color based on new rules
    let color = TRAJECTORY_COLORS.NOMINAL_POWERED;
    const hasFuel = sim.state.fuel > 0.1;
    const isFalling = sim.state.vel.dot(sim.state.pos.clone().normalize()) < -5;

    if (sim.state.status === 'ASCENT' || sim.state.status === 'POWERED_FLIGHT') {
        color = 0x00bfff; // Sky Blue
    } else if (hasFuel && isFalling) {
        color = 0xffff00; // Yellow
    } else if (!hasFuel && isFalling) {
        color = 0xff0000; // Red
    } else if (hasFuel && !isFalling) {
        color = 0x00ff00; // Green
    } else {
        color = 0x00008b; // Deep Blue
    }

    return {
        active: !['CRASHED', 'ENDED', 'IDLE'].includes(sim.state.status),
        color: color,
        time: sim.state.time,
        altitude: visual.altitude,
        speed: visual.velocity / 1000,
        status: visual.status,
        positionUnits: visual.position,
        orientation: visual.quaternion,
        fuel: visual.fuel
    };
};
