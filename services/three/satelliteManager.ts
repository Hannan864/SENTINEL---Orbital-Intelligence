
import * as THREE from 'three';
import { generateOrbitalElements, getOrbitPoints, getOrbitPosition, OrbitalElements } from './orbitalMath';

// Store elements for animation updates
const activeSatellites: { mesh: THREE.Mesh, elements: OrbitalElements, label?: string }[] = [];

export const updateSatellitesInScene = (
  sceneGroup: THREE.Group, 
  defaultSector: string, 
  risks: { id: string, level: string, trajectory: string, sector?: string }[],
  trajectoryConfig: { showPast: boolean, showFuture: boolean } = { showPast: false, showFuture: false }
) => {
  // Clear existing
  sceneGroup.clear();
  activeSatellites.length = 0; 

  const totalSats = risks.length;

  risks.forEach((risk, index) => {
      const isCritical = risk.level === 'CRITICAL';
      const isSafe = risk.level === 'SAFE';
      
      // Enterprise Colors
      const color = isCritical ? 0xef4444 : (risk.level === 'HIGH' ? 0xf97316 : (isSafe ? 0x10b981 : 0x22d3ee));
      
      // Use the risk's specific sector if available, else packet default
      const targetSector = risk.sector || defaultSector;

      // 1. Generate Realistic Keplerian Elements
      // Pass index/total to force distribution along the ring
      const elements = generateOrbitalElements(risk.id, targetSector, index, totalSats);
      elements.color = color;

      // 2. Satellite Mesh (Representation)
      const satGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2); 
      const satMat = new THREE.MeshStandardMaterial({ 
          color: color, 
          emissive: color, 
          emissiveIntensity: isCritical ? 1.0 : 0.5,
          roughness: 0.4,
          metalness: 0.8
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      
      // Solar Panels
      const panelGeo = new THREE.BoxGeometry(0.8, 0.02, 0.3);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.9 });
      const panels = new THREE.Mesh(panelGeo, panelMat);
      satMesh.add(panels);

      // Initial Position
      const pos = getOrbitPosition(elements, elements.anomaly);
      satMesh.position.copy(pos);
      satMesh.lookAt(new THREE.Vector3(0,0,0));

      satMesh.name = risk.id;
      satMesh.userData = { risk, elements };
      
      sceneGroup.add(satMesh);
      activeSatellites.push({ mesh: satMesh, elements, label: risk.id });

      // 3. ORBIT RAIL (The "Enterprise Thin Line")
      const railPoints = getOrbitPoints(elements, 256); // High res for smoothness
      const railGeo = new THREE.BufferGeometry().setFromPoints(railPoints);
      
      // LineLoop for closed orbit
      const railMat = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: isCritical ? 0.6 : 0.15, // Criticals stand out, others fade back
          linewidth: 1 // WebGL restriction often keeps this 1px, which is perfect for "thin" look
      });
      const railLine = new THREE.LineLoop(railGeo, railMat);
      sceneGroup.add(railLine);

      // 4. PREDICTION TRAILS (Optional Toggles)
      if (trajectoryConfig.showPast || trajectoryConfig.showFuture) {
          const currentAngle = elements.anomaly;
          
          if (trajectoryConfig.showPast) {
              const pastPoints = [];
              for(let i=0; i<=40; i++) {
                  // Trace backwards 1/8th of orbit
                  const a = currentAngle - ((i/40) * (Math.PI / 4)); 
                  pastPoints.push(getOrbitPosition(elements, a));
              }
              const pastGeo = new THREE.BufferGeometry().setFromPoints(pastPoints);
              const pastMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.4 });
              sceneGroup.add(new THREE.Line(pastGeo, pastMat));
          }

          if (trajectoryConfig.showFuture) {
              const futurePoints = [];
              for(let i=0; i<=60; i++) {
                  // Trace forward 1/4th of orbit
                  const a = currentAngle + ((i/60) * (Math.PI / 2)); 
                  futurePoints.push(getOrbitPosition(elements, a));
              }
              const futureGeo = new THREE.BufferGeometry().setFromPoints(futurePoints);
              const futureMat = new THREE.LineDashedMaterial({ 
                  color: color, dashSize: 0.5, gapSize: 0.2, scale: 1, transparent: true, opacity: 0.5 
              });
              const futureLine = new THREE.Line(futureGeo, futureMat);
              futureLine.computeLineDistances();
              sceneGroup.add(futureLine);
          }
      } 
  });
};

export const animateSatellites = (time: number) => {
    activeSatellites.forEach(({ mesh, elements }) => {
        // Update anomaly based on speed and time
        const newAnomaly = elements.anomaly + (elements.speed * time * 0.1); 
        const newPos = getOrbitPosition(elements, newAnomaly);
        
        mesh.position.copy(newPos);
        
        // Orient satellite to face velocity vector or earth?
        // Simple lookAt Earth center for now
        mesh.lookAt(new THREE.Vector3(0,0,0));
    });
};

export const highlightSatellite = (mesh: THREE.Object3D) => {
    if (mesh instanceof THREE.Mesh) {
       mesh.scale.setScalar(2.0);
       setTimeout(() => mesh.scale.setScalar(1.0), 500);
    }
};
