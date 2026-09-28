
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Telescope, AlertTriangle, Zap, Activity, Clock, ShieldCheck } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface CosmicEventPredictorProps {
    config: SystemConfig;
}

const CosmicEventPredictor: React.FC<CosmicEventPredictorProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [timeWindow, setTimeWindow] = useState('24H');

    const handlePredict = async () => {
        setIsAnalyzing(true);
        const prompt = `Predict cosmic events and orbital anomalies for the next ${timeWindow}. 
        Analyze collision risks, solar flare probability, and debris cloud intersections.
        Provide a risk matrix summary and specific mitigation recommendations.`;

        const response = await generateModuleAnalysis('CEP', prompt, config);
        setResult(response);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-purple-900/20 border border-purple-900/50 rounded">
                    <Telescope size={24} className="text-purple-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">CEP // COSMIC EVENT PREDICTOR</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Anomaly Forecasting & Hazard Analysis</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-4">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                        <label className="text-[10px] text-purple-400 font-bold uppercase mb-2 block flex items-center">
                            <Clock size={12} className="mr-2" /> Prediction Window
                        </label>
                        <select 
                            value={timeWindow} 
                            onChange={(e) => setTimeWindow(e.target.value)} 
                            className="w-full bg-black/30 border border-slate-600 rounded p-2 text-sm font-mono text-white focus:border-purple-500 outline-none"
                        >
                            <option value="24H">Next 24 Hours</option>
                            <option value="48H">Next 48 Hours</option>
                            <option value="1W">Next 7 Days</option>
                        </select>
                    </div>

                    <button 
                        onClick={handlePredict}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-purple-700 hover:bg-purple-600 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-purple-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? <Activity className="animate-spin mr-2" /> : <Zap className="mr-2 fill-current" />}
                        {isAnalyzing ? "Scanning Timeline..." : "Predict Anomalies"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                            <AlertTriangle size={48} className="mb-4 opacity-20" />
                            <div className="text-xs font-mono">AWAITING PREDICTION DATA</div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center text-purple-400 font-bold uppercase text-xs border-b border-purple-900/30 pb-2 mb-2">
                                <ShieldCheck size={16} className="mr-2" /> Forecast Report
                            </div>
                            <div className="font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CosmicEventPredictor;
