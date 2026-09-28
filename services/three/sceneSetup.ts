
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createStarfield } from './starfield';

export interface SceneContext {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    sunLight: THREE.DirectionalLight;
    starfield: THREE.Points;
}

export const initializeScene = (container: HTMLDivElement): SceneContext => {
    // 1. Scene
    const scene = new THREE.Scene();
    
    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 20000); 
    camera.position.set(25, 10, 25); 

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x020617, 0); 
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false; 
    controls.minDistance = 0.5; 
    controls.maxDistance = 5000; 

    // 5. Lighting & Env
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0); 
    sunLight.position.set(50, 0, 20); 
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x404040, 0.05));

    const starfield = createStarfield(8000);
    scene.add(starfield);

    return { scene, camera, renderer, controls, sunLight, starfield };
};

export const handleResize = (container: HTMLDivElement, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
};
