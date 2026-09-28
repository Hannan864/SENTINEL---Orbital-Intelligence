
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Rocket, Star, Play, Map, Zap, Compass } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface InterstellarTrajectoryProps {
    config: SystemConfig;
}

const InterstellarTrajectory: React.FC<InterstellarTrajectoryProps> = ({ config }) => {
    const [isCalculating, setIsCalculating] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [targetStar, setTargetStar] = useState("Alpha Centauri");
    const [propulsion, setPropulsion] = useState("Nuclear Pulse");

    const handleCalculate = async () => {
        setIsCalculating(true);
        const prompt = `Design Interstellar Trajectory.
        Target: ${targetStar}. Propulsion: ${propulsion}.
        Calculate: Travel time, peak velocity (%c), fuel mass ratio, and required gravity assists.
        Simulate relativistic effects on mission clock.`;

        const response = await generateModuleAnalysis('AITD', prompt, config);
        setReport(response);
        setIsCalculating(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-purple-900/20 border border-purple-900/50 rounded">
                    <Rocket size={24} className="text-purple-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">AITD // TRAJECTORY DESIGN</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Interstellar Flight Path & Propulsion Physics</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-purple-400 uppercase flex items-center">
                            <Star size={12} className="mr-2" /> Mission Profile
                        </div>
                        
                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Target System</label>
                            <select value={targetStar} onChange={(e) => setTargetStar(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Alpha Centauri">Alpha Centauri (4.37 ly)</option>
                                <option value="Barnard's Star">Barnard's Star (5.96 ly)</option>
                                <option value="Wolf 1061">Wolf 1061 (13.8 ly)</option>
                                <option value="TRAPPIST-1">TRAPPIST-1 (39 ly)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Propulsion Tech</label>
                            <select value={propulsion} onChange={(e) => setPropulsion(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Nuclear Pulse">Nuclear Pulse (Orion)</option>
                                <option value="Light Sail">Laser Light Sail</option>
                                <option value="Fusion Ramjet">Fusion Ramjet (Bussard)</option>
                                <option value="Antimatter">Antimatter Beam</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleCalculate}
                        disabled={isCalculating}
                        className="w-full py-4 bg-purple-800 hover:bg-purple-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-purple-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isCalculating ? <Compass className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isCalculating ? "Relativistic Calc..." : "Plot Trajectory"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Map size={14} className="mr-2" /> Flight Dynamics
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Select destination to begin calculation.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterstellarTrajectory;
