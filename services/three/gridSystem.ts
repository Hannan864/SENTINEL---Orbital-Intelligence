
import * as THREE from 'three';

export const createOrbitalGrids = (): THREE.Group => {
    const group = new THREE.Group();
    group.name = "OrbitalGrids";

    const gridSize = 100;
    const divisions = 20;
    const colorCenterLine = 0x444444;
    const colorGrid = 0x222222;

    // 1. XZ Plane (Equatorial / "Floor")
    const gridXZ = new THREE.GridHelper(gridSize, divisions, colorCenterLine, colorGrid);
    gridXZ.position.y = 0;
    gridXZ.material.transparent = true;
    gridXZ.material.opacity = 0.3;
    group.add(gridXZ);

    // 2. XY Plane (Vertical / "Front")
    const gridXY = new THREE.GridHelper(gridSize, divisions, colorCenterLine, colorGrid);
    gridXY.rotation.x = Math.PI / 2;
    gridXY.material.transparent = true;
    gridXY.material.opacity = 0.15; // More subtle
    group.add(gridXY);

    // 3. YZ Plane (Vertical / "Side")
    const gridYZ = new THREE.GridHelper(gridSize, divisions, colorCenterLine, colorGrid);
    gridYZ.rotation.z = Math.PI / 2;
    gridYZ.material.transparent = true;
    gridYZ.material.opacity = 0.15; // More subtle
    group.add(gridYZ);

    return group;
};

// Create a Geographic Lat/Lon Grid for the Earth Sphere
export const createLatLonGrid = (): THREE.LineSegments => {
    // Radius slightly larger than Earth (10) + Clouds (10.15) to avoid Z-fighting
    const radius = 10.2; 
    // 24 meridians, 18 parallels
    const geometry = new THREE.WireframeGeometry(new THREE.SphereGeometry(radius, 24, 18));
    const material = new THREE.LineBasicMaterial({ 
        color: 0x10b981, // Emerald Green for "Tactical" feel
        transparent: true, 
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });
    
    const lines = new THREE.LineSegments(geometry, material);
    lines.name = "LatLonGrid";
    return lines;
};
