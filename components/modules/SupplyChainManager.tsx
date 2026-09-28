
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Package, Truck, Play, Box, TrendingUp, Calendar } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface SupplyChainManagerProps {
    config: SystemConfig;
}

const SupplyChainManager: React.FC<SupplyChainManagerProps> = ({ config }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [cargoMass, setCargoMass] = useState(500); // tons
    const [destination, setDestination] = useState("Mars Colony Alpha");

    const handleOptimize = async () => {
        setIsOptimizing(true);
        const prompt = `Optimize Deep Space Supply Chain.
        Destination: ${destination}. Cargo Mass: ${cargoMass} tons.
        Mission: Resupply & Expansion.
        Generate logistics plan: Launch windows, vehicle allocation (Starship/Cargo Dragon), and risk mitigation for transit loss.`;

        const response = await generateModuleAnalysis('DSSCAI', prompt, config);
        setReport(response);
        setIsOptimizing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-blue-900/20 border border-blue-900/50 rounded">
                    <Package size={24} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">DSSCAI // SUPPLY CHAIN</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Interplanetary Logistics & Cargo Optimization</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-blue-400 uppercase flex items-center">
                            <Truck size={12} className="mr-2" /> Logistics Specs
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Cargo Mass (Tons)</span>
                                <span className="font-mono text-white">{cargoMass} t</span>
                            </div>
                            <input type="range" min="10" max="5000" step="10" value={cargoMass} onChange={(e) => setCargoMass(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Destination Outpost</label>
                            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Mars Colony Alpha">Mars Colony Alpha</option>
                                <option value="Moon Base Gateway">Moon Base Gateway</option>
                                <option value="Europa Outpost">Europa Deep Freeze</option>
                                <option value="Titan Station">Titan Station</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full py-4 bg-blue-800 hover:bg-blue-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isOptimizing ? <TrendingUp className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isOptimizing ? "Calculating Routes..." : "Optimize Logistics"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Box size={14} className="mr-2" /> Manifest Strategy
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Define cargo parameters to generate supply chain plan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplyChainManager;
