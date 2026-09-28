
import * as THREE from 'three';
import { RocketConfig } from '../rocket/rocketMath';

// --- 1. THE PAYLOAD ---
export const createRocketAsset = (config: RocketConfig): THREE.Group => {
    const group = new THREE.Group();
    group.name = "ActiveRocket";

    // Main Body (Cylinder)
    // Height 0.12, Radius 0.02
    const bodyGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 16);
    // Align so cylinder points up Y (default is Y, but let's shift center)
    // Shift up by half height so pivot is at base (tail)
    bodyGeo.translate(0, 0.06, 0); 
    
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.02, 0.06, 16);
    noseGeo.translate(0, 0.15, 0); // Position on top of body (0.12 + 0.03)
    const noseMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red tip for visibility
    const nose = new THREE.Mesh(noseGeo, noseMat);
    group.add(nose);

    // Glow Effect
    const glowGeo = new THREE.SphereGeometry(0.15, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 0.06; // Center on body
    group.add(glow);

    // Plume (Exhaust)
    // Positioned at 0 (pivot), pointing down (-Y)
    const plumeGeo = new THREE.ConeGeometry(0.04, 0.4, 12);
    plumeGeo.translate(0, -0.2, 0); 
    plumeGeo.rotateX(Math.PI); // Point down

    const plumeMat = new THREE.MeshBasicMaterial({ 
        color: 0xff8800, 
        transparent: true, 
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    const plume = new THREE.Mesh(plumeGeo, plumeMat);
    plume.name = "RocketPlume";
    plume.visible = false;
    group.add(plume);

    const light = new THREE.PointLight(0x00ffff, 2, 10); 
    light.position.y = 0.1;
    group.add(light);

    // Orient whole group so Y is "Up" relative to Earth surface when placed
    // The physics engine treats position vector as "Up", so rocket local Y aligns with position normal
    
    return group;
};

// --- 2. LOCATION MARKERS ---
export const createLocationMarker = (color: number, label: string): THREE.Group => {
    const group = new THREE.Group();
    group.name = label;

    // Pin Head (Sphere)
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 16),
        new THREE.MeshBasicMaterial({ color, toneMapped: false })
    );
    sphere.position.y = 0.05; // Sit on surface
    group.add(sphere);

    // Pin Stick (Line)
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.2, 0)
    ]);
    const line = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 })
    );
    group.add(line);

    // Target Ring (Ground)
    const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.08, 0.1, 32),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
    );
    // Align ring flat on surface (facing up locally)
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    return group;
};

// --- 3. EXPLOSION ---
export const createExplosion = (position: THREE.Vector3): THREE.Group => {
    const group = new THREE.Group();
    group.name = "CrashExplosion";
    group.position.copy(position);
    group.lookAt(new THREE.Vector3(0,0,0));
    // Reduced scale for realism relative to Earth radius (10)
    group.scale.set(0.5, 0.5, 0.5); 

    const flashGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.name = "BlastCore";
    group.add(flash);

    const waveGeo = new THREE.RingGeometry(0.1, 0.35, 48);
    const waveMat = new THREE.MeshBasicMaterial({ 
        color: 0xffaa00, 
        transparent: true, 
        opacity: 1.0, 
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending 
    });
    const wave = new THREE.Mesh(waveGeo, waveMat);
    wave.name = "Shockwave";
    group.add(wave);

    return group;
};

export const updateExplosion = (group: THREE.Group, delta: number): boolean => {
    const core = group.getObjectByName("BlastCore") as THREE.Mesh;
    const wave = group.getObjectByName("Shockwave") as THREE.Mesh;
    let active = false;

    if (core) {
        core.scale.multiplyScalar(1.0 + delta * 5.0);
        if (core.material instanceof THREE.MeshBasicMaterial) {
            core.material.opacity -= delta * 2.0;
            if (core.material.opacity > 0) active = true;
        }
    }

    if (wave) {
        wave.scale.multiplyScalar(1.0 + delta * 6.0);
        if (wave.material instanceof THREE.MeshBasicMaterial) {
            wave.material.opacity -= delta * 1.5;
            if (wave.material.opacity > 0) active = true;
        }
    }

    return active;
};

// --- 4. TRAIL ---
const MAX_TRAIL_POINTS = 10000;

export const createRocketTrail = (): THREE.Line => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_TRAIL_POINTS * 3);
    const colors = new Float32Array(MAX_TRAIL_POINTS * 3);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setDrawRange(0, 0); 

    const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 4,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });

    const line = new THREE.Line(geometry, material);
    line.name = "DynamicTrail";
    line.frustumCulled = false;
    return line;
};

export const updateRocketTrail = (
    line: THREE.Line, 
    newPos: THREE.Vector3, 
    colorHex: number,
    index: number
) => {
    const geometry = line.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    
    if (index >= MAX_TRAIL_POINTS) return;

    positions[index * 3] = newPos.x;
    positions[index * 3 + 1] = newPos.y;
    positions[index * 3 + 2] = newPos.z;

    const c = new THREE.Color(colorHex);
    colors[index * 3] = c.r;
    colors[index * 3 + 1] = c.g;
    colors[index * 3 + 2] = c.b;

    geometry.setDrawRange(0, index + 1);
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.computeBoundingSphere();
};
