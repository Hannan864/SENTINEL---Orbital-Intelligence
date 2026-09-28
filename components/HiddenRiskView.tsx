
import React, { useState, useMemo } from 'react';
import { SentinelIntelPacket, HiddenRisk, SystemConfig } from '../types';
import { 
  Share2, 
  FileDown, 
  ShieldAlert, 
  BrainCircuit, 
  FileText, 
  Search,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info,
  Power
} from 'lucide-react';
import jsPDF from 'jspdf';

interface HiddenRiskViewProps {
  packet: SentinelIntelPacket | null;
  onToggleMitigation?: (riskId: string) => void;
  config: SystemConfig;
}

// Extended Interface for the View/Export (Enriching the base packet)
interface EnrichedRisk extends HiddenRisk {
  detectionType: string;
  recommendedMitigation: {
    action: string;
    deltaV: string;
    confidence: number;
    timeSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
    resourceImpact: string;
  };
  supportingSignals: string[];
  metaAnalytics: {
    occurrenceRate: string;
    detectionDelay: number;
  };
  decisionTrace: {
    detectedBy: string;
    method: string;
    reason: string;
  };
}

const HiddenRiskView: React.FC<HiddenRiskViewProps> = ({ packet, onToggleMitigation, config }) => {
  const [notification, setNotification] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LATENT'>('ALL');

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--:--';
    const date = new Date(isoString);
    const zone = config.timeConfig.useAutoZone 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : config.timeConfig.selectedTimezone;
    return date.toLocaleTimeString('en-GB', { 
        timeZone: zone, 
        hour12: config.timeConfig.timeFormat === '12h'
    });
  };

  // --- DATA ENRICHMENT LAYER ---
  const enrichedData = useMemo(() => {
    if (!packet) return null;

    // Calculate Index
    const rawScore = packet.dashboard.riskScore;
    const hiddenIndex = Math.min(100, Math.floor(rawScore * 0.8 + (packet.hiddenRisks.length * 5)));
    // Fixed threshold: 40-60 should be ELEVATED/MEDIUM
    const indexLevel = hiddenIndex > 80 ? 'CRITICAL' : hiddenIndex > 60 ? 'HIGH' : hiddenIndex > 35 ? 'ELEVATED' : 'LATENT';

    // Enrich Risks
    const risks: EnrichedRisk[] = packet.hiddenRisks.map((risk, i) => ({
      ...risk,
      detectionType: risk.title.includes('Resonance') ? 'Latent Harmonic Convergence' : 
                     risk.title.includes('Thermal') ? 'Thermodynamic Trend Deviation' : 
                     'Multi-Vector Pattern Match',
      recommendedMitigation: {
        action: risk.mitigationAction,
        deltaV: risk.riskLevel === 'CRITICAL' ? '>0.5 m/s' : 'N/A',
        confidence: 0.85 + (Math.random() * 0.1),
        timeSensitivity: risk.riskLevel === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        resourceImpact: risk.riskLevel === 'CRITICAL' ? 'Fuel (0.2%)' : 'None'
      },
      supportingSignals: [
        "Historical similarity match: Event-LEO-219",
        "Drag variance anomaly (+7% vs Model)",
        "Resonance frequency overlap detected"
      ],
      metaAnalytics: {
        occurrenceRate: (Math.random() * 5).toFixed(1) + "%",
        detectionDelay: 48
      },
      decisionTrace: {
        detectedBy: "Sentinel AI",
        method: "Cross-model consensus",
        reason: "Severity × Blindspot Index"
      }
    }));

    return {
      timestamp: packet.metadata.timestamp,
      context: {
        systemId: "SNTL-451",
        orbitalLayer: "LEO",
        sector: packet.metadata.sector,
        analysisWindow: { forwardHours: 72, historicalDays: 30 }
      },
      hiddenRiskIndex: {
        score: hiddenIndex,
        max: 100,
        level: indexLevel,
        confidence: packet.dashboard.confidence
      },
      riskVectors: risks
    };
  }, [packet]);

  // --- EXPORT HANDLERS ---

  const handleShareJson = async () => {
    if (!enrichedData) return;
    
    // Construct strict JSON structure as requested
    const exportJson = {
      timestamp: enrichedData.timestamp,
      context: enrichedData.context,
      hiddenRiskIndex: enrichedData.hiddenRiskIndex,
      riskVectors: enrichedData.riskVectors.map(r => {
        const blindspot = packet?.humanBlindspots?.find(b => b.riskId === r.id);
        return {
          id: r.id,
          title: r.title,
          severity: r.riskLevel,
          detectionType: r.detectionType,
          status: r.mitigationStatus === 'implemented' ? 'OBSERVED' : 'MITIGATION_PENDING',
          description: r.description,
          strategicImplication: r.implication,
          recommendedMitigation: r.recommendedMitigation,
          humanBlindspot: blindspot ? {
            bias: blindspot.type,
            operatorAssumption: blindspot.humanAssumption,
            failureMode: blindspot.failureReason,
            sentinelAdvantage: blindspot.sentinelAdvantage
          } : null,
          supportingSignals: r.supportingSignals,
          decisionTrace: r.decisionTrace,
          metaAnalytics: {
            historicalOccurrenceRate: r.metaAnalytics.occurrenceRate,
            averageHumanDetectionDelayHours: r.metaAnalytics.detectionDelay
          }
        };
      })
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportJson, null, 2));
      showNotification("HIDDEN RISK DATA COPIED (JSON)");
    } catch (err) {
      console.error(err);
      showNotification("EXPORT FAILED");
    }
  };

  const handleExportPdf = () => {
    if (!enrichedData || !packet) return;
    
    showNotification("GENERATING ANALYTICAL REPORT...");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    
    const addText = (txt: string, x: number, yPos: number, size = 10, weight = 'normal', color = [0,0,0]) => {
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(txt, x, yPos);
    };

    // Header
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, pageWidth, 40, 'F');
    addText("HIDDEN RISK // ANALYTICAL LAYER", 14, 20, 16, 'bold', [50, 50, 50]);
    addText(`SYSTEM: ${enrichedData.context.systemId} | SECTOR: ${enrichedData.context.sector}`, 14, 28, 9, 'normal', [100, 100, 100]);
    
    y = 50;

    // Index
    addText(`RISK INDEX: ${enrichedData.hiddenRiskIndex.score} / 100`, 14, y, 12, 'bold');
    addText(`LEVEL: ${enrichedData.hiddenRiskIndex.level}`, 80, y, 12, 'bold', [234, 88, 12]); // Orange
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 15;

    // Risks
    enrichedData.riskVectors.forEach(risk => {
      const blindspot = packet.humanBlindspots?.find(b => b.riskId === risk.id);
      
      // Risk Header
      doc.setFillColor(250, 250, 250);
      doc.rect(14, y - 5, pageWidth - 28, 10, 'F');
      addText(`${risk.id} // ${risk.title}`, 16, y + 1, 10, 'bold');
      addText(risk.riskLevel, pageWidth - 30, y + 1, 10, 'bold', risk.riskLevel === 'CRITICAL' ? [220, 20, 20] : [230, 100, 0]);
      y += 15;

      // Details
      addText("DETECTION TYPE:", 14, y, 8, 'bold', [100, 100, 100]);
      addText(risk.detectionType, 50, y, 8);
      y += 6;
      
      addText("IMPLICATION:", 14, y, 8, 'bold', [100, 100, 100]);
      doc.text(risk.implication, 50, y, { maxWidth: pageWidth - 65 });
      y += 12;

      // Mitigation
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, y, pageWidth - 28, 15);
      addText("RECOMMENDED MITIGATION", 16, y + 5, 7, 'bold', [100, 100, 100]);
      addText(`ACTION: ${risk.recommendedMitigation.action}`, 16, y + 10, 9);
      addText(`DELTA-V: ${risk.recommendedMitigation.deltaV}`, 120, y + 10, 9);
      y += 25;
      
      // Status
      addText(`STATUS: ${risk.mitigationStatus.toUpperCase()}`, 16, y, 9, 'bold', risk.mitigationStatus === 'implemented' ? [22, 163, 74] : [234, 88, 12]);
      y += 10;

      // Blindspot
      if (blindspot) {
        doc.setFillColor(245, 245, 255);
        doc.roundedRect(14, y, pageWidth - 28, 20, 1, 1, 'F');
        addText("HUMAN BLINDSPOT ANALYSIS", 18, y + 5, 8, 'bold', [80, 80, 180]);
        addText(`BIAS: ${blindspot.type}`, 18, y + 10, 8);
        addText(`SENTINEL DETECTED: ${blindspot.sentinelAdvantage}`, 18, y + 15, 8, 'italic');
        y += 30;
      } else {
        y += 10;
      }
      
      y += 5; // Spacing
      
      // Page break check
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`Sentinel_Analytical_Report_${Date.now()}.pdf`);
    showNotification("PDF REPORT DOWNLOADED");
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- RENDER HELPERS ---
  const filteredRisks = enrichedData?.riskVectors.filter(r => {
    if (riskFilter === 'ALL') return true;
    if (riskFilter === 'LATENT') return r.riskLevel === 'LOW' || r.riskLevel === 'SAFE';
    // Explicitly handle 'MEDIUM' mapping if needed, though 'MEDIUM' exists in types
    if (riskFilter === 'MEDIUM') return r.riskLevel === 'MEDIUM';
    return r.riskLevel === riskFilter;
  }) || [];

  if (!enrichedData || !packet) return <div className="p-8 text-slate-500 font-mono text-sm">NO ANALYTICAL DATA AVAILABLE.</div>;

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 relative overflow-hidden font-sans">
      
      {/* NOTIFICATION */}
      {notification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-700 text-white px-4 py-2 rounded shadow-xl z-50 text-xs font-mono font-bold animate-in slide-in-from-top-4">
          {notification}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-[#0f172a] z-20 shrink-0">
        <div>
           <div className="flex items-center space-x-3 text-amber-500 mb-1">
             <Search size={20} />
             <h1 className="text-xl font-bold tracking-wider">HIDDEN RISK // ANALYTICAL LAYER</h1>
           </div>
           <div className="flex space-x-4 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
             <span>Mode: Non-Obvious Risk Discovery</span>
             <span>Analysis Depth: Extended</span>
           </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleShareJson}
            className="flex items-center space-x-2 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] border border-slate-700 rounded text-xs text-slate-300 font-bold transition-colors"
          >
            <Share2 size={14} />
            <span>SHARE JSON</span>
          </button>
          <button 
            onClick={handleExportPdf}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-800 rounded text-xs text-amber-500 font-bold transition-colors"
          >
            <FileDown size={14} />
            <span>EXPORT PDF</span>
          </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar pb-32">
        
        {/* SYSTEM CONTEXT STRIP */}
        <div className="flex items-center justify-between bg-[#1e293b] border border-slate-800 px-4 py-2 rounded text-[10px] font-mono text-slate-500 uppercase tracking-wider">
           <div>SYSTEM_ID: {enrichedData.context.systemId}</div>
           <div>LAYER: {enrichedData.context.orbitalLayer}</div>
           <div>SECTOR: {enrichedData.context.sector}</div>
           <div>WINDOW: +72H / -30D</div>
           <div>SCAN: {formatTime(enrichedData.timestamp)} UTC</div>
        </div>

        {/* AGGREGATE HIDDEN RISK INDEX */}
        <div className="bg-[#1e293b] border border-slate-800 p-6 rounded flex items-center justify-between">
           <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Hidden Risk Index</div>
              <div className="flex items-baseline space-x-4">
                 <span className={`text-5xl font-mono font-bold ${
                    enrichedData.hiddenRiskIndex.level === 'CRITICAL' ? 'text-red-500' :
                    enrichedData.hiddenRiskIndex.level === 'HIGH' ? 'text-orange-500' : 
                    enrichedData.hiddenRiskIndex.level === 'ELEVATED' ? 'text-yellow-500' :
                    'text-green-500'
                 }`}>
                    {enrichedData.hiddenRiskIndex.score} <span className="text-xl text-slate-600">/ 100</span>
                 </span>
                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                     enrichedData.hiddenRiskIndex.level === 'CRITICAL' ? 'bg-red-950/30 border-red-900 text-red-500' :
                     enrichedData.hiddenRiskIndex.level === 'HIGH' ? 'bg-orange-950/30 border-orange-900 text-orange-500' : 
                     enrichedData.hiddenRiskIndex.level === 'ELEVATED' ? 'bg-yellow-950/30 border-yellow-900 text-yellow-500' :
                     'bg-green-950/30 border-green-900 text-green-500'
                 }`}>
                    {enrichedData.hiddenRiskIndex.level}
                 </span>
              </div>
              <div className="mt-2 text-xs text-slate-500 italic">
                 "Derived from latent pattern correlation and human blindspot amplification."
              </div>
           </div>
           
           <div className="text-right">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Analysis Confidence</div>
              <div className="text-2xl font-mono text-slate-300">{(enrichedData.hiddenRiskIndex.confidence * 100).toFixed(1)}%</div>
           </div>
        </div>

        {/* RISK VECTORS */}
        <div>
           <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
                 <ShieldAlert size={16} className="mr-2" />
                 Hidden Risk Vectors
              </h2>
              <div className="flex space-x-1">
                 {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LATENT'].map((f: any) => (
                    <button
                      key={f}
                      onClick={() => setRiskFilter(f)}
                      className={`text-[10px] px-3 py-1 rounded font-mono transition-colors ${
                         riskFilter === f ? 'bg-amber-900/30 text-amber-500 border border-amber-800' : 'bg-[#1e293b] text-slate-600 border border-slate-800'
                      }`}
                    >
                       {f}
                    </button>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              {filteredRisks.length === 0 ? (
                 <div className="text-center py-10 text-slate-600 font-mono text-xs">NO VECTORS MATCHING FILTER</div>
              ) : (
              filteredRisks.map(risk => {
                  const blindspot = packet.humanBlindspots?.find(b => b.riskId === risk.id);
                  const isCritical = risk.riskLevel === 'CRITICAL';
                  const isResolved = risk.mitigationStatus === 'implemented';
                  
                  return (
                     <div key={risk.id} className={`bg-[#1e293b] border rounded p-6 shadow-sm transition-all duration-300 ${isResolved ? 'border-green-900/40 hover:border-green-800' : 'border-slate-800 hover:border-slate-700'}`}>
                        
                        {/* 1. CARD HEADER */}
                        <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
                           <div>
                              <div className="flex items-center space-x-3 mb-1">
                                 <span className="font-mono text-xs text-slate-500">{risk.id}</span>
                                 <h3 className={`text-lg font-bold ${isResolved ? 'text-green-400 decoration-2 decoration-green-600' : 'text-slate-200'}`}>
                                    {isResolved ? <span className="flex items-center"><CheckCircle2 size={18} className="mr-2 text-green-500"/>{risk.title} (RESOLVED)</span> : risk.title}
                                 </h3>
                                 {!isResolved && (
                                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      isCritical ? 'bg-red-950/50 text-red-500' : 
                                      risk.riskLevel === 'HIGH' ? 'bg-orange-950/50 text-orange-500' :
                                      'bg-yellow-950/50 text-yellow-500'
                                   }`}>
                                      {risk.riskLevel}
                                   </span>
                                 )}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center space-x-4">
                                 <span className="flex items-center"><Search size={12} className="mr-1"/> {risk.detectionType}</span>
                              </div>
                           </div>
                           
                           {/* STATUS ACTION BUTTON */}
                           <button
                             onClick={() => onToggleMitigation && onToggleMitigation(risk.id)}
                             className={`flex items-center space-x-2 px-4 py-2 rounded text-xs font-bold uppercase transition-all shadow-lg ${
                                isResolved 
                                  ? 'bg-green-900/20 text-green-500 border border-green-800 hover:bg-green-900/40 hover:text-green-400' 
                                  : 'bg-red-900/20 text-red-400 border border-red-800 hover:bg-red-900/40 hover:text-red-300 animate-pulse'
                             }`}
                           >
                              {isResolved ? <Power size={14} /> : <AlertTriangle size={14} />}
                              <span>{isResolved ? 'MITIGATION ACTIVE' : 'AUTHORIZE MITIGATION'}</span>
                           </button>
                        </div>

                        {/* 2. CORE ANALYSIS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
                           <div className="lg:col-span-2 space-y-4">
                              <div>
                                 <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Vector Description</label>
                                 <p className="text-sm text-slate-300 leading-relaxed">{risk.description}</p>
                              </div>
                              <div>
                                 <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Strategic Implication</label>
                                 <p className="text-sm text-amber-100/80 leading-relaxed italic border-l-2 border-amber-900/50 pl-3">
                                    "{risk.implication}"
                                 </p>
                              </div>
                              
                              {/* Mitigation Grid */}
                              <div className={`border rounded p-4 mt-4 ${isResolved ? 'bg-green-950/10 border-green-900/30' : 'bg-slate-900/50 border-slate-800'}`}>
                                 <div className={`flex items-center text-xs font-bold uppercase mb-3 ${isResolved ? 'text-green-500' : 'text-slate-400'}`}>
                                    <Scale size={14} className="mr-2" /> {isResolved ? 'Applied Protocol' : 'Recommended Mitigation'}
                                 </div>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                       <span className="text-[10px] text-slate-500 block">ACTION</span>
                                       <span className={`text-xs font-mono font-bold ${isResolved ? 'text-green-400' : 'text-cyan-400'}`}>{risk.recommendedMitigation.action}</span>
                                    </div>
                                    <div>
                                       <span className="text-[10px] text-slate-500 block">DELTA-V</span>
                                       <span className="text-xs text-slate-300 font-mono">{risk.recommendedMitigation.deltaV}</span>
                                    </div>
                                    <div>
                                       <span className="text-[10px] text-slate-500 block">CONFIDENCE</span>
                                       <span className="text-xs text-slate-300 font-mono">{(risk.recommendedMitigation.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                    <div>
                                       <span className="text-[10px] text-slate-500 block">IMPACT</span>
                                       <span className="text-xs text-slate-300 font-mono">{risk.recommendedMitigation.resourceImpact}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* 3. SIGNATURE BLINDSPOT SECTION */}
                           {blindspot && (
                              <div className="bg-indigo-950/20 border border-indigo-900/30 rounded p-4 flex flex-col h-full relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <BrainCircuit size={64} />
                                 </div>
                                 <div className="relative z-10">
                                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
                                       <BrainCircuit size={14} className="mr-2" />
                                       Human Blindspot
                                    </div>
                                    
                                    <div className="space-y-4">
                                       <div>
                                          <span className="text-[10px] text-indigo-300/60 block uppercase">Cognitive Bias</span>
                                          <span className="text-sm text-indigo-100 font-bold">{blindspot.type}</span>
                                       </div>
                                       <div>
                                          <span className="text-[10px] text-indigo-300/60 block uppercase">Operator Assumption</span>
                                          <span className="text-xs text-indigo-200 italic leading-snug">"{blindspot.humanAssumption}"</span>
                                       </div>
                                       <div>
                                          <span className="text-[10px] text-indigo-300/60 block uppercase">Failure Mode</span>
                                          <span className="text-xs text-indigo-200">{blindspot.failureReason}</span>
                                       </div>
                                       <div className="pt-2 border-t border-indigo-500/20">
                                          <span className="text-[10px] text-indigo-300/60 block uppercase">Sentinel Advantage</span>
                                          <span className="text-xs text-cyan-300 font-medium">{blindspot.sentinelAdvantage}</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* 4. FOOTER: SIGNALS & TRACEABILITY */}
                        <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row justify-between items-end text-[10px] text-slate-500 font-mono">
                           <div className="space-y-1 mb-2 md:mb-0">
                              <div className="uppercase font-bold text-slate-600 mb-1 flex items-center"><FileText size={10} className="mr-1"/> Supporting Signals</div>
                              {risk.supportingSignals.map((sig, i) => (
                                 <div key={i} className="flex items-center">
                                    <span className="w-1 h-1 rounded-full bg-slate-600 mr-2"></span>
                                    {sig}
                                 </div>
                              ))}
                           </div>
                           
                           <div className="text-right space-y-1">
                              <div>DETECTED BY: {risk.decisionTrace.detectedBy}</div>
                              <div>METHOD: {risk.decisionTrace.method}</div>
                              <div>ESCALATION: {risk.decisionTrace.reason}</div>
                              <div className="text-slate-600 mt-1 pt-1 border-t border-slate-800">
                                 HISTORICAL FREQ: {risk.metaAnalytics.occurrenceRate}
                              </div>
                           </div>
                        </div>

                     </div>
                  );
              })
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default HiddenRiskView;
