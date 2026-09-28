
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { User, Activity, Heart, Brain, Play, CheckCircle } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface ZeroGravityBehaviorProps {
    config: SystemConfig;
}

const ZeroGravityBehavior: React.FC<ZeroGravityBehaviorProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [bpm, setBpm] = useState(85);
    const [stress, setStress] = useState(40);
    const [fatigue, setFatigue] = useState(20);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const prompt = `Analyze astronaut behavior under zero-gravity conditions.
        Biometrics: Heart Rate ${bpm} BPM, Stress Level ${stress}%, Fatigue ${fatigue}%.
        Task: Complex EVA Repair.
        Predict success probability, potential errors, and suggest interventions.`;

        const response = await generateModuleAnalysis('ZGBA', prompt, config);
        setReport(response);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-pink-900/20 border border-pink-900/50 rounded">
                    <User size={24} className="text-pink-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ZGBA // BEHAVIORAL ANALYZER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Zero-G Crew Performance & Stress Prediction</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Biometric Telemetry</div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center text-pink-400"><Heart size={10} className="mr-1"/> Heart Rate</span>
                                <span className="font-mono">{bpm} BPM</span>
                            </div>
                            <input type="range" min="40" max="180" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center text-orange-400"><Activity size={10} className="mr-1"/> Stress Level</span>
                                <span className="font-mono">{stress}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={stress} onChange={(e) => setStress(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center text-blue-400"><Brain size={10} className="mr-1"/> Fatigue</span>
                                <span className="font-mono">{fatigue}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={fatigue} onChange={(e) => setFatigue(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-pink-700 hover:bg-pink-600 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-pink-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? <Activity className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isAnalyzing ? "Analyzing..." : "Run Behavioral Prediction"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <CheckCircle size={14} className="mr-2" /> Performance Assessment
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Awaiting biometric input...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZeroGravityBehavior;
