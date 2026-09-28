
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Trash2, TrendingUp, AlertTriangle, Play, Shield } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface OrbitalDebrisPredictorProps {
    config: SystemConfig;
}

const OrbitalDebrisPredictor: React.FC<OrbitalDebrisPredictorProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [years, setYears] = useState(5);
    const [satCount, setSatCount] = useState(5000);

    const handlePredict = async () => {
        setIsAnalyzing(true);
        const prompt = `Predict orbital debris formation over next ${years} years.
        Current Active Satellites: ${satCount}.
        Identify future hotspots (Kessler Syndrome risk zones).
        Recommend satellite path adjustments and proactive mitigation.`;

        const response = await generateModuleAnalysis('ODP', prompt, config);
        setReport(response);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-amber-900/20 border border-amber-900/50 rounded">
                    <Trash2 size={24} className="text-amber-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ODP // DEBRIS PREDICTOR</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Future Debris Formation & Collision Forecasting</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-amber-400 uppercase flex items-center">
                            <TrendingUp size={12} className="mr-2" /> Projection Parameters
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Forecast Window</span>
                                <span className="font-mono text-white">+{years} Years</span>
                            </div>
                            <input type="range" min="1" max="50" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Satellite Density</span>
                                <span className="font-mono text-white">{satCount} Units</span>
                            </div>
                            <input type="range" min="1000" max="50000" step="1000" value={satCount} onChange={(e) => setSatCount(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handlePredict}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-amber-800 hover:bg-amber-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-amber-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? <TrendingUp className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isAnalyzing ? "Simulating Cascade..." : "Forecast Debris"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Shield size={14} className="mr-2" /> Prediction Matrix
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Set projection timeline to analyze.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrbitalDebrisPredictor;
