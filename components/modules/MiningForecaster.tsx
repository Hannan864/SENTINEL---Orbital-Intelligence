
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Gem, TrendingUp, Play, DollarSign, PieChart, BarChart } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface MiningForecasterProps {
    config: SystemConfig;
}

const MiningForecaster: React.FC<MiningForecasterProps> = ({ config }) => {
    const [isForecasting, setIsForecasting] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [asteroidType, setAsteroidType] = useState("M-Type (Metallic)");
    const [cost, setCost] = useState(500); // $M

    const handleForecast = async () => {
        setIsForecasting(true);
        const prompt = `Forecast asteroid mining ROI.
        Target Type: ${asteroidType}. Mission Cost: $${cost} Million.
        Analyze: Composition (Platinum, Iron, Nickel, Water).
        Output: Profitability ranking, break-even timeline, and technical feasibility score.`;

        const response = await generateModuleAnalysis('ASMF', prompt, config);
        setReport(response);
        setIsForecasting(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-amber-900/20 border border-amber-900/50 rounded">
                    <Gem size={24} className="text-amber-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ASMF // MINING FORECASTER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Asteroid Profitability & Resource Analysis</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-amber-400 uppercase flex items-center">
                            <PieChart size={12} className="mr-2" /> Economic Factors
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Target Class</label>
                            <select value={asteroidType} onChange={(e) => setAsteroidType(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="M-Type (Metallic)">M-Type (Iron/Nickel/Platinum)</option>
                                <option value="C-Type (Carbon)">C-Type (Water/Volatiles)</option>
                                <option value="S-Type (Stony)">S-Type (Silicate/Metal)</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Extraction Cost</span>
                                <span className="font-mono text-white">${cost}M</span>
                            </div>
                            <input type="range" min="100" max="5000" value={cost} onChange={(e) => setCost(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleForecast}
                        disabled={isForecasting}
                        className="w-full py-4 bg-amber-800 hover:bg-amber-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-amber-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isForecasting ? <TrendingUp className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isForecasting ? "Calculating ROI..." : "Forecast Profit"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <DollarSign size={14} className="mr-2" /> Financial Outlook
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Select asteroid class to estimate value.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MiningForecaster;
