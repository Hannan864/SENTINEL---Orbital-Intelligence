
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { HeartPulse, Activity, User, Play, ClipboardCheck } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface MedicalConsultantProps {
    config: SystemConfig;
}

const MedicalConsultant: React.FC<MedicalConsultantProps> = ({ config }) => {
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [hrv, setHrv] = useState(45); // Heart Rate Variability
    const [sleep, setSleep] = useState(6.5); // Hours

    const handleDiagnose = async () => {
        setIsDiagnosing(true);
        const prompt = `Perform medical assessment for astronaut.
        Biometrics: HRV ${hrv} ms, Sleep ${sleep} hours/day.
        Assess fatigue, stress, and immune system risk.
        Prescribe countermeasures (schedule changes, supplements, exercise).`;

        const response = await generateModuleAnalysis('AMAC', prompt, config);
        setReport(response);
        setIsDiagnosing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-red-900/20 border border-red-900/50 rounded">
                    <HeartPulse size={24} className="text-red-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">AMAC // MEDICAL CONSULT</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">AI Flight Surgeon & Health Analytics</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-red-400 uppercase flex items-center">
                            <User size={12} className="mr-2" /> Vitals Input
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>HRV (Stress)</span>
                                <span className="font-mono text-white">{hrv} ms</span>
                            </div>
                            <input type="range" min="10" max="100" value={hrv} onChange={(e) => setHrv(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Avg Sleep</span>
                                <span className="font-mono text-white">{sleep} h</span>
                            </div>
                            <input type="range" min="2" max="10" step="0.5" value={sleep} onChange={(e) => setSleep(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleDiagnose}
                        disabled={isDiagnosing}
                        className="w-full py-4 bg-red-800 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-red-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isDiagnosing ? <Activity className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isDiagnosing ? "Analyzing Vitals..." : "Run Diagnosis"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <ClipboardCheck size={14} className="mr-2" /> Health Assessment
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Input biometrics to generate health report.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalConsultant;
