
import * as THREE from 'three';
import { PhysicsSettings } from '../../components/PhysicsControls';

export const updatePhysicsFields = (group: THREE.Group, config: PhysicsSettings, time: number) => {
    // O = OFF
    const showPhysics = config.mode !== 'O';
    
    // --- 1. GRAVITY WELLS (Pulsating Geoid) ---
    let gravityMesh = group.getObjectByName("GravityWell") as THREE.Mesh;
    if (showPhysics && config.showGravity) {
        if (!gravityMesh) {
            const geo = new THREE.IcosahedronGeometry(10.5, 2); // Geodesic sphere
            const mat = new THREE.MeshBasicMaterial({ 
                color: 0x10b981, 
                wireframe: true, 
                transparent: true, 
                opacity: 0.15,
                blending: THREE.AdditiveBlending
            });
            gravityMesh = new THREE.Mesh(geo, mat);
            gravityMesh.name = "GravityWell";
            group.add(gravityMesh);
        }
        gravityMesh.visible = true;
        // Animation: Pulse scale
        // R mode creates a faster, more intense pulse
        const pulseSpeed = config.mode === 'R' ? 4.0 : 2.0;
        const pulse = 1.0 + Math.sin(time * pulseSpeed) * 0.02;
        gravityMesh.scale.set(pulse, pulse, pulse);
        gravityMesh.rotation.y = time * 0.05;
        gravityMesh.rotation.z = time * 0.02;
    } else if (gravityMesh) {
        gravityMesh.visible = false;
    }

    // --- 2. MAGNETIC FLUX (Flowing Toroidal Lines) ---
    let magneticGroup = group.getObjectByName("MagneticFlux") as THREE.Group;
    if (showPhysics && config.showMagnetic) {
        if (!magneticGroup) {
            magneticGroup = new THREE.Group();
            magneticGroup.name = "MagneticFlux";
            
            // Create field lines
            for (let i = 0; i < 12; i++) {
                const radius = 15 + Math.random() * 15;
                const curve = new THREE.EllipseCurve(
                    0, 0,            // ax, aY
                    radius * 0.6, radius, // xRadius, yRadius (elongated)
                    0, 2 * Math.PI,  // aStartAngle, aEndAngle
                    false,           // aClockwise
                    0                // aRotation
                );
                
                const points = curve.getPoints(64).map(p => new THREE.Vector3(p.x, 0, p.y));
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                
                // Orient upright
                geometry.rotateZ(Math.PI / 2); 
                // Rotate around Y axis to distribute
                geometry.rotateY((Math.PI / 6) * i);

                // Dashed material for flow effect
                const material = new THREE.LineDashedMaterial({
                    color: 0xa855f7, // Purple
                    dashSize: 1,
                    gapSize: 1,
                    scale: 1, // Will animate this
                    transparent: true,
                    opacity: 0.6,
                    blending: THREE.AdditiveBlending
                });
                
                const line = new THREE.Line(geometry, material);
                line.computeLineDistances(); // Required for dashed material
                magneticGroup.add(line);
            }
            group.add(magneticGroup);
        }
        magneticGroup.visible = true;
        
        // Animation: Flow the dashes
        const flowSpeed = config.mode === 'R' ? 5.0 : 2.0;
        magneticGroup.children.forEach((child: any, i) => {
            if (child.material instanceof THREE.LineDashedMaterial) {
                // Pulse opacity faster in R mode
                child.material.opacity = 0.3 + 0.3 * Math.sin(time * flowSpeed + i);
            }
        });
        
    } else if (magneticGroup) {
        magneticGroup.visible = false;
    }

    // --- 3. DRAG DENSITY (Volumetric Shells) ---
    let dragGroup = group.getObjectByName("DragDensity") as THREE.Group;
    if (showPhysics && config.showDrag) {
        if (!dragGroup) {
            dragGroup = new THREE.Group();
            dragGroup.name = "DragDensity";
            
            // Thermosphere (Orange/Red)
            const thermoGeo = new THREE.SphereGeometry(11.5, 32, 32);
            const thermoMat = new THREE.MeshBasicMaterial({
                color: 0xf97316,
                transparent: true,
                opacity: 0.05,
                wireframe: true
            });
            const thermo = new THREE.Mesh(thermoGeo, thermoMat);
            
            // Exosphere (Yellow/White)
            const exoGeo = new THREE.SphereGeometry(14.0, 32, 32);
            const exoMat = new THREE.MeshBasicMaterial({
                color: 0xfacc15,
                transparent: true,
                opacity: 0.03,
                wireframe: true
            });
            const exo = new THREE.Mesh(exoGeo, exoMat);

            dragGroup.add(thermo);
            dragGroup.add(exo);
            group.add(dragGroup);
        }
        dragGroup.visible = true;
        // Animation: Slow rotation to show volume
        dragGroup.rotation.y = -time * 0.02;
    } else if (dragGroup) {
        dragGroup.visible = false;
    }
};
