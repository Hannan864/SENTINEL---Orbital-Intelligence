
import React, { useState, useEffect, useRef } from 'react';
import { SentinelIntelPacket, SystemConfig } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Activity, 
  Clock, 
  FileCheck, 
  Terminal,
  Bug,
  ChevronDown,
  ChevronRight,
  RotateCw,
  Timer,
  Zap
} from 'lucide-react';

interface DebugViewProps {
  packet: SentinelIntelPacket | null;
  config: SystemConfig;
}

interface ValidationLog {
  id: string;
  category: string;
  message: string;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

interface SectionState {
  systemContext: boolean;
  liveStream: boolean;
  crossTab: boolean;
  trendVectors: boolean;
  exportIntegrity: boolean;
  timeSync: boolean;
  physicsOverlay: boolean;
}

const DebugView: React.FC<DebugViewProps> = ({ packet, config }) => {
  const [logs, setLogs] = useState<ValidationLog[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [autoValidate, setAutoValidate] = useState(false);
  const [sections, setSections] = useState<SectionState>({
    systemContext: true,
    liveStream: true,
    crossTab: true,
    trendVectors: false,
    exportIntegrity: false,
    timeSync: true,
    physicsOverlay: true
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = config.timeConfig.useAutoTime ? new Date() : new Date(config.timeConfig.manualTime || Date.now());
      setCurrentTime(now);
    }, 100); // Faster update for debug
    return () => clearInterval(timer);
  }, [config.timeConfig]);

  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
     if (autoValidate && packet) {
        const interval = setInterval(() => {
           runValidation(true);
        }, 5000);
        return () => clearInterval(interval);
     }
  }, [autoValidate, packet]);

  const toggleSection = (key: keyof SectionState) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatLogTime = (date: Date) => {
      const time = date.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const ms = date.getMilliseconds().toString().padStart(3, '0');
      return `${time}.${ms}`;
  };

  const addLog = (category: string, message: string, status: 'OK' | 'WARNING' | 'CRITICAL') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substring(7),
      category,
      message,
      status,
      timestamp: formatLogTime(currentTime)
    }, ...prev].slice(0, 50)); 
  };

  const runValidation = (silent = false) => {
    if (!packet) return;
    if (!silent) setLogs([]); 

    const pktTime = new Date(packet.metadata.timestamp).getTime();
    const nowTime = currentTime.getTime();
    const ageSec = (nowTime - pktTime) / 1000;
    
    if (Math.abs(ageSec) > 3600 * 24) addLog('TIME', `Packet timestamp > 24h deviation`, 'WARNING');
    else if (ageSec < 60) addLog('TIME', `Telemetry fresh (${ageSec.toFixed(1)}s latency)`, 'OK');
    else addLog('TIME', `Telemetry stale (${ageSec.toFixed(1)}s latency)`, 'WARNING');

    addLog('SYSTEM', `Sector: ${packet.metadata.sector} | Confidence: ${(packet.metadata.confidence*100).toFixed(0)}%`, 'OK');

    if (!silent) addLog('SYSTEM', 'Validation Cycle Complete', 'OK');
  };

  if (!packet) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono">
       <Bug size={48} className="mb-4 opacity-20" />
       <div>NO SYSTEM DATA TO VALIDATE</div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-mono text-sm relative overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#1e293b] shrink-0">
         <div className="flex items-center space-x-3 text-orange-500">
            <Bug size={18} />
            <h1 className="text-sm font-bold tracking-wider">SYSTEM VALIDATOR V3.1</h1>
         </div>
         <div className="flex items-center space-x-4">
             <div className="text-[10px] text-slate-500 font-mono">{formatLogTime(currentTime)}</div>
             <button onClick={() => runValidation(false)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
                <RefreshCw size={14} />
             </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-32">

         {/* PHYSICS ENGINE OVERLAY (NEW) */}
         <div className="border border-slate-800 rounded bg-[#1e293b] overflow-hidden">
             <div 
               className="flex justify-between items-center px-3 py-2 bg-[#252526] cursor-pointer"
               onClick={() => toggleSection('physicsOverlay')}
             >
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                   {sections.physicsOverlay ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                   <Zap size={14} className="text-yellow-500" />
                   <span>PHYSICS ENGINE STATE</span>
                </div>
                <span className="text-[9px] bg-black/30 px-2 py-0.5 rounded text-green-500">ACTIVE</span>
             </div>
             
             {sections.physicsOverlay && (
                <div className="p-3 border-t border-slate-800 text-xs space-y-3 font-mono">
                   <div className="flex justify-between border-b border-slate-800 pb-2">
                       <span className="text-slate-500">TIMESTEP (dt)</span>
                       <span className="text-cyan-400 font-bold">LOCKED</span>
                   </div>
                   
                   <div className="space-y-1">
                       <div className="text-[9px] text-slate-500 font-bold mb-1">FORCE VECTORS (N)</div>
                       <ForceRow label="GRAVITY" value="WAITING FOR LAUNCH..." color="text-emerald-400" />
                       <ForceRow label="DRAG" value="0.000" color="text-orange-400" />
                       <ForceRow label="THRUST" value="0.000" color="text-purple-400" />
                   </div>

                   <div className="bg-black/20 p-2 rounded text-[10px] text-slate-500 italic">
                       * Real-time values populated during simulation. Engine running in Frame-Locked mode.
                   </div>
                </div>
             )}
         </div>

         {/* 1. SYSTEM CONTEXT OVERVIEW */}
         <div className="border border-slate-800 rounded bg-[#1e293b] overflow-hidden">
             <div 
               className="flex justify-between items-center px-3 py-2 bg-[#252526] cursor-pointer"
               onClick={() => toggleSection('systemContext')}
             >
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                   {sections.systemContext ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                   <Database size={14} className="text-cyan-500" />
                   <span>SYSTEM CONTEXT</span>
                </div>
             </div>
             
             {sections.systemContext && (
                <div className="p-3 grid grid-cols-2 gap-3 text-xs border-t border-slate-800">
                   <ContextItem label="Sector ID" value={packet.metadata.sector} />
                   <ContextItem label="Confidence" value={`${(packet.dashboard.confidence * 100).toFixed(1)}%`} />
                </div>
             )}
         </div>

         {/* 3. LIVE VALIDATION STREAM */}
         <div className="border border-slate-800 rounded bg-[#1e293b] flex flex-col h-48">
             <div className="flex justify-between items-center px-3 py-2 bg-[#252526] border-b border-slate-800">
                 <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                    <Terminal size={14} className="text-green-500" />
                    <span>VALIDATION STREAM</span>
                 </div>
             </div>
             
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 bg-[#0a0a0a] font-mono text-[10px]">
                 {logs.map(log => (
                    <div key={log.id} className="flex items-start space-x-2 p-1 hover:bg-[#151515] rounded">
                       <span className="text-slate-600 w-16 shrink-0">{log.timestamp}</span>
                       <div className="flex-1">
                          <span className="text-slate-500 font-bold mr-1">[{log.category}]</span>
                          <span className={log.status === 'OK' ? 'text-green-400' : log.status === 'WARNING' ? 'text-orange-400' : 'text-red-400 font-bold'}>
                             {log.message}
                          </span>
                       </div>
                    </div>
                 ))}
             </div>
         </div>

      </div>
    </div>
  );
};

const ForceRow = ({ label, value, color }: any) => (
    <div className="flex justify-between items-center bg-[#151515] p-2 rounded">
        <span className="text-slate-500 font-bold">{label}</span>
        <span className={`font-mono ${color}`}>{value}</span>
    </div>
);

const ContextItem = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-[#0f172a] p-2 rounded border border-slate-800">
     <div className="text-[10px] text-slate-500 uppercase mb-1">{label}</div>
     <div className="font-mono font-bold text-white">{value}</div>
  </div>
);

export default DebugView;
