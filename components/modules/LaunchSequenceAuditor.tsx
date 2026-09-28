
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { FileCode, AlertTriangle, CheckCircle, Play, Bug } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface LaunchSequenceAuditorProps {
    config: SystemConfig;
}

const LaunchSequenceAuditor: React.FC<LaunchSequenceAuditorProps> = ({ config }) => {
    const [isAuditing, setIsAuditing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [script, setScript] = useState("");

    const handleAudit = async () => {
        if (!script.trim()) return;
        setIsAuditing(true);
        const prompt = `Audit launch sequence script.
        SCRIPT:
        ${script}
        
        Identify: Timing conflicts, logic errors, safety violations.
        Suggest: Optimizations and fixes.`;

        const response = await generateModuleAnalysis('ALSA', prompt, config);
        setReport(response);
        setIsAuditing(false);
    };

    const loadSample = () => {
        setScript(`SEQUENCE: FALCON-HEAVY-TEST
T-00:10:00 Pre-chill start
T-00:02:00 LOX Load Complete
T-00:01:00 Strongback Retract
T-00:00:30 Flight Computer Startup
T-00:00:05 Ignition Sequence Start
T-00:00:00 Liftoff
T+00:01:00 Max Q (Pressure 35kPa)
ERROR: Valve 4B Stuck Closed`);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-red-900/20 border border-red-900/50 rounded">
                    <FileCode size={24} className="text-red-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ALSA // LAUNCH AUDITOR</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Autonomous Sequence Verification & Safety Check</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] text-red-400 font-bold uppercase block flex items-center">
                            <Bug size={12} className="mr-2" /> Launch Script
                        </label>
                        <button onClick={loadSample} className="text-[10px] text-slate-500 hover:text-white underline">Load Sample</button>
                    </div>
                    <textarea 
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Paste launch sequence code here..."
                        className="flex-1 bg-[#1e293b] border border-slate-700 rounded p-3 text-sm font-mono text-slate-300 focus:border-red-500 outline-none resize-none"
                    />
                    <button 
                        onClick={handleAudit}
                        disabled={isAuditing || !script}
                        className="py-3 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-widest rounded flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAuditing ? <AlertTriangle className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isAuditing ? "Auditing Sequence..." : "Run Safety Audit"}
                    </button>
                </div>

                <div className="bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <CheckCircle size={14} className="mr-2" /> Audit Report
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Awaiting script input...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LaunchSequenceAuditor;
