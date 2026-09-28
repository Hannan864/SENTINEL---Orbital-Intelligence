
import React, { useState, useEffect, useRef } from 'react';
import { SentinelIntelPacket, SystemConfig, DataMode } from '../types';
import { Bot, Send, Lock, Zap, Info, Clock, ShieldCheck, Leaf, Briefcase, Calendar, Database, Building2, Server, Link as LinkIcon, X, MapPin } from 'lucide-react';
import { getOrbAiResponse } from '../services/geminiService';

interface OrbAiViewProps {
  packet: SentinelIntelPacket | null;
  config: SystemConfig;
  onNavigateToUplink?: () => void;
  // Prop callbacks for mutating config from this view (if needed) or we pass setter functions
  onConfigChange?: (key: keyof SystemConfig, value: any) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  meta?: {
      type?: 'year_change' | 'mode_change' | 'data_change';
      year?: number;
      dataMode?: string;
  };
}

interface OrbitalContext {
    id: string;
    label: string;
    details: string;
    summary: string;
}

const OrbAiView: React.FC<OrbAiViewProps> = ({ packet, config, onNavigateToUplink, onConfigChange }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
        id: 'init-1', 
        sender: 'ai', 
        text: 'ORB-AI Online. I am your read-only orbital intelligence advisor. I can explain risks, summarize trends, or interpret telemetry. I cannot execute commands.', 
        timestamp: new Date() 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // New State for Context Attachment
  const [attachedContext, setAttachedContext] = useState<OrbitalContext | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevModeRef = useRef(config.aiMode);
  const prevDataModeRef = useRef(config.dataMode);
  const prevYearRef = useRef(config.dataYear || 2026);

  // Time Formatting Helper
  const formatTime = (date: Date) => {
    const zone = config.timeConfig.useAutoZone 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : config.timeConfig.selectedTimezone;
    return date.toLocaleTimeString('en-GB', {
        timeZone: zone,
        hour12: config.timeConfig.timeFormat === '12h',
        hour: '2-digit',
        minute: '2-digit'
    });
  }

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mode Change Detection & Announcement
  useEffect(() => {
    if (prevModeRef.current !== config.aiMode) {
        let announcement = "";
        
        switch(config.aiMode) {
            case 'ECO':
                announcement = `MODE SHIFT: ECO (STRICT OPS)\n> Protocol: Active Scan Mandatory.\n> I will refuse analysis without live telemetry. Please initiate a scan via Command Uplink.`;
                break;
            case 'ADVISOR':
                announcement = `MODE SHIFT: ADVISOR (INFERRED)\n> Protocol: Gap-Filling Active.\n> If active scans are missing, I will extrapolate using public models. You can also initiate a scan via Command Uplink.`;
                break;
            case 'PRO':
                announcement = `MODE SHIFT: PRO (SPACE-GRADE)\n> Identity: Senior Orbital Engineer.\n> Strategic risk implications and mission tradeoffs will be provided regardless of data gaps. Use Command Uplink for verified telemetry.`;
                break;
        }

        setMessages(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            sender: 'system',
            text: announcement,
            timestamp: new Date(),
            meta: { type: 'mode_change' }
        }]);

        prevModeRef.current = config.aiMode;
    }
  }, [config.aiMode]);

  // Data Mode Change Detection
  useEffect(() => {
      if (prevDataModeRef.current !== config.dataMode) {
          setMessages(prev => [...prev, {
              id: Math.random().toString(36).substring(7),
              sender: 'system',
              text: `DATA SOURCE SWITCHED: ${config.dataMode}`,
              timestamp: new Date(),
              meta: { type: 'data_change', dataMode: config.dataMode }
          }]);
          prevDataModeRef.current = config.dataMode;
      }
  }, [config.dataMode]);

  // Year Change Detection & Announcement
  useEffect(() => {
      const currentYear = config.dataYear || 2026;
      if (prevYearRef.current !== currentYear) {
          setMessages(prev => [...prev, {
              id: Math.random().toString(36).substring(7),
              sender: 'system',
              text: `TEMPORAL CONTEXT UPDATED: ${currentYear}`,
              timestamp: new Date(),
              meta: { type: 'year_change', year: currentYear }
          }]);
          prevYearRef.current = currentYear;
      }
  }, [config.dataYear]);

  // --- HANDLE ATTACH CONTEXT ---
  const handleAttachContext = () => {
      // In a real app, this would pull from the active LaunchPad or 3D Scene state
      // Here we simulate capturing the current viewport values
      const currentSector = packet?.metadata.sector || "UNKNOWN";
      
      const contextData: OrbitalContext = {
          id: Math.random().toString(36).substr(2,9),
          label: "@VALUES FROM 3D ORBITAL MAP",
          summary: `Sector: ${currentSector} | Launch: 28.57°N | Target: 51.50°N`,
          details: `
            [SYSTEM CONTEXT SNAPSHOT]
            Active Sector: ${currentSector}
            Launch Origin: Lat 28.5721, Lon -80.6480 (Cape Canaveral)
            Target Destination: Lat 51.5074, Lon -0.1278 (London/LEO)
            Current Risk Score: ${packet?.dashboard.riskScore || 0}/100
            Data Mode: ${config.dataMode}
          `
      };
      setAttachedContext(contextData);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    let finalPrompt = input;
    
    // Inject Context if Attached
    if (attachedContext) {
        finalPrompt = `${attachedContext.details}\n\nUSER QUERY: ${input}`;
        setAttachedContext(null); // Clear context after sending
    }

    const userMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: 'user',
        text: input, // Show clean input to user
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // --- MOCK MODE LOGIC ---
    if (config.dataMode === 'MOCK') {
        setTimeout(() => {
            const response = generateMockResponse(finalPrompt, packet);
            addAiMessage(response);
            setIsTyping(false);
        }, 1200);
        return;
    }

    // --- LIVE / COMPANY MODE LOGIC ---
    if (!config.enableGeminiApi || !config.apiKey) {
        setTimeout(() => {
           addAiMessage("Advisory unavailable: AI API is disabled or key is missing in Settings.");
           setIsTyping(false);
        }, 800);
        return;
    }

    // Call API
    const aiText = await getOrbAiResponse(finalPrompt, packet || ({} as any), config);
    addAiMessage(aiText);
    
    setIsTyping(false);
  };

  const addAiMessage = (text: string) => {
      setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(7),
          sender: 'ai',
          text: text,
          timestamp: new Date()
      }]);
  };

  // Heuristic Engine for Mock Mode
  const generateMockResponse = (query: string, ctx: SentinelIntelPacket | null): string => {
      const lower = query.toLowerCase();
      const dataYear = config.dataYear || 2026;
      
      // Handle Context Injection Check
      if (query.includes('[SYSTEM CONTEXT SNAPSHOT]')) {
          return "I have analyzed the attached orbital coordinates. The launch trajectory from Cape Canaveral to the target inclination (51.5°) involves a plane change that is energetically expensive. Given the current risk score in that sector, I recommend a launch window delay of 45 minutes to avoid the debris field intersecting the ascent corridor.";
      }

      // 1. MISSING DATA HANDLERS
      if (!ctx) {
          if (config.aiMode === 'ECO') {
              return "No active system context detected. Please initiate a scan via Command Uplink.";
          }
          if (config.aiMode === 'PRO') {
              return `Assumption Notice: Missing telemetry is treated as high-risk. Proceeding with strategic analysis (Data Year: ${dataYear}). You can initiate a scan via Command Uplink.\n\nOperational Directive: In the absence of verified ephemeris data, assume a non-cooperative debris environment. Immediate defensive posturing is required. Recommend suspending all non-critical maneuvers and charging avoidance thrusters to 95% capacity to mitigate blind conjunction risks.`;
          }
          // ADVISOR
          return `Assumption Notice: No live telemetry detected. Analysis based on inferred orbital models (Reference Year: ${dataYear}). You can initiate a scan via Command Uplink.\n\nBased on historical sector parameters from ${dataYear}, congestion levels are likely nominal, but standard caution is advised.`;
      }

      // 2. RISK QUERIES
      if (lower.includes('risk') || lower.includes('threat') || lower.includes('danger')) {
         const count = ctx.hiddenRisks.length;
         const critical = ctx.hiddenRisks.filter(r => r.riskLevel === 'CRITICAL');
         
         if (critical.length > 0) {
             return `I see ${count} active vectors. The primary concern is "${critical[0].title}" which is CRITICAL. It requires immediate attention (${critical[0].mitigationAction}).`;
         }
         return `Risk levels are nominal. There are ${count} vectors identified, but none are Critical. The aggregate risk score is ${ctx.dashboard.riskScore}/100.`;
      }

      // 3. SUMMARY / STATUS
      if (lower.includes('status') || lower.includes('summary') || lower.includes('overview')) {
         return `System is monitoring Sector ${ctx.metadata.sector}. Risk Score is ${ctx.dashboard.riskScore} (${ctx.dashboard.riskLevel}). ${ctx.executiveBrief.summary}`;
      }

      // 4. TRENDS
      if (lower.includes('trend') || lower.includes('forecast')) {
         return `Analysis indicates a ${ctx.dashboard.riskLevel === 'CRITICAL' ? 'deteriorating' : 'stable'} trend. Conjunction rates are ${ctx.trends.find(t=>t.metricName.includes('Conjunction'))?.trend === 'up' ? 'rising' : 'steady'}.`;
      }

      // 5. GENERIC / FALLBACK
      return "I can explain the current Risk Score, detail specific threats, or summarize the sector trends. As a read-only advisor, I cannot execute mitigation protocols.";
  };

  const getYearColorStyles = (year?: number) => {
      switch(year) {
          case 2023: return 'bg-slate-700/50 text-slate-300 border-slate-600'; 
          case 2024: return 'bg-blue-900/50 text-blue-300 border-blue-700'; 
          case 2025: return 'bg-indigo-900/50 text-indigo-300 border-indigo-700';
          case 2026: return 'bg-cyan-900/50 text-cyan-300 border-cyan-700';
          default: return 'bg-slate-800 text-slate-400 border-slate-700';
      }
  };

  const getDataModeIcon = (mode: DataMode) => {
      switch(mode) {
          case 'MOCK': return <Database size={10} className="mr-1.5" />;
          case 'LIVE': return <Zap size={10} className="mr-1.5" />;
          case 'COMPANY': return <Building2 size={10} className="mr-1.5" />;
      }
  };

  // Helper to render message
  const renderMessageText = (msg: Message) => {
      // 1. Handle Special System Messages (Year Change)
      if (msg.meta?.type === 'year_change') {
          const year = msg.meta.year || 2026;
          return (
              <div className="flex flex-col items-center justify-center space-y-1 w-full my-2">
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      <div className="h-px w-8 bg-slate-700"></div>
                      <span>Temporal Context Updated</span>
                      <div className="h-px w-8 bg-slate-700"></div>
                  </div>
                  <div className={`text-lg font-mono font-bold px-4 py-1 rounded border-2 ${getYearColorStyles(year)} shadow-lg`}>
                      {year}
                  </div>
              </div>
          );
      }

      if (msg.meta?.type === 'data_change') {
          return (
              <div className="flex flex-col items-center justify-center space-y-1 w-full my-2">
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      <div className="h-px w-8 bg-slate-700"></div>
                      <span>Active Data Stream</span>
                      <div className="h-px w-8 bg-slate-700"></div>
                  </div>
                  <div className="text-xs font-mono text-cyan-400 bg-cyan-900/20 px-3 py-1 rounded border border-cyan-800">
                      SOURCE: {msg.meta.dataMode}
                  </div>
              </div>
          );
      }

      const text = msg.text;
      if (msg.sender === 'user') return <span className="whitespace-pre-wrap">{text}</span>;

      const parts = text.split('Command Uplink');
      if (parts.length === 1) return <span className="whitespace-pre-wrap">{text}</span>;

      return (
          <span className="whitespace-pre-wrap">
              {parts.map((part, i) => (
                  <React.Fragment key={i}>
                      {part}
                      {i < parts.length - 1 && (
                          <span 
                            onClick={onNavigateToUplink}
                            className="text-cyan-400 cursor-pointer hover:underline hover:text-cyan-300 font-bold transition-colors"
                            title="Navigate to Terminal"
                          >
                              Command Uplink
                          </span>
                      )}
                  </React.Fragment>
              ))}
          </span>
      );
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans relative overflow-hidden">
        
        {/* HEADER CONTROLS */}
        <div className="flex flex-col bg-[#1e293b] border-b border-slate-800 shrink-0">
            
            {/* Top Bar: Controls */}
            <div className="flex items-center justify-between px-4 py-3">
                {/* 1. YEAR SLIDER (Left) */}
                <div className="flex items-center space-x-3 bg-[#0f172a]/50 p-1 px-3 rounded border border-slate-700">
                    <Calendar size={12} className="text-slate-400" />
                    <input 
                        type="range" 
                        min="2023" 
                        max="2026" 
                        step="1"
                        value={config.dataYear || 2026}
                        onChange={(e) => onConfigChange && onConfigChange('dataYear', parseInt(e.target.value))}
                        className="w-20 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <span className="text-xs font-mono text-cyan-400 font-bold min-w-[28px] text-center">{config.dataYear || 2026}</span>
                </div>

                {/* 2. MODE BUTTONS (Middle) */}
                <div className="flex space-x-1">
                    {(['ECO', 'ADVISOR', 'PRO'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => onConfigChange && onConfigChange('aiMode', mode)}
                            className={`text-[10px] font-bold px-3 py-1 rounded border transition-colors ${
                                config.aiMode === mode 
                                    ? mode === 'ECO' ? 'bg-green-900/30 text-green-400 border-green-800'
                                    : mode === 'PRO' ? 'bg-red-900/30 text-red-400 border-red-800'
                                    : 'bg-cyan-900/30 text-cyan-400 border-cyan-800'
                                    : 'bg-[#252526] text-slate-500 border-[#333] hover:text-slate-300'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {/* 3. DATA SOURCE SELECTOR + CONTEXT BUTTON (Right) */}
                <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-slate-700">
                    <button
                        onClick={handleAttachContext}
                        title="Link 3D Orbital Map Data to AI"
                        className="bg-[#252526] hover:bg-slate-700 text-slate-400 hover:text-white p-1.5 rounded border border-[#333] hover:border-slate-600 transition-colors"
                    >
                        <LinkIcon size={14} />
                    </button>

                    <div className="flex items-center space-x-1">
                        {(['MOCK', 'LIVE', 'COMPANY'] as DataMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => onConfigChange && onConfigChange('dataMode', mode)}
                                title={`Switch Data Source to ${mode}`}
                                className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center transition-all ${
                                    config.dataMode === mode 
                                        ? mode === 'MOCK' ? 'bg-blue-900/30 text-blue-400 border-blue-800 shadow-[0_0_8px_rgba(59,130,246,0.2)]'
                                        : mode === 'LIVE' ? 'bg-green-900/30 text-green-400 border-green-800 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                                        : 'bg-amber-900/30 text-amber-400 border-amber-800 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                        : 'bg-[#252526] text-slate-500 border-[#333] hover:text-slate-300 hover:bg-[#2d2d2d]'
                                }`}
                            >
                                {getDataModeIcon(mode)}
                                <span className="hidden sm:inline">{mode}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* INFO BANNER */}
        <div className="bg-slate-900/50 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center space-x-2">
                <ShieldCheck size={12} className="text-slate-400" />
                <span>READ-ONLY CONSOLE</span>
            </div>
            <div className="flex items-center space-x-1 font-mono">
                <Clock size={12} />
                <span>{formatTime(new Date())}</span>
            </div>
        </div>

        {/* CHAT AREA */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-4">
            {messages.map((msg) => {
                const isSystemEvent = msg.meta?.type === 'year_change' || msg.meta?.type === 'data_change';
                
                return (
                    <div key={msg.id} className={`flex ${
                        msg.sender === 'system' ? 'justify-center' : 
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                        {/* SYSTEM MESSAGE */}
                        {msg.sender === 'system' ? (
                             isSystemEvent ? (
                                renderMessageText(msg)
                             ) : (
                                 <div className="bg-slate-800/50 border border-slate-700/50 rounded px-4 py-2 text-[10px] font-mono text-slate-400 text-center max-w-[90%] whitespace-pre-wrap leading-relaxed">
                                    {renderMessageText(msg)}
                                 </div>
                             )
                        ) : (
                            /* CHAT BUBBLES */
                            <div className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed border ${
                                msg.sender === 'user' 
                                    ? 'bg-cyan-900/20 border-cyan-800/50 text-cyan-100 rounded-br-none' 
                                    : 'bg-[#1e293b] border-slate-700 text-slate-300 rounded-bl-none shadow-sm'
                            }`}>
                                {msg.sender === 'ai' && (
                                    <div className="flex items-center text-[10px] font-bold text-cyan-500 mb-1 uppercase tracking-wider">
                                        <Bot size={10} className="mr-1" /> Orb-AI Advisor
                                    </div>
                                )}
                                <div>{renderMessageText(msg)}</div>
                                <div className={`text-[9px] mt-2 opacity-50 text-right ${msg.sender === 'user' ? 'text-cyan-300' : 'text-slate-400'}`}>
                                    {formatTime(msg.timestamp)}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-[#1e293b] border border-slate-700 rounded-lg rounded-bl-none p-3 flex items-center space-x-2">
                         <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                         <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            )}
        </div>

        {/* ATTACHED CONTEXT CHIP */}
        {attachedContext && (
            <div className="mx-4 mb-2 p-2 bg-[#1e293b] border border-cyan-500/30 rounded flex justify-between items-start animate-in slide-in-from-bottom-2 shadow-lg shadow-cyan-900/10">
                <div className="flex items-center text-xs text-cyan-400">
                    <MapPin className="mr-2 mt-0.5" size={14} />
                    <div>
                        <div className="font-bold tracking-wider">{attachedContext.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {attachedContext.summary}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setAttachedContext(null)}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition-colors"
                >
                    <X size={14}/>
                </button>
            </div>
        )}

        {/* INPUT AREA */}
        <div className="p-3 bg-[#1e293b] border-t border-slate-800">
            <form onSubmit={handleSend} className="relative">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for analysis, trends, or risk context..."
                    className="w-full bg-[#0f172a] border border-slate-700 text-slate-200 text-xs rounded p-3 pr-10 focus:outline-none focus:border-cyan-600 transition-colors"
                    disabled={isTyping}
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>
            <div className="text-[9px] text-center text-slate-600 mt-2 flex items-center justify-center">
               <Info size={10} className="mr-1" />
               AI provides advisory analysis only. All actions must be executed manually.
            </div>
        </div>

    </div>
  );
};

export default OrbAiView;
