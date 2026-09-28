
import React, { useState, useEffect } from 'react';
import { 
  Rocket, MapPin, Database, ChevronRight, Check, AlertTriangle, 
  Cpu, Crosshair, Terminal, Zap, ShieldCheck, AlignJustify, Hammer, Target, Globe, Pin, Search, Loader2, Copy
} from 'lucide-react';
import { RocketConfig, calculateBearing, calculateDistance } from '../services/rocket/rocketMath';
import { ROCKET_PRESETS, RocketType } from '../services/rocket/rocketPresets';
import { resolveCoordinates } from '../services/geminiService';
import { SystemConfig } from '../types';

interface LaunchPadProps {
    onBuild: (config: RocketConfig) => void;
    onSwitchView: () => void;
    onSetMarker?: (lat: number, lon: number, alt: number, type: 'ORIGIN' | 'TARGET') => void;
    config?: SystemConfig;
}

const LaunchPadView: React.FC<LaunchPadProps> = ({ onBuild, onSwitchView, onSetMarker, config }) => {
    const [activeType, setActiveType] = useState<RocketType>('VECTOR-1');
    
    // 1. LAUNCH SITE COORDINATES (Cape Canaveral)
    const [launchLat, setLaunchLat] = useState(28.5721); 
    const [launchLon, setLaunchLon] = useState(-80.6480);
    const [launchAlt, setLaunchAlt] = useState(0);
    const [originSearch, setOriginSearch] = useState("Cape Canaveral");
    const [isResolvingOrigin, setIsResolvingOrigin] = useState(false);

    // 2. DESTINATION COORDINATES (London)
    const [targetLat, setTargetLat] = useState(51.5074); 
    const [targetLon, setTargetLon] = useState(-0.1278);
    const [targetAlt, setTargetAlt] = useState(400000); // 400km default
    const [targetSearch, setTargetSearch] = useState("London");
    const [isResolvingTarget, setIsResolvingTarget] = useState(false);

    // 3. FLIGHT PARAMETERS (Trajectory Optimization)
    // Azimuth 45 deg is optimal for 51.6 inclination from 28.5 lat
    const [launchAzimuth, setLaunchAzimuth] = useState(45.0); 
    const [targetInclination, setTargetInclination] = useState(51.6);

    // 4. PHYSICS SPECS (Vector-1 Interceptor Profile)
    const [dryMass, setDryMass] = useState(25000);      // 25t Structure
    const [fuelMass, setFuelMass] = useState(450000);   // 450t Fuel
    const [payloadMass, setPayloadMass] = useState(5000); // 5t Payload
    const [thrust, setThrust] = useState(8500);         // 8500 kN
    const [isp, setIsp] = useState(320);                // 320s Efficiency
    const [burnTime, setBurnTime] = useState(140);      // 140s Burn

    const [isDeployed, setIsDeployed] = useState(false);
    const [flightDistance, setFlightDistance] = useState(0);
    const [configCopied, setConfigCopied] = useState(false);

    useEffect(() => {
        // Recalculate bearing if locations change, but respect the 45 degree default initially if close
        const b = calculateBearing(launchLat, launchLon, targetLat, targetLon);
        const d = calculateDistance(launchLat, launchLon, targetLat, targetLon);
        
        setFlightDistance(d);
        
        // Auto-update Azimuth to match Great Circle bearing
        setLaunchAzimuth(parseFloat(b.toFixed(2)));

        // Auto-enforce Inclination >= Latitude logic (Physics constraint)
        if (Math.abs(targetLat) > targetInclination) {
            setTargetInclination(parseFloat(Math.abs(targetLat).toFixed(1)));
        }
    }, [launchLat, launchLon, targetLat, targetLon]);

    const handleInitiate = () => {
        const config = generateConfig();
        onBuild(config);
        setIsDeployed(true);
    };

    const handleLocationSearch = async (type: 'ORIGIN' | 'TARGET') => {
        if (!config || !config.apiKey) {
            alert("API Key required for Maps Search. Please configure in Settings.");
            return;
        }

        const query = type === 'ORIGIN' ? originSearch : targetSearch;
        if (!query.trim()) return;

        if (type === 'ORIGIN') setIsResolvingOrigin(true);
        else setIsResolvingTarget(true);

        const result = await resolveCoordinates(query, config);

        if (result) {
            if (type === 'ORIGIN') {
                setLaunchLat(result.lat);
                setLaunchLon(result.lon);
                setOriginSearch(result.name);
                onSetMarker?.(result.lat, result.lon, launchAlt, 'ORIGIN');
            } else {
                setTargetLat(result.lat);
                setTargetLon(result.lon);
                setTargetSearch(result.name);
                onSetMarker?.(result.lat, result.lon, targetAlt, 'TARGET');
            }
        } else {
            alert("Could not resolve location. Please try a different name.");
        }

        if (type === 'ORIGIN') setIsResolvingOrigin(false);
        else setIsResolvingTarget(false);
    };

    const generateConfig = (): RocketConfig => {
        return {
            name: "VECTOR-1 (INTERCEPTOR)",
            mass: { 
                dry: dryMass, 
                fuel: fuelMass, 
                payload: payloadMass 
            },
            engine: { 
                thrust: thrust, 
                isp: isp, 
                burnTime: burnTime 
            },
            launch: {
                lat: launchLat,
                lon: launchLon,
                altitude: launchAlt,
                azimuth: launchAzimuth 
            },
            target: { 
                lat: targetLat,
                lon: targetLon,
                altitude: targetAlt,
                inclination: targetInclination
            }
        };
    };

    const handleCopyConfig = () => {
        const data = generateConfig();
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setConfigCopied(true);
        setTimeout(() => setConfigCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-[#0b0d10] text-[#9ca3af] font-mono text-[10px] select-none border-l border-slate-800">
            
            <div className="flex-shrink-0 p-3 border-b border-slate-800 bg-[#111318] flex justify-between items-start">
                <div>
                    <div className="flex items-center text-slate-200 font-bold text-xs uppercase tracking-widest mb-1">
                        <Target size={12} className="mr-2 text-cyan-500" />
                        Payload Config
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase tracking-wider">
                        Define vehicle mass and launch parameters.
                    </div>
                </div>
                <button 
                    onClick={handleCopyConfig}
                    className="text-slate-500 hover:text-white transition-colors p-1"
                    title="Copy Configuration JSON"
                >
                    {configCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4 pb-20">
                
                {/* 1. COORDINATES */}
                <div className="space-y-2">
                    <SectionHeader title="01. COORDINATES" />
                    
                    {/* ORIGIN */}
                    <div className="bg-[#0f1115] p-2 border border-slate-800 group/loc">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center text-emerald-500 font-bold">
                                <MapPin size={10} className="mr-1" /> ORIGIN
                            </div>
                            <button 
                                onClick={() => onSetMarker?.(launchLat, launchLon, launchAlt, 'ORIGIN')}
                                className="px-2 py-0.5 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded flex items-center hover:bg-emerald-800 hover:text-white transition-colors"
                            >
                                <Pin size={8} className="mr-1"/> SET
                            </button>
                        </div>
                        
                        {/* SEARCH BAR ORIGIN */}
                        <div className="flex space-x-1 mb-2">
                            <input 
                                type="text" 
                                value={originSearch}
                                onChange={(e) => setOriginSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch('ORIGIN')}
                                className="flex-1 bg-[#0a0a0a] border border-slate-700 text-slate-300 p-1 outline-none text-[10px] focus:border-emerald-500"
                                placeholder="Search Launch Site..."
                            />
                            <button 
                                onClick={() => handleLocationSearch('ORIGIN')}
                                disabled={isResolvingOrigin}
                                className="bg-slate-800 text-slate-400 hover:text-white p-1 rounded border border-slate-700"
                            >
                                {isResolvingOrigin ? <Loader2 size={12} className="animate-spin"/> : <Search size={12}/>}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <InputBox label="LATITUDE" value={launchLat} onChange={setLaunchLat} />
                            <InputBox label="LONGITUDE" value={launchLon} onChange={setLaunchLon} />
                            <div className="col-span-2">
                                <InputBox label="ALTITUDE (M)" value={launchAlt} onChange={setLaunchAlt} step={1} />
                            </div>
                        </div>
                    </div>

                    {/* TARGET */}
                    <div className="bg-[#0f1115] p-2 border border-slate-800 group/loc">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center text-red-500 font-bold">
                                <Crosshair size={10} className="mr-1" /> TARGET
                            </div>
                            <button 
                                onClick={() => onSetMarker?.(targetLat, targetLon, targetAlt, 'TARGET')}
                                className="px-2 py-0.5 bg-red-900/30 text-red-400 border border-red-800 rounded flex items-center hover:bg-red-800 hover:text-white transition-colors"
                            >
                                <Pin size={8} className="mr-1"/> SET
                            </button>
                        </div>

                        {/* SEARCH BAR TARGET */}
                        <div className="flex space-x-1 mb-2">
                            <input 
                                type="text" 
                                value={targetSearch}
                                onChange={(e) => setTargetSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch('TARGET')}
                                className="flex-1 bg-[#0a0a0a] border border-slate-700 text-slate-300 p-1 outline-none text-[10px] focus:border-red-500"
                                placeholder="Search Destination..."
                            />
                            <button 
                                onClick={() => handleLocationSearch('TARGET')}
                                disabled={isResolvingTarget}
                                className="bg-slate-800 text-slate-400 hover:text-white p-1 rounded border border-slate-700"
                            >
                                {isResolvingTarget ? <Loader2 size={12} className="animate-spin"/> : <Search size={12}/>}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <InputBox label="LATITUDE" value={targetLat} onChange={setTargetLat} />
                            <InputBox label="LONGITUDE" value={targetLon} onChange={setTargetLon} />
                            <InputBox label="ALTITUDE (M)" value={targetAlt} onChange={setTargetAlt} step={100} />
                            <InputBox label="INCLINATION (DEG)" value={targetInclination} onChange={setTargetInclination} step={0.1} />
                        </div>
                    </div>

                    {/* FLIGHT PATH (Editable) */}
                    <div className="bg-[#151515] p-2 border border-dashed border-slate-700 grid grid-cols-2 gap-2">
                        <InputBox label="LAUNCH AZIMUTH (DEG)" value={launchAzimuth} onChange={setLaunchAzimuth} step={0.1} />
                        <div>
                            <label className="block text-[8px] text-slate-500 font-bold mb-0.5">DISTANCE (KM)</label>
                            <div className="flex items-center bg-black border border-slate-700 h-[26px] px-2">
                                <span className="text-cyan-400 font-bold text-xs">{flightDistance.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. PHYSICS SPECS */}
                <div className="space-y-2">
                    <SectionHeader title="02. VEHICLE PHYSICS" />
                    <div className="bg-[#0f1115] p-2 border border-slate-800">
                        <div className="grid grid-cols-2 gap-2">
                            <InputBox label="DRY MASS (KG)" value={dryMass} onChange={setDryMass} step={100} />
                            <InputBox label="FUEL MASS (KG)" value={fuelMass} onChange={setFuelMass} step={1000} />
                            
                            <InputBox label="PAYLOAD (KG)" value={payloadMass} onChange={setPayloadMass} step={100} />
                            <InputBox label="ISP (S)" value={isp} onChange={setIsp} step={1} />
                            
                            <InputBox label="THRUST (kN)" value={thrust} onChange={setThrust} step={100} />
                            <InputBox label="BURN TIME (S)" value={burnTime} onChange={setBurnTime} step={1} />
                        </div>
                    </div>
                </div>

            </div>

            {/* ACTION FOOTER */}
            <div className="p-3 border-t border-slate-800 bg-[#111318] shrink-0">
                {isDeployed ? (
                    <button 
                        onClick={onSwitchView}
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                        <Zap size={14} className="mr-2 fill-current" /> OPEN MISSION CONTROL
                    </button>
                ) : (
                    <button 
                        onClick={handleInitiate}
                        className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center border border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    >
                        ASSEMBLE & COMMIT
                    </button>
                )}
            </div>

        </div>
    );
};

const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#15171c] px-2 py-1 border-b border-slate-800 flex justify-between items-center mb-1">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
);

const InputBox = ({ label, value, onChange, step = 0.0001 }: any) => (
    <div>
        <label className="block text-[8px] text-slate-500 font-bold mb-0.5">{label}</label>
        <div className="flex items-center bg-black border border-slate-700">
            <input 
                type="number" 
                value={value}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full bg-transparent text-right text-slate-200 p-1 outline-none text-[10px] font-mono"
            />
        </div>
    </div>
);

export default LaunchPadView;
