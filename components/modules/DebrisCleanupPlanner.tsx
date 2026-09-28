
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Trash2, Recycle, Play, CheckCircle, Crosshair, Box } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface DebrisCleanupPlannerProps {
    config: SystemConfig;
}

const DebrisCleanupPlanner: React.FC<DebrisCleanupPlannerProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [fuel, setFuel] = useState(80);
    const [drones, setDrones] = useState(4);

    const handlePlan = async () => {
        setIsAnalyzing(true);
        const prompt = `Plan orbital debris cleanup. 
        Sector: LEO-Polar. 
        Assets: ${drones} Collector Drones, ${fuel}% Fuel Reserves. 
        Target: High-density fragment cloud (Kessler precursors).
        Strategy: Suggest optimal trajectory, capture method, and resource allocation.`;

        const response = await generateModuleAnalysis('ODACP', prompt, config);
        setReport(response);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-amber-900/20 border border-amber-900/50 rounded">
                    <Trash2 size={24} className="text-amber-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ODACP // DEBRIS CLEANUP</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">AI Strategy for Orbital Remediation</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-4">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-slate-400 uppercase">Available Assets</div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center text-amber-400"><Recycle size={10} className="mr-1"/> Drone Units</span>
                                <span className="font-mono">{drones} ACTIVE</span>
                            </div>
                            <input type="range" min="1" max="10" value={drones} onChange={(e) => setDrones(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center text-blue-400"><Box size={10} className="mr-1"/> Fuel Reserves</span>
                                <span className="font-mono">{fuel}%</span>
                            </div>
                            <input type="range" min="10" max="100" value={fuel} onChange={(e) => setFuel(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handlePlan}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-amber-700 hover:bg-amber-600 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-amber-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? <Recycle className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isAnalyzing ? "Calculating Trajectories..." : "Generate Cleanup Plan"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-amber-500 font-bold uppercase text-xs mb-4 border-b border-amber-900/30 pb-2">
                        <Crosshair size={14} className="mr-2" /> Strategic Output
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Define assets to initiate planning...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DebrisCleanupPlanner;
