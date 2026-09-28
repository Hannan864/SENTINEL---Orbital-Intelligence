
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Network, Satellite, Play, Share2, Grid, Layers } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface SatelliteNetworkPlannerProps {
    config: SystemConfig;
}

const SatelliteNetworkPlanner: React.FC<SatelliteNetworkPlannerProps> = ({ config }) => {
    const [isPlanning, setIsPlanning] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [satCount, setSatCount] = useState(60);
    const [orbitType, setOrbitType] = useState("LEO (550km)");

    const handlePlan = async () => {
        setIsPlanning(true);
        const prompt = `Plan Satellite Constellation.
        Count: ${satCount} Units. Orbit: ${orbitType}.
        Objective: Global Coverage with minimal latency.
        Output: Orbital planes, inclination, and phasing strategy.`;

        const response = await generateModuleAnalysis('ASNP', prompt, config);
        setReport(response);
        setIsPlanning(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-blue-900/20 border border-blue-900/50 rounded">
                    <Satellite size={24} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ASNP // CONSTELLATION PLANNER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Autonomous Network Layout & Coverage Optimization</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-blue-400 uppercase flex items-center">
                            <Grid size={12} className="mr-2" /> Network Specs
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Constellation Size</span>
                                <span className="font-mono text-white">{satCount} Sats</span>
                            </div>
                            <input type="range" min="10" max="5000" value={satCount} onChange={(e) => setSatCount(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Orbit Class</label>
                            <select value={orbitType} onChange={(e) => setOrbitType(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="LEO (550km)">LEO (Low Latency)</option>
                                <option value="MEO (20,000km)">MEO (GPS/Nav)</option>
                                <option value="GEO (35,786km)">GEO (Broadcast)</option>
                                <option value="Polar">Polar (Earth Obs)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handlePlan}
                        disabled={isPlanning}
                        className="w-full py-4 bg-blue-800 hover:bg-blue-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isPlanning ? <Share2 className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isPlanning ? "Optimizing Planes..." : "Generate Layout"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Layers size={14} className="mr-2" /> Deployment Strategy
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Define payload count to visualize coverage.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SatelliteNetworkPlanner;
