
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Radar, AlertTriangle, Play, CheckCircle, Target, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface CollisionAnalyzerProps {
    config: SystemConfig;
}

const CollisionAnalyzer: React.FC<CollisionAnalyzerProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [targetSat, setTargetSat] = useState("SENTINEL-1A");
    const [debrisObj, setDebrisObj] = useState("DEBRIS-8812 (FENGYUN)");
    const [probability, setProbability] = useState(0.0);

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        setProbability(0);
        
        // Simulating progressive calculation
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 5;
            if (p > 85) p = 85; // Max visual cap before real data
            setProbability(p);
        }, 100);

        const prompt = `Analyze collision risk between Active Satellite ${targetSat} and Debris Object ${debrisObj}. 
        Current separation: 4.2km. Relative velocity: 14.2 km/s. Time to Closest Approach (TCA): 45 minutes.
        Provide probability assessment and specific avoidance maneuver vectors.`;

        const response = await generateModuleAnalysis('SCRA', prompt, config);
        
        clearInterval(interval);
        setProbability(Math.random() > 0.5 ? 14.2 : 0.05); // Set "Real" probability based on mock/ai logic usually, here hardcoded for demo feel
        setResult(response);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-red-900/20 border border-red-900/50 rounded">
                    <Radar size={24} className="text-red-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">SCRA // COLLISION ANALYZER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Satellite Collision Risk Assessment Module</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                
                {/* LEFT: INPUTS */}
                <div className="space-y-4">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                        <label className="text-[10px] text-cyan-500 font-bold uppercase mb-2 block flex items-center">
                            <Target size={12} className="mr-2" /> Primary Asset
                        </label>
                        <input 
                            type="text" 
                            value={targetSat}
                            onChange={(e) => setTargetSat(e.target.value)}
                            className="w-full bg-black/30 border border-slate-600 rounded p-2 text-sm font-mono text-white focus:border-cyan-500 outline-none"
                        />
                    </div>

                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                        <label className="text-[10px] text-red-500 font-bold uppercase mb-2 block flex items-center">
                            <AlertTriangle size={12} className="mr-2" /> Conjunction Object
                        </label>
                        <input 
                            type="text" 
                            value={debrisObj}
                            onChange={(e) => setDebrisObj(e.target.value)}
                            className="w-full bg-black/30 border border-slate-600 rounded p-2 text-sm font-mono text-white focus:border-red-500 outline-none"
                        />
                    </div>

                    <button 
                        onClick={runAnalysis}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-red-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? <Activity className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isAnalyzing ? "Calculating Trajectories..." : "Run Probability Analysis"}
                    </button>
                </div>

                {/* MIDDLE: VISUALIZER (Simplified Radar) */}
                <div className="bg-[#0b0d10] border border-slate-800 rounded relative overflow-hidden flex items-center justify-center lg:col-span-2">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-20" 
                         style={{backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>
                    
                    {/* Orbits Visual */}
                    <div className="relative w-64 h-64 border border-slate-700/50 rounded-full flex items-center justify-center">
                        <div className="absolute w-full h-full border border-slate-700/30 rounded-full animate-spin-slow" style={{animationDuration: '10s'}}></div>
                        <div className="absolute w-48 h-48 border border-slate-700/30 rounded-full animate-spin-slow" style={{animationDuration: '7s'}}></div>
                        
                        {/* Earth */}
                        <div className="w-16 h-16 bg-blue-900/50 rounded-full border border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-10 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-blue-300">EARTH</span>
                        </div>

                        {/* Satellites */}
                        <div className="absolute top-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan] animate-pulse"></div>
                        <div className="absolute bottom-10 right-10 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red] animate-pulse"></div>
                        
                        {/* Collision Point */}
                        <div className="absolute top-10 right-6 w-6 h-6 border-2 border-red-500 rounded-full animate-ping opacity-50"></div>
                    </div>

                    {/* Probability Overlay */}
                    <div className="absolute top-4 right-4 text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Collision Probability</div>
                        <div className={`text-4xl font-mono font-bold ${probability > 10 ? 'text-red-500' : 'text-green-500'}`}>
                            {probability.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM: AI RESULTS */}
            {result && (
                <div className="mt-6 bg-[#1e293b] border border-slate-700 rounded p-6 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center text-cyan-400 font-bold uppercase text-xs mb-4">
                        <ShieldCheck size={16} className="mr-2" /> AI Tactical Recommendation
                    </div>
                    <div className="font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollisionAnalyzer;
