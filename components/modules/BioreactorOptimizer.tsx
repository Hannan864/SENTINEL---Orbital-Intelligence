
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { FlaskConical, Sprout, Play, Activity, Thermometer } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface BioreactorOptimizerProps {
    config: SystemConfig;
}

const BioreactorOptimizer: React.FC<BioreactorOptimizerProps> = ({ config }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [temp, setTemp] = useState(37);
    const [nutrientFlow, setNutrientFlow] = useState(50);

    const handleOptimize = async () => {
        setIsOptimizing(true);
        const prompt = `Optimize microgravity bioreactor.
        Target: Algae/Protein Crystal Growth.
        Conditions: ${temp}C, Flow Rate ${nutrientFlow} ml/min. Zero-G environment.
        Adjust parameters for maximum yield and cell density.`;

        const response = await generateModuleAnalysis('MBO', prompt, config);
        setReport(response);
        setIsOptimizing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-green-900/20 border border-green-900/50 rounded">
                    <FlaskConical size={24} className="text-green-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">MBO // BIOREACTOR</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Zero-G Biological Experiment Control</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-green-400 uppercase flex items-center">
                            <Activity size={12} className="mr-2" /> Environment Control
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Culture Temp</span>
                                <span className="font-mono text-white">{temp}°C</span>
                            </div>
                            <input type="range" min="4" max="60" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Nutrient Flow</span>
                                <span className="font-mono text-white">{nutrientFlow} ml/min</span>
                            </div>
                            <input type="range" min="0" max="100" value={nutrientFlow} onChange={(e) => setNutrientFlow(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full py-4 bg-green-800 hover:bg-green-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-green-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isOptimizing ? <Sprout className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isOptimizing ? "Calibrating..." : "Optimize Growth"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <FlaskConical size={14} className="mr-2" /> Lab Results
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Set parameters to begin bio-optimization.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BioreactorOptimizer;
