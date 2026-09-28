
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Sun, ShieldAlert, Play, Activity, Zap, Radio } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface SpaceWeatherMitigatorProps {
    config: SystemConfig;
}

const SpaceWeatherMitigator: React.FC<SpaceWeatherMitigatorProps> = ({ config }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [solarFlux, setSolarFlux] = useState(180);
    const [xrayClass, setXrayClass] = useState("X1.2");

    const handleScan = async () => {
        setIsScanning(true);
        const prompt = `Analyze Space Weather Threat.
        Solar Flux: ${solarFlux} sfu. X-Ray Flare Class: ${xrayClass}.
        Detect CME probability.
        Recommend immediate satellite protection protocols (e.g. shutdown, orientation, shielding).`;

        const response = await generateModuleAnalysis('RSWM', prompt, config);
        setReport(response);
        setIsScanning(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-yellow-900/20 border border-yellow-900/50 rounded">
                    <Sun size={24} className="text-yellow-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">RSWM // WEATHER DEFENSE</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Real-Time Solar Event Mitigation</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-yellow-400 uppercase flex items-center">
                            <Zap size={12} className="mr-2" /> Solar Telemetry
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span>Solar Flux (F10.7)</span>
                                <span className="font-mono text-white">{solarFlux} sfu</span>
                            </div>
                            <input type="range" min="60" max="300" value={solarFlux} onChange={(e) => setSolarFlux(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Flare Class (GOES)</label>
                            <select value={xrayClass} onChange={(e) => setXrayClass(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="A/B (Quiet)">A/B (Quiet)</option>
                                <option value="C (Small)">C (Minor)</option>
                                <option value="M5.0">M (Moderate)</option>
                                <option value="X1.2">X (Major)</option>
                                <option value="X10+">X10+ (Extreme)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-black/40 h-24 rounded border border-yellow-900/30 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 to-transparent opacity-50 animate-pulse"></div>
                        <Sun size={48} className="text-yellow-500 opacity-20" />
                        <span className="absolute bottom-2 right-2 text-[9px] text-yellow-600 font-mono">LIVE FEED: SDO/AIA</span>
                    </div>

                    <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className="w-full py-4 bg-yellow-800 hover:bg-yellow-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-yellow-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isScanning ? <Activity className="animate-spin mr-2" /> : <ShieldAlert className="mr-2 fill-current" />}
                        {isScanning ? "Analyzing Flux..." : "Detect & Mitigate"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <ShieldAlert size={14} className="mr-2" /> Defense Protocols
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Awaiting solar observation data...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpaceWeatherMitigator;
