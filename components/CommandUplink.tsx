
import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, SystemConfig } from '../types';

interface CommandUplinkProps {
  onCommand: (cmd: string) => void;
  onTriggerMitigation?: (riskId: string) => void;
  isProcessing: boolean;
  logs: LogEntry[];
  config: SystemConfig;
}

const CommandUplink: React.FC<CommandUplinkProps> = ({ 
  onCommand, 
  onTriggerMitigation, 
  isProcessing, 
  logs, 
  config 
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    // --- COMMAND PARSING LOGIC ---
    // Check for "Resolve mitigation for <risk-id>"
    const resolveMatch = input.match(/^(?:resolve|execute)\s+mitigation\s+(?:for\s+)?(.+)$/i);
    
    if (resolveMatch && onTriggerMitigation) {
      const riskId = resolveMatch[1].trim();
      onTriggerMitigation(riskId);
      setInput('');
      return;
    }

    // Default: Send to Gemini/System Analysis
    onCommand(input);
    setInput('');
  };

  const formatTime = (date: Date) => {
    const zone = config.timeConfig.useAutoZone 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : config.timeConfig.selectedTimezone;
    return date.toLocaleTimeString('en-GB', { 
      timeZone: zone, 
      hour12: config.timeConfig.timeFormat === '12h',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getStatusColor = () => {
      switch(config.dataMode) {
          case 'MOCK': return 'text-blue-500';
          case 'LIVE': return 'text-green-500';
          case 'COMPANY': return 'text-amber-500';
          default: return 'text-slate-500';
      }
  };

  const getStatusText = () => {
      switch(config.dataMode) {
          case 'MOCK': return 'MOCK DATA ACTIVE';
          case 'LIVE': return 'LIVE DATA ACTIVE';
          case 'COMPANY': return 'ENTERPRISE DATA ACTIVE';
          default: return 'OFFLINE';
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] font-mono text-sm">
      <div className="bg-[#1e1e1e] px-4 py-2 text-xs border-b border-[#333] flex justify-between items-center">
        <span className="text-slate-500">CONNECTED TO: SENTINEL_CORE_V4.5.1</span>
        <span className={`font-bold ${getStatusColor()}`}>{getStatusText()}</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-1 text-slate-300 pb-12">
        <div className="text-slate-500 mb-4">
          SENTINEL ORBITAL COMMAND INTERFACE<br/>
          (C) 2025 SPACE DOMAIN AWARENESS UNIT<br/>
          ----------------------------------------<br/>
          Type a query to initiate analysis.<br/>
          Commands: 'Scan Sector X', 'Resolve mitigation for [ID]'<br/>
        </div>

        {logs.map((log) => (
          <div key={log.id} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-400' : log.type === 'success' ? 'text-green-400' : 'text-slate-300'}`}>
            <span className="text-slate-600 mr-3 select-none">
              [{formatTime(log.timestamp)}]
            </span>
            {log.message}
          </div>
        ))}
        
        {isProcessing && (
          <div className="text-cyan-400 animate-pulse mt-2">
             {'>'} PROCESSING UPLINK...
          </div>
        )}
      </div>

      <div className="p-3 bg-[#252526] border-t border-[#333]">
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-500 mr-2 font-bold">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-600"
            placeholder="Input command sequence..."
            disabled={isProcessing}
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

export default CommandUplink;
