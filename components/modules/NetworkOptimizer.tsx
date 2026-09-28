
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Wifi, Globe, Play, Server, Signal } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface NetworkOptimizerProps {
    config: SystemConfig;
}

const NetworkOptimizer: React.FC<NetworkOptimizerProps> = ({ config }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [bandwidth, setBandwidth] = useState(500); // Mbps
    const [latency, setLatency] = useState(1200); // ms

    const handleOptimize = async () => {
        setIsOptimizing(true);
        const prompt = `Optimize Interplanetary Network.
        Current Bandwidth: ${bandwidth} Mbps. Latency: ${latency} ms.
        Nodes: Earth DSN, Mars Relay, Jupiter Orbiter.
        Optimize signal routing to minimize packet loss and latency. Suggest relay alignment.`;

        const response = await generateModuleAnalysis('INO', prompt, config);
        setReport(response);
        setIsOptimizing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-blue-900/20 border border-blue-900/50 rounded">
                    <Wifi size={24} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">INO // NETWORK OPTIMIZER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Deep Space Comms & Relay Management</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-blue-400 uppercase flex items-center">
                            <Signal size={12} className="mr-2" /> Link Status
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Bandwidth</span>
                                <span className="font-mono text-white">{bandwidth} Mbps</span>
                            </div>
                            <input type="range" min="10" max="10000" value={bandwidth} onChange={(e) => setBandwidth(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Latency (One-Way)</span>
                                <span className="font-mono text-white">{latency} ms</span>
                            </div>
                            <input type="range" min="100" max="5000" value={latency} onChange={(e) => setLatency(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full py-4 bg-blue-800 hover:bg-blue-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isOptimizing ? <Server className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isOptimizing ? "Rerouting Packets..." : "Optimize Uplink"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Globe size={14} className="mr-2" /> Routing Matrix
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Adjust link parameters to analyze signal path.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NetworkOptimizer;
