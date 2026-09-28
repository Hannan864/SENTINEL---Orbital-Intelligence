
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { ClipboardList, Activity, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface MissionDebriefProps {
    config: SystemConfig;
}

const MissionDebrief: React.FC<MissionDebriefProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);

    const handleDebrief = async () => {
        setIsAnalyzing(true);
        // Simulate a flight log context
        const context = `
            FLIGHT LOG ID: FL-2026-X1
            DURATION: 1h 45m
            EVENTS:
            T+00:00 Liftoff. Nominal.
            T+01:20 Max Q. Pressure 32kPa. Nominal.
            T+03:45 MECO. Fuel Residuals +2%.
            T+04:10 Stage Separation.
            T+04:15 Sensor Anomaly detected in Guidance Computer A.
            T+04:18 Attitude deviation +0.5 degrees.
            T+04:20 Auto-correction fired. Thruster Bank B used.
            T+15:00 Orbit Insertion.
            
            OBJECTIVE: Analyze root cause of Sensor Anomaly at T+04:15 and attitude deviation. 
            Suggest preventative maintenance for next flight.
        `;

        const response = await generateModuleAnalysis('MDIS', context, config);
        setReport(response);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-purple-900/20 border border-purple-900/50 rounded">
                    <ClipboardList size={24} className="text-purple-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">MDIS // MISSION DEBRIEF</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Mission Forensics & Causal Analysis</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                
                {/* LEFT: CONTROLS */}
                <div className="space-y-4">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                            <FileText size={14} className="mr-2" /> Data Ingestion
                        </h3>
                        <div className="text-[10px] text-slate-500 font-mono space-y-2 mb-4 bg-black/20 p-2 rounded">
                            <div className="flex justify-between"><span>TELEMETRY:</span> <span className="text-green-500">LOADED</span></div>
                            <div className="flex justify-between"><span>EVENT LOGS:</span> <span className="text-green-500">LOADED</span></div>
                            <div className="flex justify-between"><span>ANOMALIES:</span> <span className="text-amber-500">1 DETECTED</span></div>
                        </div>
                        <button 
                            onClick={handleDebrief}
                            disabled={isAnalyzing}
                            className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-purple-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                        >
                            {isAnalyzing ? <Activity className="animate-spin mr-2" /> : <ArrowRight className="mr-2" />}
                            {isAnalyzing ? "Synthesizing..." : "Generate Debrief"}
                        </button>
                    </div>
                </div>

                {/* RIGHT: REPORT */}
                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    {!report ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                            <ClipboardList size={48} className="mb-4 opacity-20" />
                            <div className="text-xs font-mono">AWAITING ANALYSIS GENERATION</div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center text-purple-400 font-bold uppercase text-xs border-b border-purple-900/30 pb-2 mb-2">
                                <CheckCircle2 size={16} className="mr-2" /> Executive Summary
                            </div>
                            <div className="font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                                {report}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MissionDebrief;
