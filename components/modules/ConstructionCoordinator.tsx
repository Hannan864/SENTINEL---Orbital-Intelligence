
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Bot, Hammer, Play, Grid, Box, Hexagon } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface ConstructionCoordinatorProps {
    config: SystemConfig;
}

const ConstructionCoordinator: React.FC<ConstructionCoordinatorProps> = ({ config }) => {
    const [isBuilding, setIsBuilding] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [drones, setDrones] = useState(10);
    const [project, setProject] = useState("Orbital Ring Segment");

    const handleBuild = async () => {
        setIsBuilding(true);
        const prompt = `Coordinate Orbital Construction.
        Project: ${project}. Drones: ${drones} Units.
        Task: Assembly, Welding, Component Alignment.
        Output: Drone swarm choreography, sequence of operations, and safety zone definition.`;

        const response = await generateModuleAnalysis('ACDC', prompt, config);
        setReport(response);
        setIsBuilding(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded">
                    <Hammer size={24} className="text-orange-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ACDC // CONSTRUCTION</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Autonomous Assembly & Drone Fabrication</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-orange-400 uppercase flex items-center">
                            <Bot size={12} className="mr-2" /> Swarm Config
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Active Drones</span>
                                <span className="font-mono text-white">{drones}</span>
                            </div>
                            <input type="range" min="1" max="50" value={drones} onChange={(e) => setDrones(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Blueprint</label>
                            <input 
                                type="text" 
                                value={project} 
                                onChange={(e) => setProject(e.target.value)} 
                                className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleBuild}
                        disabled={isBuilding}
                        className="w-full py-4 bg-orange-800 hover:bg-orange-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-orange-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isBuilding ? <Hexagon className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isBuilding ? "Assembling..." : "Start Sequence"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Grid size={14} className="mr-2" /> Assembly Log
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Swarm holding pattern. Awaiting blueprint.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConstructionCoordinator;
