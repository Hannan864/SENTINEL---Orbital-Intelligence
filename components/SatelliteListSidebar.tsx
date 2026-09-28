
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FolderOpen, Database, AlertTriangle, Box, ChevronDown, FileText, LocateFixed, Trash2, Rocket, FlaskConical, MapPin } from 'lucide-react';
import { SatelliteData } from './ViewerToolbar';

export interface SectorGroup {
  name: string;
  satellites: SatelliteData[];
}

interface SatelliteListSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sectors: SectorGroup[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const SatelliteListSidebar: React.FC<SatelliteListSidebarProps> = ({ 
  isOpen, 
  onToggle, 
  sectors, 
  onSelect, 
  selectedId 
}) => {
  const [hoveredSat, setHoveredSat] = useState<SatelliteData | null>(null);
  const [hoverPos, setHoverPos] = useState<{top: number, left: number} | null>(null);
  const [hoverType, setHoverType] = useState<'DATA' | 'RISK'>('DATA');
  
  // State for collapsible sectors
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  
  // Blinking effect states
  const [blinkingSat, setBlinkingSat] = useState<string | null>(null);
  const [blinkingSector, setBlinkingSector] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId) {
        const sector = sectors.find(s => s.satellites.some(sat => sat.id === selectedId));
        if (sector) {
            setExpandedSectors(prev => new Set(prev).add(sector.name));
            setBlinkingSector(sector.name);
            setTimeout(() => setBlinkingSector(null), 500);
            setBlinkingSat(selectedId);
            setTimeout(() => setBlinkingSat(null), 2000);
        }
    }
  }, [selectedId, sectors]);

  const toggleSector = (sectorName: string) => {
      setExpandedSectors(prev => {
          const next = new Set(prev);
          if (next.has(sectorName)) {
              next.delete(sectorName);
          } else {
              next.add(sectorName);
          }
          return next;
      });
  };

  const handleMouseEnter = (sat: SatelliteData, type: 'DATA' | 'RISK', e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredSat(sat);
      setHoverType(type);
      setHoverPos({ top: rect.top, left: rect.right + 10 });
  };

  const handleMouseLeave = () => {
      setHoveredSat(null);
      setHoverPos(null);
  };

  return (
    <>
      {/* TOGGLE BUTTON */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${isOpen ? 'left-[250px]' : 'left-0'}`}
      >
         <button 
           onClick={onToggle}
           className="bg-[#1e293b]/90 border border-slate-700 text-cyan-500 hover:text-cyan-300 w-6 h-12 flex items-center justify-center rounded-r-md shadow-lg backdrop-blur-sm"
           title={isOpen ? "Hide Target List" : "Show Active Targets"}
         >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
         </button>
      </div>

      {/* DRAWER CONTENT */}
      <div 
        className={`absolute top-0 bottom-0 left-0 w-[250px] bg-[#0f172a]/95 border-r border-slate-700 backdrop-blur-md z-30 transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
         <div className="p-4 border-b border-slate-700 flex items-center space-x-2 bg-[#1e293b]/50">
            <Database size={18} className="text-cyan-500" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Target Manifest</span>
            <span className="ml-auto text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
               {sectors.reduce((acc, s) => acc + s.satellites.length, 0)}
            </span>
         </div>

         <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {sectors.length === 0 ? (
               <div className="text-center py-8 text-slate-600 text-[10px] italic">
                  No active vectors.
                  <br/>Execute /scan in terminal.
               </div>
            ) : (
               sectors.map((sector) => {
                  const isExpanded = expandedSectors.has(sector.name);
                  const isSectorBlinking = blinkingSector === sector.name;
                  const isMission = sector.name === "ACTIVE MISSION";

                  return (
                  <div key={sector.name} className="animate-in fade-in slide-in-from-left-2 duration-300">
                      {/* SECTOR HEADER (FILE) */}
                      <div 
                        onClick={() => toggleSector(sector.name)}
                        className={`flex items-center text-xs font-bold p-2 cursor-pointer transition-colors rounded ${
                            isSectorBlinking ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-[#1e293b]'
                        }`}
                      >
                          {isExpanded ? <ChevronDown size={14} className="mr-1 text-slate-500"/> : <ChevronRight size={14} className="mr-1 text-slate-500"/>}
                          <FolderOpen size={14} className={`mr-2 ${isSectorBlinking ? 'text-cyan-400' : isMission ? 'text-green-500' : 'text-amber-500'}`} />
                          <span className="uppercase tracking-wider">{sector.name}</span>
                          <span className="ml-auto text-[9px] text-slate-600 font-mono">
                              [{sector.satellites.length}]
                          </span>
                      </div>

                      {/* SATELLITE TREE */}
                      {isExpanded && (
                          <div className="ml-2 border-l border-slate-700/50 pl-2 space-y-0.5 mt-1">
                              {sector.satellites.map((sat) => {
                                  const isSatBlinking = blinkingSat === sat.id;
                                  const isDebris = sat.type === 'DEBRIS FIELD' || sat.id.includes("FAILURE");
                                  const isRocket = sat.type === 'ACTIVE VEHICLE';
                                  const hasRisk = sat.level !== 'LOW' && sat.level !== 'SAFE';
                                  const riskColor = sat.level === 'CRITICAL' ? 'text-red-500' : 'text-orange-500';
                                  
                                  // Determine Icon Type
                                  let IconComponent = FileText;
                                  if (isRocket) IconComponent = Rocket;
                                  else if (isDebris) IconComponent = Trash2;
                                  else if (sat.id.includes("TEST")) IconComponent = FlaskConical; // Hypothetical test icon

                                  return (
                                      <div 
                                        key={sat.id}
                                        className={`group flex items-center justify-between text-[10px] font-mono py-1 px-2 rounded transition-all relative ${
                                            selectedId === sat.id 
                                            ? 'bg-cyan-900/30 text-cyan-300 border-l-2 border-cyan-500' 
                                            : isDebris ? 'text-red-400 bg-red-900/10' : 'text-slate-400 hover:bg-[#1e293b]'
                                        } ${isSatBlinking ? (hasRisk ? 'animate-pulse bg-red-900/40 text-red-200' : 'animate-pulse bg-cyan-900/40 text-cyan-200') : ''}`}
                                      >
                                          {/* ID & Tree Line */}
                                          <div className="flex items-center min-w-0">
                                              <span className="text-slate-600 mr-2 select-none">|-</span>
                                              <span className="truncate">{sat.id}</span>
                                          </div>

                                          {/* Action Icons */}
                                          <div className="flex items-center space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                              {/* 1. Data Hover */}
                                              <div 
                                                onMouseEnter={(e) => handleMouseEnter(sat, 'DATA', e)}
                                                onMouseLeave={handleMouseLeave}
                                                className="cursor-help hover:text-white"
                                              >
                                                  <IconComponent size={10} className={isRocket ? "text-green-400" : ""} />
                                              </div>

                                              {/* 2. Risk Hover */}
                                              {hasRisk && (
                                                  <div 
                                                    onMouseEnter={(e) => handleMouseEnter(sat, 'RISK', e)}
                                                    onMouseLeave={handleMouseLeave}
                                                    className={`cursor-help ${riskColor} animate-pulse`}
                                                  >
                                                      <AlertTriangle size={10} />
                                                  </div>
                                              )}

                                              {/* 3. Spot On / Focus */}
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); onSelect(sat.id); }}
                                                className="text-cyan-500 hover:text-cyan-300 hover:scale-125 transition-transform"
                                                title="Locate in Viewport"
                                              >
                                                  <LocateFixed size={10} />
                                              </button>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      )}
                  </div>
                  );
               })
            )}
         </div>
      </div>

      {/* HOVER DETAILS BOX */}
      {hoveredSat && hoverPos && (
          <div 
            className={`fixed z-50 w-64 bg-[#0f172a] border shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 pointer-events-none ${
                hoverType === 'RISK' ? 'border-red-900/80 shadow-red-900/20' : 'border-cyan-900/50'
            }`}
            style={{ top: hoverPos.top, left: hoverPos.left }}
          >
              <div className={`px-3 py-2 border-b flex justify-between items-center ${
                  hoverType === 'RISK' ? 'bg-red-950/30 border-red-900/50' : 'bg-[#1e293b] border-slate-700'
              }`}>
                  <div className="flex items-center space-x-2">
                      <Box size={14} className={hoverType === 'RISK' ? "text-red-500" : "text-cyan-500"} />
                      <span className="text-xs font-bold text-white font-mono">{hoveredSat.id}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      hoveredSat.level === 'CRITICAL' ? 'bg-red-900/50 text-red-400' : 
                      hoveredSat.level === 'HIGH' ? 'bg-orange-900/50 text-orange-400' : 
                      'bg-cyan-900/50 text-cyan-400'
                  }`}>
                      {hoveredSat.level}
                  </span>
              </div>
              
              <div className="p-3 space-y-3">
                  {hoverType === 'DATA' ? (
                      <>
                        {/* Coordinates */}
                        <div>
                            <div className="flex items-center text-[9px] text-slate-500 font-bold uppercase mb-1">
                                <MapPin size={10} className="mr-1" /> Coordinates (J2000)
                            </div>
                            <div className="grid grid-cols-3 gap-1 font-mono text-[10px] text-slate-300 bg-black/30 p-1.5 rounded">
                                <div>
                                    <div className="text-slate-600 text-[8px]">LAT</div>
                                    {hoveredSat.coordinates.lat}°
                                </div>
                                <div>
                                    <div className="text-slate-600 text-[8px]">LON</div>
                                    {hoveredSat.coordinates.lon}°
                                </div>
                                <div>
                                    <div className="text-slate-600 text-[8px]">ALT</div>
                                    {hoveredSat.coordinates.alt}
                                </div>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="flex justify-between items-center border-t border-slate-800 pt-2 mt-2">
                            <span className="text-[9px] text-slate-500 uppercase">Type</span>
                            <span className="text-[10px] font-mono text-cyan-400">{hoveredSat.type}</span>
                        </div>
                      </>
                  ) : (
                      <>
                        {/* RISK VIEW */}
                        <div>
                            <div className="flex items-center text-[9px] text-red-400 font-bold uppercase mb-1">
                                <AlertTriangle size={10} className="mr-1" /> Threat Vector
                            </div>
                            <div className="text-[10px] text-slate-300 leading-snug bg-red-950/10 p-2 rounded border border-red-900/20">
                                {hoveredSat.description}
                            </div>
                        </div>
                      </>
                  )}
              </div>
          </div>
      )}
    </>
  );
};

export default SatelliteListSidebar;
