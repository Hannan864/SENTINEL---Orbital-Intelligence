
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Sun, Shield, Play, Zap, Umbrella, Activity } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface WeatherShieldProps {
    config: SystemConfig;
}

const WeatherShield: React.FC<WeatherShieldProps> = ({ config }) => {
    const [isProtecting, setIsProtecting] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [stormClass, setStormClass] = useState("X1.2");

    const handleProtect = async () => {
        setIsProtecting(true);
        const prompt = `Activate Space Weather Shield.
        Incoming Storm: ${stormClass}.
        Action: Configure magnetic shielding intensity and physical orientation.
        Goal: Protect crew and sensitive electronics from high-energy particles.`;

        const response = await generateModuleAnalysis('AESWS', prompt, config);
        setReport(response);
        setIsProtecting(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-yellow-900/20 border border-yellow-900/50 rounded">
                    <Shield size={24} className="text-yellow-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">AESWS // WEATHER SHIELD</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Active Solar Storm Defense System</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-yellow-400 uppercase flex items-center">
                            <Sun size={12} className="mr-2" /> Threat Level
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Flare Class</label>
                            <select value={stormClass} onChange={(e) => setStormClass(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="C-Class">C-Class (Minor)</option>
                                <option value="M-Class">M-Class (Moderate)</option>
                                <option value="X1.2">X1.2 (Strong)</option>
                                <option value="X10+">X10+ (Extreme)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleProtect}
                        disabled={isProtecting}
                        className="w-full py-4 bg-yellow-800 hover:bg-yellow-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-yellow-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isProtecting ? <Umbrella className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isProtecting ? "Modulating Shields..." : "Deploy Defense"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Activity size={14} className="mr-2" /> System Response
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            System nominal. Monitoring solar flux.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeatherShield;
