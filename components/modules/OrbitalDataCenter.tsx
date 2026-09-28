
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Server, Cloud, Zap, Play, Globe, Cpu } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface OrbitalDataCenterProps {
    config: SystemConfig;
}

const OrbitalDataCenter: React.FC<OrbitalDataCenterProps> = ({ config }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [serverCount, setServerCount] = useState(500);
    const [orbitHeight, setOrbitHeight] = useState(800); // km

    const handleOptimize = async () => {
        setIsOptimizing(true);
        const prompt = `Optimize Orbital Data Center Deployment.
        Capacity: ${serverCount} Units. Orbit Height: ${orbitHeight}km.
        Constraints: Solar energy availability, thermal dissipation limits, and ground latency.
        Output: Placement strategy, cooling requirements, and expected throughput.`;

        const response = await generateModuleAnalysis('ODCO', prompt, config);
        setReport(response);
        setIsOptimizing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-blue-900/20 border border-blue-900/50 rounded">
                    <Server size={24} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ODCO // DATA CENTER OPTIMIZER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Space-Based Cloud Infrastructure Planning</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-blue-400 uppercase flex items-center">
                            <Cloud size={12} className="mr-2" /> Infrastructure Specs
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Server Units</span>
                                <span className="font-mono text-white">{serverCount}</span>
                            </div>
                            <input type="range" min="50" max="5000" step="50" value={serverCount} onChange={(e) => setServerCount(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Orbit Height (km)</span>
                                <span className="font-mono text-white">{orbitHeight} km</span>
                            </div>
                            <input type="range" min="400" max="2000" value={orbitHeight} onChange={(e) => setOrbitHeight(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full py-4 bg-blue-800 hover:bg-blue-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isOptimizing ? <Cpu className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isOptimizing ? "Calculating Layout..." : "Deploy Cloud"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Globe size={14} className="mr-2" /> Deployment Strategy
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Define server load to calculate orbital placement.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrbitalDataCenter;
