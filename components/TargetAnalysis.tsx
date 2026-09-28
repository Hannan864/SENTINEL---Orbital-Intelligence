
import React from 'react';
import { Crosshair, Radio, Database, Activity, Ruler, Clock } from 'lucide-react';
import { SatelliteData } from './ViewerToolbar';

interface TargetAnalysisProps {
  data: SatelliteData | null;
}

const TargetAnalysis: React.FC<TargetAnalysisProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-8 text-slate-600">
          <div className="mb-3 opacity-20 animate-pulse"><Crosshair size={32} className="mx-auto" /></div>
          <div className="text-[10px] font-bold uppercase">No Target Locked</div>
          <div className="text-[9px] opacity-60 mt-1">Select an object in the viewport to analyze telemetry.</div>
      </div>
    );
  }

  // Enterprise styling for the analysis box
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
        {/* Header / ID */}
        <div className="flex justify-between items-start">
            <div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Target ID</div>
                <div className="text-sm font-mono text-white font-bold bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700 inline-block shadow-sm">
                    {data.id}
                </div>
            </div>
            <div className={`px-2 py-1 rounded text-[9px] font-bold border uppercase ${
                data.level === 'CRITICAL' ? 'bg-red-900/30 text-red-400 border-red-800 animate-pulse' : 
                data.level === 'HIGH' ? 'bg-orange-900/30 text-orange-400 border-orange-800' :
                'bg-cyan-900/30 text-cyan-400 border-cyan-800'
            }`}>
                {data.level}
            </div>
        </div>

        {/* Classification */}
        <div className="bg-[#151515] p-2 rounded border border-[#333]">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Classification</div>
            <div className="flex items-center text-xs text-cyan-300 font-bold mb-1">
                <Radio size={12} className="mr-1.5" />
                {data.type}
            </div>
            <div className="text-[10px] text-slate-400 italic border-l-2 border-slate-700 pl-2">
                {data.name}
            </div>
        </div>

        {/* Live Coordinates Box */}
        <div className="bg-black/30 rounded p-2 border border-slate-700 font-mono text-[10px] space-y-1">
            <div className="flex justify-between border-b border-slate-800 pb-1 mb-1">
                <span className="text-slate-500 flex items-center"><Database size={10} className="mr-1"/> COORD_DATA</span>
                <span className="text-slate-600">J2000 EPOCH</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400">LAT:</span> 
                <span className="text-cyan-300">{data.coordinates.lat}°</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400">LON:</span> 
                <span className="text-cyan-300">{data.coordinates.lon}°</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400">ALT:</span> 
                <span className="text-cyan-300">{data.coordinates.alt.toLowerCase().includes('km') || data.coordinates.alt.toLowerCase().includes('leo') ? data.coordinates.alt : `${data.coordinates.alt} km`}</span>
            </div>
        </div>

        {/* Predictive Data (Linked to Trajectory) */}
        {(() => {
            const rawAlt = parseFloat(data.coordinates.alt);
            const numAlt = isNaN(rawAlt) ? 450 : rawAlt;
            return (
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded p-2">
                     <div className="flex items-center text-[10px] font-bold text-indigo-400 mb-2 border-b border-indigo-500/20 pb-1">
                        <Activity size={10} className="mr-1"/> ORBITAL PREDICTION
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                         <div>
                            <span className="text-slate-500 block">PERIGEE</span>
                            <span className="text-indigo-200">{(numAlt * 0.9).toFixed(1)} km</span>
                         </div>
                         <div>
                            <span className="text-slate-500 block">APOGEE</span>
                            <span className="text-indigo-200">{(numAlt * 1.1).toFixed(1)} km</span>
                         </div>
                         <div>
                            <span className="text-slate-500 block">PERIOD</span>
                            <span className="text-indigo-200">92.4 min</span>
                         </div>
                         <div>
                            <span className="text-slate-500 block">INCLINATION</span>
                            <span className="text-indigo-200">98.2°</span>
                         </div>
                     </div>
                </div>
            );
        })()}

        {/* Intel Vector */}
        <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Intelligence Vector</div>
            <div className="text-[10px] text-slate-300 leading-relaxed bg-slate-800/30 p-2 rounded border border-slate-700/50 relative overflow-hidden">
                {data.description}
                <div className="absolute bottom-0 right-0 p-1 opacity-20"><Ruler size={24}/></div>
            </div>
        </div>
    </div>
  );
};

export default TargetAnalysis;
