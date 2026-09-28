
import React, { useState } from 'react';
import OrbitalMap from './OrbitalMap';
import { SentinelIntelPacket, SystemConfig } from '../types';
import { AlertOctagon, Map, Activity, Signal, Zap, Database, Crosshair, Share2, ClipboardCheck, ArrowUp, ArrowDown, Minus, Wifi } from 'lucide-react';

interface DashboardProps {
  isProcessing: boolean;
  packet: SentinelIntelPacket | null;
  config: SystemConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ isProcessing, packet, config }) => {
  const [notification, setNotification] = useState<string | null>(null);

  // Safely extract values with "NIL" fallback
  const safeValue = (value: any, suffix: string = '') => {
      if (value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value))) {
          return <span className="text-slate-600 font-mono">NIL</span>;
      }
      return <>{value}{suffix}</>;
  };

  const riskScore = packet?.dashboard.riskScore;
  const metrics = packet?.dashboard.metrics || [];
  const trajectory = packet?.trajectory;
  const topRisk = packet?.hiddenRisks.find(r => r.riskLevel === 'CRITICAL') 
               || packet?.hiddenRisks.find(r => r.riskLevel === 'HIGH')
               || packet?.hiddenRisks[0];

  // Time Formatting Helper
  const formatTime = (isoString?: string) => {
    if (!isoString) return <span className="text-slate-600">--:--:--</span>;
    const date = new Date(isoString);
    const zone = config.timeConfig.useAutoZone 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : config.timeConfig.selectedTimezone;
    
    return date.toLocaleTimeString('en-GB', { 
        timeZone: zone,
        hour12: config.timeConfig.timeFormat === '12h'
    }) + (zone === 'UTC' ? ' UTC' : '');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'critical': return 'border-red-500/50 bg-red-950/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'warning': return 'border-orange-500/50 bg-orange-950/20 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
      default: return 'border-green-500/50 bg-green-950/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
    }
  };

  const getIcon = (label: string) => {
    if (label.includes('Debris')) return <Database size={14} />;
    if (label.includes('Collision')) return <Crosshair size={14} />;
    if (label.includes('Signal')) return <Signal size={14} />;
    return <Zap size={14} />;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
      switch(trend) {
          case 'up': return <ArrowUp size={12} className="text-slate-400" />;
          case 'down': return <ArrowDown size={12} className="text-slate-400" />;
          default: return <Minus size={12} className="text-slate-400" />;
      }
  };

  const handleShare = async () => {
    if (!packet) return;
    
    const shareData = {
        metadata: packet.metadata,
        dashboard: {
            riskScore: packet.dashboard.riskScore,
            riskScoreMax: packet.dashboard.riskScoreMax,
            riskLevel: packet.dashboard.riskLevel,
            confidence: packet.dashboard.confidence,
            dataFreshness: packet.dashboard.dataFreshness,
            metrics: packet.dashboard.metrics
        },
        scanInfo: {
            scanSource: "Command-Initiated",
            lastScan: packet.metadata.timestamp
        }
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(shareData, null, 2));
      setNotification("DASHBOARD DATA COPIED");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Enterprise Logic: 
  // Scanner line is active ONLY when processing (Acquiring).
  // Once data is loaded (Monitoring), the line stops, but satellites orbit.
  const isScannerActive = isProcessing;

  const dataModeColor = 
      config.dataMode === 'MOCK' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
      config.dataMode === 'LIVE' ? 'bg-green-900/30 text-green-400 border-green-800' :
      'bg-amber-900/30 text-amber-400 border-amber-800';

  return (
    <div className="h-full flex flex-col relative bg-[#1e1e1e]">
      
      {/* HEADER WITH SHARE BUTTON */}
      <div className="h-14 px-4 border-b border-[#333] flex items-center justify-between bg-[#1e1e1e] shrink-0 z-20">
         <div className="flex items-center space-x-3">
             <div className={`w-2 h-2 rounded-full ${isScannerActive ? 'bg-cyan-500 animate-pulse' : 'bg-slate-500'}`}></div>
             <span className="font-mono font-bold text-sm tracking-widest text-slate-200">ORBITAL_DASHBOARD.V2</span>
             
             {/* DATA SOURCE BADGE */}
             <div className={`text-[9px] font-bold px-2 py-0.5 rounded border ${dataModeColor} uppercase`}>
                 SOURCE: {config.dataMode}
             </div>
         </div>
         <button 
          onClick={handleShare}
          className="flex items-center space-x-2 px-3 py-1.5 bg-[#252526] hover:bg-cyan-900/30 text-xs font-mono text-cyan-400 border border-[#333] hover:border-cyan-700 rounded transition-all"
          title="Export Dashboard JSON"
        >
          <Share2 size={12} />
          <span>EXPORT STATUS</span>
        </button>
      </div>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="absolute top-16 right-4 bg-cyan-600 text-white px-4 py-2 rounded shadow-xl z-50 flex items-center animate-in slide-in-from-right-10 duration-200">
          <ClipboardCheck size={16} className="mr-2" />
          <span className="text-xs font-mono font-bold">{notification}</span>
        </div>
      )}

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          
          {/* LIVE MAP RENDERER */}
          <div className="flex flex-col bg-[#1e1e1e] border border-[#333] rounded overflow-hidden min-h-[350px] shrink-0 relative">
             <div className="bg-[#252526] px-3 py-2 text-xs font-mono text-slate-400 border-b border-[#333] flex flex-wrap justify-between items-center z-10 gap-2">
               <div className="flex items-center space-x-2">
                  <Map size={14} className="text-blue-500" />
                  <span>LIVE_MAP_RENDERER</span>
               </div>
               <div className="flex items-center space-x-4">
                   {packet?.metadata.sector && (
                       <span className="text-slate-300 font-bold bg-[#151515] px-2 py-0.5 rounded border border-[#333]">
                           SECTOR: {packet.metadata.sector}
                       </span>
                   )}
                   <div className="flex items-center space-x-2">
                       <span className="text-[10px] text-slate-500">LIVE ORBITAL TELEMETRY</span>
                       <div className={`w-2 h-2 rounded-full ${isScannerActive ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                   </div>
               </div>
             </div>
             
             {/* Map Area */}
             <div className="flex-1 relative bg-slate-950 min-h-[300px]">
               <OrbitalMap 
                  active={isScannerActive} 
                  points={packet?.dashboard.radarPoints}
               />
             </div>

             {/* Footer with Scan Details (Responsive) */}
             <div className="bg-[#1a1a1a] border-t border-[#333] px-3 py-1.5 flex flex-wrap gap-x-4 gap-y-2 justify-between items-center min-h-[30px]">
                <div className="flex flex-wrap gap-4 items-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Scan Source: Command-Initiated
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Last Scan: {formatTime(packet?.metadata.timestamp)}
                    </span>
                </div>
                {packet?.metadata.confidence !== undefined && (
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        CONFIDENCE: {(packet.metadata.confidence * 100).toFixed(0)}%
                    </span>
                )}
             </div>
          </div>

          {/* AGGREGATE RISK & STATUS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* AGGREGATE RISK CARD */}
              <div className="bg-[#1e1e1e] border border-[#333] rounded p-4 flex flex-col justify-between min-h-[9rem] relative overflow-hidden group">
                   <div className="flex justify-between items-start z-10">
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Aggregate Risk</span>
                      <Activity size={16} className={riskScore && riskScore > 75 ? "text-red-500" : "text-cyan-500"} />
                   </div>
                   <div className="z-10 mt-auto">
                      <div className="flex items-end space-x-2 flex-wrap">
                          <span className={`text-4xl font-mono font-bold ${riskScore && riskScore > 75 ? "text-red-500" : riskScore && riskScore > 50 ? "text-orange-400" : "text-cyan-400"}`}>
                            {safeValue(riskScore)}<span className="text-lg text-slate-600">/100</span>
                          </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                          Confidence: {safeValue(packet?.dashboard.confidence ? packet.dashboard.confidence * 100 : undefined, '%')}
                      </div>
                      <div className="w-full bg-[#333] h-1 mt-3 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${riskScore && riskScore > 75 ? "bg-red-500" : "bg-cyan-500"}`} 
                          style={{ width: `${riskScore || 0}%` }}
                        />
                      </div>
                   </div>
                   {/* Background Decor */}
                   <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                     <Activity size={120} />
                   </div>
              </div>

              {/* TELEMETRY SYNC STATUS */}
              <div className="bg-[#1e1e1e] border border-[#333] rounded p-4 flex flex-col justify-center min-h-[9rem] space-y-3">
                   <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Telemetry Sync</div>
                   <div className="flex items-center space-x-3">
                       <div className="p-2 bg-green-900/20 rounded-full border border-green-900/50">
                           <Wifi size={20} className="text-green-500" />
                       </div>
                       <div>
                           <div className="text-lg font-bold text-slate-200">
                               {packet ? "LIVE" : safeValue(undefined)}
                           </div>
                           <div className="text-xs text-slate-500 font-mono">Latency: 120ms</div>
                       </div>
                   </div>
                   <div className="text-[10px] text-slate-500 font-mono border-t border-[#333] pt-2 mt-2 truncate">
                       Uplink Stable // Encryption: AES-256
                   </div>
              </div>

              {/* PROJECTED IMPACT */}
              <div className="bg-[#1e1e1e] border border-[#333] rounded p-4 flex flex-col min-h-[9rem]">
                   <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-4">Projected Impact</div>
                   <div className="flex-1 flex flex-col justify-center">
                       {trajectory ? (
                           <>
                               <div className="text-xl font-mono font-bold text-white mb-1 truncate">
                                   {trajectory.impactWindow.split(' ').slice(0, 2).join(' ')}
                               </div>
                               <div className="text-lg font-mono text-red-400 truncate">
                                   {trajectory.impactWindow.split(' ').slice(2).join(' ')}
                               </div>
                               <div className="text-[10px] text-slate-500 mt-2 font-mono">
                                   Collision Probability: {safeValue(packet?.trajectory?.timeline[3]?.probability, '%')}
                               </div>
                           </>
                       ) : (
                           <div className="text-sm text-slate-500 italic">No impact trajectory calculated.</div>
                       )}
                   </div>
              </div>

              {/* TOP PRIORITY ACTION */}
              <div className="bg-gradient-to-br from-[#1e1e1e] to-red-950/20 border border-red-900/30 rounded p-4 flex flex-col min-h-[9rem] relative overflow-hidden">
                   <div className="flex items-center text-red-400 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">
                       <AlertOctagon size={12} className="mr-2" />
                       Top Priority Action
                   </div>
                   {topRisk ? (
                       <div className="z-10 flex flex-col h-full">
                           <div className="font-mono text-sm font-bold text-white mb-2 line-clamp-2" title={topRisk.title}>
                               {topRisk.title}
                           </div>
                           <div className="mt-auto bg-black/40 p-2 rounded border border-red-900/20 backdrop-blur-sm">
                               <span className="text-[9px] text-red-300 font-mono uppercase block mb-1">Mitigation:</span>
                               <span className="text-[10px] text-slate-200 font-mono leading-tight line-clamp-2" title={topRisk.mitigationAction}>
                                   {topRisk.mitigationAction}
                               </span>
                           </div>
                       </div>
                   ) : (
                       <div className="flex items-center justify-center h-full text-xs text-slate-500 z-10">
                           No critical actions pending.
                       </div>
                   )}
                   <div className="absolute top-0 right-0 p-1 pointer-events-none">
                       <div className="w-16 h-16 bg-red-500/5 rounded-full blur-xl"></div>
                   </div>
              </div>
          </div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.length > 0 ? metrics.map((metric, i) => (
                  <div key={i} className={`border rounded p-3 flex flex-col justify-between min-h-[7rem] ${getStatusColor(metric.status)}`}>
                      <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-bold opacity-80 tracking-wider truncate mr-2">{metric.label}</span>
                          {getIcon(metric.label)}
                      </div>
                      
                      <div className="mt-2">
                          <span className="text-lg font-mono font-bold block truncate" title={metric.value}>
                              {safeValue(metric.value)}
                          </span>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2 pt-2 border-t border-black/10">
                          <div className="text-[9px] opacity-70 font-mono truncate">
                              Upd: {safeValue(metric.updated)}
                          </div>
                          <div className="flex items-center opacity-70" title={`Trend: ${metric.trend}`}>
                              {getTrendIcon(metric.trend)}
                          </div>
                      </div>
                  </div>
              )) : (
                  // Fallback Empty Metrics
                  Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="border border-slate-800 rounded p-3 flex flex-col justify-between min-h-[7rem] bg-[#222]">
                          <span className="text-[10px] text-slate-600">METRIC SLOT {i+1}</span>
                          <span className="text-lg font-mono text-slate-700">NIL</span>
                      </div>
                  ))
              )}
          </div>

      </div>
    </div>
  );
};

export default Dashboard;
