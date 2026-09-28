
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Thermometer, Snowflake, Play, Activity, Wind, Server } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface ZeroGCoolingProps {
    config: SystemConfig;
}

const ZeroGCooling: React.FC<ZeroGCoolingProps> = ({ config }) => {
    const [isManaging, setIsManaging] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [heatLoad, setHeatLoad] = useState(8500); // Watts
    const [sunExposure, setSunExposure] = useState(100); // %

    const handleManage = async () => {
        setIsManaging(true);
        const prompt = `Manage Zero-G Thermal Load.
        Heat Output: ${heatLoad} Watts. Solar Exposure: ${sunExposure}%.
        Environment: Vacuum. Radiator Efficiency: Nominal.
        Goal: Prevent server overheating. Suggest coolant flow adjustments and radiator orientation.`;

        const response = await generateModuleAnalysis('ZGCMAI', prompt, config);
        setReport(response);
        setIsManaging(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-cyan-900/20 border border-cyan-900/50 rounded">
                    <Snowflake size={24} className="text-cyan-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ZGCM-AI // ZERO-G COOLING</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Thermal Regulation for Orbital Data Centers</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-cyan-400 uppercase flex items-center">
                            <Thermometer size={12} className="mr-2" /> Thermal Load
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>CPU Heat Output</span>
                                <span className="font-mono text-white">{heatLoad} W</span>
                            </div>
                            <input type="range" min="1000" max="20000" step="500" value={heatLoad} onChange={(e) => setHeatLoad(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Solar Exposure</span>
                                <span className="font-mono text-white">{sunExposure}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={sunExposure} onChange={(e) => setSunExposure(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleManage}
                        disabled={isManaging}
                        className="w-full py-4 bg-cyan-800 hover:bg-cyan-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-cyan-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isManaging ? <Wind className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isManaging ? "Regulating Temp..." : "Activate Cooling"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Activity size={14} className="mr-2" /> Thermal Protocol
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Adjust heat load to calculate cooling strategy.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZeroGCooling;
