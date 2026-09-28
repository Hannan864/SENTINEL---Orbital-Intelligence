
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Box, ListOrdered, Play, CheckSquare, Layers, Scale } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface PayloadPrioritizerProps {
    config: SystemConfig;
}

const PayloadPrioritizer: React.FC<PayloadPrioritizerProps> = ({ config }) => {
    const [isRanking, setIsRanking] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [manifest, setManifest] = useState("Comms Sat, Deep Space Telescope, Cubesat Swarm, Bio-Experiment");

    const handleRank = async () => {
        setIsRanking(true);
        const prompt = `Prioritize Space Mission Payload Manifest.
        Items: ${manifest}.
        Constraints: Mass limits, launch window urgency, ROI.
        Output: Ranked list, items bumped to next launch, and load balance analysis.`;

        const response = await generateModuleAnalysis('APP', prompt, config);
        setReport(response);
        setIsRanking(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-emerald-900/20 border border-emerald-900/50 rounded">
                    <Box size={24} className="text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">APP // PAYLOAD PRIORITIZER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Mission ROI & Mass Constraint Solver</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                <div className="flex flex-col space-y-4">
                    <div className="bg-[#1e293b] p-3 rounded border border-slate-700">
                        <label className="text-[10px] text-emerald-400 font-bold uppercase mb-2 block">Payload Manifest</label>
                        <textarea 
                            value={manifest}
                            onChange={(e) => setManifest(e.target.value)}
                            className="w-full bg-black/30 border border-slate-600 rounded p-3 text-sm font-mono text-white focus:border-emerald-500 outline-none resize-none h-40"
                            placeholder="Enter payload items..."
                        />
                    </div>
                    
                    <button 
                        onClick={handleRank}
                        disabled={isRanking || !manifest}
                        className="py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest rounded flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isRanking ? <ListOrdered className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isRanking ? "Ranking ROI..." : "Optimize Manifest"}
                    </button>
                </div>

                <div className="bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Scale size={14} className="mr-2" /> Launch Schedule
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Input payloads to generate schedule.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayloadPrioritizer;
