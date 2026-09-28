
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { FileCode, Play, CheckCircle, Bug, Terminal, FileText } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface MissionQAProps {
    config: SystemConfig;
}

const MissionQA: React.FC<MissionQAProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [script, setScript] = useState("");

    const handleAudit = async () => {
        if (!script.trim()) return;
        setIsAnalyzing(true);
        const prompt = `Perform QA Audit on the following mission script/log. 
        Identify logic errors, resource mismanagement, and potential failure points.
        Suggest actionable fixes.
        SCRIPT:
        ${script}`;

        const response = await generateModuleAnalysis('AMQD', prompt, config);
        setReport(response);
        setIsAnalyzing(false);
    };

    const loadSample = () => {
        setScript(`MISSION_LOG_2026_ALPHA
T+00:00 Liftoff
T+02:00 Stage 1 Sep. Fuel Remaining: 12% (Expected 5%)
T+02:15 Second Stage Ignition. Thrust 80%.
T+05:00 Orbit Insertion Burn. Delta-V 3200m/s.
T+05:30 Payload Deploy.
ERROR: Solar Array Deployment Failed. Power Bus B voltage drop.`);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded">
                    <Bug size={24} className="text-orange-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">AMQD // MISSION QA & DEBUGGER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Automated Logic Verification System</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] text-orange-400 font-bold uppercase block flex items-center">
                            <FileCode size={12} className="mr-2" /> Mission Script / Logs
                        </label>
                        <button onClick={loadSample} className="text-[10px] text-slate-500 hover:text-white underline">Load Sample</button>
                    </div>
                    <textarea 
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Paste simulation logs or mission script here..."
                        className="flex-1 bg-[#1e293b] border border-slate-700 rounded p-3 text-sm font-mono text-slate-300 focus:border-orange-500 outline-none resize-none"
                    />
                    <button 
                        onClick={handleAudit}
                        disabled={isAnalyzing || !script}
                        className="py-3 bg-orange-700 hover:bg-orange-600 text-white font-bold uppercase tracking-widest rounded flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? <Terminal className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isAnalyzing ? "Auditing Logic..." : "Run QA Audit"}
                    </button>
                </div>

                <div className="bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <FileText size={14} className="mr-2" /> Audit Results
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            No active audit.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MissionQA;
