
import React from 'react';

export interface ViewerSettingsConfig {
  showAtmosphere: boolean;
  atmosphereDensity: 'LOW' | 'NORMAL' | 'HIGH';
  showClouds: boolean;
  showGrids: boolean; // Orbital Grids
  showLatLonGrid: boolean; // Geographic Grids (New)
  showGravity: boolean;
  showMagnetic: boolean;
  showDrag: boolean;
  autoRotate: boolean;
  cameraPreset: 'Perspective' | 'Top' | 'Side';
  showStarfield: boolean;
  starTwinkle: 'LOW' | 'HIGH'; // Restricted options
  enableTerrain: boolean;
  enableShadows: boolean;
  showNightLights: boolean;
  highQualityLighting: boolean;
  realtimeSun: boolean;
}

// Deprecated component (replaced by ViewerToolbar), keeping interface for type safety across app
const ViewerSettings = () => null;
export default ViewerSettings;
