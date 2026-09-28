
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Radio, Binary, Play, Search, Signal, Database } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface DataMiningAIProps {
    config: SystemConfig;
}

const DataMiningAI: React.FC<DataMiningAIProps> = ({ config }) => {
    const [isMining, setIsMining] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [source, setSource] = useState("Kepler-452b");

    const handleMine = async () => {
        setIsMining(true);
        const prompt = `Analyze deep space radio telescope data.
        Source: ${source}.
        Task: Pattern Recognition & Anomaly Detection.
        Goal: Identify potential technosignatures or rare astrophysical phenomena.`;

        const response = await generateModuleAnalysis('IDMAI', prompt, config);
        setReport(response);
        setIsMining(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-purple-900/20 border border-purple-900/50 rounded">
                    <Binary size={24} className="text-purple-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">IDMAI // DATA MINER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Deep Space Signal Analysis & Technosignatures</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-purple-400 uppercase flex items-center">
                            <Radio size={12} className="mr-2" /> Data Stream
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Observation Target</label>
                            <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Kepler-452b">Kepler-452b</option>
                                <option value="Tabby's Star">Tabby's Star (KIC 8462852)</option>
                                <option value="Wow! Signal Region">Sagittarius (Wow! Region)</option>
                                <option value="Fast Radio Burst 121102">FRB 121102</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-black/40 h-24 rounded border border-purple-900/30 relative overflow-hidden flex items-center justify-center">
                        <div className="flex space-x-0.5 h-16 items-center">
                             {Array.from({length: 40}).map((_, i) => (
                                 <div key={i} className="w-1 bg-purple-500/50 animate-pulse" style={{height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s`}}></div>
                             ))}
                        </div>
                        <span className="absolute bottom-2 right-2 text-[9px] text-purple-600 font-mono">RAW STREAM</span>
                    </div>

                    <button 
                        onClick={handleMine}
                        disabled={isMining}
                        className="w-full py-4 bg-purple-800 hover:bg-purple-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-purple-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isMining ? <Search className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isMining ? "Processing Petabytes..." : "Analyze Signal"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Database size={14} className="mr-2" /> Analysis Findings
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Select a target to begin data mining.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataMiningAI;
