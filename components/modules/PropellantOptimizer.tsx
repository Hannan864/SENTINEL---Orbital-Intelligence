
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Fuel, TrendingUp, Play, Crosshair, Gauge } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface PropellantOptimizerProps {
    config: SystemConfig;
}

const PropellantOptimizer: React.FC<PropellantOptimizerProps> = ({ config }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [mass, setMass] = useState(5000); // kg
    const [orbit, setOrbit] = useState("GTO Transfer");

    const handleOptimize = async () => {
        setIsOptimizing(true);
        const prompt = `Optimize propellant usage for maneuver.
        Spacecraft Mass: ${mass} kg. Maneuver: ${orbit}.
        Calculate burn sequence, Delta-V budget, and fuel savings vs standard Hohmann transfer.`;

        const response = await generateModuleAnalysis('APO', prompt, config);
        setReport(response);
        setIsOptimizing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-blue-900/20 border border-blue-900/50 rounded">
                    <Fuel size={24} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">APO // PROPELLANT OPTIMIZER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Orbital Maneuver Efficiency Calculator</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-blue-400 uppercase flex items-center">
                            <Gauge size={12} className="mr-2" /> Mission Specs
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Wet Mass (kg)</span>
                                <span className="font-mono text-white">{mass}</span>
                            </div>
                            <input type="range" min="100" max="20000" step="100" value={mass} onChange={(e) => setMass(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Maneuver Type</label>
                            <select value={orbit} onChange={(e) => setOrbit(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="LEO Circularization">LEO Circularization</option>
                                <option value="GTO Transfer">GTO Transfer</option>
                                <option value="Lunar Injection">Trans-Lunar Injection</option>
                                <option value="Mars Transfer">Hohmann Transfer (Mars)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full py-4 bg-blue-800 hover:bg-blue-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isOptimizing ? <TrendingUp className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isOptimizing ? "Computing Burns..." : "Optimize Trajectory"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Crosshair size={14} className="mr-2" /> Burn Schedule
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Configure maneuver to optimize fuel usage.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropellantOptimizer;
