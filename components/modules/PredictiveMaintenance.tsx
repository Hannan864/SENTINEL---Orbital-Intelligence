
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Wrench, Activity, Play, Settings, AlertCircle, ClipboardList } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface PredictiveMaintenanceProps {
    config: SystemConfig;
}

const PredictiveMaintenance: React.FC<PredictiveMaintenanceProps> = ({ config }) => {
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [vibration, setVibration] = useState(2.5); // mm/s
    const [temp, setTemp] = useState(45); // C

    const handleDiagnose = async () => {
        setIsDiagnosing(true);
        const prompt = `Perform Predictive Maintenance Analysis.
        Telemetry: Vibration ${vibration} mm/s, Bearing Temp ${temp}C.
        Component: Reaction Wheel Assembly.
        Predict time to failure (TTF) and suggest preventative maintenance actions.`;

        const response = await generateModuleAnalysis('ASPM', prompt, config);
        setReport(response);
        setIsDiagnosing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded">
                    <Wrench size={24} className="text-orange-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ASPM // PREDICTIVE MAINT</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Component Health & Failure Prediction</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-orange-400 uppercase flex items-center">
                            <Activity size={12} className="mr-2" /> Sensor Feeds
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Vibration (RMS)</span>
                                <span className="font-mono text-white">{vibration} mm/s</span>
                            </div>
                            <input type="range" min="0" max="10" step="0.1" value={vibration} onChange={(e) => setVibration(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Bearing Temp</span>
                                <span className="font-mono text-white">{temp}°C</span>
                            </div>
                            <input type="range" min="0" max="150" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleDiagnose}
                        disabled={isDiagnosing}
                        className="w-full py-4 bg-orange-800 hover:bg-orange-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-orange-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isDiagnosing ? <Settings className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isDiagnosing ? "Running Diagnostics..." : "Predict Failure"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <ClipboardList size={14} className="mr-2" /> Maintenance Schedule
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Input telemetry to assess component health.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PredictiveMaintenance;
