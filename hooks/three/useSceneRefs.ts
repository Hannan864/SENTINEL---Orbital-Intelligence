
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PhysicsData } from '../../services/physicsCalculation';
import { RocketConfig } from '../../services/rocket/rocketMath';
import { RigidBodyState } from '../../services/physics/rigidBodyPhysics';
import { PhysicsSettings } from '../../components/PhysicsControls';
import { ViewerSettingsConfig } from '../../components/ViewerSettings';
import { RocketSimulationCore } from '../../services/simulation/rocket/RocketSimulationCore';

export const useSceneRefs = (initialSettings: ViewerSettingsConfig) => {
    // --- REACT STATE ---
    const [sceneReady, setSceneReady] = useState(false);
    const [cameraAltitude, setCameraAltitude] = useState(0);
    const [loadPhase, setLoadPhase] = useState<'INIT' | 'SCANNING' | 'PROCESSING' | 'COMPLETE'>('INIT');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [currentPhysics, setCurrentPhysics] = useState<PhysicsData | null>(null);
    // Added PRELAUNCH state and ENDED state to fix assignment error in useSceneActions
    const [rocketStatus, setRocketStatus] = useState<'IDLE' | 'CONSTRUCTING' | 'PRELAUNCH' | 'ASCENT' | 'ORBIT' | 'CRASHED' | 'ENDED'>('IDLE');

    // --- THREE.JS REFERENCES ---
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
    const starfieldRef = useRef<THREE.Points | null>(null);

    // --- SCENE GRAPH GROUPS ---
    const earthRef = useRef<THREE.Group | null>(null);
    const satellitesGroupRef = useRef<THREE.Group | null>(null);
    const physicsGroupRef = useRef<THREE.Group | null>(null);
    const gridGroupRef = useRef<THREE.Group | null>(null);
    const atmosphereRef = useRef<THREE.Group | null>(null);
    const rocketGroupRef = useRef<THREE.Group | null>(null);
    const rocketMeshRef = useRef<THREE.Group | null>(null);
    const constructionGroupRef = useRef<THREE.Group | null>(null); // NEW

    // --- LOGIC REFS ---
    const trailFrameCountRef = useRef(0);
    const currentRocketConfig = useRef<RocketConfig | null>(null);
    const simulationCoreRef = useRef<RocketSimulationCore | null>(null); // NEW: Physics Core
    const loadTimeRef = useRef(0);
    const constructionTimeRef = useRef(0); // NEW: Timer for build animation
    const texturesLoadedRef = useRef(false);
    const animationIdRef = useRef<number>(0);
    
    // Mutable Settings Refs (for access inside loop without deps)
    const settingsRef = useRef(initialSettings);
    const physicsSettingsRef = useRef<PhysicsSettings>({
        mode: 'O', showGravity: false, showMagnetic: false, showDrag: false
    });

    // --- LEGACY PHYSICS STATE (Kept for compatibility with other views) ---
    const rigidBodyRef = useRef<RigidBodyState>({
        position: new THREE.Vector3(0,0,0),
        velocity: new THREE.Vector3(0,0,0),
        mass: 0,
        fuel: 0,
        orientation: new THREE.Quaternion(),
        angularVelocity: new THREE.Vector3(),
        throttle: 0,
        status: 'READY',
        forces: { 
            gravity: new THREE.Vector3(), 
            drag: new THREE.Vector3(), 
            thrust: new THREE.Vector3(), 
            total: new THREE.Vector3() 
        }
    });

    const physicsTelemetryRef = useRef({ dt: 0, fps: 0, forces: rigidBodyRef.current.forces });

    return {
        // Refs
        sceneRef, cameraRef, rendererRef, controlsRef, sunLightRef, starfieldRef,
        earthRef, satellitesGroupRef, physicsGroupRef, gridGroupRef, atmosphereRef, rocketGroupRef, rocketMeshRef,
        constructionGroupRef,
        trailFrameCountRef, currentRocketConfig, simulationCoreRef, loadTimeRef, constructionTimeRef, texturesLoadedRef, animationIdRef,
        settingsRef, physicsSettingsRef, rigidBodyRef, physicsTelemetryRef,
        
        // State & Setters
        state: {
            sceneReady, cameraAltitude, loadPhase, downloadProgress, currentPhysics, rocketStatus
        },
        setters: {
            setSceneReady, setCameraAltitude, setLoadPhase, setDownloadProgress, setCurrentPhysics, setRocketStatus
        }
    };
};
