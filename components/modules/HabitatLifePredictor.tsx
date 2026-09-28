
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Home, Thermometer, Wind, RefreshCw, Activity, Heart } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface HabitatLifePredictorProps {
    config: SystemConfig;
}

const HabitatLifePredictor: React.FC<HabitatLifePredictorProps> = ({ config }) => {
    const [isPredicting, setIsPredicting] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [oxygen, setOxygen] = useState(95);
    const [temp, setTemp] = useState(22);
    const [rad, setRad] = useState(12);

    const handlePredict = async () => {
        setIsPredicting(true);
        const prompt = `Analyze Space Habitat Viability.
        Telemetry: Oxygen ${oxygen}%, Temperature ${temp}C, Radiation ${rad} mSv/day.
        Predict: Life support longevity, failure risks for key modules (Scrubbers, Thermal Control), and suggest corrective actions.`;

        const response = await generateModuleAnalysis('SHLP', prompt, config);
        setReport(response);
        setIsPredicting(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-green-900/20 border border-green-900/50 rounded">
                    <Home size={24} className="text-green-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">SHLP // HABITAT PREDICTOR</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Life Support Sustainability & Risk Analysis</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-green-400 uppercase flex items-center">
                            <Activity size={12} className="mr-2" /> Environmental Status
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Wind size={10} className="mr-1 text-cyan-400"/> Oxygen Level</span>
                                <span className="font-mono text-white">{oxygen}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={oxygen} onChange={(e) => setOxygen(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Thermometer size={10} className="mr-1 text-orange-400"/> Temperature</span>
                                <span className="font-mono text-white">{temp}°C</span>
                            </div>
                            <input type="range" min="-50" max="50" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Activity size={10} className="mr-1 text-purple-400"/> Radiation (mSv)</span>
                                <span className="font-mono text-white">{rad}</span>
                            </div>
                            <input type="range" min="0" max="500" value={rad} onChange={(e) => setRad(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handlePredict}
                        disabled={isPredicting}
                        className="w-full py-4 bg-green-800 hover:bg-green-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-green-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isPredicting ? <RefreshCw className="animate-spin mr-2" /> : <Heart className="mr-2 fill-current" />}
                        {isPredicting ? "Calculating Viability..." : "Predict Life Support"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Activity size={14} className="mr-2" /> System Health Forecast
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Adjust environment sliders to forecast viability.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HabitatLifePredictor;
