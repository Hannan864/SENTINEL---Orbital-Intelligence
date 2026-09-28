
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Sprout, Globe, Play, Thermometer, Wind, Mountain } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface PlanetaryTerraformerProps {
    config: SystemConfig;
}

const PlanetaryTerraformer: React.FC<PlanetaryTerraformerProps> = ({ config }) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [target, setTarget] = useState("Mars");
    const [method, setMethod] = useState("Greenhouse Gas Release");

    const handleSimulate = async () => {
        setIsSimulating(true);
        const prompt = `Simulate Planetary Terraforming.
        Target: ${target}. Method: ${method}.
        Simulate: Atmospheric thickening, temperature rise, liquid water stability.
        Output: Timeline to habitability, resource cost, and environmental risk assessment.`;

        const response = await generateModuleAnalysis('APPT', prompt, config);
        setReport(response);
        setIsSimulating(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-green-900/20 border border-green-900/50 rounded">
                    <Globe size={24} className="text-green-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">APPT // TERRAFORMER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Planetary Engineering & Eco-Synthesis</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-green-400 uppercase flex items-center">
                            <Mountain size={12} className="mr-2" /> Target World
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Planet</label>
                            <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Mars">Mars</option>
                                <option value="Venus">Venus</option>
                                <option value="Moon">The Moon (Dome)</option>
                                <option value="Titan">Titan</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Modification Strategy</label>
                            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Greenhouse Gas Release">Greenhouse Gas Release</option>
                                <option value="Orbital Mirrors">Orbital Mirrors</option>
                                <option value="Algae Seeding">Algae Seeding</option>
                                <option value="Nuclear Cap Melt">Nuclear Polar Cap Melt</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleSimulate}
                        disabled={isSimulating}
                        className="w-full py-4 bg-green-800 hover:bg-green-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-green-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isSimulating ? <Sprout className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isSimulating ? "Simulating Ecosystem..." : "Initiate Terraform"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Thermometer size={14} className="mr-2" /> Climate Projection
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Select a world to begin engineering.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlanetaryTerraformer;
