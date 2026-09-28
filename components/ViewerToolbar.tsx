
import React, { useState, useRef } from 'react';
import { 
  Settings, Layers, Zap, Globe, Wind, Check, 
  Star, Mountain, Sun, Lightbulb, 
  ChevronRight, ChevronLeft, Video, Clock, Umbrella, Cloud,
  Crosshair, Waypoints, Rocket, Pin, Hammer, Map, Cpu
} from 'lucide-react';
import { ViewerSettingsConfig } from './ViewerSettings';
import TargetAnalysis from './TargetAnalysis';
import TrajectoryPredictor, { TrajectorySettings } from './TrajectoryPredictor';
import PhysicsControls, { PhysicsSettings } from './PhysicsControls';
import RocketMissionControl from './RocketMissionControl'; 
import LaunchPadView from './LaunchPadView'; 
import { RocketConfig } from '../services/rocket/rocketMath';
import { RocketTelemetry } from '../services/simulation/rocket/RocketSimulationBridge';
// Import SystemConfig type implicitly handled via any or we can import if needed, 
// but LaunchPadView props changed so we need to pass config.
import { SystemConfig } from '../types'; 

export interface SatelliteData {
  id: string;
  name: string;
  type: string;
  level: string;
  description: string;
  coordinates: {
    lat: string;
    lon: string;
    alt: string;
  };
}

interface ViewerToolbarProps {
  config: ViewerSettingsConfig;
  onChange: (newConfig: ViewerSettingsConfig) => void;
  satelliteData?: SatelliteData | null;
  trajSettings: TrajectorySettings;
  onTrajChange: (s: TrajectorySettings) => void;
  physicsSettings: PhysicsSettings;
  onPhysicsChange: (s: PhysicsSettings) => void;
  onLaunchRocket: (c: RocketConfig) => void;
  onPauseRocket: () => void;
  onStopRocket: () => void;
  onSetMarker: (lat: number, lon: number, alt: number, type: 'ORIGIN' | 'TARGET') => void;
  simSpeed: number;
  onSimSpeedChange: (speed: number) => void;
  liveTelemetry?: RocketTelemetry | null;
  systemConfig?: SystemConfig; // Optional prop to pass down global system config
}

type Category = 'PLANET' | 'PHYSICS' | 'LIGHTING' | 'CAM' | 'REALTIME' | 'ANALYSIS' | 'TRAJECTORY' | 'ROCKET' | 'BUILD';

const ViewerToolbar: React.FC<ViewerToolbarProps> = ({ 
  config, onChange, 
  satelliteData, 
  trajSettings, onTrajChange,
  physicsSettings, onPhysicsChange,
  onLaunchRocket,
  onPauseRocket,
  onStopRocket,
  onSetMarker,
  simSpeed, onSimSpeedChange,
  liveTelemetry,
  systemConfig
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [pinnedCategory, setPinnedCategory] = useState<Category | null>(null);
  const [stagedRocket, setStagedRocket] = useState<RocketConfig | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = (key: keyof ViewerSettingsConfig) => {
    onChange({ ...config, [key]: !config[key] });
  };

  const updateVal = (key: keyof ViewerSettingsConfig, val: any) => {
    onChange({ ...config, [key]: val });
  };

  const handleInteraction = (cat: Category, type: 'enter' | 'click' | 'double') => {
      if (leaveTimeoutRef.current) {
          clearTimeout(leaveTimeoutRef.current);
          leaveTimeoutRef.current = null;
      }
      if (type === 'double') {
          if (pinnedCategory === cat) {
              setPinnedCategory(null); setActiveCategory(cat);
          } else {
              setPinnedCategory(cat); setActiveCategory(cat);
          }
      } else {
          setActiveCategory(cat);
      }
  };

  const handleMouseLeave = () => {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = setTimeout(() => {
          setActiveCategory(pinnedCategory || null);
      }, 300); 
  };

  const handleDrawerEnter = () => {
      if (leaveTimeoutRef.current) {
          clearTimeout(leaveTimeoutRef.current);
          leaveTimeoutRef.current = null;
      }
  };

  const handleBuildSequence = (cfg: RocketConfig) => {
      setStagedRocket(cfg);
      (onLaunchRocket as any)( { ...cfg, isConstruction: true } ); 
  };

  return (
    <div 
      className={`absolute right-0 top-0 bottom-0 flex z-30 transition-transform duration-300 ${isCollapsed ? 'translate-x-[calc(100%-24px)]' : 'translate-x-0'}`}
      onMouseLeave={handleMouseLeave} 
    >
      <div className="h-full flex items-center">
         <button 
           onClick={() => setIsCollapsed(!isCollapsed)}
           className="w-6 h-12 bg-slate-900/90 border-l border-t border-b border-slate-700 flex items-center justify-center text-cyan-500 hover:text-cyan-300 hover:bg-slate-800 rounded-l-md clip-path-polygon shadow-lg"
           title={isCollapsed ? "Expand Tools" : "Collapse Tools"}
         >
            {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
         </button>
      </div>

      <div className="w-14 h-full bg-[#0f172a]/95 border-l border-slate-700 backdrop-blur-md flex flex-col items-center py-2 gap-1 shadow-2xl overflow-visible">
         <ToolbarIcon 
            icon={<Cpu size={18} />} 
            label="Analysis"
            active={activeCategory === 'ANALYSIS'}
            pinned={pinnedCategory === 'ANALYSIS'}
            onInteract={(t) => handleInteraction('ANALYSIS', t)}
            onDrawerEnter={handleDrawerEnter}
         >
            <div className="w-64">
               <div className="p-3 border-b border-slate-700 bg-slate-900/50 font-bold text-xs text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center"><Crosshair size={12} className="mr-2" /> Target Analysis</span>
                  {pinnedCategory === 'ANALYSIS' && <Pin size={12} className="text-amber-500 fill-amber-500" />}
               </div>
               <div className="p-4"><TargetAnalysis data={satelliteData || null} /></div>
            </div>
         </ToolbarIcon>

         <ToolbarIcon 
            icon={<Hammer size={18} />} 
            label="Build"
            active={activeCategory === 'BUILD'}
            pinned={pinnedCategory === 'BUILD'}
            onInteract={(t) => handleInteraction('BUILD', t)}
            onDrawerEnter={handleDrawerEnter}
         >
            <div className="w-[350px]"> 
               <LaunchPadView 
                  onBuild={handleBuildSequence} 
                  onSwitchView={() => { setPinnedCategory('ROCKET'); setActiveCategory('ROCKET'); }} 
                  onSetMarker={onSetMarker} 
                  config={systemConfig} // Pass config for Maps search
               />
            </div>
         </ToolbarIcon>

         <ToolbarIcon 
            icon={<Rocket size={18} />} 
            label="Flight"
            active={activeCategory === 'ROCKET'}
            pinned={pinnedCategory === 'ROCKET'}
            onInteract={(t) => handleInteraction('ROCKET', t)}
            onDrawerEnter={handleDrawerEnter}
         >
            <div className="w-[350px]"> 
               <RocketMissionControl 
                  rocketConfig={stagedRocket}
                  onLaunch={onLaunchRocket} 
                  onPause={onPauseRocket}
                  onStop={onStopRocket}
                  simSpeed={simSpeed}
                  onSimSpeedChange={onSimSpeedChange}
                  liveTelemetry={liveTelemetry}
               />
            </div>
         </ToolbarIcon>

         <ToolbarIcon 
            icon={<Waypoints size={18} />} 
            label="Trajectory"
            active={activeCategory === 'TRAJECTORY'}
            pinned={pinnedCategory === 'TRAJECTORY'}
            onInteract={(t) => handleInteraction('TRAJECTORY', t)}
            onDrawerEnter={handleDrawerEnter}
         >
            <div className="w-64">
               <div className="p-3 border-b border-slate-700 bg-slate-900/50 font-bold text-xs text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center"><Waypoints size={12} className="mr-2" /> Trajectory Predictor</span>
                  {pinnedCategory === 'TRAJECTORY' && <Pin size={12} className="text-amber-500 fill-amber-500" />}
               </div>
               <TrajectoryPredictor settings={trajSettings} onChange={onTrajChange} />
            </div>
         </ToolbarIcon>

         <div className="my-1 w-8 h-px bg-slate-700/50 shrink-0"></div>

         <ToolbarIcon 
            icon={<Clock size={18} />} 
            label="Time"
            active={activeCategory === 'REALTIME'}
            pinned={pinnedCategory === 'REALTIME'}
            onInteract={(t) => handleInteraction('REALTIME', t)}
            onDrawerEnter={handleDrawerEnter}
         >
            <div className="w-64">
               <div className="p-3 border-b border-slate-700 bg-slate-900/50 font-bold text-xs text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center"><Clock size={12} className="mr-2" /> Realtime Systems</span>
                  {pinnedCategory === 'REALTIME' && <Pin size={12} className="text-amber-500 fill-amber-500" />}
               </div>
               <div className="p-2 space-y-1">
                  <ToggleItem label="Realtime Sun (UTC)" icon={<Sun size={14}/>} active={config.realtimeSun} onClick={() => toggle('realtimeSun')} />
                  <ToggleItem label="Atmosphere Glow" icon={<Wind size={14}/>} active={config.showAtmosphere} onClick={() => toggle('showAtmosphere')} />
                  <ToggleItem label="Auto-Rotation" icon={<Zap size={14}/>} active={config.autoRotate} onClick={() => toggle('autoRotate')} />
                  <ToggleItem label="Real Lat/Lon Grid" icon={<Map size={14}/>} active={config.showLatLonGrid} onClick={() => toggle('showLatLonGrid')} />
                  <div className="my-2 border-t border-slate-700"></div>
                  <ToggleItem label="Day/Night Lights" icon={<Lightbulb size={14}/>} active={config.showNightLights} onClick={() => toggle('showNightLights')} />
                  <ToggleItem label="Dynamic Clouds" icon={<Cloud size={14}/>} active={config.showClouds} onClick={() => toggle('showClouds')} />
               </div>
            </div>
         </ToolbarIcon>

         <ToolbarIcon 
            icon={<Globe size={18} />} 
            label="Planet"
            active={activeCategory === 'PLANET'}
            pinned={pinnedCategory === 'PLANET'}
            onInteract={(t) => handleInteraction('PLANET', t)}
            onDrawerEnter={handleDrawerEnter}
         >
            <div className="w-64">
               <div className="p-3 border-b border-slate-700 bg-slate-900/50 font-bold text-xs text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                  <span>Planetary Surface</span>
                  {pinnedCategory === 'PLANET' && <Pin size={12} className="text-amber-500 fill-amber-500" />}
               </div>
               <div className="p-2 space-y-1">
                  <ToggleItem label="Terrain Depth (3D)" icon={<Mountain size={14}/>} active={config.enableTerrain} onClick={() => toggle('enableTerrain')} />
                  <ToggleItem label="Orbital Grids" icon={<Globe size={14}/>} active={config.showGrids} onClick={() => toggle('showGrids')} />
                  <div className="pt-2 mt-2 border-t border-slate-700">
                      <ToggleItem label="Deep Space Stars" icon={<Star size={14}/>} active={config.showStarfield} onClick={() => toggle('showStarfield')} />
                  </div>
               </div>
            </div>
         </ToolbarIcon>

         <ToolbarIcon 
            icon={<Layers size={18} />} 
            label="Physics"
            active={activeCategory === 'PHYSICS'}
            pinned={pinnedCategory === 'PHYSICS'}
            onInteract={(t) => handleInteraction('PHYSICS', t)}
            onDrawerEnter={handleDrawerEnter}
            drawerPosition="bottom"
         >
            <div className="w-64">
               <div className="p-3 border-b border-slate-700 bg-slate-900/50 font-bold text-xs text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center"><Zap size={12} className="mr-2" /> PHYSICS</span>
                  {pinnedCategory === 'PHYSICS' && <Pin size={12} className="text-amber-500 fill-amber-500" />}
               </div>
               <PhysicsControls settings={physicsSettings} onChange={onPhysicsChange} />
            </div>
         </ToolbarIcon>

         <ToolbarIcon 
            icon={<Video size={18} />} 
            label="Render"
            active={activeCategory === 'LIGHTING'}
            pinned={pinnedCategory === 'LIGHTING'}
            onInteract={(t) => handleInteraction('LIGHTING', t)}
            onDrawerEnter={handleDrawerEnter}
            drawerPosition="bottom"
         >
            <div className="w-64">
               <div className="p-3 border-b border-slate-700 bg-slate-900/50 font-bold text-xs text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                  <span>Render Quality</span>
                  {pinnedCategory === 'LIGHTING' && <Pin size={12} className="text-amber-500 fill-amber-500" />}
               </div>
               <div className="p-2 space-y-1">
                  <ToggleItem label="Cast Realistic Shadows" icon={<Umbrella size={14}/>} active={config.enableShadows} onClick={() => toggle('enableShadows')} />
                  <ToggleItem label="High Quality Render" icon={<Video size={14}/>} active={config.highQualityLighting} onClick={() => toggle('highQualityLighting')} />
               </div>
            </div>
         </ToolbarIcon>

         <div className="flex-1"></div>

         <ToolbarIcon 
            icon={<Settings size={18} />} 
            label="Cam"
            active={activeCategory === 'CAM'}
            pinned={pinnedCategory === 'CAM'}
            onInteract={(t) => handleInteraction('CAM', t)}
            onDrawerEnter={handleDrawerEnter}
            drawerPosition="bottom" 
         >
            <div className="w-56">
               <div className="p-3 border-b border-slate-700 bg-slate-900/50 font-bold text-xs text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                  <span>System</span>
                  {pinnedCategory === 'CAM' && <Pin size={12} className="text-amber-500 fill-amber-500" />}
               </div>
               <div className="p-2">
                  <div className="text-[10px] text-slate-500 font-bold mb-1 px-2">CAMERA PRESET</div>
                  <div className="flex space-x-1 px-2">
                      {['Perspective', 'Top', 'Side'].map(p => (
                          <button 
                            key={p} 
                            onClick={() => updateVal('cameraPreset', p)}
                            className={`flex-1 py-1 text-[9px] border rounded ${config.cameraPreset === p ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                          >
                              {p}
                          </button>
                      ))}
                  </div>
               </div>
            </div>
         </ToolbarIcon>
      </div>
    </div>
  );
};

interface ToolbarIconProps {
    icon: React.ReactNode;
    label?: string;
    children: React.ReactNode;
    active: boolean;
    pinned: boolean;
    onInteract: (type: 'enter' | 'click' | 'double') => void;
    onDrawerEnter?: () => void;
    drawerPosition?: 'top' | 'bottom'; 
}

const ToolbarIcon: React.FC<ToolbarIconProps> = ({ icon, label, children, active, pinned, onInteract, onDrawerEnter, drawerPosition = 'top' }) => {
    let containerClass = 'absolute right-full mr-0 z-[100]'; 
    if (drawerPosition === 'bottom') {
        containerClass += ' bottom-0';
    } else {
        containerClass += ' top-0'; 
    }

    return (
        <div 
          className="relative w-full flex justify-center shrink-0 group"
          onMouseEnter={() => onInteract('enter')}
          onClick={() => onInteract('click')}
          onDoubleClick={() => onInteract('double')}
        >
            <button 
                className={`
                    p-2 rounded-xl transition-all duration-200 relative z-20
                    ${active || pinned ? 'bg-cyan-900/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}
                `}
                title={label}
            >
                {icon}
                {pinned && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_5px_rgba(245,158,11,0.8)]" />}
            </button>
            <div 
                className={`
                    transition-all duration-200 origin-right
                    ${active ? 'visible opacity-100 scale-100' : 'invisible opacity-0 scale-95 pointer-events-none'}
                    ${containerClass}
                `}
                onMouseEnter={onDrawerEnter}
            >
                <div className={`bg-[#1e293b] border ${pinned ? 'border-amber-500/50 shadow-amber-900/20' : 'border-slate-600'} rounded-l-lg shadow-2xl overflow-hidden min-w-[200px] max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

const ToggleItem = ({ label, icon, active, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer text-xs transition-colors ${
       active ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-900/50' : 'hover:bg-slate-800 text-slate-400 border border-transparent'
    }`}
  >
     <div className="flex items-center space-x-3">
        <span className={active ? "text-cyan-500" : "text-slate-600"}>{icon}</span>
        <span>{label}</span>
     </div>
     {active && <Check size={12} className="text-cyan-500" />}
  </div>
);

export default ViewerToolbar;
