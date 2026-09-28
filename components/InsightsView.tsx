

import React, { useState, useMemo } from 'react';
import { SentinelIntelPacket, SystemConfig } from '../types';
import { 
  Share2, 
  FileDown, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  GitCommit, 
  Telescope,
  Lightbulb,
  ArrowRight,
  CalendarClock
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';

interface InsightsViewProps {
  packet: SentinelIntelPacket | null;
  config: SystemConfig;
}

// Internal types for the enriched data structure
interface TrendHistory {
  metric: string;
  history: { day: number; value: number }[];
  unit: string;
  trendDirection: 'up' | 'down' | 'stable';
}

interface EnrichedInsightData {
  timestamp: string;
  context: {
    systemId: string;
    orbitalLayer: string;
    sector: string;
    analysisSpanDays: number;
    lastAggregation: string;
  };
  macroTrends: {
    metric: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    directionLabel: string;
    interpretation: string;
  }[];
  trendTimelines: TrendHistory[];
  correlations: {
    metrics: string[];
    relationship: 'positive' | 'negative';
    confidence: 'HIGH' | 'MEDIUM';
    description: string;
  }[];
  forecast: {
    window: string;
    expectedTrend: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  emergingPatterns: {
    id: string;
    name: string;
    description: string;
    timeframe: string;
    relevance: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  executiveSummary: string[];
}

const InsightsView: React.FC<InsightsViewProps> = ({ packet, config }) => {
  const [notification, setNotification] = useState<string | null>(null);

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

  // --- DATA ENRICHMENT & SYNTHESIS ---
  const insightsData = useMemo<EnrichedInsightData | null>(() => {
    if (!packet) return null;

    // Helper to generate synthetic history based on trend direction
    const generateHistory = (baseValue: number, trend: 'up' | 'down' | 'stable') => {
      const points = [];
      const volatility = baseValue * 0.05;
      let current = baseValue;
      
      // Generate 30 days back
      for (let i = 0; i <= 30; i++) {
        points.push({ day: -i, value: Number(current.toFixed(2)) });
        
        // Reverse engineer past values
        const noise = (Math.random() - 0.5) * volatility;
        if (trend === 'up') current -= (baseValue * 0.02) + noise;
        else if (trend === 'down') current += (baseValue * 0.02) + noise;
        else current += noise;
        
        if (current < 0) current = 0;
      }
      return points.reverse(); // -30 to 0
    };

    const macroTrends = packet.trends.map(t => {
      let label = "Stable";
      let interpretation = "Maintains nominal baseline variability";
      
      if (t.trend === 'up') {
        label = "Rising";
        interpretation = t.metricName.includes("Reserves") ? "Efficiency gains improving reserves" : "Upward pressure observed";
        if (t.metricName.includes("Conjunction") || t.metricName.includes("Drag")) interpretation = "Increasing environmental density factors";
      } else if (t.trend === 'down') {
        label = "Declining";
        interpretation = t.metricName.includes("Reserves") ? "Consumption rate exceeding regeneration" : "Reduction in vector intensity";
      }

      return {
        metric: t.metricName,
        value: t.value,
        unit: t.unit,
        trend: t.trend,
        directionLabel: label,
        interpretation
      };
    });

    return {
      timestamp: packet.metadata.timestamp,
      context: {
        systemId: "SNTL-451",
        orbitalLayer: "LEO",
        sector: packet.metadata.sector,
        analysisSpanDays: 90,
        lastAggregation: new Date().toISOString()
      },
      macroTrends,
      trendTimelines: packet.trends.map(t => ({
        metric: t.metricName,
        unit: t.unit,
        trendDirection: t.trend,
        history: generateHistory(t.value, t.trend)
      })),
      correlations: [
        {
          metrics: ["Drag Coefficient", "Conjunction Rate"],
          relationship: "positive",
          confidence: "HIGH",
          description: "Increased atmospheric drag correlates with higher conjunction frequency (+0.82 r-value)"
        },
        {
          metrics: ["Fuel Reserves", "Mitigation Frequency"],
          relationship: "negative",
          confidence: "MEDIUM",
          description: "Reserve depletion rate accelerates during high-density conjunction windows"
        }
      ],
      forecast: {
        window: "Next 72 Hours",
        expectedTrend: packet.dashboard.riskLevel === 'CRITICAL' 
          ? "Sharp increase in orbital interaction probability" 
          : "Moderate stability with cyclic density variations",
        confidence: "HIGH"
      },
      emergingPatterns: [
        {
          id: "insight-041",
          name: "Orbital Shell Congestion",
          description: "Gradual object density increase observed across polar shell vectors.",
          timeframe: "Last 45 Days",
          relevance: "MEDIUM"
        },
        {
          id: "insight-042",
          name: "Solar Flux Latency",
          description: "Atmospheric response to solar events showing 6h lag reduction.",
          timeframe: "Last 12 Days",
          relevance: "LOW"
        }
      ],
      executiveSummary: [
        `Orbital environment is trending toward ${packet.dashboard.riskLevel === 'LOW' ? 'nominal stability' : 'higher interaction density'}.`,
        "Drag effects are becoming a primary influencing factor in trajectory decay models.",
        "No immediate corrective maneuvers required, but close monitoring of fuel economy advised."
      ]
    };
  }, [packet]);

  // --- EXPORT HANDLERS ---

  const handleShareJson = async () => {
    if (!insightsData) return;
    
    // Strict schema copy
    const exportData = {
      timestamp: insightsData.timestamp,
      context: insightsData.context,
      macroTrends: insightsData.macroTrends.map(t => ({
        metric: t.metric,
        currentValue: t.value,
        unit: t.unit,
        trend: t.trend,
        interpretation: t.interpretation
      })),
      trendTimelines: insightsData.trendTimelines.map(t => ({
        metric: t.metric,
        history: t.history.map(h => ({ dayOffset: h.day, value: h.value }))
      })),
      correlations: insightsData.correlations,
      forecast: insightsData.forecast,
      emergingPatterns: insightsData.emergingPatterns,
      executiveSummary: insightsData.executiveSummary
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      showNotification("INSIGHTS DATA EXPORTED (JSON)");
    } catch (err) {
      console.error(err);
      showNotification("EXPORT FAILED");
    }
  };

  const handleExportPdf = () => {
    if (!insightsData) return;
    
    showNotification("GENERATING STRATEGIC REPORT...");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    
    const addText = (txt: string, x: number, yPos: number, size = 10, weight = 'normal', color = [0,0,0] as [number, number, number]) => {
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(txt, x, yPos);
    };

    // Header
    doc.setFillColor(240, 245, 255); // Light blue tint
    doc.rect(0, 0, pageWidth, 40, 'F');
    addText("INSIGHTS & TRENDS // STRATEGIC ANALYTICS", 14, 20, 16, 'bold', [30, 64, 175]);
    addText("Temporal intelligence derived from multi-cycle orbital analysis", 14, 28, 9, 'italic', [100, 116, 139]);
    
    y = 50;

    // Context
    addText(`SYSTEM: ${insightsData.context.systemId}  |  SECTOR: ${insightsData.context.sector}  |  SPAN: ${insightsData.context.analysisSpanDays} DAYS`, 14, y, 9, 'bold', [100, 100, 100]);
    y += 15;

    // Macro Trends Table
    addText("MACRO ENVIRONMENT SUMMARY", 14, y, 11, 'bold', [30, 41, 59]);
    y += 8;
    
    insightsData.macroTrends.forEach(t => {
       doc.setDrawColor(226, 232, 240);
       doc.setFillColor(248, 250, 252);
       doc.roundedRect(14, y, pageWidth - 28, 16, 1, 1, 'FD');
       
       addText(t.metric, 18, y + 6, 9, 'bold');
       addText(`${t.value} ${t.unit}`, 18, y + 11, 10, 'normal', [15, 23, 42]);
       
       const trendTxt = t.trend === 'up' ? "RISING" : t.trend === 'down' ? "DECLINING" : "STABLE";
       addText(trendTxt, 80, y + 11, 8, 'bold', t.trend === 'up' ? [220, 38, 38] : t.trend === 'down' ? [22, 163, 74] : [100, 116, 139]);
       
       addText(t.interpretation, 120, y + 11, 8, 'italic', [100, 100, 100]);
       y += 20;
    });

    y += 10;

    // Forecast
    doc.setFillColor(240, 253, 250); // Teal tint
    doc.rect(14, y, pageWidth - 28, 25, 'F');
    addText("FORWARD OUTLOOK (72H)", 18, y + 8, 9, 'bold', [13, 148, 136]);
    addText(insightsData.forecast.expectedTrend, 18, y + 16, 10, 'normal');
    addText(`CONFIDENCE: ${insightsData.forecast.confidence}`, pageWidth - 50, y + 8, 8, 'bold', [13, 148, 136]);
    y += 35;

    // Charts - Simplified Representation
    addText("TEMPORAL TRENDS (30 DAY SNAPSHOT)", 14, y, 11, 'bold', [30, 41, 59]);
    y += 10;

    insightsData.trendTimelines.forEach((timeline, i) => {
       if (y > 250) { doc.addPage(); y = 20; }
       
       addText(`${timeline.metric} (${timeline.unit})`, 14, y, 9, 'bold', [71, 85, 105]);
       
       // Draw simplified line chart
       const startX = 14;
       const width = pageWidth - 28;
       const height = 20;
       
       doc.setDrawColor(203, 213, 225);
       doc.rect(startX, y + 2, width, height); // Chart box
       
       // Draw line
       const maxVal = Math.max(...timeline.history.map(h => h.value)) * 1.1;
       const minVal = Math.min(...timeline.history.map(h => h.value)) * 0.9;
       
       doc.setDrawColor(59, 130, 246); // Blue line
       doc.setLineWidth(0.5);
       
       let prevX = 0;
       let prevY = 0;
       
       timeline.history.forEach((pt, idx) => {
          const ptX = startX + (idx / (timeline.history.length - 1)) * width;
          // Normalize Y: y + 2 + height - (val - min) / (max - min) * height
          const normY = y + 2 + height - ((pt.value - minVal) / (maxVal - minVal)) * height;
          
          if (idx > 0) {
             doc.line(prevX, prevY, ptX, normY);
          }
          prevX = ptX;
          prevY = normY;
       });
       
       y += 30;
    });

    // Patterns
    if (y > 230) { doc.addPage(); y = 20; }
    addText("EMERGING PATTERNS", 14, y, 11, 'bold', [30, 41, 59]);
    y += 8;
    
    insightsData.emergingPatterns.forEach(p => {
       addText(`●  ${p.name}`, 14, y, 9, 'bold');
       addText(p.description, 60, y, 9, 'normal', [71, 85, 105]);
       y += 6;
    });

    // Executive Summary
    y += 10;
    addText("EXECUTIVE TAKEAWAYS", 14, y, 11, 'bold', [30, 41, 59]);
    y += 8;
    insightsData.executiveSummary.forEach(s => {
       addText(`- ${s}`, 14, y, 9, 'normal');
       y += 6;
    });

    doc.save(`Sentinel_Strategic_Report_${Date.now()}.pdf`);
    showNotification("STRATEGIC REPORT DOWNLOADED");
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (!insightsData) return <div className="p-8 text-slate-500 font-mono text-sm">AWAITING ANALYTICAL AGGREGATION...</div>;

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 relative overflow-hidden font-sans">
      
      {/* NOTIFICATION */}
      {notification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white px-4 py-2 rounded shadow-xl z-50 text-xs font-mono font-bold animate-in slide-in-from-top-4">
          {notification}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-[#0f172a] z-20 shrink-0">
        <div>
           <div className="flex items-center space-x-3 text-blue-400 mb-1">
             <LineChart size={20} />
             <h1 className="text-xl font-bold tracking-wider">INSIGHTS & TRENDS // STRATEGIC ANALYTICS</h1>
           </div>
           <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono pl-8">
             Temporal intelligence derived from multi-cycle orbital analysis
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
            className="flex items-center space-x-2 px-4 py-2 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-800 rounded text-xs text-blue-400 font-bold transition-colors"
          >
            <FileDown size={14} />
            <span>EXPORT PDF</span>
          </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar pb-32">
        
        {/* CONTEXT STRIP */}
        <div className="flex items-center space-x-6 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">
           <div>SYSTEM_ID: {insightsData.context.systemId}</div>
           <div>LAYER: {insightsData.context.orbitalLayer}</div>
           <div>SECTOR: {insightsData.context.sector}</div>
           <div>SPAN: {insightsData.context.analysisSpanDays} DAYS</div>
           <div className="ml-auto flex items-center text-blue-500/80">
              <CalendarClock size={12} className="mr-1" />
              LAST AGGREGATION: {formatTime(insightsData.context.lastAggregation)}
           </div>
        </div>

        {/* MACRO TREND SUMMARY */}
        <section>
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
              <Telescope size={16} className="mr-2" /> Macro Environment Summary
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insightsData.macroTrends.map((trend, i) => (
                 <div key={i} className="bg-[#1e293b] border border-slate-800 p-4 rounded hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-slate-300 uppercase">{trend.metric}</span>
                       <div className={`flex items-center text-xs font-bold ${
                          trend.trend === 'up' ? 'text-blue-400' : trend.trend === 'down' ? 'text-teal-400' : 'text-slate-500'
                       }`}>
                          {trend.trend === 'up' && <TrendingUp size={14} className="mr-1" />}
                          {trend.trend === 'down' && <TrendingDown size={14} className="mr-1" />}
                          {trend.trend === 'stable' && <Minus size={14} className="mr-1" />}
                          {trend.directionLabel.toUpperCase()}
                       </div>
                    </div>
                    <div className="text-2xl font-mono text-white mb-2">
                       {trend.value} <span className="text-sm text-slate-500">{trend.unit}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 italic border-t border-slate-800 pt-2 mt-2">
                       {trend.interpretation}
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* TREND TIMELINES */}
        <section>
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
              <LineChart size={16} className="mr-2" /> Temporal Trend Analysis
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insightsData.trendTimelines.map((timeline, i) => (
                 <div key={i} className="bg-[#1e293b] border border-slate-800 rounded p-4 h-64 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-xs font-bold text-slate-300">{timeline.metric}</span>
                       <span className="text-[10px] text-slate-500 font-mono">Last 30 Days</span>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={timeline.history}>
                             <defs>
                                <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={timeline.trendDirection === 'down' ? '#2dd4bf' : '#3b82f6'} stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor={timeline.trendDirection === 'down' ? '#2dd4bf' : '#3b82f6'} stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                             <XAxis dataKey="day" hide />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                                labelFormatter={(v) => `T${v}d`}
                             />
                             <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={timeline.trendDirection === 'down' ? '#2dd4bf' : '#3b82f6'} 
                                fill={`url(#grad-${i})`} 
                                strokeWidth={2}
                             />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              ))}
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* CORRELATIONS & FORECAST */}
           <div className="space-y-6">
              <section>
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <GitCommit size={16} className="mr-2" /> Cross-Metric Correlations
                 </h2>
                 <div className="space-y-3">
                    {insightsData.correlations.map((corr, i) => (
                       <div key={i} className="bg-[#1e293b] border border-slate-800 p-3 rounded flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                                <span>{corr.metrics[0]}</span>
                                <ArrowRight size={10} className="text-slate-600" />
                                <span>{corr.metrics[1]}</span>
                             </div>
                             <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700 font-bold uppercase">
                                Conf: {corr.confidence}
                             </span>
                          </div>
                          <p className="text-xs text-slate-400 italic">
                             {corr.description}
                          </p>
                       </div>
                    ))}
                 </div>
              </section>

              <section>
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <Telescope size={16} className="mr-2" /> Forward Outlook
                 </h2>
                 <div className="bg-gradient-to-br from-[#1e293b] to-blue-900/20 border border-blue-900/30 p-5 rounded">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] text-blue-400 font-bold uppercase">{insightsData.forecast.window} Projection</span>
                       <span className="text-[10px] text-slate-500 font-mono">Confidence: {insightsData.forecast.confidence}</span>
                    </div>
                    <div className="text-lg text-white font-light leading-relaxed">
                       "{insightsData.forecast.expectedTrend}"
                    </div>
                 </div>
              </section>
           </div>

           {/* EMERGING PATTERNS & SUMMARY */}
           <div className="space-y-6">
              <section>
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <Lightbulb size={16} className="mr-2" /> Emerging Patterns
                 </h2>
                 <div className="bg-[#1e293b] border border-slate-800 rounded divide-y divide-slate-800">
                    {insightsData.emergingPatterns.map((pattern, i) => (
                       <div key={i} className="p-3">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-sm font-bold text-slate-200">{pattern.name}</span>
                             <span className="text-[9px] text-slate-500 font-mono">{pattern.id}</span>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{pattern.description}</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                             <span>Observed: {pattern.timeframe}</span>
                             <span className={pattern.relevance === 'HIGH' ? 'text-blue-400' : 'text-slate-600'}>
                                Relevance: {pattern.relevance}
                             </span>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>
              
              <section>
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Strategic Interpretation</h2>
                 <div className="bg-[#1e293b] border-l-4 border-slate-600 p-4 rounded-r">
                    <ul className="space-y-2">
                       {insightsData.executiveSummary.map((item, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start">
                             <span className="text-blue-500 mr-2 mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500"></span>
                             {item}
                          </li>
                       ))}
                    </ul>
                 </div>
              </section>
           </div>

        </div>

      </div>
    </div>
  );
};

export default InsightsView;
