
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Wind, Search, Play, Microscope, FileText } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface AtmosphericAnalyzerProps {
    config: SystemConfig;
}

const AtmosphericAnalyzer: React.FC<AtmosphericAnalyzerProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [target, setTarget] = useState("Proxima Centauri b");

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const prompt = `Analyze exoplanet atmosphere for ${target}.
        Interpret simulated spectral data. Determine gas composition (O2, CO2, CH4).
        Assess habitability potential and detect biosignatures.`;

        const response = await generateModuleAnalysis('EAA', prompt, config);
        setReport(response);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-teal-900/20 border border-teal-900/50 rounded">
                    <Wind size={24} className="text-teal-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">EAA // ATMOSPHERE LAB</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Exoplanet Spectral Analysis & Biosignatures</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-teal-400 uppercase flex items-center">
                            <Search size={12} className="mr-2" /> Target Selection
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Candidate Planet</label>
                            <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Proxima Centauri b">Proxima Centauri b</option>
                                <option value="TRAPPIST-1e">TRAPPIST-1e</option>
                                <option value="Kepler-186f">Kepler-186f</option>
                                <option value="K2-18b">K2-18b</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-black/40 h-24 rounded border border-teal-900/30 relative overflow-hidden flex items-center justify-center">
                        <div className="flex items-end space-x-1 h-12">
                             {Array.from({length: 20}).map((_, i) => (
                                 <div key={i} className="w-2 bg-teal-500/50 animate-pulse" style={{height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s`}}></div>
                             ))}
                        </div>
                        <span className="absolute bottom-2 right-2 text-[9px] text-teal-600 font-mono">SPECTROSCOPY FEED</span>
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-teal-800 hover:bg-teal-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-teal-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? <Microscope className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isAnalyzing ? "Processing Spectrum..." : "Analyze Atmosphere"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <FileText size={14} className="mr-2" /> Composition Report
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Select a target to begin spectral analysis.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AtmosphericAnalyzer;
