
import * as THREE from 'three';
import { CONSTANTS } from '../physics/physicsConstants';

// --- CONSTRUCTION SHADERS ---
const HOLOGRAM_VERT = `
  varying vec3 vPos;
  varying vec3 vNormal;
  void main() {
    vPos = position;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HOLOGRAM_FRAG = `
  uniform float uTime;
  uniform float uBuildProgress; // 0.0 to 1.0
  varying vec3 vPos;
  varying vec3 vNormal;

  void main() {
    // Scanline effect
    float scan = sin(vPos.y * 20.0 - uTime * 5.0) * 0.5 + 0.5;
    
    // Build progress clip (vertical wipe)
    // Rocket is roughly -0.2 to 0.2 in Y local space
    float normalizedY = (vPos.y + 0.2) / 0.4;
    
    // Edges glow
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 3.0);
    
    vec3 color = vec3(0.0, 1.0, 1.0); // Cyan
    float alpha = (0.2 + fresnel * 0.8) * scan;
    
    // If below progress, show solid-ish wireframe. If above, invisible.
    if (normalizedY > uBuildProgress) discard;
    
    // Top edge glow
    if (normalizedY > uBuildProgress - 0.05) {
        color = vec3(1.0, 1.0, 1.0);
        alpha = 1.0;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

export const createConstructionSite = (position: THREE.Vector3): THREE.Group => {
    const group = new THREE.Group();
    group.name = "ConstructionSite";
    group.position.copy(position);

    // 1. Hologram Rocket Proxy
    const geo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 16);
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uBuildProgress: { value: 0 }
        },
        vertexShader: HOLOGRAM_VERT,
        fragmentShader: HOLOGRAM_FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const hologram = new THREE.Mesh(geo, mat);
    hologram.name = "Hologram";
    group.add(hologram);

    // 2. Drones (Particles)
    const droneCount = 8;
    const droneGeo = new THREE.BufferGeometry();
    const dronePos = new Float32Array(droneCount * 3);
    droneGeo.setAttribute('position', new THREE.BufferAttribute(dronePos, 3));
    
    const droneMat = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.2, // Scaled by distance in shader usually, but simple here
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        map: generateDroneTexture()
    });
    
    const drones = new THREE.Points(droneGeo, droneMat);
    drones.name = "BuilderDrones";
    group.add(drones);

    // 3. Laser Beams (Lines from drones to center)
    const beamGeo = new THREE.BufferGeometry();
    const beamPos = new Float32Array(droneCount * 6); // 2 points per drone
    beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
    const beamMat = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    const beams = new THREE.LineSegments(beamGeo, beamMat);
    beams.name = "LaserBeams";
    group.add(beams);

    return group;
};

// Texture gen helper
function generateDroneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16,16,0,16,16,16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(0,255,255,0.5)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,32,32);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
}

export const updateConstruction = (group: THREE.Group, progress: number, time: number) => {
    const hologram = group.getObjectByName("Hologram") as THREE.Mesh;
    const drones = group.getObjectByName("BuilderDrones") as THREE.Points;
    const beams = group.getObjectByName("LaserBeams") as THREE.LineSegments;

    if (hologram && hologram.material instanceof THREE.ShaderMaterial) {
        hologram.material.uniforms.uTime.value = time;
        hologram.material.uniforms.uBuildProgress.value = progress;
        hologram.rotation.y = time * 0.2;
    }

    // Animate Drones orbiting and rising
    if (drones && beams) {
        const positions = drones.geometry.attributes.position.array as Float32Array;
        const beamPos = beams.geometry.attributes.position.array as Float32Array;
        
        const count = positions.length / 3;
        const radius = 0.05; // Distance from rocket center
        const heightSpan = 0.12;
        const bottomY = -0.06;

        for(let i=0; i<count; i++) {
            const angle = (i / count) * Math.PI * 2 + (time * 2.0) + (i % 2 === 0 ? 0 : Math.PI); // Counter rot
            const yOffset = bottomY + (progress * heightSpan) + Math.sin(time * 5.0 + i)*0.01;
            
            // Drone Pos
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = yOffset;

            positions[i*3] = x;
            positions[i*3+1] = y;
            positions[i*3+2] = z;

            // Beam Start (Drone)
            beamPos[i*6] = x;
            beamPos[i*6+1] = y;
            beamPos[i*6+2] = z;

            // Beam End (Rocket Surface approx)
            beamPos[i*6+3] = x * 0.2; // Converge to center
            beamPos[i*6+4] = y;
            beamPos[i*6+5] = z * 0.2;
        }

        drones.geometry.attributes.position.needsUpdate = true;
        beams.geometry.attributes.position.needsUpdate = true;
        
        // Hide lasers if complete
        if (progress >= 1.0) {
            beams.visible = false;
            drones.visible = false;
        } else {
            beams.visible = true;
            drones.visible = true;
        }
    }
};
