
import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Activity, Play, Square, Settings, Pause,
  MapPin, AlertTriangle, Zap, Terminal, Fuel, 
  Wind, Gauge, ArrowUp, ArrowDown, RotateCcw, Target, Copy, Check
} from 'lucide-react';
import { RocketConfig } from '../services/rocket/rocketMath';
import { RocketTelemetry } from '../services/simulation/rocket/RocketSimulationBridge';

interface Props {
    rocketConfig: RocketConfig | null; 
    onLaunch: (c: RocketConfig) => void;
    onPause: () => void;
    onStop: () => void;
    simSpeed: number;
    onSimSpeedChange: (s: number) => void;
    liveTelemetry?: RocketTelemetry | null;
}

const RocketMissionControl: React.FC<Props> = ({ rocketConfig, onLaunch, onPause, onStop, simSpeed, onSimSpeedChange, liveTelemetry }) => {
    const [eventHistory, setEventHistory] = useState<string[]>([]);
    const [logsCopied, setLogsCopied] = useState(false);
    const lastEventCount = useRef(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const flightRecorder = useRef<string[]>([]); // Full data logger

    const time = liveTelemetry?.time || 0;
    const velocityKmS = liveTelemetry?.speed || 0;
    const altitudeKm = liveTelemetry?.altitude || 0;
    const status = liveTelemetry?.status || "READY";
    const isPaused = (liveTelemetry as any)?.isPaused || false;
    
    const mach = (velocityKmS * 1000) / 343;
    const fuelPct = rocketConfig && rocketConfig.mass.fuel > 0 
        ? ((liveTelemetry?.fuel || 0) / rocketConfig.mass.fuel) * 100 
        : 0;

    // --- DATA RECORDER LOGIC ---
    useEffect(() => {
        if (!liveTelemetry) return;

        // Reset recorder on new launch
        if (liveTelemetry.status === 'IGNITION' && flightRecorder.current.length > 100) {
            flightRecorder.current = [];
        }

        // Calculate Geodetic Lat/Lon from ECEF Position Units
        // r = length(pos), y = r*sin(lat), z/-x = tan(lon)
        const pos = liveTelemetry.positionUnits;
        const r = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z);
        
        let lat = 0, lon = 0;
        if (r > 0) {
            // ThreeJS Space: Y is North/Polar. X/Z are Equatorial.
            // lat = asin(y / r)
            lat = Math.asin(pos.y / r) * (180 / Math.PI);
            // lon = atan2(-z, x)
            lon = Math.atan2(-pos.z, pos.x) * (180 / Math.PI);
        }

        const logEntry = [
            `T+${liveTelemetry.time.toFixed(1)}s`,
            liveTelemetry.status,
            `${liveTelemetry.altitude.toFixed(3)}km`,
            `${liveTelemetry.speed.toFixed(3)}km/s`,
            `M${mach.toFixed(2)}`,
            `${fuelPct.toFixed(1)}%`,
            `${lat.toFixed(4)}`,
            `${lon.toFixed(4)}`
        ].join(' | ');

        // Only log if active or just finished
        if (liveTelemetry.status !== 'READY' && liveTelemetry.status !== 'IDLE') {
            flightRecorder.current.push(logEntry);
        }

    }, [liveTelemetry]);

    useEffect(() => {
        if (!liveTelemetry) return;
        const currentEvents = (liveTelemetry as any).events || [];
        if (currentEvents.length > lastEventCount.current) {
            setEventHistory(currentEvents);
            lastEventCount.current = currentEvents.length;
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [liveTelemetry]);

    useEffect(() => {
        if (status === 'READY') {
            setEventHistory([]);
            flightRecorder.current = [];
            lastEventCount.current = 0;
        }
    }, [status]);

    const handleLaunch = () => {
        if (rocketConfig) onLaunch(rocketConfig);
    };

    const handleCopyLogs = () => {
        // Construct detailed CSV-style header
        const header = "TIME | STATUS | ALTITUDE | VELOCITY | MACH | FUEL | LAT | LON\n" + 
                       "----------------------------------------------------------------\n";
        const body = flightRecorder.current.join('\n');
        
        // Also append major events
        const events = "\n\n--- MAJOR EVENTS ---\n" + eventHistory.join('\n');
        
        const fullLog = header + body + events;

        navigator.clipboard.writeText(fullLog).then(() => {
            setLogsCopied(true);
            setTimeout(() => setLogsCopied(false), 2000);
        });
    };

    const isSimRunning = !['READY', 'TERMINATED', 'IDLE', 'CRASHED', 'ENDED'].includes(status);

    return (
        <div className="h-full flex flex-col bg-[#0b0d10] text-[#9ca3af] font-mono text-[10px] w-[350px] border-l border-slate-800 select-none">
            
            {/* 1. HEADER */}
            <div className="p-3 border-b border-slate-800 bg-[#111318] flex justify-between items-center">
                <div className="font-bold text-slate-200">FLIGHT DIRECTOR</div>
                <div className="flex items-center space-x-2">
                    {isPaused && <span className="text-amber-500 font-bold animate-pulse text-[8px]">PAUSED</span>}
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        status === 'ASCENT' ? 'bg-blue-900 text-blue-400 animate-pulse' :
                        status === 'TERMINATED' ? 'bg-red-900 text-red-400' :
                        'bg-slate-800 text-slate-500'
                    }`}>{status}</div>
                </div>
            </div>

            {/* 2. MAIN TELEMETRY */}
            <div className="p-3 grid grid-cols-2 gap-px bg-slate-800 border border-slate-800">
                <Readout label="VELOCITY" value={velocityKmS.toFixed(3)} unit="km/s" />
                <Readout label="ALTITUDE" value={altitudeKm === Infinity ? "ESCAPE" : altitudeKm.toFixed(1)} unit="km" color={altitudeKm > 100 ? "text-green-400" : "text-white"} />
                <Readout label="MACH" value={mach.toFixed(1)} unit="M" />
                <Readout label="FUEL" value={fuelPct.toFixed(1)} unit="%" color={fuelPct < 10 ? "text-red-500" : "text-cyan-400"} />
            </div>

            {/* 3. SIM CONTROL */}
            <div className="p-3 border-t border-slate-800 space-y-4">
                <div>
                    <div className="flex justify-between text-slate-500 mb-1">
                        <span>SIM SPEED</span>
                        <span className="text-cyan-400">{simSpeed}x</span>
                    </div>
                    <input 
                        type="range" min="0.1" max="100" step="0.1" 
                        value={simSpeed} 
                        onChange={(e) => onSimSpeedChange(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-700 accent-cyan-500"
                    />
                </div>
                
                <div className="space-y-2">
                    {/* START / STOP BUTTON */}
                    {isSimRunning ? (
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={onPause} 
                                className={`py-2 font-bold flex items-center justify-center border ${
                                    isPaused 
                                    ? 'bg-amber-700 text-white border-amber-500 animate-pulse' 
                                    : 'bg-amber-900/30 text-amber-400 border-amber-800 hover:bg-amber-800'
                                }`}
                            >
                                {isPaused ? <Play size={12} className="mr-2 fill-current"/> : <Pause size={12} className="mr-2 fill-current"/>}
                                {isPaused ? 'RESUME' : 'PAUSE SIM'}
                            </button>
                            <button onClick={onStop} className="bg-red-900/30 text-red-400 border border-red-800 py-2 font-bold flex items-center justify-center hover:bg-red-800">
                                <Square size={12} className="mr-2 fill-current"/> STOP / ABORT
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleLaunch} className="w-full bg-emerald-700 text-white py-3 font-bold flex items-center justify-center hover:bg-emerald-600 border border-emerald-500 shadow-lg shadow-emerald-900/20">
                            <Play size={14} className="mr-2 fill-current"/> INITIATE LAUNCH SEQUENCE
                        </button>
                    )}
                </div>
            </div>

            {/* 4. LOGS */}
            <div className="flex-1 flex flex-col min-h-0 border-t border-slate-800">
                <div className="p-2 bg-black border-b border-slate-800 flex justify-between items-center">
                    <div className="text-slate-600 font-bold uppercase tracking-widest">Event Stream</div>
                    <button 
                        onClick={handleCopyLogs} 
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Copy Full Flight Logs (CSV)"
                    >
                        {logsCopied ? <Check size={12} className="text-green-500"/> : <Copy size={12}/>}
                    </button>
                </div>
                <div ref={scrollRef} className="flex-1 bg-black p-2 overflow-y-auto font-mono text-[9px] space-y-1">
                    {status === 'READY' && <div className="text-slate-500">&gt; System Standby. Awaiting commit.</div>}
                    {eventHistory.map((evt, i) => (
                        <div key={i} className={`${evt.includes('FAILURE') || evt.includes('CRASH') ? 'text-red-500 font-bold' : evt.includes('MECO') ? 'text-yellow-400' : 'text-slate-300'}`}>
                            {`> ${evt}`}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Readout = ({ label, value, unit, color = "text-slate-200" }: any) => (
    <div className="p-2 bg-[#0b0d10] flex flex-col justify-center">
        <span className="text-[8px] text-slate-600 mb-0.5">{label}</span>
        <span className={`text-xs font-mono font-bold ${color}`}>
            {value} <span className="text-[8px] text-slate-600 font-normal">{unit}</span>
        </span>
    </div>
);

export default RocketMissionControl;
