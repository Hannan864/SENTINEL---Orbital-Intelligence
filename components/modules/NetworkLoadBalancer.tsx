
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Network, Globe, Play, Server, ArrowRightLeft, Activity } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface NetworkLoadBalancerProps {
    config: SystemConfig;
}

const NetworkLoadBalancer: React.FC<NetworkLoadBalancerProps> = ({ config }) => {
    const [isBalancing, setIsBalancing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [traffic, setTraffic] = useState(80); // Tbps
    const [region, setRegion] = useState("APAC (Asia-Pacific)");

    const handleBalance = async () => {
        setIsBalancing(true);
        const prompt = `Balance Cloud Workload between Earth and Orbit.
        Region: ${region}. Demand: ${traffic} Tbps.
        Orbital Capacity: High. Ground Capacity: Congested.
        Optimize routing for lowest latency and maximum throughput.`;

        const response = await generateModuleAnalysis('ONLB', prompt, config);
        setReport(response);
        setIsBalancing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-indigo-900/20 border border-indigo-900/50 rounded">
                    <Network size={24} className="text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ONLB // LOAD BALANCER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Orbital-Terrestrial Cloud Traffic Optimization</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-indigo-400 uppercase flex items-center">
                            <Activity size={12} className="mr-2" /> Traffic Demand
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Network Load</span>
                                <span className="font-mono text-white">{traffic} Tbps</span>
                            </div>
                            <input type="range" min="10" max="500" value={traffic} onChange={(e) => setTraffic(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Congested Region</label>
                            <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="APAC (Asia-Pacific)">APAC (Asia-Pacific)</option>
                                <option value="NA (North America)">NA (North America)</option>
                                <option value="EMEA (Europe/Mid-East)">EMEA (Europe/Mid-East)</option>
                                <option value="LATAM (Latin America)">LATAM (Latin America)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleBalance}
                        disabled={isBalancing}
                        className="w-full py-4 bg-indigo-800 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-indigo-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isBalancing ? <ArrowRightLeft className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isBalancing ? "Rerouting Packets..." : "Optimize Routing"}
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
                            Select region to balance workload.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NetworkLoadBalancer;
