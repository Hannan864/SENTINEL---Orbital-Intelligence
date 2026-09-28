
import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, SystemConfig, SentinelIntelPacket, Suggestion, UploadedFile, LiveStream, ViewType } from '../types';
import { getSuggestions, processTerminalCommand } from '../services/terminalEngine';
import { TerminalSquare, ChevronRight, AlertCircle, Check, Loader2 } from 'lucide-react';

interface TerminalProps {
  onCommand?: (cmd: string) => void; // Deprecated but kept for compatibility if needed
  onTriggerMitigation?: (riskId: string) => void;
  isProcessing: boolean;
  logs: LogEntry[];
  config: SystemConfig;
  // New props for Engine Integration
  packet: SentinelIntelPacket | null;
  setPacket: (p: SentinelIntelPacket | null) => void;
  addLog: (msg: string, type: 'info' | 'warning' | 'error' | 'success') => void;
  uploadedFiles: UploadedFile[];
  liveStreams: LiveStream[];
  onNavigate: (view: ViewType) => void;
}

const Terminal: React.FC<TerminalProps> = ({ 
  isProcessing, 
  logs, 
  config,
  packet,
  setPacket,
  addLog,
  uploadedFiles,
  liveStreams,
  onNavigate
}) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update suggestions on input change
  useEffect(() => {
    if (input.startsWith('/')) {
      // Pass uploadedFiles and liveStreams to getSuggestions
      const sugs = getSuggestions(input, config, packet, uploadedFiles, liveStreams);
      setSuggestions(sugs);
      setSelectedSuggestionIndex(0);
    } else {
      setSuggestions([]);
    }
  }, [input, config, packet, uploadedFiles, liveStreams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        completeSuggestion(suggestions[selectedSuggestionIndex]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => Math.min(suggestions.length - 1, prev + 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && input !== suggestions[selectedSuggestionIndex].value && !input.endsWith(' ')) {
         // If suggestion is selected but not fully typed, verify if we should complete or submit
         // Simple heuristic: if input doesn't match full command value, complete it
         if (input.split(' ').length < suggestions[selectedSuggestionIndex].value.split(' ').length) {
             completeSuggestion(suggestions[selectedSuggestionIndex]);
             return;
         }
      }
      execute();
    }
  };

  const completeSuggestion = (sug: Suggestion) => {
    const parts = input.split(' ');
    // Logic: replace the last token or append
    // Simpler logic for this engine:
    // If suggestion is "/scan", and input is "/s", replace with "/scan "
    // If suggestion is "sector", and input is "/scan se", replace with "/scan sector "
    
    if (sug.type === 'root') {
      setInput(sug.value + ' ');
    } else {
      // Find the last partial word
      const lastSpaceIndex = input.lastIndexOf(' ');
      const prefix = input.substring(0, lastSpaceIndex + 1);
      setInput(prefix + sug.value + ' ');
    }
  };

  const execute = () => {
    if (!input.trim()) return;
    
    // Echo command - handled implicitly via context logic or here?
    // Let's add it to logs manually for feedback
    // addLog(input, 'info'); 
    
    processTerminalCommand(input.trim(), {
      packet,
      config,
      setPacket,
      addLog,
      uploadedFiles,
      liveStreams,
      onNavigate
    });
    
    setInput('');
    setSuggestions([]);
  };

  const formatTime = (date: Date) => {
    const zone = config.timeConfig.useAutoZone 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : config.timeConfig.selectedTimezone;
    return date.toLocaleTimeString('en-GB', { 
      timeZone: zone, 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0c0c] font-mono text-sm border-r border-[#1e1e1e] overflow-hidden relative">
      
      {/* HEADER */}
      <div className="bg-[#151515] px-4 py-2 text-xs border-b border-[#333] flex justify-between items-center select-none shrink-0">
        <div className="flex items-center space-x-2 text-slate-400">
           <TerminalSquare size={14} />
           <span className="font-bold tracking-widest">ORB-AI COMMAND ENGINE</span>
        </div>
        <div className="flex items-center space-x-3">
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${config.dataMode === 'MOCK' ? 'text-blue-400 border-blue-900 bg-blue-900/10' : config.dataMode === 'LIVE' ? 'text-green-400 border-green-900 bg-green-900/10' : 'text-amber-400 border-amber-900 bg-amber-900/10'}`}>
              {config.dataMode}
           </span>
           <span className="text-[10px] text-slate-600">v4.5.1</span>
        </div>
      </div>
      
      {/* LOG OUTPUT */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-1.5 pb-4 custom-scrollbar min-h-0">
        <div className="text-slate-600 mb-6 text-xs leading-relaxed">
          <p>SENTINEL ORBITAL OPERATIONS CONSOLE</p>
          <p>AUTHORIZED PERSONNEL ONLY // {config.dataYear}</p>
          <p>----------------------------------------</p>
          <p>Type <span className="text-slate-300 font-bold">/help</span> for command list.</p>
          <p>Initial Sequence: <span className="text-cyan-600">/scan</span> &rarr; <span className="text-cyan-600">/reveal</span> &rarr; <span className="text-cyan-600">/access</span></p>
        </div>

        {logs.map((log) => (
          <div key={log.id} className="animate-in fade-in duration-200 flex items-start group">
            <span className="text-slate-700 mr-3 text-[10px] w-14 shrink-0 font-mono mt-0.5 select-none">
              {formatTime(log.timestamp)}
            </span>
            <div className={`flex-1 break-words ${
                log.type === 'error' ? 'text-red-400 font-bold' : 
                log.type === 'warning' ? 'text-amber-400' : 
                log.type === 'success' ? 'text-green-400' : 'text-slate-300'
            }`}>
               {log.type === 'error' && <AlertCircle size={10} className="inline mr-1.5 -mt-0.5"/>}
               {log.type === 'success' && <Check size={10} className="inline mr-1.5 -mt-0.5"/>}
               {log.message}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex items-center text-cyan-500 mt-2">
             <Loader2 size={12} className="animate-spin mr-2" />
             <span className="animate-pulse">PROCESSING...</span>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="shrink-0 relative p-3 bg-[#111] border-t border-[#333] z-20">
        
        {/* FLOATING AUTOCOMPLETE */}
        {suggestions.length > 0 && (
           <div className="absolute bottom-full left-3 mb-2 w-64 bg-[#1a1a1a] border border-[#333] rounded shadow-2xl overflow-hidden z-50">
              <div className="bg-[#252526] px-2 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-[#333]">
                 Suggestions
              </div>
              <ul className="max-h-48 overflow-y-auto">
                 {suggestions.map((sug, i) => (
                    <li 
                      key={sug.value}
                      onClick={() => { completeSuggestion(sug); inputRef.current?.focus(); }}
                      className={`px-3 py-2 text-xs cursor-pointer flex flex-col ${i === selectedSuggestionIndex ? 'bg-cyan-900/30 text-cyan-400' : 'text-slate-400 hover:bg-[#222]'}`}
                    >
                       <span className="font-bold">{sug.value}</span>
                       <span className="text-[10px] opacity-60 truncate">{sug.description}</span>
                    </li>
                 ))}
              </ul>
              <div className="bg-[#151515] px-2 py-1 text-[9px] text-slate-600 flex justify-between border-t border-[#333]">
                 <span>TAB to complete</span>
                 <span>↑↓ to select</span>
              </div>
           </div>
        )}

        <div className="flex items-center">
          <ChevronRight size={14} className="text-green-500 mr-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-700 font-mono"
            placeholder="Type / to begin command..."
            disabled={isProcessing}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
