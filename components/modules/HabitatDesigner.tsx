
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Home, Layout, Play, Users, Clock, Box } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface HabitatDesignerProps {
    config: SystemConfig;
}

const HabitatDesigner: React.FC<HabitatDesignerProps> = ({ config }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [crewSize, setCrewSize] = useState(12);
    const [duration, setDuration] = useState(18); // months

    const handleDesign = async () => {
        setIsGenerating(true);
        const prompt = `Design Space Habitat Layout.
        Crew: ${crewSize} Astronauts. Mission Duration: ${duration} months.
        Environment: Martian Surface / Orbital Station.
        Output: Modular layout blueprint, life support requirements, and efficiency analysis (psychological & physical).`;

        const response = await generateModuleAnalysis('ASHD', prompt, config);
        setReport(response);
        setIsGenerating(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-green-900/20 border border-green-900/50 rounded">
                    <Home size={24} className="text-green-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ASHD // HABITAT DESIGNER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Modular Base Architect & Efficiency Simulator</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-green-400 uppercase flex items-center">
                            <Layout size={12} className="mr-2" /> Base Constraints
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Users size={10} className="mr-1"/> Crew Capacity</span>
                                <span className="font-mono text-white">{crewSize} PAX</span>
                            </div>
                            <input type="range" min="1" max="100" value={crewSize} onChange={(e) => setCrewSize(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Clock size={10} className="mr-1"/> Mission Duration</span>
                                <span className="font-mono text-white">{duration} MO</span>
                            </div>
                            <input type="range" min="1" max="60" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </div>

                    <button 
                        onClick={handleDesign}
                        disabled={isGenerating}
                        className="w-full py-4 bg-green-800 hover:bg-green-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-green-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <Box className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isGenerating ? "Architecting..." : "Generate Blueprint"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Layout size={14} className="mr-2" /> Structural Plan
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Awaiting design parameters...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HabitatDesigner;
