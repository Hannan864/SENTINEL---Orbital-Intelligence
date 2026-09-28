
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Navigation, Map, BoxSelect, Play, Flag } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface SampleCollectorProps {
    config: SystemConfig;
}

const SampleCollector: React.FC<SampleCollectorProps> = ({ config }) => {
    const [isPlanning, setIsPlanning] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [terrain, setTerrain] = useState("Crater Rim");
    const [battery, setBattery] = useState(85);

    const handlePlan = async () => {
        setIsPlanning(true);
        const prompt = `Plan autonomous sample collection mission.
        Terrain: ${terrain}. Rover Battery: ${battery}%.
        Identify high-value geological targets. Plan path to minimize energy and maximize yield.`;

        const response = await generateModuleAnalysis('ASC', prompt, config);
        setReport(response);
        setIsPlanning(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-emerald-900/20 border border-emerald-900/50 rounded">
                    <Navigation size={24} className="text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ASC // SAMPLE COLLECTOR</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Autonomous Planetary Surface Exploration</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-emerald-400 uppercase flex items-center">
                            <Map size={12} className="mr-2" /> Mission Context
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Terrain Type</label>
                            <select value={terrain} onChange={(e) => setTerrain(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Crater Rim">Crater Rim (Steep)</option>
                                <option value="Dune Field">Dune Field (Loose)</option>
                                <option value="Ancient Riverbed">Ancient Riverbed (Flat)</option>
                                <option value="Ice Cap">Polar Ice Cap (Slippery)</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Rover Energy</span>
                                <span className="font-mono text-white">{battery}%</span>
                            </div>
                            <input type="range" min="10" max="100" value={battery} onChange={(e) => setBattery(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handlePlan}
                        disabled={isPlanning}
                        className="w-full py-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-emerald-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isPlanning ? <BoxSelect className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isPlanning ? "Mapping Path..." : "Deploy Rover"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Flag size={14} className="mr-2" /> Mission Plan
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Select terrain to initiate autonomous collection.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SampleCollector;
