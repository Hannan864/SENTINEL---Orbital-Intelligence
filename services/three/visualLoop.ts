
import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { updateEarthMaterials } from './earthModel';
import { updateAtmosphereLighting } from './atmosphereLayers';
import { updatePhysicsFields } from './orbitalPhysics';
import { updateRocketTrail, updateExplosion } from './rocketSceneManager';
import { animateSatellites } from './satelliteManager';
import { ViewerSettingsConfig } from '../../components/ViewerSettings';
import { PhysicsSettings } from '../../components/PhysicsControls';
import { RigidBodyState } from '../physics/rigidBodyPhysics';
import { evaluateMissionState, TRAJECTORY_COLORS } from '../simulation/missionRules';

// --- ENVIRONMENT UPDATE ---
export const updateEnvironmentVisuals = (
    dt: number,
    elapsedTime: number,
    settings: ViewerSettingsConfig,
    physicsConfig: PhysicsSettings,
    refs: {
        earth: THREE.Group | null,
        atmosphere: THREE.Group | null,
        sunLight: THREE.DirectionalLight | null,
        starfield: THREE.Points | null,
        physicsGroup: THREE.Group | null,
        gridGroup: THREE.Group | null,
        loadTime: React.MutableRefObject<number>,
        texturesLoaded: React.MutableRefObject<boolean>
    }
) => {
    refs.loadTime.current += dt;

    if (!refs.texturesLoaded.current) {
        if (refs.loadTime.current >= 3.0) refs.loadTime.current = 0.0;
    } else {
        if (refs.loadTime.current > 10.0) refs.loadTime.current = 10.0;
    }

    if (refs.earth && refs.sunLight && refs.atmosphere) {
        const clouds = refs.earth.getObjectByName("Clouds");
        if (clouds) {
            clouds.visible = settings.showClouds;
            if (settings.showClouds) clouds.rotation.y += dt * 0.015;
        }
        
        const latLonGrid = refs.earth.getObjectByName("LatLonGrid");
        if (latLonGrid) latLonGrid.visible = settings.showLatLonGrid;

        if (settings.realtimeSun) {
            const now = new Date();
            const hourAngle = (now.getUTCHours() + now.getUTCMinutes()/60) / 24 * Math.PI * 2;
            // Apply rotation to Earth Group
            refs.earth.rotation.y = hourAngle + Math.PI; 
            // Atmosphere is separate, usually syncs
            refs.atmosphere.rotation.y = hourAngle + Math.PI;
        } else if (settings.autoRotate) {
            refs.earth.rotation.y += 0.0005;
            refs.atmosphere.rotation.y += 0.0005;
        }

        updateEarthMaterials(
            refs.earth, 
            { 
                enableTerrain: settings.enableTerrain, 
                showNightLights: settings.showNightLights,
                showClouds: settings.showClouds 
            },
            refs.sunLight.position,
            refs.loadTime.current, 
            refs.texturesLoaded.current 
        );
        
        refs.atmosphere.visible = settings.showAtmosphere;
        if (settings.showAtmosphere) {
            updateAtmosphereLighting(refs.atmosphere, refs.sunLight.position, elapsedTime);
        }
    }

    if (refs.physicsGroup) updatePhysicsFields(refs.physicsGroup, physicsConfig, elapsedTime);
    if (refs.gridGroup) refs.gridGroup.visible = settings.showGrids;

    if (refs.starfield && refs.starfield.material instanceof THREE.ShaderMaterial) {
        refs.starfield.visible = settings.showStarfield;
        const intensity = settings.starTwinkle === 'LOW' ? 0.5 : 1.5; 
        refs.starfield.material.uniforms.twinkleIntensity.value = intensity;
        refs.starfield.material.uniforms.time.value = elapsedTime;
    }

    animateSatellites(elapsedTime);
};

// --- ROCKET VISUAL SYNC ---
export const syncRocketVisuals = (
    dt: number,
    rb: RigidBodyState,
    physicsConfig: PhysicsSettings,
    refs: {
        rocketMesh: THREE.Group | null,
        rocketGroup: THREE.Group | null, // Container (Rocket + Trail)
        trailFrameCount: React.MutableRefObject<number>,
        camera: THREE.PerspectiveCamera | null,
        controls: OrbitControls | null
    }
) => {
    if (!refs.rocketMesh || !refs.rocketGroup) return;
    
    // The rocket is now a child of Earth Group.
    // The Simulation returns position in ECEF (which maps 1:1 to Earth Local Space).
    // So we apply positions directly.
    refs.rocketMesh.position.copy(rb.position);
    refs.rocketMesh.quaternion.copy(rb.orientation);

    // 2. Engine Plume Animation (Fire)
    const plume = refs.rocketMesh.getObjectByName("RocketPlume");
    if (plume) {
        const isBurning = rb.fuel > 0 && rb.throttle > 0 && (rb.status === 'ASCENT' || rb.status === 'IGNITION' || rb.status === 'FLIGHT');
        plume.visible = isBurning;
        if (isBurning) {
            const flicker = 1.0 + (Math.random() * 0.2 - 0.1);
            const scaleY = rb.throttle * 3.0 * flicker;
            const scaleXZ = rb.throttle * 1.5 * flicker;
            plume.scale.set(scaleXZ, scaleY, scaleXZ);
        }
    }

    // 3. Update Trail
    const isSimulating = (rb.status !== 'IDLE' && rb.status !== 'READY');
    
    if (isSimulating) {
        // Trail is inside rocketGroup (which is inside Earth)
        // We need the trail line object
        const trailLine = refs.rocketGroup.getObjectByName("DynamicTrail");
        if (trailLine instanceof THREE.Line) {
            const colorHex = evaluateMissionState(rb);
            // Points are local to Earth, matching rocket
            updateRocketTrail(trailLine, rb.position, colorHex, refs.trailFrameCount.current);
            refs.trailFrameCount.current++;
        }
    }

    // 4. Explosion Handling
    if (rb.status === 'CRASHED') {
        const explosion = refs.rocketGroup.getObjectByName("CrashExplosion");
        if (explosion instanceof THREE.Group) { 
            const active = updateExplosion(explosion, dt);
            if (!active) {
                refs.rocketGroup.remove(explosion);
            }
        }
    }
};
