
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Box, Layers, Play, Thermometer, Zap, ShieldCheck } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface AstroMaterialOptimizerProps {
    config: SystemConfig;
}

const AstroMaterialOptimizer: React.FC<AstroMaterialOptimizerProps> = ({ config }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [maxTemp, setMaxTemp] = useState(1200); // K
    const [radiation, setRadiation] = useState(500); // mSv/hr

    const handleOptimize = async () => {
        setIsOptimizing(true);
        const prompt = `Optimize Spacecraft Materials.
        Constraints: Max Temp ${maxTemp}K. Radiation Load ${radiation} mSv/hr.
        Mission Profile: High-Stress Re-entry / Deep Space.
        Recommend optimal alloy/composite stack (e.g. Carbon-Carbon, Aerogel, Lead).
        Predict failure points and estimate cost factor.`;

        const response = await generateModuleAnalysis('AMO', prompt, config);
        setReport(response);
        setIsOptimizing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-indigo-900/20 border border-indigo-900/50 rounded">
                    <Box size={24} className="text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">AMO // MATERIAL OPTIMIZER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">AI Materials Science & Shielding Design</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-indigo-400 uppercase flex items-center">
                            <Layers size={12} className="mr-2" /> Stress Constraints
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Thermometer size={10} className="mr-1 text-red-400"/> Peak Temp</span>
                                <span className="font-mono text-white">{maxTemp} K</span>
                            </div>
                            <input type="range" min="300" max="3000" step="50" value={maxTemp} onChange={(e) => setMaxTemp(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Zap size={10} className="mr-1 text-yellow-400"/> Radiation Load</span>
                                <span className="font-mono text-white">{radiation} mSv/h</span>
                            </div>
                            <input type="range" min="10" max="5000" step="10" value={radiation} onChange={(e) => setRadiation(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full py-4 bg-indigo-800 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-indigo-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isOptimizing ? <Layers className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isOptimizing ? "Testing Compounds..." : "Generate Composition"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <ShieldCheck size={14} className="mr-2" /> Material Specs
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Define constraints to engineer material.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AstroMaterialOptimizer;
