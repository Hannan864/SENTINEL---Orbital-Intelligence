
import { useCallback } from 'react';
import * as THREE from 'three';
import { RocketConfig } from '../../services/rocket/rocketMath';
import { createRocketAsset, createRocketTrail, createLocationMarker } from '../../services/three/rocketSceneManager';
import { updateSatellitesInScene, highlightSatellite } from '../../services/three/satelliteManager';
import { TrajectorySettings } from '../../components/TrajectoryPredictor';
import { PhysicsSettings } from '../../components/PhysicsControls';
import { useSceneRefs } from './useSceneRefs'; 
import { RocketSimulation } from '../../services/rocket/RocketSimulation';
import { geoToECEF, VISUAL_SCALE } from '../../services/rocket/RocketState';
import { createConstructionSite } from '../../services/three/constructionManager';
import { SentinelIntelPacket } from '../../types';

type SceneRefs = ReturnType<typeof useSceneRefs>;

export const useSceneActions = (refsContext: SceneRefs) => {
    const { 
        rocketGroupRef, satellitesGroupRef, physicsSettingsRef,
        currentRocketConfig, trailFrameCountRef, rocketMeshRef,
        cameraRef, controlsRef, simulationCoreRef,
        constructionGroupRef, constructionTimeRef,
        earthRef,
        setters: { setRocketStatus }
    } = refsContext;

    const setLocationMarker = useCallback((lat: number, lon: number, alt: number, type: 'ORIGIN' | 'TARGET') => {
        if (!earthRef.current) return;
        
        const label = `${type}_MARKER`;
        const oldMarker = earthRef.current.getObjectByName(label);
        if (oldMarker) earthRef.current.remove(oldMarker);

        const posMeters = geoToECEF(lat, lon, alt);
        const posUnits = posMeters.multiplyScalar(1 / VISUAL_SCALE);
        
        const color = type === 'ORIGIN' ? 0x00ff00 : 0xff0000;
        const marker = createLocationMarker(color, label);
        
        marker.position.copy(posUnits);
        marker.lookAt(new THREE.Vector3(0,0,0)); 
        
        earthRef.current.add(marker);
        
        const worldPos = new THREE.Vector3();
        marker.getWorldPosition(worldPos);
        
        if (controlsRef.current) {
            controlsRef.current.target.copy(worldPos);
            controlsRef.current.update();
        }
    }, [earthRef, controlsRef]);

    const launchRocket = useCallback((config: RocketConfig & { isConstruction?: boolean }) => {
        if (!rocketGroupRef.current) return;
        if (!earthRef.current) return;
        
        rocketGroupRef.current.clear();
        if (satellitesGroupRef.current) satellitesGroupRef.current.clear();
        if (constructionGroupRef.current) constructionGroupRef.current.clear();

        if (config.isConstruction) {
            setRocketStatus('CONSTRUCTING');
            if (constructionTimeRef) constructionTimeRef.current = 0;
            currentRocketConfig.current = config;

            const posMeters = geoToECEF(config.launch.lat, config.launch.lon, config.launch.altitude || 0);
            const startPos = posMeters.multiplyScalar(1 / VISUAL_SCALE);

            const constructionSite = createConstructionSite(startPos);
            constructionSite.lookAt(new THREE.Vector3(0,0,0)); 
            earthRef.current.add(constructionSite);
            
            constructionGroupRef.current = constructionSite; 

            const rocket = createRocketAsset(config);
            rocket.position.copy(startPos);
            const up = startPos.clone().normalize();
            rocket.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
            rocket.visible = false;
            
            earthRef.current.add(rocket);
            rocketGroupRef.current = rocket; 
            rocketMeshRef.current = rocket;

            return;
        }
        
        const params = {
            dryMass: config.mass.dry,
            fuelMass: config.mass.fuel,
            payloadMass: config.mass.payload,
            thrust: config.engine.thrust,
            isp: config.engine.isp,
            launchLat: config.launch.lat,
            launchLon: config.launch.lon,
            launchAlt: config.launch.altitude,
            targetLat: config.target.lat,
            targetLon: config.target.lon,
            targetAlt: config.target.altitude
        };

        const sim = new RocketSimulation(params);
        simulationCoreRef.current = sim as any;
        
        setRocketStatus('ASCENT');
        currentRocketConfig.current = config;
        trailFrameCountRef.current = 0;
        physicsSettingsRef.current = { ...physicsSettingsRef.current, mode: 'R' };

        const rocket = createRocketAsset(config);
        const trail = createRocketTrail();
        
        const container = new THREE.Group();
        container.name = "RocketContainer";
        container.add(rocket);
        container.add(trail);
        
        earthRef.current.add(container);
        
        rocketGroupRef.current = container; 
        rocketMeshRef.current = rocket;

        const visual = sim.getVisualData();
        rocket.position.copy(visual.position);
        rocket.quaternion.copy(visual.quaternion);

        const worldPos = new THREE.Vector3();
        rocket.getWorldPosition(worldPos);

        if (controlsRef.current && cameraRef.current) {
            controlsRef.current.target.copy(worldPos);
            controlsRef.current.update();
        }

        sim.launch();

    }, [rocketGroupRef, satellitesGroupRef, physicsSettingsRef, currentRocketConfig, setRocketStatus, trailFrameCountRef, simulationCoreRef, rocketMeshRef, cameraRef, controlsRef, earthRef, constructionGroupRef, constructionTimeRef]);

    const completeConstruction = useCallback(() => {
        if (constructionGroupRef.current && earthRef.current) {
             earthRef.current.remove(constructionGroupRef.current);
             constructionGroupRef.current = null;
        }
        setRocketStatus('PRELAUNCH');
        if (rocketMeshRef.current) {
            rocketMeshRef.current.visible = true;
        }
    }, [constructionGroupRef, setRocketStatus, rocketMeshRef, earthRef]);

    const pauseSimulation = useCallback(() => {
        if (simulationCoreRef.current) {
            (simulationCoreRef.current as any).togglePause();
        }
    }, [simulationCoreRef]);

    const stopSimulation = useCallback(() => {
        if (simulationCoreRef.current) {
            (simulationCoreRef.current as any).state.status = 'ENDED';
            setRocketStatus('ENDED');
        }
    }, [simulationCoreRef, setRocketStatus]);

    const updateSatellites = useCallback((packet: SentinelIntelPacket, trajectoryConfig: TrajectorySettings) => {
        if (!satellitesGroupRef.current) return;
        
        // The packet metadata sector (e.g., "LEO-Polar") drives the default
        const currentSector = packet.metadata.sector || "LEO";

        // 1. High Priority Risks
        // Pass the packet sector if risk doesn't specify one
        const risks = packet.hiddenRisks.map(r => ({
            id: r.id,
            level: r.riskLevel,
            trajectory: 'LOCKED',
            sector: currentSector 
        }));

        // 2. Background Traffic (Radar Points)
        // Assume radar points belong to the active sector unless named otherwise
        const debris = packet.dashboard.radarPoints.map(p => ({
            id: p.id,
            level: p.level,
            trajectory: 'ESTIMATED',
            sector: currentSector // Place them in the real sector too!
        }));

        const allObjects = [...risks, ...debris];

        updateSatellitesInScene(
            satellitesGroupRef.current,
            currentSector,
            allObjects,
            trajectoryConfig
        );
    }, [satellitesGroupRef]);

    return {
        launchRocket,
        completeConstruction,
        pauseSimulation,
        stopSimulation,
        setLocationMarker,
        updateSatellites,
        resetScene: () => {
            if (rocketGroupRef.current && earthRef.current) {
                earthRef.current.remove(rocketGroupRef.current);
            }
            if (constructionGroupRef.current && earthRef.current) {
                earthRef.current.remove(constructionGroupRef.current);
            }
            if (satellitesGroupRef.current) {
                satellitesGroupRef.current.clear();
            }
            setRocketStatus('IDLE');
            simulationCoreRef.current = null;
        },
        focusSatellite: (id: string) => {
            if (!satellitesGroupRef.current) return;
            const satMesh = satellitesGroupRef.current.getObjectByName(id);
            if (satMesh) {
                highlightSatellite(satMesh);
                const worldPos = new THREE.Vector3();
                satMesh.getWorldPosition(worldPos);
                if (controlsRef.current && cameraRef.current) {
                    controlsRef.current.target.copy(worldPos);
                    const offset = cameraRef.current.position.clone().sub(worldPos);
                    if (offset.lengthSq() < 0.001) offset.set(1, 1, 1);
                    offset.normalize().multiplyScalar(4.0);
                    cameraRef.current.position.copy(worldPos.clone().add(offset));
                    controlsRef.current.update();
                }
            }
        },
        updatePhysicsSettings: (settings: PhysicsSettings) => {
            if (physicsSettingsRef) {
                physicsSettingsRef.current = settings;
            }
        },
        resetScan: () => {
            if (satellitesGroupRef.current) {
                satellitesGroupRef.current.clear();
            }
        }
    };
};
