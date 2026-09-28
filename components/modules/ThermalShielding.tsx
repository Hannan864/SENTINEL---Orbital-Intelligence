
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Flame, Thermometer, ShieldAlert, Play, Activity } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface ThermalShieldingProps {
    config: SystemConfig;
}

const ThermalShielding: React.FC<ThermalShieldingProps> = ({ config }) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [velocity, setVelocity] = useState(27000); // km/h (Orbital)
    const [temp, setTemp] = useState(1500); // K

    const handleAnalyze = async () => {
        setIsSimulating(true);
        const prompt = `Analyze thermal shielding integrity.
        Re-entry Velocity: ${velocity} km/h. Hull Temp: ${temp} K.
        Optimize shield configuration and coolant flow. Predict burn-through probability.`;

        const response = await generateModuleAnalysis('ATSAI', prompt, config);
        setReport(response);
        setIsSimulating(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded">
                    <Flame size={24} className="text-orange-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ATSAI // THERMAL SHIELD</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Adaptive Heat Shielding Optimization</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-orange-400 uppercase flex items-center">
                            <Thermometer size={12} className="mr-2" /> Re-entry Telemetry
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Velocity</span>
                                <span className="font-mono text-white">{velocity} km/h</span>
                            </div>
                            <input type="range" min="10000" max="40000" step="100" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Hull Temperature</span>
                                <span className="font-mono text-white">{temp} K</span>
                            </div>
                            <input type="range" min="300" max="3000" step="50" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={isSimulating}
                        className="w-full py-4 bg-orange-800 hover:bg-orange-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-orange-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isSimulating ? <Activity className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isSimulating ? "Optimizing Heat Flow..." : "Calibrate Shields"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <ShieldAlert size={14} className="mr-2" /> Thermal Output
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Adjust re-entry parameters to test shielding.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThermalShielding;
