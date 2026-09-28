
import React, { useState } from 'react';
import { RocketConfig } from '../services/rocket/rocketMath';
import { Beaker, Play, AlertTriangle, RotateCcw } from 'lucide-react';

interface EngineTestViewProps {
    onLaunch: (config: RocketConfig) => void;
}

const EngineTestView: React.FC<EngineTestViewProps> = ({ onLaunch }) => {
    // Unconstrained State
    const [thrust, setThrust] = useState(12000); // kN
    const [isp, setIsp] = useState(310);
    const [fuelMass, setFuelMass] = useState(980000);
    const [dryMass, setDryMass] = useState(45000);
    
    const handleTestLaunch = () => {
        const testConfig: RocketConfig = {
            name: "EXPERIMENTAL-X1",
            mass: { dry: dryMass, fuel: fuelMass, payload: 0 },
            engine: { thrust: thrust, isp: isp, burnTime: 9999 }, // Infinite burn until fuel out
            launch: { lat: 0, lon: 0, altitude: 0, azimuth: 90 }, // Equatorial launch
            target: { lat: 0, lon: 0, altitude: 1000, inclination: 0 } // Dummy target
        };
        onLaunch(testConfig);
    };

    return (
        <div className="p-4 space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded text-center">
                <div className="flex justify-center mb-2 text-amber-500"><Beaker size={24} /></div>
                <h3 className="text-amber-500 font-bold uppercase text-xs tracking-widest mb-1">Experimental Sandbox</h3>
                <p className="text-[10px] text-amber-200/60 leading-tight">
                    Safety limiters disabled. Physics engine running in raw mode. Failure is expected.
                </p>
            </div>

            <div className="space-y-4">
                <div className="bg-[#151515] p-3 rounded border border-[#333]">
                    <label className="text-[9px] text-slate-500 font-bold uppercase block mb-2">Engine Thrust (kN)</label>
                    <input 
                        type="number" 
                        value={thrust} 
                        onChange={(e) => setThrust(parseFloat(e.target.value))}
                        className="w-full bg-[#0f172a] border border-slate-700 text-white font-mono text-sm p-2 rounded focus:border-amber-500 outline-none"
                    />
                    <div className="text-[9px] text-slate-600 mt-1">Real-world F-1 Engine: ~6770 kN</div>
                </div>

                <div className="bg-[#151515] p-3 rounded border border-[#333]">
                    <label className="text-[9px] text-slate-500 font-bold uppercase block mb-2">Specific Impulse (s)</label>
                    <input 
                        type="number" 
                        value={isp} 
                        onChange={(e) => setIsp(parseFloat(e.target.value))}
                        className="w-full bg-[#0f172a] border border-slate-700 text-white font-mono text-sm p-2 rounded focus:border-amber-500 outline-none"
                    />
                    <div className="text-[9px] text-slate-600 mt-1">Chemical Limit: ~460s. Nuclear: ~900s</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#151515] p-3 rounded border border-[#333]">
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-2">Fuel Mass (kg)</label>
                        <input 
                            type="number" 
                            value={fuelMass} 
                            onChange={(e) => setFuelMass(parseFloat(e.target.value))}
                            className="w-full bg-[#0f172a] border border-slate-700 text-white font-mono text-sm p-2 rounded focus:border-amber-500 outline-none"
                        />
                    </div>
                    <div className="bg-[#151515] p-3 rounded border border-[#333]">
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-2">Dry Mass (kg)</label>
                        <input 
                            type="number" 
                            value={dryMass} 
                            onChange={(e) => setDryMass(parseFloat(e.target.value))}
                            className="w-full bg-[#0f172a] border border-slate-700 text-white font-mono text-sm p-2 rounded focus:border-amber-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={handleTestLaunch}
                className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs uppercase rounded flex items-center justify-center transition-colors shadow-lg shadow-amber-900/20"
            >
                <Play size={14} className="mr-2" /> Initiate Test Fire
            </button>
        </div>
    );
};

export default EngineTestView;
