
import React, { useState, useEffect } from 'react';
import { Rocket, Fuel, Play } from 'lucide-react';
import { RocketConfig, calculateRocketMission } from '../services/rocket/rocketMath';

const DEFAULT_ROCKET: RocketConfig = {
    name: "ARES-V PROTOTYPE",
    mass: { dry: 45000, fuel: 980000, payload: 15000 },
    engine: { thrust: 12000, isp: 310, burnTime: 380 },
    launch: { lat: 28.5721, lon: -80.6480, altitude: 0, azimuth: 45 },
    target: { lat: 51.5074, lon: -0.1278, altitude: 400, inclination: 51.6 }
};

interface Props { 
    onLaunch?: (c: RocketConfig) => void; 
}

const RocketControlPanel: React.FC<Props> = ({ onLaunch }) => {
    const [config, setConfig] = useState<RocketConfig>(DEFAULT_ROCKET);
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => { 
        setAnalysis(calculateRocketMission(config)); 
    }, [config]);

    const update = (section: keyof RocketConfig, key: string, val: string) => {
        if (section === 'name') return;
        setConfig(prev => ({ 
            ...prev, 
            [section]: { ...(prev[section] as any), [key]: parseFloat(val) } 
        }));
    };

    return (
        <div className="w-[320px] p-4 text-slate-300 font-sans max-h-[70vh] overflow-y-auto">
            <div className="flex items-center text-amber-500 font-bold text-xs mb-4">
                <Rocket size={14} className="mr-2" /> VEHICLE CONFIG
            </div>

            {/* PRE-FLIGHT ANALYSIS */}
            <div className="bg-[#151515] border border-slate-700 p-3 rounded mb-4">
                <div className="text-[9px] text-slate-500 font-bold uppercase mb-2">Pre-Flight Analysis</div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div>
                        <div className="text-slate-600">DELTA V</div>
                        <div className={analysis?.deltaV_available > 9000 ? "text-green-400" : "text-amber-400"}>
                            {analysis?.deltaV_available.toFixed(0)} m/s
                        </div>
                    </div>
                    <div>
                        <div className="text-slate-600">TWR (Liftoff)</div>
                        <div className="text-white">
                            {((config.engine.thrust * 1000) / ((config.mass.dry+config.mass.fuel)*9.81)).toFixed(2)}
                        </div>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-800">
                        <span className="text-slate-600">ORBIT CAPABLE: </span>
                        <span className={analysis?.is_feasible ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                            {analysis?.is_feasible ? "YES" : "NO - INSUFFICIENT FUEL"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="text-[9px] text-slate-500 font-bold block mb-1">FUEL MASS (KG)</label>
                    <input type="number" value={config.mass.fuel} onChange={e => update('mass', 'fuel', e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 p-1.5 text-xs text-white" />
                </div>
                <div>
                    <label className="text-[9px] text-slate-500 font-bold block mb-1">ENGINE THRUST (kN)</label>
                    <input type="number" value={config.engine.thrust} onChange={e => update('engine', 'thrust', e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 p-1.5 text-xs text-white" />
                </div>
            </div>

            <button onClick={() => onLaunch?.(config)} className="w-full mt-4 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 text-xs rounded flex items-center justify-center">
                <Play size={12} className="mr-2" /> SEND TO PAD
            </button>
        </div>
    );
};

export default RocketControlPanel;
