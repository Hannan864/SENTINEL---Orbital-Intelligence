
import React from 'react';
import { Layers, Zap, Wind, Eye, Activity, Ban } from 'lucide-react';

export type PhysicsMode = 'O' | 'V' | 'R';

export interface PhysicsSettings {
  mode: PhysicsMode;
  showGravity: boolean;
  showMagnetic: boolean;
  showDrag: boolean;
}

interface PhysicsControlsProps {
  settings: PhysicsSettings;
  onChange: (s: PhysicsSettings) => void;
}

const PhysicsControls: React.FC<PhysicsControlsProps> = ({ settings, onChange }) => {
  
  const setMode = (mode: PhysicsMode) => {
    onChange({ ...settings, mode });
  };

  const toggleLayer = (key: keyof PhysicsSettings) => {
    // Only allow toggling if not OFF
    if (settings.mode !== 'O') {
        onChange({ ...settings, [key]: !settings[key] });
    }
  };

  const isActive = settings.mode !== 'O';

  return (
    <div className="space-y-4 p-4 animate-in fade-in slide-in-from-right-4 duration-300">
       
       {/* 3-STATE MODE SELECTOR */}
       <div className="bg-[#151515] p-1 rounded-lg border border-[#333] flex space-x-1">
          <button
            onClick={() => setMode('O')}
            className={`flex-1 py-2 rounded text-[10px] font-bold flex flex-col items-center justify-center transition-all ${
               settings.mode === 'O' 
               ? 'bg-slate-700 text-white shadow-sm' 
               : 'text-slate-500 hover:text-slate-300'
            }`}
          >
             <Ban size={14} className="mb-1" />
             O
          </button>
          <button
            onClick={() => setMode('V')}
            className={`flex-1 py-2 rounded text-[10px] font-bold flex flex-col items-center justify-center transition-all ${
               settings.mode === 'V' 
               ? 'bg-cyan-700 text-white shadow-sm' 
               : 'text-slate-500 hover:text-slate-300'
            }`}
          >
             <Eye size={14} className="mb-1" />
             V
          </button>
          <button
            onClick={() => setMode('R')}
            className={`flex-1 py-2 rounded text-[10px] font-bold flex flex-col items-center justify-center transition-all ${
               settings.mode === 'R' 
               ? 'bg-amber-700 text-white shadow-sm' 
               : 'text-slate-500 hover:text-slate-300'
            }`}
          >
             <Activity size={14} className="mb-1" />
             R
          </button>
       </div>

       <div className="text-[9px] text-center text-slate-500 font-mono uppercase tracking-widest border-b border-[#333] pb-2">
          {settings.mode === 'O' && "SYSTEM OFF"}
          {settings.mode === 'V' && "VISUAL MODE"}
          {settings.mode === 'R' && "REAL PHYSICS"}
       </div>

       {/* INDIVIDUAL LAYERS */}
       <div className={`space-y-2 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <div className="text-[10px] text-slate-500 font-bold mb-2">ACTIVE FORCE FIELDS</div>
          
          <ToggleRow 
             label="Gravity Wells" 
             icon={<Layers size={14}/>} 
             active={settings.showGravity} 
             onClick={() => toggleLayer('showGravity')}
             color="text-emerald-400"
          />
          <ToggleRow 
             label="Magnetic Flux" 
             icon={<Zap size={14}/>} 
             active={settings.showMagnetic} 
             onClick={() => toggleLayer('showMagnetic')}
             color="text-purple-400"
          />
          <ToggleRow 
             label="Drag Density" 
             icon={<Wind size={14}/>} 
             active={settings.showDrag} 
             onClick={() => toggleLayer('showDrag')}
             color="text-orange-400"
          />
       </div>
    </div>
  );
};

const ToggleRow = ({ label, icon, active, onClick, color }: any) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer border transition-all ${
         active ? 'bg-[#1e293b] border-slate-600' : 'bg-transparent border-transparent hover:bg-[#1e293b]'
      }`}
    >
       <div className="flex items-center">
          <span className={`mr-3 ${active ? color : 'text-slate-600'}`}>{icon}</span>
          <span className={`text-xs ${active ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
       </div>
       <div className={`w-2 h-2 rounded-full ${active ? `bg-current ${color} shadow-[0_0_5px_currentColor]` : 'bg-slate-800'}`}></div>
    </div>
);

export default PhysicsControls;
