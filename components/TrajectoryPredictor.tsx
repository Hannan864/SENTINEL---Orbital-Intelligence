
import React from 'react';
import { Waypoints, ChevronRight, Clock, FastForward, Rewind } from 'lucide-react';

export interface TrajectorySettings {
  showPast: boolean;
  showFuture: boolean;
  predictionWindow: number; // Hours
}

interface TrajectoryPredictorProps {
  settings: TrajectorySettings;
  onChange: (s: TrajectorySettings) => void;
}

const TrajectoryPredictor: React.FC<TrajectoryPredictorProps> = ({ settings, onChange }) => {
  
  const toggle = (key: keyof TrajectorySettings) => {
      // Logic handled in parent, this just requests change
      onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-4 p-4 animate-in fade-in slide-in-from-right-4 duration-300">
       <div className="bg-[#151515] border border-cyan-900/30 p-3 rounded">
          <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center">
             <Waypoints size={12} className="mr-2" /> Propagation Model
          </div>
          
          <div className="space-y-2">
             <div 
                className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${settings.showPast ? 'bg-cyan-950/40 border-cyan-600 text-cyan-100' : 'bg-[#222] border-transparent text-slate-500 hover:border-slate-600'}`}
                onClick={() => toggle('showPast')}
             >
                <div className="flex items-center">
                   <Rewind size={14} className="mr-2" />
                   <span className="text-xs font-mono font-bold">PAST TRACK</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${settings.showPast ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-700'}`}></div>
             </div>

             <div 
                className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${settings.showFuture ? 'bg-purple-950/40 border-purple-600 text-purple-100' : 'bg-[#222] border-transparent text-slate-500 hover:border-slate-600'}`}
                onClick={() => toggle('showFuture')}
             >
                <div className="flex items-center">
                   <FastForward size={14} className="mr-2" />
                   <span className="text-xs font-mono font-bold">FUTURE ARC</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${settings.showFuture ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'bg-slate-700'}`}></div>
             </div>
          </div>
       </div>

       <div className="bg-[#151515] border border-[#333] p-3 rounded">
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
              <Clock size={12} className="mr-2" /> Prediction Window
           </div>
           <div className="flex items-center space-x-2">
               <input 
                 type="range" 
                 min="1" 
                 max="24" 
                 step="1" 
                 value={settings.predictionWindow}
                 onChange={(e) => onChange({...settings, predictionWindow: parseInt(e.target.value)})}
                 className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
               />
               <span className="text-xs font-mono text-white w-10 text-right">{settings.predictionWindow}H</span>
           </div>
       </div>

       <div className="text-[9px] text-slate-500 leading-relaxed border-t border-[#333] pt-2 italic">
          * Calculated using SGP4 propagation on Enterprise Mock Datasets. Dashed lines indicate probabilistic variance.
       </div>
    </div>
  );
};

export default TrajectoryPredictor;
