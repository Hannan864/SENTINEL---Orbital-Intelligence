
import * as THREE from 'three';

export const createAtmosphere = (): THREE.Group => {
  const group = new THREE.Group();

  // World Space Atmosphere Shader - Thicker, "Sci-Fi" Glow
  const material = new THREE.ShaderMaterial({
    uniforms: {
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      atmosphereDensity: { value: 1.0 }, 
      atmosphereColor: { value: new THREE.Vector3(0.1, 0.4, 1.0) }, // Base Blue
      time: { value: 0.0 }
    },
    vertexShader: `
      varying vec3 vNormalWorld;
      varying vec3 vViewDirWorld;
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        // World Space Normal
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        
        // View Direction (Camera to Vertex) in World Space
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vViewDirWorld = normalize(cameraPosition - worldPosition.xyz);
        
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 sunDirection;
      uniform float atmosphereDensity;
      uniform vec3 atmosphereColor;
      uniform float time;
      
      varying vec3 vNormalWorld;
      varying vec3 vViewDirWorld;
      varying vec2 vUv;

      // Simple noise for subtle shimmer
      float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec3 normal = normalize(vNormalWorld);
        vec3 sunDir = normalize(sunDirection);
        vec3 viewDir = normalize(vViewDirWorld);

        // 1. Fresnel (Rim Light) - Lower power = Thicker glow
        // Using 2.5 instead of 4.5 for a wider, stronger band
        float viewDotNormal = dot(viewDir, normal);
        float fresnel = pow(1.0 - abs(viewDotNormal), 2.5);
        
        // 2. Solar Alignment (Day/Night)
        float sunAlignment = dot(normal, sunDir);
        
        // 3. Shimmer
        float turbulence = noise(vUv * 30.0 + (time * 0.1));
        float shimmer = 0.9 + (turbulence * 0.2); 

        // 4. Color Logic (Vibrant Sci-Fi Palette)
        vec3 dayColor = vec3(0.2, 0.6, 1.0);   // Electric Blue
        vec3 sunsetColor = vec3(1.0, 0.5, 0.1); // Neon Orange
        vec3 nightColor = vec3(0.05, 0.1, 0.4); // Deep Purple/Blue

        // Terminator logic
        vec3 scatteringColor = mix(nightColor, sunsetColor, smoothstep(-0.4, 0.1, sunAlignment));
        scatteringColor = mix(scatteringColor, dayColor, smoothstep(0.1, 0.6, sunAlignment));

        // 5. Intensity Calculation - BOOSTED for visibility
        // Base intensity is much higher now (0.6 min instead of 0.3)
        float intensity = fresnel * (0.6 + 0.6 * smoothstep(-0.5, 0.5, sunAlignment));
        
        // Apply Density
        intensity *= atmosphereDensity * shimmer * 1.5; // 1.5x Multiplier for "Punch"

        gl_FragColor = vec4(scatteringColor, intensity);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide, 
    transparent: true,
    depthWrite: false
  });

  const geometry = new THREE.SphereGeometry(12.5, 64, 64); // Slightly larger geometry
  const atmosphere = new THREE.Mesh(geometry, material);
  atmosphere.name = "AtmosphereGlow";
  group.add(atmosphere);

  return group;
};

export const updateAtmosphereLighting = (atmGroup: THREE.Group, sunPos: THREE.Vector3, time: number) => {
    const mesh = atmGroup.getObjectByName("AtmosphereGlow") as THREE.Mesh;
    if (mesh && mesh.material instanceof THREE.ShaderMaterial) {
        mesh.material.uniforms.sunDirection.value.copy(sunPos).normalize();
        mesh.material.uniforms.time.value = time;
    }
};
