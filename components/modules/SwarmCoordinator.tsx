
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Grid, Share2, Activity, Play, Network, BoxSelect } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface SwarmCoordinatorProps {
    config: SystemConfig;
}

const SwarmCoordinator: React.FC<SwarmCoordinatorProps> = ({ config }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [swarmSize, setSwarmSize] = useState(12);
    const [formation, setFormation] = useState("Mesh");

    const handleOptimize = async () => {
        setIsOptimizing(true);
        const prompt = `Coordinate autonomous satellite swarm.
        Swarm Size: ${swarmSize} units. Formation: ${formation}.
        Objective: Maximize Earth coverage while minimizing collision risk.
        Output: Optimal orbital planes, separation distances, and task allocation protocol.`;

        const response = await generateModuleAnalysis('SSCAI', prompt, config);
        setReport(response);
        setIsOptimizing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-teal-900/20 border border-teal-900/50 rounded">
                    <Grid size={24} className="text-teal-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">SSCAI // SWARM COORDINATOR</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Autonomous Constellation Management</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-teal-400 uppercase flex items-center">
                            <Network size={12} className="mr-2" /> Swarm Parameters
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><BoxSelect size={10} className="mr-1 text-slate-400"/> Swarm Count</span>
                                <span className="font-mono text-white">{swarmSize} Units</span>
                            </div>
                            <input type="range" min="3" max="100" value={swarmSize} onChange={(e) => setSwarmSize(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Formation Topology</label>
                            <select value={formation} onChange={(e) => setFormation(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Mesh">Global Mesh (Latency Optimized)</option>
                                <option value="Ring">Equatorial Ring (Bandwidth Optimized)</option>
                                <option value="Train">Pearl String (Observation Optimized)</option>
                                <option value="Tetrahedron">3D Volumetric (Science Optimized)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full py-4 bg-teal-800 hover:bg-teal-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-teal-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isOptimizing ? <Activity className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isOptimizing ? "Synchronizing Nodes..." : "Optimize Formation"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Share2 size={14} className="mr-2" /> Command Protocol
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Define swarm parameters to calculate vectors.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SwarmCoordinator;
