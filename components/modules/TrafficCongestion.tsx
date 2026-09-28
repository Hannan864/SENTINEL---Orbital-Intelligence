
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Network, Activity, Play, AlertOctagon, Share2 } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface TrafficCongestionProps {
    config: SystemConfig;
}

const TrafficCongestion: React.FC<TrafficCongestionProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [density, setDensity] = useState("High");
    const [launches, setLaunches] = useState(5);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const prompt = `Analyze Space Traffic Congestion.
        Orbital Density: ${density}. Planned Launches: ${launches} (next 24h).
        Identify bottlenecks in LEO shells. Predict collision probability spikes.
        Suggest slot allocation and phasing maneuvers.`;

        const response = await generateModuleAnalysis('STCA', prompt, config);
        setReport(response);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-blue-900/20 border border-blue-900/50 rounded">
                    <Network size={24} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">STCA // TRAFFIC CONTROL</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Orbital Congestion & Launch Slot Management</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-blue-400 uppercase flex items-center">
                            <Activity size={12} className="mr-2" /> Sector Status
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Orbital Density</label>
                            <select value={density} onChange={(e) => setDensity(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Low">Low (Polar)</option>
                                <option value="Medium">Medium (MEO)</option>
                                <option value="High">High (Starlink Shell)</option>
                                <option value="Critical">Critical (Eq. LEO)</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Upcoming Launches (24h)</span>
                                <span className="font-mono text-white">{launches}</span>
                            </div>
                            <input type="range" min="0" max="20" value={launches} onChange={(e) => setLaunches(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-blue-800 hover:bg-blue-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? <Share2 className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isAnalyzing ? "Calculating Conjunctions..." : "Analyze Traffic"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <AlertOctagon size={14} className="mr-2" /> Traffic Report
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Select sector density to view congestion analysis.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrafficCongestion;
