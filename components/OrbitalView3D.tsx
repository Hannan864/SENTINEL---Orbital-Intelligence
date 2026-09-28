
import React, { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { SentinelIntelPacket, SystemConfig } from '../types';
import { useThreeScene } from '../hooks/useThreeScene';
import ViewerToolbar, { SatelliteData } from './ViewerToolbar'; 
import { ViewerSettingsConfig } from './ViewerSettings';
import SatelliteListSidebar, { SectorGroup } from './SatelliteListSidebar';
import { TrajectorySettings } from './TrajectoryPredictor';
import { PhysicsSettings } from './PhysicsControls';
import { RocketConfig } from '../services/rocket/rocketMath';
import { OrbitalOverlayUI } from './orbital-view/OrbitalOverlayUI';
import { OrbitalPhysicsHUD } from './orbital-view/OrbitalPhysicsHUD';

interface OrbitalView3DProps {
  packet: SentinelIntelPacket | null;
  config?: SystemConfig;
  active?: boolean;
}

const OrbitalView3D: React.FC<OrbitalView3DProps> = ({ packet, config, active }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedSat, setSelectedSat] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sectorRegistry, setSectorRegistry] = useState<SectorGroup[]>([]);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1.0); 

  const [trajSettings, setTrajSettings] = useState<TrajectorySettings>({
      showPast: false,
      showFuture: false,
      predictionWindow: 12
  });

  const [physicsSettings, setPhysicsSettings] = useState<PhysicsSettings>({
      mode: 'O',
      showGravity: false,
      showMagnetic: false,
      showDrag: false
  });
  
  const [viewerSettings, setViewerSettings] = useState<ViewerSettingsConfig>({
    showAtmosphere: false, atmosphereDensity: 'LOW', showClouds: false, showGrids: false,
    showLatLonGrid: false, showGravity: false, showMagnetic: false, showDrag: false,
    autoRotate: false, cameraPreset: 'Perspective', showStarfield: false, 
    starTwinkle: 'LOW', enableTerrain: false, enableShadows: false, 
    showNightLights: false, highQualityLighting: false, realtimeSun: false 
  });

  const { 
      sceneReady, cameraAltitude, loadPhase, downloadProgress, currentPhysics,
      rocketStatus, liveTelemetry, launchRocket, pauseSimulation, stopSimulation, resetScene, resetScan, focusSatellite, updateSatellites, updatePhysicsSettings, setLocationMarker 
  } = useThreeScene(containerRef, viewerSettings, config, simSpeed); 

  useEffect(() => { setIsReady(sceneReady); }, [sceneReady]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync physics settings whenever they change
  useEffect(() => {
    updatePhysicsSettings(physicsSettings);
  }, [physicsSettings, updatePhysicsSettings]);

  // Derive selected satellite data for Target Analysis drawer
  const selectedSatelliteData = useMemo<SatelliteData | null>(() => {
    if (!selectedSat) return null;
    for (const sector of sectorRegistry) {
      const found = sector.satellites.find(s => s.id === selectedSat);
      if (found) {
        return {
          id: found.id,
          name: found.name,
          type: found.type,
          level: found.level,
          description: found.description,
          coordinates: found.coordinates
        };
      }
    }
    return null;
  }, [selectedSat, sectorRegistry]);

  const handleSelectSat = (id: string) => {
    setSelectedSat(id);
    focusSatellite(id);
  };

  // SYNC PACKET DATA TO SCENE
  useEffect(() => {
      if (packet && isReady && active) {
          // 1. Render in 3D (Pass trajSettings to ensure lines update)
          updateSatellites(packet, trajSettings);
          
          // 2. Update UI Sidebar with ALL objects (Risks + Radar Points)
          // Group 1: Priority Risks
          const riskSector: SectorGroup = {
              name: "ACTIVE THREATS",
              satellites: packet.hiddenRisks.map(r => ({
                  id: r.id,
                  name: r.title,
                  type: r.riskLevel === 'CRITICAL' ? 'THREAT VECTOR' : 'ANOMALY',
                  level: r.riskLevel,
                  description: r.description,
                  coordinates: { lat: '28.5', lon: '-80.6', alt: 'LEO' } // Placeholder coords
              }))
          };

          // Group 2: Background Traffic (From Radar Points)
          // We synthesize plausible coordinates based on the ID hash for display purposes
          const backgroundSector: SectorGroup = {
              name: "BACKGROUND TRAFFIC",
              satellites: packet.dashboard.radarPoints.map(p => {
                  // Pseudo-random coord generation for UI display
                  const hash = p.id.split('').reduce((a,b)=>a+b.charCodeAt(0),0);
                  const lat = ((hash % 180) - 90).toFixed(4);
                  const lon = ((hash % 360) - 180).toFixed(4);
                  const alt = (400 + (hash % 200)).toString();

                  return {
                      id: p.id,
                      name: p.label,
                      type: 'DEBRIS FIELD',
                      level: p.level,
                      description: `Tracked object ID ${p.id}. Nominal orbit.`,
                      coordinates: { lat, lon, alt: `${alt} km` }
                  };
              })
          };
          
          setSectorRegistry([riskSector, backgroundSector]);
          
          // Only auto-open if we haven't already (prevent annoying re-opening)
          if (!isLeftSidebarOpen) setIsLeftSidebarOpen(true); 
      }
  }, [packet, isReady, active, updateSatellites, trajSettings]); // Added trajSettings dependence to re-render lines on toggle

  const formatUtcTime = (date: Date) => {
      const zone = config?.timeConfig.useAutoZone ? Intl.DateTimeFormat().resolvedOptions().timeZone : config?.timeConfig.selectedTimezone || 'UTC';
      return date.toLocaleTimeString('en-GB', { timeZone: zone }) + ` ${zone}`;
  };

  return (
    <div className="h-full w-full relative bg-[#020617] overflow-hidden group">
       <div ref={containerRef} className="h-full w-full block cursor-move" />
       {!isReady && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617] z-50">
            <Loader2 size={40} className="text-cyan-500 animate-spin mb-4" />
            <div className="text-cyan-500 font-mono tracking-widest text-xs">INITIALIZING ORBITAL ENGINE...</div>
         </div>
       )}
       <SatelliteListSidebar isOpen={isLeftSidebarOpen} onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} sectors={sectorRegistry} onSelect={handleSelectSat} selectedId={selectedSat} />
       <OrbitalOverlayUI loadPhase={loadPhase} downloadProgress={downloadProgress} sectorRegistry={sectorRegistry} viewerSettings={viewerSettings} currentTime={currentTime} selectedSat={selectedSat} formatUtcTime={formatUtcTime} onReset={resetScene} />
       <OrbitalPhysicsHUD cameraAltitude={cameraAltitude} currentPhysics={currentPhysics} physicsSettings={physicsSettings} rocketStatus={rocketStatus} liveAltitude={liveTelemetry?.altitude} />
       <ViewerToolbar 
          config={viewerSettings} 
          onChange={setViewerSettings} 
          satelliteData={selectedSatelliteData} 
          trajSettings={trajSettings} 
          onTrajChange={setTrajSettings} 
          physicsSettings={physicsSettings} 
          onPhysicsChange={setPhysicsSettings} 
          onLaunchRocket={launchRocket} 
          onPauseRocket={pauseSimulation} 
          onStopRocket={stopSimulation} 
          onSetMarker={setLocationMarker} 
          simSpeed={simSpeed} 
          onSimSpeedChange={setSimSpeed} 
          liveTelemetry={liveTelemetry}
          systemConfig={config} 
       />
    </div>
  );
};

export default OrbitalView3D;
