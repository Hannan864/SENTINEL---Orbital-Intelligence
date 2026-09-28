
import React from 'react';
import { Ruler } from 'lucide-react';
import { PhysicsData } from '../../services/physicsCalculation';
import { PhysicsSettings } from '../PhysicsControls';

interface OrbitalPhysicsHUDProps {
    cameraAltitude: number;
    currentPhysics: PhysicsData | null;
    physicsSettings: PhysicsSettings;
    rocketStatus: string;
    liveAltitude?: number; // Pass real altitude if available
}

export const OrbitalPhysicsHUD: React.FC<OrbitalPhysicsHUDProps> = ({
    cameraAltitude,
    currentPhysics,
    physicsSettings,
    rocketStatus,
    liveAltitude
}) => {
    // Priority to liveAltitude (from simulation core)
    const effectiveAlt = liveAltitude !== undefined ? liveAltitude : (cameraAltitude * 637.1);
    
    let display = "";
    if (effectiveAlt === Infinity) {
        display = "∞ / ESCAPE";
    } else {
        display = effectiveAlt > 10000 
            ? `${(effectiveAlt / 1000).toFixed(1)}k KM` 
            : `${effectiveAlt.toFixed(0)} KM`;
    }

    return (
        <div className="absolute bottom-20 right-20 pointer-events-none flex flex-col items-end">
            <div className="flex items-center text-xs font-mono text-slate-300 mb-2 bg-black/40 px-2 py-1 rounded border-b-2 border-cyan-500">
                <Ruler size={12} className="mr-2 text-cyan-400" /> ALTITUDE: <span className="ml-2 font-bold text-white">{display}</span>
            </div>
            
            {rocketStatus !== 'IDLE' && (
                <div className="bg-black/60 p-2 rounded border border-slate-700 text-[10px] text-cyan-400 font-bold mb-2 uppercase">
                   Status: {rocketStatus}
                </div>
            )}
        </div>
    );
};
