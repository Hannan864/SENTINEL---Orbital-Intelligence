
import React, { useState, useMemo } from 'react';
import { ViewType, SentinelIntelPacket, SystemConfig } from '../types';
import { 
  ShieldAlert, Activity, ArrowUp, ArrowDown, Minus, Target, 
  BrainCircuit, Wrench, ChevronDown, Radar, Share2, ClipboardCheck 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ExecutiveReport from './ExecutiveReport';
import RiskRadar from './RadarChart';

interface IntelligenceViewerProps {
  view: ViewType;
  packet: SentinelIntelPacket | null;
  onNavigateToUplink: () => void;
  onToggleMitigation: (riskId: string) => void;
  config: SystemConfig;
}

const IntelligenceViewer: React.FC<IntelligenceViewerProps> = ({ 
  view, 
  packet, 
  onNavigateToUplink,
  onToggleMitigation,
  config
}) => {
  // HOOKS MUST BE UNCONDITIONAL
  const [risksShown, setRisksShown] = useState(6);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Moved useMemo to top level to avoid "Rendered more hooks than during the previous render" error
  const filteredRisks = useMemo(() => {
    if (!packet) return [];
    return packet.hiddenRisks.filter(r => {
      if (riskFilter === 'ALL') return true;
      if (riskFilter === 'CRITICAL') return r.riskLevel === 'CRITICAL';
      if (riskFilter === 'HIGH') return r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL';
      return true;
    });
  }, [packet, riskFilter]);

  const handleShare = async () => {
    if (!packet) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
      setNotification("MONITOR DATA COPIED");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--:--';
    const date = new Date(isoString);
    const zone = config.timeConfig.useAutoZone 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : config.timeConfig.selectedTimezone;
    
    return date.toLocaleTimeString('en-GB', { 
      timeZone: zone, 
      hour12: config.timeConfig.timeFormat === '12h' 
    }) + (zone === 'UTC' ? ' UTC' : '');
  };

  // CONDITIONAL RENDERING STARTS HERE

  // 1. Empty State
  if (!packet) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#555]">
        <Activity size={48} className="mb-4 opacity-20" />
        <p className="font-mono text-sm mb-2">NO INTELLIGENCE DATA AVAILABLE</p>
        <p className="text-xs text-[#444] max-w-md text-center">
          The system is currently idle. Please navigate to the Command Uplink and initiate a scan.
        </p>
        <button 
          onClick={onNavigateToUplink} 
          className="mt-6 px-4 py-2 bg-[#252526] border border-[#333] hover:bg-[#333] text-cyan-500 text-xs font-mono rounded transition-colors"
        >
          &gt; INITIATE_UPLINK
        </button>
      </div>
    );
  }

  // 2. Report View (Delegated Component)
  if (view === 'report') {
    return <ExecutiveReport packet={packet} onToggleMitigation={onToggleMitigation} config={config} />;
  }

  // 3. Log View
  if (view === 'intel') {
     return (
       <div className="p-4 h-full overflow-y-auto font-mono text-xs text-slate-300 pb-24">
         <div className="mb-4 text-slate-500 border-b border-[#333] pb-2 flex justify-between">
           <span>SYSTEM_LOG_STREAM // {packet.metadata.sector}</span>
           <span>LOG_COUNT: {packet.threatLogs.length}</span>
         </div>
         {packet.threatLogs.map((log, i) => (
           <div key={i} className="mb-1 flex">
             <span className="text-slate-500 mr-4 w-24 shrink-0">{formatTime(log.timestamp)}</span>
             <span className={`${
                log.severity === 'critical' ? 'text-red-500 font-bold' : 
                log.severity === 'warning' ? 'text-amber-400' : 
                log.severity === 'success' ? 'text-green-500' : 'text-slate-300'
             }`}>
                {log.message}
             </span>
           </div>
         ))}
       </div>
     );
  }

  // 4. Monitor / Risks / Insights View (Default)
  const visibleRisks = filteredRisks.slice(0, risksShown);
  const totalRisks = filteredRisks.length;

  return (
    <div className="p-4 overflow-y-auto h-full space-y-4 relative pb-32">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white px-4 py-2 rounded shadow-xl z-50 flex items-center animate-bounce">
          <ClipboardCheck size={16} className="mr-2" />
          <span className="text-xs font-mono font-bold">{notification}</span>
        </div>
      )}

      {/* Share Button (Top Right) */}
      <div className="flex justify-end mb-2">
         <button 
          onClick={handleShare}
          className="flex items-center space-x-2 text-[10px] text-slate-400 hover:text-white bg-[#252526] hover:bg-[#333] px-3 py-1 rounded border border-[#333] transition-colors"
         >
           <Share2 size={12} />
           <span>EXPORT JSON</span>
         </button>
      </div>
      
      {/* TOP ROW: RADAR & TRAJECTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[350px]">
         {/* Radar */}
         <div className="bg-[#1e1e1e] border border-[#333] rounded p-2 flex flex-col">
            <div className="flex justify-between items-center mb-2 px-2 border-b border-[#333] pb-2">
               <div className="flex items-center text-xs font-mono text-slate-400">
                  <Radar size={14} className="mr-2 text-cyan-500" />
                  RISK_VECTOR_ANALYSIS
               </div>
               <span className="text-[10px] text-slate-500 font-mono">THREAT_SCORE: {packet.dashboard.riskScore}</span>
            </div>
            <div className="flex-1 relative">
              <RiskRadar points={packet.dashboard.radarPoints} />
            </div>
         </div>

         {/* Trajectory */}
         <div className="bg-[#1e1e1e] border border-[#333] rounded p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
               <div className="flex items-center text-xs font-mono text-slate-400">
                  <Target size={14} className="mr-2 text-red-500" />
                  ORBITAL TRAJECTORY
               </div>
               <span className="text-[10px] text-slate-500 font-mono">
                  {packet.trajectory ? `IMPACT: ${packet.trajectory.impactWindow}` : 'NO DATA'}
               </span>
            </div>
            <div className="flex-1 w-full min-h-0">
              {packet.trajectory ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={packet.trajectory.timeline}>
                      <defs>
                        <linearGradient id="monitorChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="offset" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#22d3ee" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px', color: '#fff' }} 
                          itemStyle={{ color: '#22d3ee' }}
                      />
                      <Area type="monotone" dataKey="distance" stroke="#22d3ee" fill="url(#monitorChart)" />
                   </AreaChart>
                 </ResponsiveContainer>
              ) : (
                 <div className="h-full flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800 rounded">
                    NO TRAJECTORY DATA
                 </div>
              )}
            </div>
         </div>
      </div>

      {/* MIDDLE ROW: TRENDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {packet.trends.map((trend, i) => (
           <div key={i} className="bg-[#1e1e1e] border border-[#333] rounded p-3 flex justify-between items-center">
             <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold">{trend.metricName}</div>
                <div className="text-lg font-mono text-white">
                   {trend.value} <span className="text-xs text-cyan-500">{trend.unit}</span>
                </div>
             </div>
             {trend.trend === 'up' && <ArrowUp size={16} className="text-red-400" />}
             {trend.trend === 'down' && <ArrowDown size={16} className="text-green-400" />}
             {trend.trend === 'stable' && <Minus size={16} className="text-slate-400" />}
           </div>
         ))}
      </div>

      {/* BOTTOM SECTION: HIDDEN RISK VECTORS */}
      <div className="pt-2">
         <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
            <div className="flex items-center text-sm font-light text-slate-100">
               <ShieldAlert className="mr-2 text-orange-500" size={16} />
               HIDDEN RISK VECTORS
            </div>
            <div className="flex space-x-2">
               {(['ALL', 'CRITICAL', 'HIGH'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setRiskFilter(f)}
                    className={`text-[10px] px-2 py-1 rounded font-mono transition-colors ${
                       riskFilter === f ? 'bg-cyan-900 text-cyan-400 border border-cyan-800' : 'bg-[#252526] text-slate-500 hover:text-slate-300 border border-[#333]'
                    }`}
                  >
                    {f}
                  </button>
               ))}
            </div>
         </div>
         
         <div className="space-y-3">
            {visibleRisks.map((risk) => {
               const blindspot = packet.humanBlindspots?.find(b => b.riskId === risk.id);
               const isExpanded = expandedRiskId === risk.id;
               const isCritical = risk.riskLevel === 'CRITICAL';
               
               return (
                  <div 
                    key={risk.id} 
                    className={`bg-[#1e1e1e] border ${isCritical ? 'border-red-900/50' : 'border-[#333]'} rounded overflow-hidden transition-all duration-300`}
                  >
                     <div 
                        className="p-3 flex justify-between items-center cursor-pointer hover:bg-[#252526]"
                        onClick={() => setExpandedRiskId(isExpanded ? null : risk.id)}
                     >
                        <div className="flex items-center">
                           <div className={`w-2 h-2 rounded-full mr-3 ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
                           <span className="text-sm font-mono font-bold text-slate-200 mr-4">{risk.title}</span>
                           <span className="text-[10px] text-slate-500 hidden sm:inline font-mono">{risk.id}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                           <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              isCritical ? 'bg-red-950 text-red-400' : 'bg-orange-950 text-orange-400'
                           }`}>
                              {risk.riskLevel}
                           </span>
                           <ChevronDown size={14} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                     </div>

                     {isExpanded && (
                        <div className="p-4 bg-[#151515] border-t border-[#333] grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                           <div>
                              <p className="text-xs text-slate-400 mb-3 leading-relaxed border-l-2 border-slate-700 pl-3">{risk.description}</p>
                              <div className="bg-[#252526] p-2 rounded border border-[#333] mb-2">
                                 <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Strategic Implication</div>
                                 <div className="text-xs text-slate-300 italic">"{risk.implication}"</div>
                              </div>
                              <div className="flex items-center justify-between bg-[#252526] p-2 rounded border border-[#333]">
                                 <div>
                                    <div className="text-[10px] text-cyan-500 uppercase flex items-center font-bold mb-1">
                                       <Wrench size={10} className="mr-1" /> Mitigation Protocol
                                    </div>
                                    <div className="text-xs text-white font-mono">{risk.mitigationAction}</div>
                                 </div>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); onToggleMitigation(risk.id); }}
                                    className={`ml-2 px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-colors whitespace-nowrap ${
                                       risk.mitigationStatus === 'implemented' 
                                          ? 'bg-green-900/30 text-green-400 border border-green-800' 
                                          : 'bg-slate-800 text-slate-400 border border-slate-600 hover:bg-cyan-900 hover:text-cyan-400 hover:border-cyan-700'
                                    }`}
                                 >
                                    {risk.mitigationStatus === 'implemented' ? 'STATUS: DONE' : 'STATUS: PENDING'}
                                 </button>
                              </div>
                           </div>
                           
                           {blindspot && (
                              <div className="bg-indigo-950/10 border border-indigo-900/30 rounded p-3">
                                 <div className="flex items-center text-indigo-400 text-xs font-bold mb-3 border-b border-indigo-900/30 pb-2">
                                    <BrainCircuit size={14} className="mr-2" />
                                    HUMAN BLINDSPOT ANALYSIS
                                 </div>
                                 <div className="space-y-3">
                                    <div>
                                       <span className="text-[9px] text-slate-500 uppercase block tracking-widest">Cognitive Bias Detected</span>
                                       <span className="text-xs text-indigo-300 font-mono">{blindspot.type}</span>
                                    </div>
                                    <div>
                                       <span className="text-[9px] text-slate-500 uppercase block tracking-widest">Operator Assumption</span>
                                       <span className="text-xs text-slate-400 italic">"{blindspot.humanAssumption}"</span>
                                    </div>
                                    <div>
                                       <span className="text-[9px] text-slate-500 uppercase block tracking-widest">Sentinel Advantage</span>
                                       <span className="text-xs text-cyan-300">{blindspot.sentinelAdvantage}</span>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               );
            })}
            
            {totalRisks > risksShown && (
               <button 
                 onClick={() => setRisksShown(prev => prev + 5)}
                 className="w-full py-2 bg-[#252526] hover:bg-[#333] text-xs text-slate-400 font-mono border border-[#333] rounded transition-colors"
               >
                  LOAD MORE VECTORS ({totalRisks - risksShown} HIDDEN)
               </button>
            )}
         </div>
      </div>
    </div>
  );
};

export default IntelligenceViewer;
