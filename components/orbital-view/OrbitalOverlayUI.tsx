
import React from 'react';
import { Database, ScanLine, RotateCcw, Clock, Crosshair, Wifi } from 'lucide-react';
import { ViewerSettingsConfig } from '../ViewerSettings';
import { SectorGroup } from '../SatelliteListSidebar';

interface OrbitalOverlayUIProps {
    loadPhase: 'INIT' | 'SCANNING' | 'PROCESSING' | 'COMPLETE';
    downloadProgress: number;
    sectorRegistry: SectorGroup[];
    viewerSettings: ViewerSettingsConfig;
    currentTime: Date;
    selectedSat: string | null;
    formatUtcTime: (date: Date) => string;
    onReset: () => void;
}

export const OrbitalOverlayUI: React.FC<OrbitalOverlayUIProps> = ({
    loadPhase,
    downloadProgress,
    sectorRegistry,
    viewerSettings,
    currentTime,
    selectedSat,
    formatUtcTime,
    onReset
}) => {
    
    // --- ANIMATION STYLES (Self-Contained) ---
    // 1. blinkHide: Blinks 3 times (opacity 0->1->0->1->0->1) then stays hidden
    const animationStyles = `
      @keyframes blinkHide {
        0% { opacity: 0; }
        15% { opacity: 1; }
        30% { opacity: 0; }
        45% { opacity: 1; }
        60% { opacity: 0; }
        75% { opacity: 1; }
        100% { opacity: 0; visibility: hidden; }
      }
      .animate-blink-hide {
        animation: blinkHide 3s cubic-bezier(0.4, 0, 0.6, 1) forwards;
      }
    `;

    // Visual indicator if we are looping (scanning but waiting for textures)
    // If downloadProgress is high but we are still in SCANNING phase
    const isLooping = loadPhase === 'SCANNING' && downloadProgress > 95;

    return (
        <>
            <style>{animationStyles}</style>

            {/* --- TOP LEFT: SECTOR INFO --- */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="text-cyan-500 font-bold font-mono text-lg flex items-center">
                    <GlobeIcon className="mr-2 animate-pulse" />
                    {sectorRegistry.length > 0 
                        ? sectorRegistry.length === 1 ? sectorRegistry[0].name : `MULTI-SECTOR (${sectorRegistry.length})` 
                        : 'SECTOR NOT SELECTED'}
                </div>
                <div className="text-slate-500 text-[10px] font-mono mt-1">
                    VISUALIZATION: REAL-TIME RENDER // THREE.JS
                </div>
            </div>

            {/* --- TOP RIGHT: RESET BUTTON --- */}
            <div className="absolute top-4 right-14 z-10">
                <button 
                    onClick={onReset}
                    className="bg-slate-900/80 hover:bg-cyan-900/50 border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-cyan-400 px-3 py-1.5 rounded flex items-center transition-all group/btn"
                    title="Clear Visualization & Reset View"
                >
                    <RotateCcw size={14} className="mr-2 group-hover/btn:-rotate-90 transition-transform" />
                    <span className="text-xs font-mono font-bold">RESET VIEW</span>
                </button>
            </div>

            {/* --- TOP CENTER: LOADING HUD (PHASE 1) --- */}
            {/* Visible ONLY during SCANNING. Hides during PROCESSING (Square Reveal). */}
            {(loadPhase === 'SCANNING' || loadPhase === 'INIT') && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center space-x-4 bg-black/60 px-6 py-2 rounded-lg border border-cyan-900/50 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)] min-w-[320px]">
                        <Database size={16} className="text-cyan-500 animate-pulse shrink-0" />
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-center text-cyan-400 text-[10px] font-mono font-bold tracking-widest w-full">
                                <span>{isLooping ? "ACQUIRING ASSETS..." : "DOWNLOADING TOPOLOGY"}</span>
                                <span>{downloadProgress}%</span>
                            </div>
                            <div className="w-full h-0.5 bg-slate-700/50 mt-1.5 rounded-full overflow-hidden relative">
                                    <div 
                                        className="h-full bg-cyan-500 transition-all duration-75 ease-linear shadow-[0_0_5px_rgba(34,211,238,0.8)]" 
                                        style={{width: `${downloadProgress}%`}}
                                    ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TOP CENTER: ONLINE HUD (PHASE 3) --- */}
            {/* Appears ONLY when 'COMPLETE'. Blinks 3 times then hides permanently. */}
            {loadPhase === 'COMPLETE' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center min-w-[280px] animate-blink-hide">
                        <div className={`flex items-center justify-center space-x-3 text-xs font-mono font-bold tracking-widest text-cyan-500 bg-black/60 px-6 py-2 rounded-lg border border-cyan-900/50 backdrop-blur-md w-full shadow-[0_0_20px_rgba(34,211,238,0.2)]`}>
                            <ScanLine size={16} />
                            <span>VISUALIZATION ONLINE</span>
                        </div>
                </div>
            )}

            {/* --- BOTTOM FOOTER --- */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end pointer-events-none pr-16 pl-10">
                <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-6">
                    <div className="flex items-center space-x-4">
                        <span>CAM: {viewerSettings.cameraPreset.toUpperCase()}</span>
                        <span>TERRAIN: {viewerSettings.enableTerrain ? 'HIGH-RES' : 'FLAT'}</span>
                        <span>LIGHTS: {viewerSettings.showNightLights ? 'ON' : 'OFF'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 pl-4 border-l border-slate-700">
                        <Clock size={12} className={viewerSettings.realtimeSun ? "text-cyan-400" : "text-slate-600"} />
                        <span className={viewerSettings.realtimeSun ? "text-cyan-400 font-bold" : "text-slate-600"}>
                            {viewerSettings.realtimeSun ? `LIVE: ${formatUtcTime(currentTime)}` : "SIMULATION TIME"}
                        </span>
                    </div>
                </div>

                {selectedSat && (
                    <div className="bg-cyan-950/50 border border-cyan-800 px-3 py-1 rounded text-cyan-400 text-xs font-mono flex items-center">
                        <Crosshair size={12} className="mr-2" />
                        TRACKING: {selectedSat}
                    </div>
                )}
            </div>
            
            <div className="absolute bottom-10 right-16 text-[9px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                LMB: ROTATE | RMB: PAN | SCROLL: ZOOM
            </div>
        </>
    );
};

const GlobeIcon = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);
