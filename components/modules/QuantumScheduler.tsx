
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Cpu, Atom, Play, Clock, Share2, Binary } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface QuantumSchedulerProps {
    config: SystemConfig;
}

const QuantumScheduler: React.FC<QuantumSchedulerProps> = ({ config }) => {
    const [isScheduling, setIsScheduling] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [tasks, setTasks] = useState(128);
    const [coherence, setCoherence] = useState(50); // ms

    const handleSchedule = async () => {
        setIsScheduling(true);
        const prompt = `Schedule Orbital Quantum Computing Tasks.
        Job Queue: ${tasks} Algorithms. Coherence Time: ${coherence} ms.
        Environment: Microgravity (High Stability).
        Objective: Minimize decoherence errors and maximize throughput for cryptographic/simulation jobs.`;

        const response = await generateModuleAnalysis('OQCS', prompt, config);
        setReport(response);
        setIsScheduling(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-purple-900/20 border border-purple-900/50 rounded">
                    <Atom size={24} className="text-purple-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">OQCS // QUANTUM SCHEDULER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Space-Based Qubit Job Orchestration</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-purple-400 uppercase flex items-center">
                            <Cpu size={12} className="mr-2" /> QPU Status
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Job Queue Depth</span>
                                <span className="font-mono text-white">{tasks}</span>
                            </div>
                            <input type="range" min="10" max="1000" value={tasks} onChange={(e) => setTasks(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Coherence Time</span>
                                <span className="font-mono text-white">{coherence} ms</span>
                            </div>
                            <input type="range" min="10" max="500" value={coherence} onChange={(e) => setCoherence(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleSchedule}
                        disabled={isScheduling}
                        className="w-full py-4 bg-purple-800 hover:bg-purple-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-purple-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isScheduling ? <Binary className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isScheduling ? "Entangling Qubits..." : "Run Scheduler"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Clock size={14} className="mr-2" /> Execution Timeline
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Define quantum load to generate schedule.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuantumScheduler;
