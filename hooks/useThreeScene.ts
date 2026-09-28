
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createEarth } from '../services/three/earthModel';
import { createAtmosphere } from '../services/three/atmosphereLayers';
import { createOrbitalGrids, createLatLonGrid } from '../services/three/gridSystem'; 
import { ViewerSettingsConfig } from '../components/ViewerSettings';
import { SystemConfig } from '../types';
import { createExplosion } from '../services/three/rocketSceneManager';
import { updateConstruction } from '../services/three/constructionManager';
import { CONSTANTS } from '../services/physics/physicsConstants';

// Modular Hooks
import { useSceneRefs } from './three/useSceneRefs';
import { useSceneActions } from './three/useSceneActions';
import { initializeScene, handleResize } from '../services/three/sceneSetup';
import { updateEnvironmentVisuals, syncRocketVisuals } from '../services/three/visualLoop';
import { getSimulationTelemetry, RocketTelemetry } from '../services/simulation/rocket/RocketSimulationBridge';

export const useThreeScene = (
  containerRef: React.RefObject<HTMLDivElement>,
  settings: ViewerSettingsConfig,
  systemConfig?: SystemConfig,
  simSpeed: number = 1.0
) => {
  const refsContext = useSceneRefs(settings);
  const { 
      sceneRef, cameraRef, rendererRef, controlsRef, sunLightRef, starfieldRef,
      earthRef, satellitesGroupRef, physicsGroupRef, gridGroupRef, atmosphereRef, rocketGroupRef, rocketMeshRef,
      constructionGroupRef, constructionTimeRef,
      trailFrameCountRef, currentRocketConfig, loadTimeRef, texturesLoadedRef, animationIdRef, simulationCoreRef,
      settingsRef, physicsSettingsRef, rigidBodyRef,
      state: { rocketStatus, loadPhase, downloadProgress },
      setters: { setSceneReady, setDownloadProgress, setLoadPhase, setCameraAltitude, setRocketStatus }
  } = refsContext;

  const [liveTelemetry, setLiveTelemetry] = useState<RocketTelemetry | null>(null);
  const actions = useSceneActions(refsContext);
  const simSpeedRef = useRef(1.0);
  
  const virtualProgressRef = useRef(0);
  const phaseRef = useRef<'INIT' | 'SCANNING' | 'PROCESSING' | 'COMPLETE'>('INIT');

  useEffect(() => { simSpeedRef.current = simSpeed; }, [simSpeed]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const prevCameraPresetRef = useRef(settings.cameraPreset);
  useEffect(() => {
    if (prevCameraPresetRef.current !== settings.cameraPreset && cameraRef.current && controlsRef.current) {
      prevCameraPresetRef.current = settings.cameraPreset;
      if (settings.cameraPreset === 'Perspective') {
        cameraRef.current.position.set(25, 10, 25);
        controlsRef.current.target.set(0, 0, 0);
      } else if (settings.cameraPreset === 'Top') {
        cameraRef.current.position.set(0, 35, 0.001);
        controlsRef.current.target.set(0, 0, 0);
      } else if (settings.cameraPreset === 'Side') {
        cameraRef.current.position.set(35, 0, 0);
        controlsRef.current.target.set(0, 0, 0);
      }
      controlsRef.current.update();
    }
  }, [settings.cameraPreset]);

  useEffect(() => {
      if (loadPhase === 'INIT' && phaseRef.current !== 'INIT') {
          phaseRef.current = 'INIT';
          virtualProgressRef.current = 0;
      }
  }, [loadPhase]);

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera, renderer, controls, sunLight, starfield } = initializeScene(containerRef.current);
    sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer;
    controlsRef.current = controls; sunLightRef.current = sunLight; starfieldRef.current = starfield;

    const handleContainerResize = () => {
      if (containerRef.current && cameraRef.current && rendererRef.current) {
        handleResize(containerRef.current, cameraRef.current, rendererRef.current);
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(handleContainerResize);
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', handleContainerResize);

    const earthGroup = createEarth(
        () => { 
            texturesLoadedRef.current = true; 
        },
        (p) => {}
    );
    scene.add(earthGroup); earthRef.current = earthGroup;

    const latLonGrid = createLatLonGrid();
    latLonGrid.visible = false; 
    earthGroup.add(latLonGrid);

    // Satellites independent (ECI usually, but here we keep simple)
    satellitesGroupRef.current = new THREE.Group(); scene.add(satellitesGroupRef.current);
    physicsGroupRef.current = new THREE.Group(); scene.add(physicsGroupRef.current);
    
    // Rocket Group is now managed by Actions (Child of Earth)
    // We just initialize a ref placeholder if needed, but actions will overwrite.
    rocketGroupRef.current = new THREE.Group(); 
    // Do NOT add rocketGroup to scene here, useSceneActions adds it to Earth.

    gridGroupRef.current = createOrbitalGrids(); scene.add(gridGroupRef.current);
    atmosphereRef.current = createAtmosphere(); scene.add(atmosphereRef.current);

    const clock = new THREE.Clock();

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      
      if (simulationCoreRef.current) {
          const core = simulationCoreRef.current;
          core.step(dt, simSpeedRef.current);
          const telemetry = getSimulationTelemetry(core as any);
          setLiveTelemetry(telemetry);

          rigidBodyRef.current.position.copy(telemetry.positionUnits);
          rigidBodyRef.current.orientation.copy(telemetry.orientation);
          rigidBodyRef.current.status = telemetry.status as any;
          
          if (telemetry.status === 'CRASHED' && rocketStatus !== 'CRASHED') {
              setRocketStatus('CRASHED');
              if (rocketMeshRef.current) rocketMeshRef.current.visible = false;
              // Add explosion to Earth group (rocketGroup is in Earth)
              rocketGroupRef.current?.add(createExplosion(telemetry.positionUnits));
          }
      }

      if (rocketStatus === 'CONSTRUCTING' && constructionGroupRef.current) {
          constructionTimeRef.current += dt;
          const progress = Math.min(1.0, constructionTimeRef.current / 5.0);
          updateConstruction(constructionGroupRef.current, progress, constructionTimeRef.current);
      }

      if (phaseRef.current === 'SCANNING' || phaseRef.current === 'INIT') {
          const target = texturesLoadedRef.current ? 100 : 98;
          const interpolationSpeed = texturesLoadedRef.current ? 5.0 : 0.8; 
          virtualProgressRef.current += (target - virtualProgressRef.current) * interpolationSpeed * dt;
          let displayValue = Math.floor(virtualProgressRef.current);
          if (texturesLoadedRef.current && Math.abs(100 - virtualProgressRef.current) < 0.5) {
              virtualProgressRef.current = 100;
              displayValue = 100;
          }
          setDownloadProgress(displayValue);
          if (displayValue >= 100) {
              phaseRef.current = 'PROCESSING';
              setLoadPhase('PROCESSING');
              loadTimeRef.current = 3.0;
          } else {
              if (phaseRef.current !== 'SCANNING') {
                  phaseRef.current = 'SCANNING';
                  setLoadPhase('SCANNING');
              }
          }
      } 
      else if (phaseRef.current === 'PROCESSING') {
          if (loadTimeRef.current >= 5.5) {
              phaseRef.current = 'COMPLETE';
              setLoadPhase('COMPLETE');
          }
      }

      updateEnvironmentVisuals(dt, clock.getElapsedTime(), settingsRef.current, physicsSettingsRef.current, {
          earth: earthRef.current, atmosphere: atmosphereRef.current, sunLight: sunLightRef.current,
          starfield: starfieldRef.current, physicsGroup: physicsGroupRef.current, gridGroup: gridGroupRef.current,
          loadTime: loadTimeRef, texturesLoaded: texturesLoadedRef
      });

      syncRocketVisuals(dt, rigidBodyRef.current, physicsSettingsRef.current, {
          rocketMesh: rocketMeshRef.current, rocketGroup: rocketGroupRef.current,
          trailFrameCount: trailFrameCountRef, camera: cameraRef.current, controls: controlsRef.current
      });

      if (controlsRef.current && cameraRef.current) {
          setCameraAltitude(cameraRef.current.position.length() - CONSTANTS.EARTH_RADIUS_UNITS);
      }
      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
    };
    
    animate();
    setSceneReady(true);
    return () => {
        cancelAnimationFrame(animationIdRef.current);
        if (resizeObserver) resizeObserver.disconnect();
        window.removeEventListener('resize', handleContainerResize);
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
    };
  }, []); 

  return { ...refsContext.state, ...actions, liveTelemetry };
};
