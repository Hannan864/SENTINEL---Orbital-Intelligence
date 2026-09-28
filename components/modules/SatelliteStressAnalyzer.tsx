
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { HeartPulse, Activity, Brain, Smile, Frown, Meh, AlertCircle } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface SatelliteStressAnalyzerProps {
    config: SystemConfig;
}

const SatelliteStressAnalyzer: React.FC<SatelliteStressAnalyzerProps> = ({ config }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [logs, setLogs] = useState("");

    const loadSampleLogs = () => {
        setLogs(`SAT-441 LOGS:
[08:00] Battery Temp: 45C (High)
[08:15] Solar Array Joint: Friction Warning
[08:30] CPU Load: 98%
[09:00] Gyro Drift: Compensating...
[09:15] Power Bus: Voltage Fluctuation Detected`);
    };

    const handleAnalyze = async () => {
        if (!logs.trim()) return;
        setIsAnalyzing(true);
        const prompt = `Analyze the following satellite telemetry logs. 
        Interpret the machine's "emotional state" based on stress indicators (heat, load, errors). 
        Is it anxious? Fatigued? Overwhelmed? 
        Provide a psycho-analysis of the system and suggest care.
        LOGS:
        ${logs}`;

        const response = await generateModuleAnalysis('SETA', prompt, config);
        setReport(response);
        setIsAnalyzing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-pink-900/20 border border-pink-900/50 rounded">
                    <HeartPulse size={24} className="text-pink-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">SETA // SYSTEM EMPATHY</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Satellite Emotional Tone & Stress Analyzer</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] text-pink-400 font-bold uppercase block flex items-center">
                            <Activity size={12} className="mr-2" /> Telemetry Stream
                        </label>
                        <button onClick={loadSampleLogs} className="text-[10px] text-slate-500 hover:text-white underline">Load Distress Logs</button>
                    </div>
                    <textarea 
                        value={logs}
                        onChange={(e) => setLogs(e.target.value)}
                        placeholder="Paste raw system logs here..."
                        className="flex-1 bg-[#1e293b] border border-slate-700 rounded p-3 text-sm font-mono text-slate-300 focus:border-pink-500 outline-none resize-none"
                    />
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !logs}
                        className="py-3 bg-pink-700 hover:bg-pink-600 text-white font-bold uppercase tracking-widest rounded flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? <Brain className="animate-spin mr-2" /> : <Smile className="mr-2 fill-current" />}
                        {isAnalyzing ? "Diagnosing Mood..." : "Analyze Emotional State"}
                    </button>
                </div>

                <div className="bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <AlertCircle size={14} className="mr-2" /> Psychological Profile
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Waiting for patient data...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SatelliteStressAnalyzer;
