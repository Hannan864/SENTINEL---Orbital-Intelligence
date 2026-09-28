
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { AlertOctagon, Activity, Globe, Shield, Play } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface AsteroidThreatSimulatorProps {
    config: SystemConfig;
}

const AsteroidThreatSimulator: React.FC<AsteroidThreatSimulatorProps> = ({ config }) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [size, setSize] = useState(140); // meters
    const [velocity, setVelocity] = useState(25); // km/s
    const [distance, setDistance] = useState(5.2); // LD (Lunar Distances)

    const handleSimulate = async () => {
        setIsSimulating(true);
        const prompt = `Simulate asteroid threat. 
        Object Parameters: Diameter ${size}m, Velocity ${velocity}km/s, Distance ${distance} Lunar Distances.
        Calculate impact probability, kinetic energy, and recommend mitigation strategies (e.g. Gravity Tractor, Kinetic Impactor, Nuclear).`;

        const response = await generateModuleAnalysis('ATS', prompt, config);
        setReport(response);
        setIsSimulating(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-red-900/20 border border-red-900/50 rounded">
                    <Globe size={24} className="text-red-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ATS // THREAT SIMULATOR</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Planetary Defense & Impact Analysis</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-red-400 uppercase flex items-center">
                            <AlertOctagon size={12} className="mr-2" /> Object Parameters
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Diameter</span>
                                <span className="font-mono text-white">{size} m</span>
                            </div>
                            <input type="range" min="10" max="2000" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Relative Velocity</span>
                                <span className="font-mono text-white">{velocity} km/s</span>
                            </div>
                            <input type="range" min="5" max="80" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Distance (LD)</span>
                                <span className="font-mono text-white">{distance} LD</span>
                            </div>
                            <input type="range" min="0.1" max="20" step="0.1" value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleSimulate}
                        disabled={isSimulating}
                        className="w-full py-4 bg-red-800 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-red-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isSimulating ? <Activity className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isSimulating ? "Running Impact Models..." : "Simulate Threat"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Shield size={14} className="mr-2" /> Mitigation Assessment
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Awaiting object data for simulation...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AsteroidThreatSimulator;
