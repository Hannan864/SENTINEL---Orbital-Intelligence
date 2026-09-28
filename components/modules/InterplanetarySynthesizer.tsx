
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Globe, Radio, Share2, Layers, Map, GitMerge } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface InterplanetarySynthesizerProps {
    config: SystemConfig;
}

const InterplanetarySynthesizer: React.FC<InterplanetarySynthesizerProps> = ({ config }) => {
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [sources, setSources] = useState({
        rover: true,
        orbiter: true,
        lander: false
    });

    const toggleSource = (key: keyof typeof sources) => {
        setSources(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSynthesize = async () => {
        setIsSynthesizing(true);
        const activeSources = Object.keys(sources).filter(k => sources[k as keyof typeof sources]);
        const prompt = `Synthesize interplanetary data from: ${activeSources.join(', ')}.
        Correlate atmospheric readings, seismic data, and visual telemetry.
        Predict environmental trends and identify mission hazards.`;

        const response = await generateModuleAnalysis('IDS', prompt, config);
        setReport(response);
        setIsSynthesizing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-emerald-900/20 border border-emerald-900/50 rounded">
                    <Globe size={24} className="text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">IDS // INTERPLANETARY SYNTHESIZER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Cross-Platform Data Fusion Engine</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-4">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                        <div className="text-xs font-bold text-emerald-400 uppercase mb-3 flex items-center">
                            <Radio size={12} className="mr-2" /> Data Sources
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 cursor-pointer bg-black/20 p-2 rounded hover:bg-black/30">
                                <input type="checkbox" checked={sources.rover} onChange={() => toggleSource('rover')} className="accent-emerald-500" />
                                <span className="text-xs">Rover A (Surface)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer bg-black/20 p-2 rounded hover:bg-black/30">
                                <input type="checkbox" checked={sources.orbiter} onChange={() => toggleSource('orbiter')} className="accent-emerald-500" />
                                <span className="text-xs">Orbiter B (Atmosphere)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer bg-black/20 p-2 rounded hover:bg-black/30">
                                <input type="checkbox" checked={sources.lander} onChange={() => toggleSource('lander')} className="accent-emerald-500" />
                                <span className="text-xs">Lander C (Seismic)</span>
                            </label>
                        </div>
                    </div>

                    <button 
                        onClick={handleSynthesize}
                        disabled={isSynthesizing}
                        className="w-full py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-emerald-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isSynthesizing ? <GitMerge className="animate-spin mr-2" /> : <Layers className="mr-2 fill-current" />}
                        {isSynthesizing ? "Correlating Streams..." : "Synthesize Data"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Map size={14} className="mr-2" /> Unified Intelligence Report
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Select sources to begin fusion.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterplanetarySynthesizer;
