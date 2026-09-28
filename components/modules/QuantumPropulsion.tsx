
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Zap, Atom, Gauge, Settings, Play, CheckCircle } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface QuantumPropulsionProps {
    config: SystemConfig;
}

const QuantumPropulsion: React.FC<QuantumPropulsionProps> = ({ config }) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [fieldStrength, setFieldStrength] = useState(85);
    const [entanglement, setEntanglement] = useState(99);

    const handleSimulate = async () => {
        setIsSimulating(true);
        const prompt = `Simulate Quantum Vacuum Thruster performance.
        Parameters: Magnetic Field ${fieldStrength} Tesla, Entanglement Fidelity ${entanglement}%.
        Calculate: Theoretical Thrust (N), Specific Impulse (s), and Efficiency.
        Provide optimization advice for deep space transit.`;

        const response = await generateModuleAnalysis('QPEO', prompt, config);
        setReport(response);
        setIsSimulating(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-indigo-900/20 border border-indigo-900/50 rounded">
                    <Atom size={24} className="text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">QPEO // QUANTUM DRIVE</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Propulsion Efficiency & Thrust Optimizer</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-indigo-400 uppercase flex items-center">
                            <Settings size={12} className="mr-2" /> Core Parameters
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Magnetic Field Strength</span>
                                <span className="font-mono text-indigo-300">{fieldStrength} T</span>
                            </div>
                            <input type="range" min="10" max="100" value={fieldStrength} onChange={(e) => setFieldStrength(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Entanglement Fidelity</span>
                                <span className="font-mono text-cyan-300">{entanglement}%</span>
                            </div>
                            <input type="range" min="50" max="100" value={entanglement} onChange={(e) => setEntanglement(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleSimulate}
                        disabled={isSimulating}
                        className="w-full py-4 bg-indigo-700 hover:bg-indigo-600 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-indigo-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isSimulating ? <Zap className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isSimulating ? "Running Simulation..." : "Ignite Virtual Drive"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Gauge size={14} className="mr-2" /> Efficiency Report
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Awaiting ignition parameters...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuantumPropulsion;
