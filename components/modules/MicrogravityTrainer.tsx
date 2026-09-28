
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { UserCheck, Activity, Calendar, Dumbbell, Play, ClipboardList } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface MicrogravityTrainerProps {
    config: SystemConfig;
}

const MicrogravityTrainer: React.FC<MicrogravityTrainerProps> = ({ config }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [plan, setPlan] = useState<string | null>(null);
    const [missionDay, setMissionDay] = useState(45);
    const [boneLoss, setBoneLoss] = useState(1.5); // %

    const handleGenerate = async () => {
        setIsGenerating(true);
        const prompt = `Generate astronaut fitness routine.
        Mission Day: ${missionDay}. Bone Density Loss: ${boneLoss}%.
        Goal: Counteract microgravity atrophy.
        Output: Daily exercise schedule, resistance settings for ARED (Advanced Resistive Exercise Device), and dietary adjustments.`;

        const response = await generateModuleAnalysis('MAT', prompt, config);
        setPlan(response);
        setIsGenerating(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-blue-900/20 border border-blue-900/50 rounded">
                    <UserCheck size={24} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">MAT // AI TRAINER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Microgravity Physiology & Fitness Coach</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-blue-400 uppercase flex items-center">
                            <Activity size={12} className="mr-2" /> Crew Status
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Calendar size={10} className="mr-1 text-slate-400"/> Mission Day</span>
                                <span className="font-mono text-white">Day {missionDay}</span>
                            </div>
                            <input type="range" min="1" max="365" value={missionDay} onChange={(e) => setMissionDay(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Activity size={10} className="mr-1 text-red-400"/> Bone Loss Est.</span>
                                <span className="font-mono text-white">{boneLoss}%</span>
                            </div>
                            <input type="range" min="0" max="10" step="0.1" value={boneLoss} onChange={(e) => setBoneLoss(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full py-4 bg-blue-800 hover:bg-blue-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <Activity className="animate-spin mr-2" /> : <Dumbbell className="mr-2 fill-current" />}
                        {isGenerating ? "Analyzing Physiology..." : "Generate Routine"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <ClipboardList size={14} className="mr-2" /> Prescribed Regimen
                    </div>
                    {plan ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {plan}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Awaiting crew biometrics...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MicrogravityTrainer;
