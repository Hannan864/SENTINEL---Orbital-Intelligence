
import React, { useState, useMemo } from 'react';
import { SentinelIntelPacket, SystemConfig } from '../types';
import { 
  AlertTriangle, 
  CheckCircle, 
  Printer, 
  Share2, 
  ClipboardCheck, 
  FileText, 
  ShieldAlert,
  BrainCircuit,
  Layers,
  Activity
} from 'lucide-react';
import jsPDF from 'jspdf';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface ExecutiveReportProps {
  packet: SentinelIntelPacket;
  onToggleMitigation?: (riskId: string) => void;
  config: SystemConfig;
}

// --- HELPER FOR TREND HISTORY GENERATION ---
const generateHistory = (baseValue: number, trend: 'up' | 'down' | 'stable') => {
    const points = [];
    const volatility = baseValue * 0.05;
    let current = baseValue;
    for (let i = 0; i <= 30; i++) {
        points.push({ day: -i, value: Number(current.toFixed(2)) });
        const noise = (Math.random() - 0.5) * volatility;
        if (trend === 'up') current -= (baseValue * 0.02) + noise;
        else if (trend === 'down') current += (baseValue * 0.02) + noise;
        else current += noise;
        if (current < 0) current = 0;
    }
    return points.reverse();
};

const ExecutiveReport: React.FC<ExecutiveReportProps> = ({ packet, onToggleMitigation, config }) => {
  const [notification, setNotification] = useState<string | null>(null);
  
  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--:--';
    const date = new Date(isoString);
    const zone = config.timeConfig.useAutoZone 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : config.timeConfig.selectedTimezone;
    
    return date.toLocaleDateString('en-GB', { timeZone: zone }) + ' ' + date.toLocaleTimeString('en-GB', { 
      timeZone: zone,
      hour12: config.timeConfig.timeFormat === '12h' 
    }) + (zone === 'UTC' ? ' UTC' : '');
  };

  // --- DATA AGGREGATION & ENRICHMENT ---
  // We use useMemo to ensure this updates whenever 'packet' prop changes (including status updates)
  const fullReportData = useMemo(() => {
     // Filter threats (Critical/High)
     const primaryThreats = packet.hiddenRisks
        .filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH')
        .sort((a, b) => (a.riskLevel === 'CRITICAL' ? -1 : 1));

     // Generate Recommendations
     const recommendations = packet.hiddenRisks.map(r => ({
        action: r.mitigationAction,
        resourceImpact: r.riskLevel === 'CRITICAL' ? "Fuel 0.5% | Delta-V > 0.5m/s" : "Low Impact",
        priority: r.riskLevel,
        confidence: 0.85 + (Math.random() * 0.1),
        linkedThreatId: r.id
     })).slice(0, 4);

     // Synthesize Insights
     const insights = {
        macroTrends: packet.trends.map(t => ({
             ...t,
             history: generateHistory(t.value, t.trend)
        })),
        forecast: {
             trend: packet.dashboard.riskLevel === 'CRITICAL' ? "Sharp increase in orbital interaction probability" : "Moderate stability",
             confidence: "HIGH"
        }
     };

     // Format Timestamp for window
     const now = new Date(packet.metadata.timestamp);
     const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
     const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

     return {
        timestamp: packet.metadata.timestamp,
        systemId: "SNTL-451",
        reportHeader: {
            title: "INTEL REPORT // EXECUTIVE OVERVIEW",
            classification: "SECRET // NOFORN",
            date: formatTime(packet.metadata.timestamp),
            sector: packet.metadata.sector,
            orbitalLayer: "LEO",
            generatedBy: "Sentinel Core v4.5.1"
        },
        executiveSummary: packet.executiveBrief.summary,
        primaryThreatVectors: primaryThreats.map(t => ({
             id: t.id,
             title: t.title,
             riskLevel: t.riskLevel,
             status: t.mitigationStatus === 'implemented' ? 'RESOLVED' : 'PENDING',
             description: t.description,
             strategicImplication: t.implication,
             eta: t.riskLevel === 'CRITICAL' ? "T-45min" : null,
             mitigationAction: t.mitigationAction,
             linkedHiddenRiskId: t.id
        })),
        strategicRecommendations: recommendations,
        telemetrySnapshot: {
            riskScore: packet.dashboard.riskScore,
            statusLevel: packet.dashboard.riskLevel,
            conjunctionRate: packet.trends.find(t => t.metricName.includes('Conjunction'))?.value || 0,
            fuelReserves: packet.trends.find(t => t.metricName.includes('Fuel'))?.value || 0,
            dragCoeff: packet.trends.find(t => t.metricName.includes('Drag'))?.value || 0,
            velocity: "7.8 km/s",
            altitudeStability: "99.4%"
        },
        hiddenRiskDetails: packet.hiddenRisks.map(r => {
           const blindspot = packet.humanBlindspots?.find(b => b.riskId === r.id);
           return {
             id: r.id,
             title: r.title,
             riskLevel: r.riskLevel,
             description: r.description,
             strategicImplication: r.implication,
             mitigationAction: r.mitigationAction,
             mitigationStatus: r.mitigationStatus === 'implemented' ? 'RESOLVED' : 'PENDING',
             aiCounterSignal: blindspot ? blindspot.sentinelAdvantage : "Correlated anomaly confirmed.",
             humanBlindspot: blindspot ? blindspot.humanAssumption : null,
             failureMode: blindspot ? blindspot.failureReason : null
           }
        }),
        insightsTrends: insights,
        immediateActions: packet.hiddenRisks.map(r => ({
             linkedHiddenRiskId: r.id,
             status: r.mitigationStatus,
             checkboxLinked: true
        })),
        exportOptions: {
            pdf: {
                includeCharts: true,
                includeTelemetry: true,
                includeTrendVisuals: true,
                includeHiddenRisk: true,
                includeExecutiveSummary: true
            },
            json: {
                combineAllTabs: true,
                interactiveStatusSync: true
            }
        },
        reportWindow: {
            startUTC: startMonth,
            endUTC: endMonth
        }
     };
  }, [packet, config]); // Add config to dependency array

  // --- ACTIONS ---

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShareJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(fullReportData, null, 2));
      showNotification("FULL AGGREGATED REPORT JSON COPIED");
    } catch (err) {
      console.error(err);
      showNotification("COPY FAILED");
    }
  };

  // --- PROGRAMMATIC PDF GENERATION (jsPDF) ---
  const handleDownloadPdf = () => {
    showNotification("GENERATING VECTOR PDF...");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    const checkPageBreak = (spaceNeeded: number) => {
      if (y + spaceNeeded > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    };

    const addText = (text: string, x: number, yPos: number, size = 10, color = [0,0,0] as [number, number, number], weight = 'normal') => {
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, x, yPos);
    };

    // 1. HEADER
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 40, 'F');
    addText("INTEL REPORT // EXECUTIVE OVERVIEW", 14, 18, 16, [255, 255, 255], 'bold');
    addText(`CLASSIFICATION: ${fullReportData.reportHeader.classification}`, 14, 26, 8, [239, 68, 68], 'bold'); // Red
    addText(`DATE: ${fullReportData.reportHeader.date}  |  SECTOR: ${fullReportData.reportHeader.sector}  |  GEN: ${fullReportData.reportHeader.generatedBy}`, 14, 32, 8, [148, 163, 184]);
    
    y = 55;

    // 2. EXECUTIVE SUMMARY
    addText("01 // EXECUTIVE SUMMARY", 14, y, 12, [51, 65, 85], 'bold');
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y + 2, pageWidth - 14, y + 2);
    y += 10;
    
    const splitSummary = doc.splitTextToSize(fullReportData.executiveSummary, pageWidth - 28);
    addText(splitSummary, 14, y, 10, [15, 23, 42]);
    y += (splitSummary.length * 5) + 15;

    // 3. PRIMARY THREAT VECTORS
    addText("02 // PRIMARY THREAT VECTORS", 14, y, 12, [51, 65, 85], 'bold');
    doc.line(14, y + 2, pageWidth - 14, y + 2);
    y += 10;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 8, 'F');
    addText("THREAT NAME", 16, y + 5, 8, [71, 85, 105], 'bold');
    addText("SEVERITY", 80, y + 5, 8, [71, 85, 105], 'bold');
    addText("STATUS", 110, y + 5, 8, [71, 85, 105], 'bold');
    addText("ETA", 170, y + 5, 8, [71, 85, 105], 'bold');
    y += 12;

    fullReportData.primaryThreatVectors.forEach(threat => {
       const isCritical = threat.riskLevel === 'CRITICAL';
       const isResolved = threat.status === 'RESOLVED';
       
       addText(threat.title, 16, y, 9, [15, 23, 42]);
       addText(threat.riskLevel, 80, y, 9, isCritical ? [220, 38, 38] : [234, 88, 12], 'bold');
       addText(threat.status, 110, y, 9, isResolved ? [22, 163, 74] : [234, 179, 8], 'bold');
       addText(threat.eta || "--", 170, y, 9, [100, 116, 139]);
       
       doc.setDrawColor(241, 245, 249);
       doc.line(14, y + 3, pageWidth - 14, y + 3);
       y += 10;
    });
    y += 10;

    // 4. RECOMMENDATIONS
    checkPageBreak(50);
    addText("03 // STRATEGIC RECOMMENDATIONS", 14, y, 12, [51, 65, 85], 'bold');
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y + 2, pageWidth - 14, y + 2);
    y += 10;

    fullReportData.strategicRecommendations.forEach((rec, i) => {
       checkPageBreak(20);
       addText(`${i + 1}. ${rec.action}`, 14, y, 10, [15, 23, 42]);
       addText(`   IMPACT: ${rec.resourceImpact}  |  CONFIDENCE: ${(rec.confidence * 100).toFixed(0)}%`, 14, y + 5, 8, [100, 116, 139]);
       y += 12;
    });
    y += 10;

    // 5. TELEMETRY
    checkPageBreak(40);
    addText("04 // TELEMETRY SNAPSHOT", 14, y, 12, [51, 65, 85], 'bold');
    doc.line(14, y + 2, pageWidth - 14, y + 2);
    y += 10;

    const metrics = [
        { l: "RISK SCORE", v: fullReportData.telemetrySnapshot.riskScore.toString() },
        { l: "STATUS", v: fullReportData.telemetrySnapshot.statusLevel },
        { l: "CONJ. RATE", v: fullReportData.telemetrySnapshot.conjunctionRate.toString() },
        { l: "FUEL", v: `${fullReportData.telemetrySnapshot.fuelReserves}%` },
        { l: "VELOCITY", v: fullReportData.telemetrySnapshot.velocity },
    ];
    
    let xMetrics = 14;
    metrics.forEach(m => {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(xMetrics, y, 32, 18, 1, 1, 'FD');
        addText(m.l, xMetrics + 2, y + 5, 7, [100, 116, 139], 'bold');
        addText(m.v, xMetrics + 2, y + 14, 10, [15, 23, 42], 'bold');
        xMetrics += 36;
    });
    y += 25;

    // 6. HIDDEN RISK
    checkPageBreak(60);
    addText("05 // HIDDEN RISK DETAIL", 14, y, 12, [51, 65, 85], 'bold');
    doc.line(14, y + 2, pageWidth - 14, y + 2);
    y += 10;

    fullReportData.hiddenRiskDetails.forEach(risk => {
        checkPageBreak(40);
        const isResolved = risk.mitigationStatus === 'RESOLVED';
        
        // Card bg
        doc.setFillColor(isResolved ? 240 : 255, isResolved ? 253 : 245, isResolved ? 244 : 245); // Green tint or Red tint
        doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'F');
        
        addText(`${risk.title} (${risk.id})`, 18, y + 6, 10, [15, 23, 42], 'bold');
        addText(isResolved ? "RESOLVED" : "PENDING", pageWidth - 40, y + 6, 9, isResolved ? [22, 163, 74] : [234, 88, 12], 'bold');
        
        const desc = doc.splitTextToSize(risk.description, pageWidth - 36);
        addText(desc, 18, y + 12, 9, [51, 65, 85]);
        
        addText(`MITIGATION: ${risk.mitigationAction}`, 18, y + 24, 8, [71, 85, 105], 'italic');
        
        y += 35;
    });

    // Footer
    addText("GENERATED BY SENTINEL CORE V4.5.1", 14, pageHeight - 10, 8, [148, 163, 184]);

    doc.save(`SENTINEL_INTEL_REPORT_${Date.now()}.pdf`);
    showNotification("PDF DOWNLOAD COMPLETE");
  };

  return (
    <div className="h-full bg-[#1e1e1e] overflow-y-auto relative custom-scrollbar pb-32">
       {/* Notification */}
       {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white px-4 py-2 rounded shadow-xl z-[60] flex items-center animate-bounce">
          <ClipboardCheck size={16} className="mr-2" />
          <span className="text-xs font-mono font-bold">{notification}</span>
        </div>
      )}

      {/* 1. TOP HEADER & 2. EXPORT ACTIONS */}
      <div className="sticky top-0 bg-[#1e1e1e] border-b border-[#333] z-20 px-8 py-6 flex justify-between items-start">
         <div>
            <div className="flex items-center space-x-2 text-cyan-500 mb-1">
               <FileText size={20} />
               <h1 className="text-xl font-bold tracking-wider font-mono">INTEL REPORT // EXECUTIVE OVERVIEW</h1>
            </div>
            <div className="flex space-x-4 text-[10px] text-slate-500 uppercase tracking-widest font-mono pl-7">
               <span className="text-red-500 font-bold">CLASSIFICATION: {fullReportData.reportHeader.classification}</span>
               <span>DATE: {fullReportData.reportHeader.date}</span>
               <span>SECTOR: {fullReportData.reportHeader.sector}</span>
            </div>
         </div>
         <div className="flex space-x-3">
             <button 
                onClick={handleShareJson}
                className="flex items-center space-x-2 px-4 py-2 bg-[#252526] hover:bg-[#333] border border-[#444] rounded text-xs text-slate-300 font-mono transition-colors"
             >
                <Share2 size={14} />
                <span>SHARE JSON</span>
             </button>
             <button 
                onClick={handleDownloadPdf}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-800 rounded text-xs text-cyan-400 font-mono transition-colors"
             >
                <Printer size={14} />
                <span>EXPORT PDF</span>
             </button>
         </div>
      </div>

      {/* REPORT CONTENT */}
      <div className="max-w-5xl mx-auto p-8 space-y-10 bg-[#1e1e1e] text-slate-300">
         
         {/* 3. EXECUTIVE SUMMARY */}
         <section>
             <SectionHeader title="01 // EXECUTIVE SUMMARY" />
             <div className="bg-[#252526] p-6 rounded border border-[#333] border-l-4 border-l-cyan-500">
                 <p className="text-sm leading-relaxed text-justify font-sans text-slate-200">
                    {fullReportData.executiveSummary}
                 </p>
             </div>
         </section>

         {/* 4. PRIMARY THREAT VECTORS */}
         <section>
             <SectionHeader title="02 // PRIMARY THREAT VECTORS" />
             <div className="overflow-hidden rounded border border-[#333]">
                <table className="w-full text-left text-sm">
                   <thead className="bg-[#151515] text-[10px] text-slate-500 uppercase tracking-wider">
                      <tr>
                         <th className="p-3">Threat Name</th>
                         <th className="p-3">Severity</th>
                         <th className="p-3">Status</th>
                         <th className="p-3">Strategic Implication</th>
                         <th className="p-3 text-right">ETA</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#333] bg-[#1e1e1e]">
                      {fullReportData.primaryThreatVectors.length === 0 ? (
                         <tr><td colSpan={5} className="p-4 text-center text-xs text-slate-500">NO ACTIVE THREATS DETECTED</td></tr>
                      ) : (
                         fullReportData.primaryThreatVectors.map(t => {
                            const isResolved = t.status === 'RESOLVED';
                            return (
                              <tr key={t.id} className="hover:bg-[#252526]">
                                 <td className="p-3 font-mono text-xs font-bold text-slate-200">{t.title}</td>
                                 <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                       t.riskLevel === 'CRITICAL' ? 'bg-red-900/40 text-red-500' : 'bg-orange-900/40 text-orange-500'
                                    }`}>{t.riskLevel}</span>
                                 </td>
                                 <td className="p-3">
                                    <div className="flex items-center text-[10px] font-bold uppercase">
                                       {isResolved 
                                          ? <span className="text-green-500 flex items-center bg-green-950/20 px-2 py-0.5 rounded border border-green-900/50"><CheckCircle size={12} className="mr-1"/> RESOLVED</span>
                                          : <span className="text-yellow-500 flex items-center bg-yellow-950/20 px-2 py-0.5 rounded border border-yellow-900/50"><AlertTriangle size={12} className="mr-1"/> ACTIVE</span>}
                                    </div>
                                 </td>
                                 <td className="p-3 text-xs text-slate-400 italic max-w-xs">{t.strategicImplication}</td>
                                 <td className="p-3 text-right text-xs font-mono text-red-400">{t.eta || '--'}</td>
                              </tr>
                            );
                         })
                      )}
                   </tbody>
                </table>
             </div>
         </section>

         {/* 5. STRATEGIC RECOMMENDATIONS */}
         <section>
            <SectionHeader title="03 // STRATEGIC RECOMMENDATIONS" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {fullReportData.strategicRecommendations.map((rec, i) => (
                  <div key={i} className="bg-[#252526] p-4 rounded border border-[#333] flex flex-col justify-between">
                     <div className="mb-2">
                        <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider block mb-1">
                           Recommendation {i+1}
                        </span>
                        <div className="text-sm font-medium text-slate-200">{rec.action}</div>
                     </div>
                     <div className="mt-3 pt-3 border-t border-[#333] flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>IMPACT: {rec.resourceImpact}</span>
                        <span>CONFIDENCE: {(rec.confidence * 100).toFixed(0)}%</span>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* 6. TELEMETRY SNAPSHOT */}
         <section>
             <SectionHeader title="04 // TELEMETRY SNAPSHOT" />
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                 <MetricCard label="RISK SCORE" value={fullReportData.telemetrySnapshot.riskScore} />
                 <MetricCard label="STATUS" value={fullReportData.telemetrySnapshot.statusLevel} color={fullReportData.telemetrySnapshot.statusLevel === 'CRITICAL' ? 'text-red-500' : 'text-green-500'} />
                 <MetricCard label="CONJUNCTION RATE" value={fullReportData.telemetrySnapshot.conjunctionRate} unit="/day" />
                 <MetricCard label="FUEL RESERVES" value={fullReportData.telemetrySnapshot.fuelReserves} unit="%" />
                 <MetricCard label="DRAG COEFF" value={fullReportData.telemetrySnapshot.dragCoeff} unit="Cd" />
                 <MetricCard label="VELOCITY" value={fullReportData.telemetrySnapshot.velocity} />
             </div>
         </section>

         {/* 7. HIDDEN RISK DETAIL & 9. IMMEDIATE ACTIONS */}
         <section>
             <SectionHeader title="05 // HIDDEN RISK DETAIL & STATUS SYNC" />
             <div className="space-y-4">
                {fullReportData.hiddenRiskDetails.map(risk => {
                   const blindspot = packet.humanBlindspots?.find(b => b.riskId === risk.id);
                   const isResolved = risk.mitigationStatus === 'RESOLVED';
                   
                   return (
                      <div key={risk.id} className={`bg-[#1e1e1e] border ${isResolved ? 'border-green-900/30' : 'border-red-900/30'} rounded p-4 relative`}>
                          <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center space-x-3">
                                 <div className={`w-2 h-2 rounded-full ${isResolved ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                                 <h3 className="text-sm font-bold text-slate-200">{risk.title}</h3>
                                 <span className="text-[10px] font-mono text-slate-500">{risk.id}</span>
                              </div>
                              {/* 9. IMMEDIATE ACTIONS CHECKBOX */}
                              <label className="flex items-center space-x-2 cursor-pointer select-none bg-black/20 px-3 py-1 rounded border border-[#333] hover:border-slate-500 transition-colors">
                                  <input 
                                     type="checkbox" 
                                     checked={isResolved} 
                                     onChange={() => onToggleMitigation && onToggleMitigation(risk.id)}
                                     className="appearance-none w-3 h-3 border border-slate-500 rounded bg-transparent checked:bg-green-500 checked:border-green-500 transition-colors"
                                  />
                                  <span className={`text-[10px] font-bold uppercase ${isResolved ? 'text-green-500' : 'text-slate-400'}`}>
                                     {isResolved ? 'COMPLETED' : 'MARK RESOLVED'}
                                  </span>
                              </label>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Vector Analysis</div>
                                <p className="text-xs text-slate-300 leading-relaxed mb-3">{risk.description}</p>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">AI Counter-Signal</div>
                                <div className="text-xs text-cyan-400 font-mono">
                                   {risk.aiCounterSignal}
                                </div>
                             </div>
                             {blindspot && (
                                <div className="bg-indigo-950/10 border border-indigo-900/20 p-3 rounded">
                                   <div className="flex items-center text-[10px] text-indigo-400 font-bold uppercase mb-2">
                                      <BrainCircuit size={10} className="mr-1" /> Human Blindspot
                                   </div>
                                   <div className="text-xs text-slate-300 italic mb-1">"{risk.humanBlindspot}"</div>
                                   <div className="text-[10px] text-indigo-300">Failure Mode: {risk.failureMode}</div>
                                </div>
                             )}
                          </div>
                      </div>
                   );
                })}
             </div>
         </section>

         {/* 8. INSIGHTS & TRENDS SUMMARY */}
         <section>
             <SectionHeader title="06 // INSIGHTS & TRENDS SUMMARY" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {fullReportData.insightsTrends.macroTrends.map((trend, i) => (
                    <div key={i} className="bg-[#252526] border border-[#333] p-3 rounded h-32 flex flex-col">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{trend.metricName}</span>
                          <span className={`text-[10px] font-bold ${trend.trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                             {trend.trend.toUpperCase()}
                          </span>
                       </div>
                       <div className="text-lg font-mono text-white mb-2">{trend.value} {trend.unit}</div>
                       <div className="flex-1 w-full min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={trend.history}>
                                <Area type="monotone" dataKey="value" stroke="#475569" fill="#334155" strokeWidth={1} />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 ))}
             </div>
             <div className="mt-4 bg-[#252526] border border-[#333] p-4 rounded flex items-center justify-between">
                 <div>
                    <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest block mb-1">Forward Outlook (72H)</span>
                    <span className="text-sm text-slate-200">{fullReportData.insightsTrends.forecast.trend}</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Confidence</span>
                    <span className="text-lg font-mono text-cyan-400">{fullReportData.insightsTrends.forecast.confidence}</span>
                 </div>
             </div>
         </section>

         {/* FOOTER */}
         <div className="border-t border-[#333] pt-6 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase">
             <div>Generated by Sentinel Core v4.5.1</div>
             <div>End of Report // {fullReportData.reportHeader.classification}</div>
         </div>

      </div>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center border-b border-[#333] pb-2">
     <Layers size={14} className="mr-2 text-cyan-600" />
     {title}
  </h2>
);

const MetricCard = ({ label, value, unit, color = "text-slate-200" }: any) => (
  <div className="bg-[#252526] border border-[#333] p-3 rounded">
     <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">{label}</div>
     <div className={`font-mono text-lg font-bold ${color}`}>
        {value} <span className="text-[10px] text-slate-500 font-normal">{unit}</span>
     </div>
  </div>
);

export default ExecutiveReport;
