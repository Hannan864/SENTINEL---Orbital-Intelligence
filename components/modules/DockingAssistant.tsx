
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Anchor, Crosshair, Play, Target, Radio } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface DockingAssistantProps {
    config: SystemConfig;
}

const DockingAssistant: React.FC<DockingAssistantProps> = ({ config }) => {
    const [isDocking, setIsDocking] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [relVel, setRelVel] = useState(0.5); // m/s
    const [distance, setDistance] = useState(50); // m

    const handleDock = async () => {
        setIsDocking(true);
        const prompt = `Execute autonomous docking sequence.
        Target: ISS Port 2. Distance: ${distance}m. Relative Velocity: ${relVel} m/s.
        Calculate approach vector, thruster firings, and collision risk.`;

        const response = await generateModuleAnalysis('AEDA', prompt, config);
        setReport(response);
        setIsDocking(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-indigo-900/20 border border-indigo-900/50 rounded">
                    <Anchor size={24} className="text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">AEDA // DOCKING ASSIST</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">AI Autonomous Proximity Operations</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-indigo-400 uppercase flex items-center">
                            <Crosshair size={12} className="mr-2" /> Approach Telemetry
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Relative Velocity</span>
                                <span className="font-mono text-white">{relVel} m/s</span>
                            </div>
                            <input type="range" min="0.01" max="2.0" step="0.01" value={relVel} onChange={(e) => setRelVel(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Distance to Port</span>
                                <span className="font-mono text-white">{distance} m</span>
                            </div>
                            <input type="range" min="1" max="200" value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </div>

                    <div className="bg-black/40 h-32 rounded border border-indigo-900/30 relative flex items-center justify-center">
                        <div className="w-16 h-16 border-2 border-indigo-500/50 rounded-full animate-ping absolute"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <Target size={48} className="text-indigo-500/20 absolute" />
                        <span className="absolute bottom-2 left-2 text-[9px] text-indigo-600 font-mono">LIDAR LOCK: ACTIVE</span>
                    </div>

                    <button 
                        onClick={handleDock}
                        disabled={isDocking}
                        className="w-full py-4 bg-indigo-800 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-indigo-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isDocking ? <Radio className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isDocking ? "Matching Rotation..." : "Engage Auto-Dock"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Anchor size={14} className="mr-2" /> Sequence Log
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Align vector to initiate docking sequence.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DockingAssistant;
