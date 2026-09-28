
import * as THREE from 'three';
import { EARTH_FRAGMENT_SHADER, EARTH_VERTEX_SHADER } from './earthShaders';

// High-Res NASA Textures (4K where possible for better zoom)
const TEX_COLOR = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg';
const TEX_SPECULAR = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg';
const TEX_NORMAL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg';
const TEX_CLOUDS = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png';
const TEX_LIGHTS = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png';
// Displacement Map for 3D Terrain Depth
const TEX_DISPLACEMENT = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'; // Using normal map as height proxy for demo, ideal is a grayscale heightmap

export const createEarth = (onLoad?: () => void, onProgress?: (percent: number) => void): THREE.Group => {
  const group = new THREE.Group();
  
  // Use LoadingManager to track all textures
  const manager = new THREE.LoadingManager();
  
  manager.onLoad = () => {
      if (onLoad) onLoad();
  };

  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (onProgress) {
          const percent = (itemsLoaded / itemsTotal) * 100;
          onProgress(percent);
      }
  };

  const loader = new THREE.TextureLoader(manager);

  // Load Textures
  const dayMap = loader.load(TEX_COLOR);
  const nightMap = loader.load(TEX_LIGHTS);
  const normalMap = loader.load(TEX_NORMAL);
  const specularMap = loader.load(TEX_SPECULAR);
  const cloudsMap = loader.load(TEX_CLOUDS);
  const displacementMap = loader.load(TEX_DISPLACEMENT); // Height data

  // 1. EARTH SURFACE (Custom Shader - Tile Loading Effect)
  // Increased segment count for displacement detail
  const earthGeo = new THREE.SphereGeometry(10, 256, 256); 
  
  const earthMat = new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayMap },
      nightTexture: { value: nightMap },
      specularMap: { value: specularMap },
      displacementMap: { value: displacementMap }, // New Uniform
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      showNightLights: { value: 0.0 },
      uLoadTime: { value: 0.0 },
      uTextureReady: { value: 0.0 },
      uDisplacementScale: { value: 0.0 } // Controlled by Settings
    },
    vertexShader: EARTH_VERTEX_SHADER,
    fragmentShader: EARTH_FRAGMENT_SHADER,
    wireframe: false
  });

  const earth = new THREE.Mesh(earthGeo, earthMat);
  earth.name = "EarthSurface";
  earth.castShadow = true;
  earth.receiveShadow = true;
  group.add(earth);

  // 2. REALISTIC CLOUDS (Volumetric-Feel Shader)
  const cloudGeo = new THREE.SphereGeometry(10.15, 128, 128);
  const cloudMat = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: cloudsMap },
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      opacityVal: { value: 1.0 },
      uLoadTime: { value: 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormalWorld;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vNormalWorld = normalize(mat3(modelMatrix) * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vViewDir = normalize(cameraPosition - worldPosition.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform vec3 sunDirection;
      uniform float opacityVal;
      uniform float uLoadTime;
      
      varying vec2 vUv;
      varying vec3 vNormalWorld;
      varying vec3 vViewDir;

      void main() {
        // Cloud loading starts slightly delayed
        float cloudLoad = smoothstep(2.5, 4.5, uLoadTime);
        if (cloudLoad < 0.01) discard;

        vec4 texColor = texture2D(map, vUv);
        
        // Use soft alpha from texture
        float cloudIntensity = texColor.r;
        float alpha = smoothstep(0.05, 0.9, cloudIntensity);
        
        if (alpha < 0.01) discard;

        float nDotL = dot(normalize(vNormalWorld), normalize(sunDirection));
        float fresnel = pow(1.0 - dot(normalize(vNormalWorld), vViewDir), 2.0);
        float dayFactor = smoothstep(-0.2, 0.3, nDotL);
        
        vec3 cloudColor = vec3(0.95, 0.95, 1.0);
        vec3 litColor = cloudColor * (0.2 + 0.8 * dayFactor);
        litColor += vec3(0.1, 0.2, 0.4) * fresnel * 0.3;

        float finalAlpha = alpha * opacityVal * cloudLoad * 0.9; 

        gl_FragColor = vec4(litColor, finalAlpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.NormalBlending 
  });

  const clouds = new THREE.Mesh(cloudGeo, cloudMat);
  clouds.name = "Clouds";
  clouds.castShadow = true; 
  group.add(clouds);

  return group;
};

export const updateEarthMaterials = (earthGroup: THREE.Group, settings: { enableTerrain: boolean, showNightLights: boolean, showClouds: boolean }, sunPos: THREE.Vector3, loadTime: number, textureReady: boolean) => {
    const surface = earthGroup.getObjectByName("EarthSurface") as THREE.Mesh;
    const clouds = earthGroup.getObjectByName("Clouds") as THREE.Mesh;

    if (surface && surface.material instanceof THREE.ShaderMaterial) {
        surface.material.uniforms.showNightLights.value = settings.showNightLights ? 1.0 : 0.0;
        surface.material.uniforms.sunDirection.value.copy(sunPos).normalize();
        surface.material.uniforms.uLoadTime.value = loadTime; 
        surface.material.uniforms.uTextureReady.value = textureReady ? 1.0 : 0.0; 
        
        // Terrain Depth Logic
        // 0.0 = Flat Sphere, 0.3 = Visible 3D Mountains
        surface.material.uniforms.uDisplacementScale.value = settings.enableTerrain ? 0.3 : 0.0;
    }

    if (clouds && clouds.material instanceof THREE.ShaderMaterial) {
        clouds.visible = settings.showClouds;
        if (clouds.material.uniforms.sunDirection) {
            clouds.material.uniforms.sunDirection.value.copy(sunPos).normalize();
        }
        if (clouds.material.uniforms.uLoadTime) {
            clouds.material.uniforms.uLoadTime.value = loadTime;
        }
        if (clouds.material.uniforms.uTextureReady) {
            clouds.material.uniforms.uTextureReady.value = textureReady ? 1.0 : 0.0;
        }
    }
};