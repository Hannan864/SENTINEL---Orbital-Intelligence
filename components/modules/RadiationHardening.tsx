
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { ShieldCheck, Zap, Play, Activity, Radiation, AlertTriangle } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface RadiationHardeningProps {
    config: SystemConfig;
}

const RadiationHardening: React.FC<RadiationHardeningProps> = ({ config }) => {
    const [isProtecting, setIsProtecting] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [flux, setFlux] = useState(2500); // Proton flux
    const [event, setEvent] = useState("South Atlantic Anomaly");

    const handleProtect = async () => {
        setIsProtecting(true);
        const prompt = `Protect Orbital Data Center from Radiation.
        Event: ${event}. Flux: ${flux} pfu.
        Action: Configure shielding, enable memory error correction (ECC), and activate triple-modular redundancy.`;

        const response = await generateModuleAnalysis('SRHAI', prompt, config);
        setReport(response);
        setIsProtecting(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-yellow-900/20 border border-yellow-900/50 rounded">
                    <ShieldCheck size={24} className="text-yellow-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">SRH-AI // RAD HARDENING</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Automated Radiation Defense for Orbital Logic</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-yellow-400 uppercase flex items-center">
                            <Radiation size={12} className="mr-2" /> Threat Environment
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Proton Flux</span>
                                <span className="font-mono text-white">{flux} pfu</span>
                            </div>
                            <input type="range" min="100" max="10000" step="100" value={flux} onChange={(e) => setFlux(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Radiation Event</label>
                            <select value={event} onChange={(e) => setEvent(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="South Atlantic Anomaly">South Atlantic Anomaly</option>
                                <option value="Solar Proton Event">Solar Proton Event</option>
                                <option value="Galactic Cosmic Rays">Galactic Cosmic Rays</option>
                                <option value="Outer Van Allen Belt">Outer Van Allen Belt</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleProtect}
                        disabled={isProtecting}
                        className="w-full py-4 bg-yellow-800 hover:bg-yellow-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-yellow-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isProtecting ? <Zap className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isProtecting ? "Hardening Circuits..." : "Engage Protection"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Activity size={14} className="mr-2" /> Defense Log
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Select threat level to activate countermeasures.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RadiationHardening;
