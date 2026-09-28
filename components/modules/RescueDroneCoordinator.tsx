
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Bot, MapPin, Send, Crosshair, Grid, CheckCircle } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface RescueDroneCoordinatorProps {
    config: SystemConfig;
}

const RescueDroneCoordinator: React.FC<RescueDroneCoordinatorProps> = ({ config }) => {
    const [isCoordinating, setIsCoordinating] = useState(false);
    const [plan, setPlan] = useState<string | null>(null);
    const [activeDrones, setActiveDrones] = useState(3);
    const [target, setTarget] = useState("Solar Array Malfunction (SAT-9)");

    const handleCoordinate = async () => {
        setIsCoordinating(true);
        const prompt = `Coordinate autonomous rescue drones.
        Fleet Size: ${activeDrones} Units.
        Emergency Target: ${target}.
        Generate flight paths, task assignments, and priority sequence.
        Optimize for speed and battery life.`;

        const response = await generateModuleAnalysis('ARDC', prompt, config);
        setPlan(response);
        setIsCoordinating(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded">
                    <Bot size={24} className="text-orange-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ARDC // DRONE COORDINATOR</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Autonomous Repair & Rescue Fleet Management</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-4">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-orange-400 uppercase">Mission Parameters</div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center text-slate-300"><Grid size={10} className="mr-1"/> Active Units</span>
                                <span className="font-mono text-orange-300">{activeDrones} DRONES</span>
                            </div>
                            <input type="range" min="1" max="10" value={activeDrones} onChange={(e) => setActiveDrones(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Target Anomaly</label>
                            <input 
                                type="text" 
                                value={target} 
                                onChange={(e) => setTarget(e.target.value)} 
                                className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs text-white focus:border-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleCoordinate}
                        disabled={isCoordinating}
                        className="w-full py-4 bg-orange-700 hover:bg-orange-600 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-orange-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isCoordinating ? <Bot className="animate-spin mr-2" /> : <Send className="mr-2 fill-current" />}
                        {isCoordinating ? "Assigning Tasks..." : "Deploy Swarm"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Crosshair size={14} className="mr-2" /> Fleet Command Log
                    </div>
                    {plan ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {plan}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Fleet standby. Awaiting orders.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RescueDroneCoordinator;
