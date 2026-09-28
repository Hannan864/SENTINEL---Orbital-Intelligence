
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Fuel, Pickaxe, Play, Droplets, Gauge } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface FuelHarvestingOptimizerProps {
    config: SystemConfig;
}

const FuelHarvestingOptimizer: React.FC<FuelHarvestingOptimizerProps> = ({ config }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [target, setTarget] = useState("Asteroid Psyche");
    const [demand, setDemand] = useState(500); // tons

    const handleOptimize = async () => {
        setIsOptimizing(true);
        const prompt = `Optimize Orbital Fuel Harvesting.
        Target: ${target}. Fuel Demand: ${demand} tons.
        Evaluate: ISRU potential (Water Ice / Volatiles).
        Output: Extraction schedule, refining process efficiency, and refueling logistics.`;

        const response = await generateModuleAnalysis('OFHO', prompt, config);
        setReport(response);
        setIsOptimizing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-yellow-900/20 border border-yellow-900/50 rounded">
                    <Fuel size={24} className="text-yellow-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">OFHO // FUEL HARVESTER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">In-Situ Resource Utilization & Refueling</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-yellow-400 uppercase flex items-center">
                            <Pickaxe size={12} className="mr-2" /> Mining Ops
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Target Source</label>
                            <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Asteroid Psyche">Asteroid Psyche (Metal/Ice)</option>
                                <option value="Lunar South Pole">Lunar South Pole (Ice)</option>
                                <option value="Phobos">Phobos (Martian Moon)</option>
                                <option value="Ceres">Ceres (Dwarf Planet)</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Fuel Demand</span>
                                <span className="font-mono text-white">{demand} t</span>
                            </div>
                            <input type="range" min="10" max="2000" value={demand} onChange={(e) => setDemand(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full py-4 bg-yellow-800 hover:bg-yellow-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-yellow-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isOptimizing ? <Droplets className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isOptimizing ? "Analyzing Composition..." : "Plan Extraction"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Gauge size={14} className="mr-2" /> Yield Forecast
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Select a target to evaluate fuel potential.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FuelHarvestingOptimizer;
