
import React, { useState } from 'react';
import { SentinelIntelPacket, SystemConfig } from '../types';
import { 
  Share2, 
  FileDown, 
  Activity, 
  Radar, 
  Target, 
  AlertTriangle, 
  BrainCircuit, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  Zap,
  Gauge,
  Wind,
  Fuel
} from 'lucide-react';
import RiskRadar from './RadarChart';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import jsPDF from 'jspdf';

interface MonitorViewProps {
  packet: SentinelIntelPacket | null;
  isProcessing: boolean;
  config: SystemConfig;
}

const MonitorView: React.FC<MonitorViewProps> = ({ packet, isProcessing, config }) => {
  const [notification, setNotification] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  // Time Formatting Helper
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

  // Safe defaults if packet is null
  const riskScore = packet?.dashboard.riskScore || 0;
  const statusLevel = riskScore > 75 ? 'CRITICAL' : riskScore > 50 ? 'ELEVATED' : 'NORMAL';
  const lastUpdate = formatTime(packet?.metadata.timestamp);
  
  // Telemetry mapping
  const conjunctionRate = packet?.trends.find(t => t.metricName.includes('Conjunction'))?.value || 0;
  const fuelReserves = packet?.trends.find(t => t.metricName.includes('Fuel'))?.value || 0;
  const dragCoeff = packet?.trends.find(t => t.metricName.includes('Drag'))?.value || 0;
  
  // Filter active risks
  const activeRisks = packet?.hiddenRisks.filter(r => {
    if (riskFilter === 'ALL') return true;
    if (riskFilter === 'CRITICAL') return r.riskLevel === 'CRITICAL';
    if (riskFilter === 'HIGH') return r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL';
    return true;
  }) || [];

  // --- EXPORT LOGIC CORE ---
  
  const getMonitorData = () => {
    if (!packet) return null;
    return {
      timestamp: new Date().toISOString(),
      systemContext: {
        systemId: "SNTL-451",
        orbitalLayer: "LEO",
        sector: packet.metadata.sector
      },
      liveTelemetry: {
        riskScore,
        statusLevel,
        conjunctionRate,
        fuelReserves,
        dragCoeff,
        velocity: "7.8 km/s",
        altitudeStability: "99.4%"
      },
      radarState: {
        rangeKm: 1000,
        mode: "LIVE",
        timeMarkers: ["T-6h", "T-2h", "T+0", "T+2h", "NOW"]
      },
      activeRiskEvents: activeRisks.map(r => ({
        id: r.id,
        level: r.riskLevel,
        title: r.title,
        status: 'ACTIVE',
        countdown: "00:45:12"
      })),
      orbitalParameters: {
        sector: packet.metadata.sector,
        trajectoryImpact: packet.trajectory?.impactWindow || "N/A"
      },
      operatorAlerts: packet.humanBlindspots || []
    };
  };

  const handleShareJson = async () => {
    const data = getMonitorData();
    if (!data) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      showNotification("MONITOR DATA EXPORTED (JSON)");
    } catch (err) {
      console.error(err);
      showNotification("EXPORT FAILED");
    }
  };

  const handleExportPdf = () => {
    const data = getMonitorData();
    if (!data) return;

    showNotification("GENERATING PDF REPORT...");
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Helper for layout
    const addText = (text: string, x: number, y: number, size = 10, color = [0,0,0] as [number, number, number], font = "helvetica", style = "normal") => {
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont(font, style);
        doc.text(text, x, y);
    };

    // 1. Header
    // Dark Header Background
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    addText("SENTINEL // MONITOR REPORT", 14, 18, 16, [34, 211, 238], "courier", "bold"); // Cyan Title
    addText(`TIMESTAMP: ${data.timestamp}`, 14, 26, 8, [200, 200, 200], "courier");
    
    // System Context Box (Right side)
    doc.setDrawColor(80, 80, 80);
    doc.setFillColor(40, 40, 40);
    doc.roundedRect(pageWidth - 70, 10, 60, 24, 2, 2, 'FD');
    addText(`ID: ${data.systemContext.systemId}`, pageWidth - 65, 16, 8, [255, 255, 255], "courier", "bold");
    addText(`LAYER: ${data.systemContext.orbitalLayer}`, pageWidth - 65, 22, 8, [200, 200, 200], "courier");
    addText(`SECTOR: ${data.systemContext.sector}`, pageWidth - 65, 28, 8, [200, 200, 200], "courier");

    yPos = 55;

    // 2. Telemetry Summary
    addText("LIVE TELEMETRY SNAPSHOT", 14, yPos, 12, [0, 0, 0], "helvetica", "bold");
    doc.setDrawColor(0, 0, 0);
    doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
    yPos += 15;

    const metrics = [
        { l: "RISK SCORE", v: data.liveTelemetry.riskScore.toString() },
        { l: "STATUS", v: data.liveTelemetry.statusLevel },
        { l: "FUEL", v: `${data.liveTelemetry.fuelReserves}%` },
        { l: "VELOCITY", v: data.liveTelemetry.velocity },
        { l: "CONJ. RATE", v: data.liveTelemetry.conjunctionRate.toString() }
    ];

    let xPos = 14;
    metrics.forEach(m => {
        doc.setFillColor(245, 245, 245);
        doc.rect(xPos, yPos, 35, 20, 'F');
        addText(m.l, xPos + 2, yPos + 6, 6, [100, 100, 100], "helvetica", "bold");
        addText(m.v, xPos + 2, yPos + 15, 10, [0, 0, 0], "courier", "bold");
        xPos += 38;
    });
    yPos += 35;

    // 3. Radar State
    addText("TACTICAL RADAR STATE", 14, yPos, 12, [0, 0, 0], "helvetica", "bold");
    doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
    yPos += 10;
    
    addText(`RANGE: ${data.radarState.rangeKm}km`, 14, yPos, 9, [50, 50, 50], "courier");
    addText(`MODE: ${data.radarState.mode}`, 60, yPos, 9, [50, 50, 50], "courier");
    addText(`MARKERS: ${data.radarState.timeMarkers.join(', ')}`, 110, yPos, 9, [50, 50, 50], "courier");
    yPos += 20;

    // 4. Active Risks Table
    addText("ACTIVE MONITOR ALERTS", 14, yPos, 12, [0, 0, 0], "helvetica", "bold");
    doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
    yPos += 10;

    // Table Header
    doc.setFillColor(230, 230, 230);
    doc.rect(14, yPos, pageWidth - 28, 8, 'F');
    addText("ID", 16, yPos + 5, 8, [0,0,0], "helvetica", "bold");
    addText("LEVEL", 40, yPos + 5, 8, [0,0,0], "helvetica", "bold");
    addText("TITLE", 70, yPos + 5, 8, [0,0,0], "helvetica", "bold");
    addText("COUNTDOWN", 150, yPos + 5, 8, [0,0,0], "helvetica", "bold");
    yPos += 10;

    data.activeRiskEvents.forEach(risk => {
        const isCritical = risk.level === 'CRITICAL';
        addText(risk.id, 16, yPos, 8, [50, 50, 50], "courier");
        addText(risk.level, 40, yPos, 8, isCritical ? [220, 38, 38] : [234, 88, 12], "courier", "bold");
        addText(risk.title.substring(0, 40), 70, yPos, 8, [0, 0, 0], "helvetica");
        addText(risk.countdown, 150, yPos, 8, [0, 0, 0], "courier");
        
        doc.setDrawColor(220, 220, 220);
        doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
        yPos += 8;
    });

    yPos += 10;

    // 5. Blindspots
    if (data.operatorAlerts.length > 0) {
        addText("OPERATOR BLINDSPOTS DETECTED", 14, yPos, 12, [0, 0, 0], "helvetica", "bold");
        doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
        yPos += 10;

        data.operatorAlerts.forEach(alert => {
             doc.setDrawColor(200, 200, 255);
             doc.setFillColor(245, 245, 255);
             doc.roundedRect(14, yPos, pageWidth - 28, 16, 1, 1, 'FD');
             
             addText(`TYPE: ${alert.type}`, 16, yPos + 5, 8, [79, 70, 229], "courier", "bold");
             addText(`" ${alert.humanAssumption} "`, 16, yPos + 10, 8, [50, 50, 50], "helvetica", "italic");
             yPos += 20;
        });
    }

    // Footer
    addText("GENERATED BY SENTINEL CORE V4.5.1", 14, 280, 8, [150, 150, 150], "courier");

    doc.save(`SENTINEL_MONITOR_${Date.now()}.pdf`);
    showNotification("PDF DOWNLOAD COMPLETE");
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- EMPTY STATE ---
  if (!packet) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono">
        <Activity size={48} className="mb-4 opacity-20" />
        <div>AWAITING TELEMETRY STREAM...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] relative overflow-hidden">
      
      {/* GLOBAL EXPORT HEADER */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#333] bg-[#252526] z-20 shrink-0">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-sm font-bold tracking-wider">
          <Activity size={16} />
          <span>MONITOR // LIVE STREAM</span>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleShareJson}
            className="flex items-center space-x-2 px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#333] border border-[#444] rounded text-xs text-slate-300 font-mono transition-colors"
          >
            <Share2 size={12} />
            <span>SHARE JSON</span>
          </button>
          <button 
            onClick={handleExportPdf}
            className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-800 rounded text-xs text-cyan-400 font-mono transition-colors"
          >
            <FileDown size={12} />
            <span>EXPORT PDF</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION */}
      {notification && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white px-4 py-2 rounded shadow-xl z-50 text-xs font-mono font-bold animate-in slide-in-from-top-4">
          {notification}
        </div>
      )}

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-40">

        {/* 1. MONITOR HEADER INFO */}
        <div className="flex items-end justify-between border-b border-[#333] pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center mb-1">
                   RISK_VECTOR_MONITOR
                   {isProcessing && <RefreshCw size={12} className="ml-2 animate-spin text-cyan-500"/>}
                </h2>
                <div className="text-xs text-slate-600 font-mono">SYSTEM_ID: SNTL-451 // ORBITAL_LAYER: LEO</div>
              </div>
              <div className="text-right">
                 <div className="text-[10px] text-slate-500 font-mono uppercase">Last Updated</div>
                 <div className="text-lg font-mono text-cyan-400">{lastUpdate}</div>
              </div>
        </div>

        {/* 2. BIG CHARTS ROW: RADAR & TRAJECTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
           {/* RADAR */}
           <div className="bg-[#151515] border border-[#333] rounded p-1 flex flex-col">
              <div className="flex justify-between items-center px-3 py-2 border-b border-[#333]">
                 <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center">
                    <Radar size={12} className="mr-2 text-cyan-500" />
                    Tactical Risk Radar (Live)
                 </div>
                 <div className="text-[10px] text-slate-600 font-mono">RANGE: 1000km</div>
              </div>
              <div className="flex-1 relative p-2">
                 <RiskRadar points={packet.dashboard.radarPoints} />
              </div>
           </div>

           {/* TRAJECTORY */}
           <div className="bg-[#151515] border border-[#333] rounded p-1 flex flex-col">
              <div className="flex justify-between items-center px-3 py-2 border-b border-[#333]">
                 <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center">
                    <Target size={12} className="mr-2 text-red-500" />
                    ORBITAL ARC
                 </div>
                 <div className="text-[10px] text-slate-600 font-mono">
                    IMPACT: {packet.trajectory?.impactWindow || "N/A"}
                 </div>
              </div>
              <div className="flex-1 relative p-2">
                 {packet.trajectory ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={packet.trajectory.timeline}>
                           <defs>
                              <linearGradient id="monitorArc" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                           <XAxis dataKey="offset" stroke="#444" fontSize={8} tickLine={false} axisLine={false} />
                           <Tooltip contentStyle={{background:'#000', border:'1px solid #333', fontSize:'10px'}} itemStyle={{color:'#ef4444'}} />
                           <Area type="monotone" dataKey="probability" stroke="#ef4444" fill="url(#monitorArc)" strokeWidth={2} />
                           <ReferenceLine x="T+0h" stroke="#fff" strokeDasharray="3 3" label={{value:'NOW', position:'insideTop', fill:'#666', fontSize:8}} />
                        </AreaChart>
                     </ResponsiveContainer>
                 ) : (
                     <div className="h-full flex items-center justify-center text-[10px] text-slate-600">NO ARC DATA</div>
                 )}
              </div>
           </div>
        </div>

        {/* 3. THREAT SCORE ROW */}
        <div className="bg-[#151515] border border-[#333] rounded p-6 flex items-center justify-between relative overflow-hidden group">
              <div className="z-10">
                 <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Threat Score</div>
                 <div className={`text-6xl font-mono font-black tracking-tighter ${
                    riskScore > 75 ? 'text-red-500' : riskScore > 50 ? 'text-orange-500' : 'text-cyan-500'
                 }`}>
                    {riskScore}
                 </div>
                 <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded border border-[#333] bg-[#222]">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                        riskScore > 75 ? 'bg-red-500 animate-pulse' : riskScore > 50 ? 'bg-orange-500' : 'bg-green-500'
                    }`} />
                    <span className="text-[10px] font-mono text-slate-300 uppercase">{statusLevel}</span>
                 </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10">
                 {/* Decorative Background Graph */}
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{v:20},{v:40},{v:30},{v:70},{v:50},{v:riskScore}]}>
                       <Area type="monotone" dataKey="v" stroke="none" fill="#fff" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
        </div>

        {/* 4. ORBITAL TELEMETRY SNAPSHOT */}
        <div>
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
              <Activity size={12} className="mr-2" /> Telemetry Snapshot
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <TelemetryCard label="Conjunction Rate" value={conjunctionRate} unit="/day" icon={<Target size={14}/>} />
              <TelemetryCard label="Fuel Reserves" value={fuelReserves} unit="%" icon={<Fuel size={14}/>} color="text-yellow-500" />
              <TelemetryCard label="Drag Coeff" value={dragCoeff} unit="Cd" icon={<Wind size={14}/>} />
              <TelemetryCard label="Relative Velocity" value="7.8" unit="km/s" icon={<Zap size={14}/>} />
              <TelemetryCard label="Altitude Stability" value="99.4" unit="%" icon={<Gauge size={14}/>} color="text-green-500" />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* 5. ACTIVE RISK EVENTS */}
           <div className="bg-[#151515] border border-[#333] rounded flex flex-col min-h-[250px]">
              <div className="flex justify-between items-center px-4 py-3 border-b border-[#333]">
                 <div className="text-xs font-bold text-white uppercase flex items-center">
                    <AlertTriangle size={14} className="mr-2 text-red-500" />
                    Active Monitor Alerts
                 </div>
                 <div className="flex space-x-1">
                    {(['ALL', 'CRITICAL', 'HIGH'] as const).map(f => (
                       <button
                         key={f}
                         onClick={() => setRiskFilter(f)}
                         className={`text-[9px] px-2 py-1 rounded font-mono ${riskFilter === f ? 'bg-slate-700 text-white' : 'bg-[#222] text-slate-500'}`}
                       >
                          {f}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                 {activeRisks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono">
                       NO ACTIVE THREATS IN FILTER RANGE
                    </div>
                 ) : (
                    activeRisks.map(risk => (
                       <div key={risk.id} className="bg-[#1e1e1e] border border-[#333] p-3 rounded hover:border-slate-600 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${risk.riskLevel === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
                                <span className="text-xs font-bold text-slate-200">{risk.id}</span>
                             </div>
                             <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                risk.riskLevel === 'CRITICAL' ? 'bg-red-900/30 text-red-500' : 'bg-orange-900/30 text-orange-500'
                             }`}>
                                {risk.riskLevel}
                             </span>
                          </div>
                          <div className="text-xs text-slate-400 mb-2 font-mono line-clamp-2">{risk.description}</div>
                          <div className="flex justify-between items-center border-t border-[#333] pt-2">
                             <div className="flex items-center text-[10px] text-slate-500 font-mono">
                                <Clock size={10} className="mr-1" /> T-00:45:12
                             </div>
                             <div className="text-[10px] font-bold text-slate-300 uppercase">STATUS: ACTIVE</div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* 6. OPERATOR AWARENESS PANEL */}
           <div className="bg-[#151515] border border-[#333] rounded flex flex-col">
              <div className="px-4 py-3 border-b border-[#333] flex items-center">
                 <BrainCircuit size={14} className="mr-2 text-indigo-400" />
                 <span className="text-xs font-bold text-white uppercase">Human Blindspot Monitoring</span>
              </div>
              <div className="flex-1 p-4">
                 {packet.humanBlindspots && packet.humanBlindspots.length > 0 ? (
                    <div className="space-y-4">
                       {packet.humanBlindspots.slice(0, 2).map((spot, i) => (
                          <div key={i} className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-1">
                                <Activity size={48} className="text-indigo-500/10" />
                             </div>
                             <div className="relative z-10">
                                <div className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Bias Detected: {spot.type}</div>
                                <div className="text-xs text-slate-300 italic mb-3 opacity-80">"{spot.humanAssumption}"</div>
                                <div className="flex items-start bg-black/20 p-2 rounded">
                                   <Zap size={12} className="text-yellow-500 mr-2 mt-0.5 shrink-0" />
                                   <div className="text-[10px] text-slate-200 font-mono leading-tight">
                                      AI COUNTER-SIGNAL: {spot.sentinelAdvantage}
                                   </div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                       <CheckCircle size={32} className="mb-2 opacity-20" />
                       <div className="text-xs font-mono">OPERATOR COGNITION NOMINAL</div>
                    </div>
                 )}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

const TelemetryCard = ({ label, value, unit, icon, color = "text-slate-200" }: any) => (
  <div className="bg-[#151515] border border-[#333] p-3 rounded flex flex-col justify-between h-24">
     <div className="flex justify-between items-start">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-tight">{label}</span>
        <span className="text-slate-600">{icon}</span>
     </div>
     <div>
        <span className={`text-xl font-mono font-bold ${color}`}>{value}</span>
        <span className="text-[10px] text-slate-500 ml-1">{unit}</span>
     </div>
  </div>
);

export default MonitorView;
