
import * as THREE from 'three';

/**
 * Creates a realistic deep-space starfield using GPU particles.
 * @param count Number of stars
 * @returns THREE.Points object with custom shader material
 */
export const createStarfield = (count: number = 5000): THREE.Points => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const shifts = new Float32Array(count); // Random offset for twinkle phase

  for (let i = 0; i < count; i++) {
    // 1. Position: Extremely far spherical shell (Radius 2000-3000)
    // This ensures stars are always behind Earth and satellites, preventing clipping issues during zoom.
    const r = 2000 + Math.random() * 1000; 
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // 2. Size: Randomize for depth perception
    sizes[i] = Math.random() * 1.5 + 0.5; 

    // 3. Shift: Random phase for twinkling so they don't all blink at once
    shifts[i] = Math.random() * Math.PI;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('shift', new THREE.BufferAttribute(shifts, 1));

  // Custom Shader for Circular Points + Twinkle
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      twinkleIntensity: { value: 1.0 }, // Controlled by React state
      color: { value: new THREE.Color(0xffffff) }
    },
    vertexShader: `
      attribute float size;
      attribute float shift;
      uniform float time;
      uniform float twinkleIntensity;
      varying float vAlpha;
      
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Scale point size by distance to camera (perspective)
        // 400.0 is a magic scaler for this scene scale
        gl_PointSize = size * (800.0 / -mvPosition.z); 
        
        // Twinkle Logic
        // Sine wave based on time + random shift
        float blink = sin(time * 2.0 + shift); 
        
        // Map blink (-1 to 1) to alpha opacity
        // Low intensity = stars are mostly static
        float minOpacity = 0.4;
        float variance = twinkleIntensity * 0.4; // 0.0 to 0.4
        
        vAlpha = minOpacity + (0.5 * (blink + 1.0) * variance);
        
        // Prevent invisible stars if intensity is 0
        if (twinkleIntensity < 0.1) {
            vAlpha = 0.8 + (sin(shift) * 0.2); // Static random brightness
        }
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vAlpha;
      
      void main() {
        // Discard corners to make a circle instead of a square
        vec2 coord = gl_PointCoord - vec2(0.5);
        if (length(coord) > 0.5) discard;
        
        // Soft gradient from center
        float strength = 1.0 - (length(coord) * 2.0);
        strength = pow(strength, 2.0); // Sharpen center
        
        gl_FragColor = vec4(color, vAlpha * strength);
      }
    `,
    transparent: true,
    depthWrite: false, // Stars don't occlude anything
    blending: THREE.AdditiveBlending
  });

  const stars = new THREE.Points(geometry, material);
  stars.name = "DeepSpaceStarfield";
  // Ensure stars render last if depthWrite is false, though huge distance usually handles sorting
  stars.renderOrder = -1; 
  
  return stars;
};
