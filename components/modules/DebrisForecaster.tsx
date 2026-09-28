
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Satellite, Sun, AlertOctagon, RefreshCw, BarChart3, Wind } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface DebrisForecasterProps {
    config: SystemConfig;
}

const DebrisForecaster: React.FC<DebrisForecasterProps> = ({ config }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [forecast, setForecast] = useState<string | null>(null);
    const [solarFlux, setSolarFlux] = useState(145);

    const handleUpdate = async () => {
        setIsUpdating(true);
        // Simulate flux change
        setSolarFlux(prev => prev + Math.floor(Math.random() * 10 - 5));
        
        const prompt = `Generate space debris forecast. Solar Flux Index: ${solarFlux}. 
        Geomagnetic K-Index: 6 (Storm). Evaluate atmospheric drag impact on LEO debris fields (400-800km).
        Identify high-risk sectors.`;

        const response = await generateModuleAnalysis('SDFD', prompt, config);
        setForecast(response);
        setIsUpdating(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-900/20 border border-amber-900/50 rounded">
                        <Satellite size={24} className="text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-widest">SDFD // DEBRIS FORECAST</h1>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">Orbital Debris & Space Weather Dashboard</div>
                    </div>
                </div>
                <button 
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded font-bold text-xs uppercase transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={14} className={isUpdating ? "animate-spin" : ""} />
                    <span>{isUpdating ? "Updating Models..." : "Update Forecast"}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                
                {/* LEFT: METRICS */}
                <div className="space-y-4">
                    <MetricCard 
                        label="Solar Flux (F10.7)" 
                        value={solarFlux.toString()} 
                        unit="sfu" 
                        icon={<Sun size={14} className="text-yellow-500" />} 
                        status={solarFlux > 150 ? "HIGH" : "NORMAL"}
                    />
                    <MetricCard 
                        label="Geomagnetic K-Index" 
                        value="6" 
                        unit="Kp" 
                        icon={<Wind size={14} className="text-cyan-500" />} 
                        status="STORM"
                        statusColor="text-red-500"
                    />
                    <MetricCard 
                        label="Tracked Objects" 
                        value="24,931" 
                        unit="obj" 
                        icon={<AlertOctagon size={14} className="text-amber-500" />} 
                        status="RISING"
                    />
                </div>

                {/* CENTER: HEATMAP (Simulated) */}
                <div className="lg:col-span-3 bg-[#0b0d10] border border-slate-800 rounded p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase flex items-center">
                            <BarChart3 size={14} className="mr-2" /> Sector Risk Heatmap
                        </span>
                        <div className="flex space-x-2 text-[9px] font-mono">
                            <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded">CRITICAL</span>
                            <span className="px-2 py-1 bg-amber-900/50 text-amber-300 rounded">HIGH</span>
                            <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded">NOMINAL</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-1">
                        {Array.from({length: 72}).map((_, i) => {
                            // Pseudo-random coloring for heatmap
                            const risk = Math.random();
                            const colorClass = risk > 0.85 ? 'bg-red-600/40 hover:bg-red-500' : 
                                               risk > 0.6 ? 'bg-amber-600/40 hover:bg-amber-500' : 
                                               'bg-slate-800/40 hover:bg-slate-700';
                            return (
                                <div key={i} className={`rounded-sm transition-colors cursor-pointer ${colorClass} relative group`}>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] font-bold text-white pointer-events-none">
                                        SEC-{i}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* BOTTOM: AI REPORT */}
            {forecast && (
                <div className="mt-6 bg-[#1e293b] border border-slate-700 rounded p-6 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center text-amber-400 font-bold uppercase text-xs mb-4">
                        <AlertOctagon size={16} className="mr-2" /> Predictive Debris Alert
                    </div>
                    <div className="font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                        {forecast}
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ label, value, unit, icon, status, statusColor = "text-amber-400" }: any) => (
    <div className="bg-[#1e293b] p-4 rounded border border-slate-700">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase">{label}</span>
            {icon}
        </div>
        <div className="text-2xl font-mono text-white font-bold">
            {value} <span className="text-xs text-slate-500 font-normal">{unit}</span>
        </div>
        <div className={`text-[10px] font-bold mt-2 ${statusColor} border-t border-slate-700 pt-2`}>
            STATUS: {status}
        </div>
    </div>
);

export default DebrisForecaster;
