
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Radiation, Activity, Shield, Play, AlertTriangle } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface RadiationMapperProps {
    config: SystemConfig;
}

const RadiationMapper: React.FC<RadiationMapperProps> = ({ config }) => {
    const [isMapping, setIsMapping] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [flux, setFlux] = useState(500); // MeV
    const [solarActivity, setSolarActivity] = useState("High");

    const handleMap = async () => {
        setIsMapping(true);
        const prompt = `Generate Cosmic Radiation Map.
        Particle Flux: ${flux} MeV. Solar Activity: ${solarActivity}.
        Identify radiation belts and hazard zones in LEO/GEO.
        Recommend shielding levels for crew and electronics.`;

        const response = await generateModuleAnalysis('CRM', prompt, config);
        setReport(response);
        setIsMapping(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-yellow-900/20 border border-yellow-900/50 rounded">
                    <Radiation size={24} className="text-yellow-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">CRM // RADIATION MAPPER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Orbital Radiation Hazard Analysis</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-yellow-400 uppercase flex items-center">
                            <Activity size={12} className="mr-2" /> Sensor Readings
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Particle Flux (MeV)</span>
                                <span className="font-mono text-white">{flux}</span>
                            </div>
                            <input type="range" min="10" max="2000" value={flux} onChange={(e) => setFlux(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Solar Activity</label>
                            <select value={solarActivity} onChange={(e) => setSolarActivity(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Low">Low (Quiet Sun)</option>
                                <option value="Moderate">Moderate</option>
                                <option value="High">High (Solar Max)</option>
                                <option value="Storm">Extreme (Storm Alert)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleMap}
                        disabled={isMapping}
                        className="w-full py-4 bg-yellow-800 hover:bg-yellow-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-yellow-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isMapping ? <AlertTriangle className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isMapping ? "Scanning Flux..." : "Generate Hazard Map"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Shield size={14} className="mr-2" /> Safety Protocols
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Define radiation environment to map hazards.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RadiationMapper;
