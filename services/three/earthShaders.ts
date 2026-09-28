
import * as THREE from 'three';

export const EARTH_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormalWorld;
  
  uniform sampler2D displacementMap;
  uniform float uDisplacementScale;

  void main() {
    vUv = uv;
    // Calculate Normal in WORLD SPACE for correct lighting rotation
    vNormalWorld = normalize(mat3(modelMatrix) * normal);
    
    // --- TERRAIN DISPLACEMENT LOGIC ---
    float height = texture2D(displacementMap, uv).r;
    
    // Displace vertex along its normal
    vec3 displacedPosition = position + (normal * height * uDisplacementScale);
    
    vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const EARTH_FRAGMENT_SHADER = `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D specularMap;
  uniform vec3 sunDirection;
  uniform float showNightLights;
  uniform float uLoadTime; // Controls the entire animation sequence
  uniform float uTextureReady; // 0.0 (Loading) or 1.0 (Ready)
  
  varying vec2 vUv;
  varying vec3 vNormalWorld;

  // Pseudo-random for grid noise
  float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    // --- 1. GRID LOGIC (Adjusted for Clarity) ---
    // Reduced density (was 80x40) to prevent cramping
    float gridScaleX = 36.0;
    float gridScaleY = 18.0;
    
    vec2 gridUv = vUv * vec2(gridScaleX, gridScaleY);
    vec2 tileId = floor(gridUv);
    
    // Normalize Tile Y (0.0 at bottom, 1.0 at top) for reveal logic
    // We use the center of the tile for comparison to ensure whole tile flips at once
    float tileY = (tileId.y + 0.5) / gridScaleY; 

    float tileRandom = rand(tileId); // 0.0 to 1.0 per tile

    // --- 2. ANIMATION TIMING CONTROLS ---
    
    // PASS 1: SCANNER (0.0s to 3.0s)
    // Blue laser moves Top->Bottom (UV.y 1->0).
    float scanDuration = 3.0;
    float scanSpeed = 1.0 / scanDuration; 
    // Map time 0..3 to Pos 1.1..-0.1
    float scanPos = 1.1 - (clamp(uLoadTime, 0.0, scanDuration) * scanSpeed * 1.2); 

    // PASS 2: REVEAL (3.0s to 5.5s)
    // The "Squares Rendering" phase. Starts ONLY after 3.0.
    float revealDuration = 2.5;
    float revealSpeed = 1.0 / revealDuration;
    float revealTime = max(0.0, uLoadTime - 3.0);
    float revealPos = 1.1 - (revealTime * revealSpeed * 1.2);

    // Positions relative to current pixel (UV.y)
    // Scan Line is horizontal (constant Y).
    
    // --- 3. COLORS ---
    vec3 colorDeepSpace = vec3(0.0, 0.02, 0.05); // Dark Void
    vec3 colorGridLine = vec3(0.0, 0.25, 0.5);   // Passive Grid (Brighter Blue)
    
    vec3 colorScanLaser = vec3(0.0, 1.0, 1.0);   // Cyan Laser
    vec3 colorDigital   = vec3(0.0, 0.4, 0.8);   // Blue Topology
    vec3 colorReveal    = vec3(1.0, 1.0, 1.0);   // White Reveal Flash

    vec3 finalOutput = vec3(0.0);
    
    // --- WIREFRAME RENDER ---
    vec2 gridFrag = fract(gridUv);
    // Thicker lines (0.08) with smoothstep for anti-aliasing to prevent "missing lines"
    float thickness = 0.08;
    float lineX = smoothstep(1.0 - thickness, 1.0, gridFrag.x);
    float lineY = smoothstep(1.0 - thickness, 1.0, gridFrag.y);
    float gridLine = max(lineX, lineY);
    
    vec3 wireframe = colorDeepSpace + (colorGridLine * gridLine * 0.8);

    // --- 4. TEXTURE SAMPLING ---
    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
    vec3 nightColor = texture2D(nightTexture, vUv).rgb;
    float specular = texture2D(specularMap, vUv).r;
    float nDotL = dot(normalize(vNormalWorld), normalize(sunDirection));
    
    float dayFactor = smoothstep(-0.2, 0.2, nDotL);
    float ambientFactor = 0.1; 
    vec3 baseTexture = dayColor * (dayFactor + ambientFactor);
    
    if (showNightLights > 0.5) {
       float nightFactor = 1.0 - smoothstep(-0.1, 0.1, nDotL);
       vec3 cityLights = nightColor * vec3(1.5, 1.2, 0.6); 
       baseTexture += cityLights * nightFactor * 1.5;
    }
    if (nDotL > 0.0) {
       baseTexture += vec3(0.3) * specular * pow(nDotL, 4.0);
    }

    // --- 5. RENDER LOGIC ---

    // PHASE 2: REVEAL (Texture Loading via Squares)
    if (uLoadTime >= 3.0) {
        // Compare REVEAL LINE vs TILE Y (not pixel Y)
        // This forces the check to be per-square, not per-pixel
        if (revealPos < tileY) {
            // "Square Render" Effect: 
            // Randomize the reveal per tile slightly for digital noise effect
            float tileDelay = tileRandom * 0.15; 
            
            if ((revealPos + tileDelay) < tileY) {
                 finalOutput = baseTexture; // Show Real Earth
                 
                 // Overlay faint grid on texture for tech feel
                 // FADE OUT LOGIC: Fade from 1.0 to 0.0 between t=8.0 and t=9.0
                 // This ensures lines are gone after the 3s blink (which starts at 5.5s)
                 float gridFade = 1.0 - smoothstep(8.0, 9.0, uLoadTime);
                 
                 finalOutput += colorGridLine * gridLine * 0.2 * gridFade;
            } else {
                 // Pending flip (Digital State)
                 finalOutput = colorDigital * 0.5 + (colorGridLine * gridLine);
                 finalOutput += colorReveal * 0.6; // Flash
            }
        } 
        // Below reveal line (but scanned), show Digital Topology
        else {
            finalOutput = colorDigital * 0.3 + (colorGridLine * gridLine);
            
            // Draw the Reveal Laser Line (Pixel based for smoothness)
            float dist = abs(vUv.y - revealPos);
            if (dist < 0.02) {
                finalOutput += colorReveal * (1.0 - (dist / 0.02));
            }
        }
    }
    // PHASE 1: SCANNING
    else {
        // If pixel is above scan line, show Digital Topology
        if (scanPos < vUv.y) {
            finalOutput = colorDigital * 0.3 + (colorGridLine * gridLine);
            
            // Add some "data noise" to the digital part
            float noise = rand(vUv * 10.0 + uLoadTime);
            if (noise > 0.92) finalOutput += colorDigital * 0.5;
        } 
        // Below scan line, show Void/Wireframe
        else {
            finalOutput = wireframe;
        }

        // Draw Scan Laser Line
        float dist = abs(vUv.y - scanPos);
        if (dist < 0.02) {
            finalOutput += colorScanLaser * (1.0 - (dist / 0.02)) * 1.5;
        }
    }

    gl_FragColor = vec4(finalOutput, 1.0);
  }
`;
