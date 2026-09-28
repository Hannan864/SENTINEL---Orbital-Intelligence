
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Globe, Sprout, Play, Thermometer, Wind, Database } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface ExoplanetTerraformProps {
    config: SystemConfig;
}

const ExoplanetTerraform: React.FC<ExoplanetTerraformProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [radius, setRadius] = useState(1.1); // Earth Radii
    const [temp, setTemp] = useState(-20); // Celsius
    const [atmosphere, setAtmosphere] = useState("CO2-Rich");

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const prompt = `Evaluate terraform feasibility for Exoplanet.
        Radius: ${radius} Earths. Avg Temp: ${temp}C. Atmosphere: ${atmosphere}.
        Calculate Habitability Score (0-100).
        Propose geo-engineering strategy (e.g. mirrors, algae, greenhouse gases).`;

        const response = await generateModuleAnalysis('ETF-AI', prompt, config);
        setReport(response);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-green-900/20 border border-green-900/50 rounded">
                    <Sprout size={24} className="text-green-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ETF-AI // TERRAFORM ANALYZER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Exoplanet Habitability & Geo-Engineering</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-green-400 uppercase flex items-center">
                            <Globe size={12} className="mr-2" /> Planet Data
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Radius (Earths)</span>
                                <span className="font-mono text-white">{radius} R⊕</span>
                            </div>
                            <input type="range" min="0.5" max="3.0" step="0.1" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Avg Surface Temp</span>
                                <span className="font-mono text-white">{temp}°C</span>
                            </div>
                            <input type="range" min="-100" max="100" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Atmosphere Type</label>
                            <select value={atmosphere} onChange={(e) => setAtmosphere(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="CO2-Rich">CO2 Heavy (Venusian)</option>
                                <option value="N2-Rich">Nitrogen Rich (Titan)</option>
                                <option value="Thin">Thin / Vacuum (Martian)</option>
                                <option value="H2-He">Hydrogen/Helium (Gas Dwarf)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-green-800 hover:bg-green-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-green-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? <Database className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isAnalyzing ? "Simulating Ecosystem..." : "Evaluate Feasibility"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Sprout size={14} className="mr-2" /> Engineering Strategy
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Input planetary metrics to begin assessment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExoplanetTerraform;
