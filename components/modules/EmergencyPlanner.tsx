
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Bell, Shield, Play, AlertTriangle, Siren, Activity } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface EmergencyPlannerProps {
    config: SystemConfig;
}

const EmergencyPlanner: React.FC<EmergencyPlannerProps> = ({ config }) => {
    const [isPlanning, setIsPlanning] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [anomaly, setAnomaly] = useState("");

    const handlePlan = async () => {
        if (!anomaly.trim()) return;
        setIsPlanning(true);
        const prompt = `Generate Emergency Contingency Plan.
        Anomaly: ${anomaly}.
        System Status: Critical.
        Output: Ranked emergency protocols, crew survival instructions, and asset preservation steps.`;

        const response = await generateModuleAnalysis('AECP', prompt, config);
        setReport(response);
        setIsPlanning(false);
    };

    const loadScenario = () => {
        setAnomaly("Hull Breach in Sector 4. O2 Pressure falling 2psi/min. Fire detected in Avionics Bay.");
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-red-900/20 border border-red-900/50 rounded">
                    <Siren size={24} className="text-red-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">AECP // EMERGENCY PLANNER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Automated Disaster Response & Contingency</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] text-red-400 font-bold uppercase block flex items-center">
                            <AlertTriangle size={12} className="mr-2" /> Critical Telemetry
                        </label>
                        <button onClick={loadScenario} className="text-[10px] text-slate-500 hover:text-white underline">Simulate Breach</button>
                    </div>
                    <textarea 
                        value={anomaly}
                        onChange={(e) => setAnomaly(e.target.value)}
                        placeholder="Describe system failure or emergency situation..."
                        className="flex-1 bg-[#1e293b] border border-slate-700 rounded p-3 text-sm font-mono text-slate-300 focus:border-red-500 outline-none resize-none"
                    />
                    <button 
                        onClick={handlePlan}
                        disabled={isPlanning || !anomaly}
                        className="py-3 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-widest rounded flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isPlanning ? <Activity className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isPlanning ? "Calculating Protocols..." : "Generate Action Plan"}
                    </button>
                </div>

                <div className="bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Shield size={14} className="mr-2" /> Safety Protocols
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Awaiting emergency input...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmergencyPlanner;
