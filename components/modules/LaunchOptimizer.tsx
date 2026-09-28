
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Rocket, Gauge, ArrowUpRight, Check, Zap, Settings2 } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface LaunchOptimizerProps {
    config: SystemConfig;
}

const LaunchOptimizer: React.FC<LaunchOptimizerProps> = ({ config }) => {
    const [mass, setMass] = useState(450000);
    const [thrust, setThrust] = useState(7600);
    const [orbit, setOrbit] = useState("LEO-400km");
    const [optimizationResult, setOptimizationResult] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Mock trajectory data for chart
    const data = [
        { t: 0, alt: 0 }, { t: 20, alt: 2 }, { t: 40, alt: 8 }, { t: 60, alt: 25 },
        { t: 80, alt: 55 }, { t: 100, alt: 95 }, { t: 120, alt: 140 }, { t: 140, alt: 190 }
    ];

    const handleOptimize = async () => {
        setIsOptimizing(true);
        const prompt = `Optimize launch trajectory for rocket. 
        Mass: ${mass}kg. Thrust: ${thrust}kN. Target Orbit: ${orbit}.
        Site: Cape Canaveral. Calculate optimal azimuth, fuel budget, and risk of Max-Q failure.`;

        const response = await generateModuleAnalysis('LOA', prompt, config);
        setOptimizationResult(response);
        setIsOptimizing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-cyan-900/20 border border-cyan-900/50 rounded">
                    <Rocket size={24} className="text-cyan-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">LOA // LAUNCH OPTIMIZER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Trajectory & Fuel Efficiency Assistant</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                
                {/* LEFT: PARAMETERS */}
                <div className="space-y-4">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                        <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase mb-4">
                            <Settings2 size={12} className="mr-2" /> Mission Parameters
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-[9px] text-slate-400 block mb-1">VEHICLE MASS (KG)</label>
                                <input type="number" value={mass} onChange={e => setMass(Number(e.target.value))} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-cyan-300" />
                            </div>
                            <div>
                                <label className="text-[9px] text-slate-400 block mb-1">ENGINE THRUST (kN)</label>
                                <input type="number" value={thrust} onChange={e => setThrust(Number(e.target.value))} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-cyan-300" />
                            </div>
                            <div>
                                <label className="text-[9px] text-slate-400 block mb-1">TARGET ORBIT</label>
                                <select value={orbit} onChange={e => setOrbit(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                    <option value="LEO-400km">LEO (400km)</option>
                                    <option value="GTO">GTO (Transfer)</option>
                                    <option value="POLAR">Polar (Sun-Sync)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full py-4 bg-cyan-700 hover:bg-cyan-600 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-cyan-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isOptimizing ? <Gauge className="animate-spin mr-2" /> : <Zap className="mr-2 fill-current" />}
                        {isOptimizing ? "Optimizing..." : "Compute Trajectory"}
                    </button>
                </div>

                {/* RIGHT: CHART */}
                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase flex items-center">
                            <ArrowUpRight size={14} className="mr-2 text-green-500" /> Ascent Profile Prediction
                        </span>
                    </div>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="t" stroke="#555" fontSize={10} tickLine={false} />
                                <YAxis stroke="#555" fontSize={10} tickLine={false} />
                                <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333'}} itemStyle={{color: '#22d3ee'}} />
                                <Line type="monotone" dataKey="alt" stroke="#22d3ee" strokeWidth={2} dot={{r:3}} activeDot={{r:5}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* RESULTS */}
            {optimizationResult && (
                <div className="mt-6 bg-[#1e293b] border border-slate-700 rounded p-6 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center text-green-400 font-bold uppercase text-xs mb-4">
                        <Check size={16} className="mr-2" /> Optimized Flight Plan
                    </div>
                    <div className="font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                        {optimizationResult}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaunchOptimizer;
