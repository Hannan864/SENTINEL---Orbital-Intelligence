
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Bot, AlertOctagon, Activity, CheckSquare, Zap } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface AutonomousResponseProps {
    config: SystemConfig;
}

const AutonomousResponse: React.FC<AutonomousResponseProps> = ({ config }) => {
    const [status, setStatus] = useState<'MONITORING' | 'ANALYZING' | 'RESOLVED'>('MONITORING');
    const [actionPlan, setActionPlan] = useState<string | null>(null);
    const [deviation, setDeviation] = useState<string | null>(null);

    const simulateDeviation = async () => {
        setDeviation("CRITICAL: Fuel Pressure Drop in Sector 4 Feed Line (-15 psi/s)");
        setStatus('ANALYZING');
        
        const context = `
            CURRENT STATE:
            Altitude: 400km
            Velocity: 7.6 km/s
            Fuel Pressure Main: 98%
            Fuel Pressure Sec 4: 45% (Dropping)
            
            DEVIATION: Fuel Pressure Drop in Sector 4 Feed Line.
            
            GOAL: Stabilize propulsion system and prevent engine starve.
        `;

        const response = await generateModuleAnalysis('SMARS', context, config);
        setActionPlan(response);
        setStatus('RESOLVED');
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-emerald-900/20 border border-emerald-900/50 rounded">
                    <Bot size={24} className="text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">SMARS // AUTONOMOUS RESPONSE</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">AI Mission Control & Auto-Recovery System</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                
                {/* LEFT: MONITOR */}
                <div className="space-y-4">
                    {/* Status Indicator */}
                    <div className={`p-4 rounded border flex flex-col items-center justify-center h-32 transition-colors ${
                        status === 'MONITORING' ? 'bg-emerald-950/20 border-emerald-900 text-emerald-500' :
                        status === 'ANALYZING' ? 'bg-amber-950/20 border-amber-900 text-amber-500' :
                        'bg-blue-950/20 border-blue-900 text-blue-500'
                    }`}>
                        {status === 'MONITORING' && <Activity size={32} className="mb-2 animate-pulse" />}
                        {status === 'ANALYZING' && <AlertOctagon size={32} className="mb-2 animate-bounce" />}
                        {status === 'RESOLVED' && <CheckSquare size={32} className="mb-2" />}
                        <div className="font-bold text-lg tracking-widest">{status}</div>
                    </div>

                    {/* Simulation Control */}
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Simulation Injection</h3>
                        <button 
                            onClick={simulateDeviation}
                            disabled={status !== 'MONITORING'}
                            className="w-full py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 font-bold uppercase tracking-widest rounded flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Zap size={14} className="mr-2" /> Trigger Fuel Leak
                        </button>
                    </div>

                    {/* Active Deviation Display */}
                    {deviation && (
                        <div className="bg-red-950/20 border border-red-900 p-3 rounded animate-in slide-in-from-left-2">
                            <div className="text-[10px] text-red-500 font-bold uppercase mb-1">Active Deviation</div>
                            <div className="text-xs text-red-300 font-mono">{deviation}</div>
                        </div>
                    )}
                </div>

                {/* RIGHT: AI RESPONSE MATRIX */}
                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative">
                    <div className="flex items-center text-emerald-500 font-bold uppercase text-xs border-b border-emerald-900/30 pb-2 mb-4">
                        <Bot size={14} className="mr-2" /> Proposed Response Vectors
                    </div>
                    
                    {actionPlan ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 animate-in fade-in">
                            <div className="bg-emerald-950/10 border border-emerald-900/30 p-4 rounded">
                                <div className="font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                                    {actionPlan}
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-500 text-center uppercase tracking-widest mt-4">
                                Awaiting Operator Confirmation...
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            System Nominal. Listening for telemetry deviations...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AutonomousResponse;
