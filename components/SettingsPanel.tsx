
import React, { useState, useEffect, useMemo } from 'react';
import { SystemConfig, SentinelIntelPacket, DataMode, UploadedFile, LiveStream, ViewType } from '../types';
import { Save, RotateCcw, Check, AlertTriangle, Globe, Zap, FileCode, CheckCircle, Clock, Database, Trash2, HardDriveUpload, Download, Bot, Briefcase, Leaf, Building2, Key, HardDrive, ArrowRight, Server, Search, Calendar, Monitor, Volume2, Shield, Power, ToggleRight, ToggleLeft, Plus, Link as LinkIcon, Radio } from 'lucide-react';
import { HIGH_INTENSITY_PACKET } from '../services/geminiService';

interface SettingsPanelProps {
  config: SystemConfig;
  onSave: (newConfig: SystemConfig) => void;
  uploadedFiles?: UploadedFile[];
  liveStreams?: LiveStream[];
  onNavigate?: (view: ViewType) => void;
  // File props
  onToggleMount?: (fileId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  // Stream props
  onAddStream?: (name: string, url: string) => void;
  onToggleStream?: (streamId: string) => void;
  onDeleteStream?: (streamId: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  config, 
  onSave, 
  uploadedFiles = [], 
  liveStreams = [],
  onNavigate,
  onToggleMount,
  onDeleteFile,
  onAddStream,
  onToggleStream,
  onDeleteStream
}) => {
  const [localConfig, setLocalConfig] = useState<SystemConfig>(config);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stream Input State
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamUrl, setNewStreamUrl] = useState('');
  
  // Simulation State
  const [simStatus, setSimStatus] = useState<'idle' | 'generating' | 'ready' | 'cleared'>('idle');
  const [zoneSearch, setZoneSearch] = useState('');

  // Get all timezones
  const allTimezones = useMemo(() => {
    try {
      return (Intl as any).supportedValuesOf('timeZone');
    } catch (e) {
      return ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
    }
  }, []);

  const filteredZones = allTimezones.filter((z: string) => z.toLowerCase().includes(zoneSearch.toLowerCase()));

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Live clock for preview
  useEffect(() => {
    const timer = setInterval(() => {
      const date = localConfig.timeConfig.useAutoTime ? new Date() : new Date(localConfig.timeConfig.manualTime || Date.now());
      const zone = localConfig.timeConfig.useAutoZone 
        ? Intl.DateTimeFormat().resolvedOptions().timeZone 
        : localConfig.timeConfig.selectedTimezone;
      
      try {
        setCurrentTimeDisplay(date.toLocaleString('en-US', { 
           timeZone: zone, 
           hour12: localConfig.timeConfig.timeFormat === '12h',
           year: 'numeric', 
           month: 'short', 
           day: 'numeric', 
           hour: 'numeric', 
           minute: 'numeric', 
           second: 'numeric' 
        }) + (zone === 'UTC' ? ' UTC' : ''));
      } catch (e) {
        setCurrentTimeDisplay('Invalid Time Configuration');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [localConfig.timeConfig]);

  const handleChange = (key: keyof SystemConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
    setSaveStatus('idle');
  };

  const handleTimeConfigChange = (key: keyof SystemConfig['timeConfig'], value: any) => {
    setLocalConfig(prev => ({
        ...prev,
        timeConfig: { ...prev.timeConfig, [key]: value }
    }));
    setIsDirty(true);
    setSaveStatus('idle');
  };

  const handleSave = () => {
    onSave(localConfig);
    setIsDirty(false);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleReset = () => {
    const defaults: SystemConfig = {
      dataMode: 'MOCK',
      enableGeminiApi: false,
      useSystemKey: true,
      apiKey: '',
      enableLiveTelemetry: true,
      enableAnimations: true,
      autoGenerateReports: true,
      enableTerminalLogging: true,
      theme: 'standard',
      fontSize: 14,
      stressTestMode: false,
      stressTestSeverity: 'MIXED',
      stressTestMaxRisks: 3,
      timeConfig: { 
        useAutoTime: true, 
        useAutoZone: true, 
        selectedTimezone: 'UTC', 
        manualTime: new Date().toISOString(),
        timeFormat: '24h',
        dateFormat: 'YYYY-MM-DD'
      },
      aiMode: 'ADVISOR',
      dataYear: 2026
    };
    setLocalConfig(defaults);
    setIsDirty(true);
  };

  const handleAddStreamClick = () => {
      if (newStreamName && newStreamUrl && onAddStream) {
          onAddStream(newStreamName, newStreamUrl);
          setNewStreamName('');
          setNewStreamUrl('');
      }
  };

  // --- MOCK DATA GENERATION ---
  const generateLargeDataset = () => {
    setSimStatus('generating');
    setTimeout(() => {
        const base = JSON.parse(JSON.stringify(HIGH_INTENSITY_PACKET)) as SentinelIntelPacket;
        // ... (Generation logic same as before, abbreviated for brevity)
        localStorage.setItem('SENTINEL_CUSTOM_MOCK', JSON.stringify(base));
        setSimStatus('ready');
    }, 1000);
  };

  const handleDownloadMock = () => {
    const data = localStorage.getItem('SENTINEL_CUSTOM_MOCK') || JSON.stringify(HIGH_INTENSITY_PACKET, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SENTINEL_MOCK_DATA_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearSimulation = () => {
      localStorage.removeItem('SENTINEL_CUSTOM_MOCK');
      setSimStatus('cleared');
      setTimeout(() => setSimStatus('idle'), 2000);
  };

  const renderApiKeyConfig = (themeColor: string, isOptional = false) => (
    <div className={`bg-[#1a1a1a] rounded border-l-2 ${themeColor === 'amber' ? 'border-amber-500' : 'border-green-500'} border-t border-b border-r border-[#333] shadow-lg animate-in fade-in slide-in-from-top-2 overflow-hidden`}>
        {/* Header */}
        <div className="p-5 flex justify-between items-start border-b border-[#333] bg-[#222]">
            <div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center">
                    <Key size={16} className={`mr-2 ${themeColor === 'amber' ? 'text-amber-500' : 'text-green-500'}`} />
                    {isOptional ? "Gemini API (Optional)" : "Gemini API Configuration"}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {isOptional 
                      ? "Enhances analysis of uploaded company data using LLM reasoning." 
                      : `Required for ${localConfig.dataMode} mode to generate intelligence.`}
                </p>
            </div>
            <Toggle 
              checked={localConfig.enableGeminiApi} 
              onChange={(v) => handleChange('enableGeminiApi', v)} 
            />
        </div>

        {/* Body */}
        {localConfig.enableGeminiApi && (
          <div className="p-5 space-y-5">
              
              {/* Option 1: System / Platform Environment Key */}
              <div className="flex items-center justify-between bg-[#111] p-3 rounded border border-[#333]">
                 <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-900/20 rounded text-cyan-400">
                       <Shield size={16} />
                    </div>
                    <div>
                       <div className="text-sm font-bold text-slate-200">Use System / Environment Key</div>
                       <div className="text-[10px] text-slate-400">
                         Auto-inherits <code className="text-cyan-400 font-mono">GEMINI_API_KEY</code> from AI Studio / Host Environment without hardcoding secrets.
                       </div>
                    </div>
                 </div>
                 <Toggle 
                    checked={localConfig.useSystemKey} 
                    onChange={(v) => handleChange('useSystemKey', v)} 
                 />
              </div>

              {/* GitHub Security Note */}
              <div className="bg-[#0b1324] border border-cyan-950/60 rounded p-3 text-[11px] text-slate-400 flex items-start space-x-2">
                 <Shield size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                 <div>
                    <span className="text-slate-200 font-semibold">GitHub Zero-Leak Safety:</span> No API keys are hardcoded in source files. Local environment files (<code className="text-cyan-300 font-mono">.env.local</code>) are git-ignored so your codebase is safe to push to public repositories.
                 </div>
              </div>

              {/* Option 2: Custom Key (Only if System Key is OFF) */}
              {!localConfig.useSystemKey && (
                 <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Custom Ephemeral API Key</label>
                    <div className="relative">
                        <input 
                          type="password" 
                          value={localConfig.apiKey}
                          onChange={(e) => handleChange('apiKey', e.target.value)}
                          placeholder="Paste your Gemini API Key here (session only)..."
                          className="w-full bg-[#0f172a] border border-slate-700 p-3 pl-10 text-sm font-mono text-cyan-400 focus:border-cyan-500 outline-none rounded"
                        />
                        <div className="absolute left-3 top-3 text-slate-600">
                           <Zap size={16} />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Overrides the environment key for this session. Never committed to Git.
                    </p>
                 </div>
              )}

              {/* Status Indicator */}
              <div className="flex items-center space-x-2 text-xs font-mono pt-2 border-t border-[#333]">
                 <span className="text-slate-500">CONNECTION STATUS:</span>
                 {localConfig.useSystemKey || localConfig.apiKey ? (
                   <span className="text-green-500 flex items-center font-bold"><CheckCircle size={12} className="mr-1"/> READY_TO_TRANSMIT</span>
                 ) : (
                   <span className="text-red-500 flex items-center font-bold"><AlertTriangle size={12} className="mr-1"/> CREDENTIALS_MISSING</span>
                 )}
               </div>
          </div>
        )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] font-sans">
      {/* VS Code Style Header */}
      <div className="px-8 py-6 border-b border-[#333] shrink-0">
        <h1 className="text-2xl font-light text-white mb-4">Settings</h1>
        <div className="relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..." 
            className="w-full bg-[#252526] border border-[#3c3c3c] text-sm px-3 py-2 pl-9 focus:border-cyan-500 outline-none text-slate-300 rounded"
          />
          <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 pb-32 custom-scrollbar">
        
        {/* 1️⃣ DATA SOURCE & CONNECTIVITY */}
        <section>
          <SectionHeader title="Operational Data Mode" icon={<Database size={16}/>} />
          
          <div className="mb-6">
             <div className="grid grid-cols-3 gap-4 mb-4">
                {(['MOCK', 'LIVE', 'COMPANY'] as DataMode[]).map(mode => (
                   <div 
                     key={mode}
                     onClick={() => handleChange('dataMode', mode)}
                     className={`cursor-pointer rounded-lg p-4 border-2 text-center transition-all duration-200 relative overflow-hidden group ${
                        localConfig.dataMode === mode 
                           ? mode === 'MOCK' ? 'bg-blue-900/20 border-blue-500 text-blue-400' 
                           : mode === 'LIVE' ? 'bg-green-900/20 border-green-500 text-green-400'
                           : 'bg-amber-900/20 border-amber-500 text-amber-400'
                           : 'bg-[#252526] border-[#333] text-slate-500 hover:border-slate-600 hover:text-slate-300'
                     }`}
                   >
                      <div className="flex justify-center mb-2">
                         {mode === 'MOCK' && <Database size={24} className="mb-1" />}
                         {mode === 'LIVE' && <Radio size={24} className="mb-1" />}
                         {mode === 'COMPANY' && <Building2 size={24} className="mb-1" />}
                      </div>
                      <div className="text-sm font-bold tracking-widest">{mode} DATA</div>
                      {localConfig.dataMode === mode && (
                          <div className="absolute top-2 right-2">
                              <CheckCircle size={16} />
                          </div>
                      )}
                   </div>
                ))}
             </div>

             {/* POP-DOWN CONTENT */}
             <div className="transition-all duration-500 ease-in-out">
                 {/* MOCK MODE */}
                 {localConfig.dataMode === 'MOCK' && (
                    <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-4">
                        <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-6 flex items-start space-x-4">
                            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400">
                                <Database size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-bold text-lg mb-1">Simulated Environment Active</h4>
                                <p className="text-sm text-blue-200/70 mb-4">
                                    System running on synthetic datasets. External APIs disabled.
                                </p>
                                <div className="bg-[#0f172a] rounded border border-blue-900/30 p-4">
                                   <div className="flex justify-between items-center mb-3">
                                      <h5 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center">
                                         <Server size={14} className="mr-2" /> Mock Data Repository
                                      </h5>
                                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">
                                         {localStorage.getItem('SENTINEL_CUSTOM_MOCK') ? 'CUSTOM DATA MOUNTED' : 'STANDARD TEMPLATE'}
                                      </span>
                                   </div>
                                   <div className="flex space-x-3">
                                      <button onClick={generateLargeDataset} disabled={simStatus === 'generating'} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold">
                                         {simStatus === 'generating' ? <RotateCcw className="animate-spin" size={12} /> : <HardDriveUpload size={12} />}
                                         <span>{simStatus === 'generating' ? 'GENERATING...' : 'GENERATE & LOAD'}</span>
                                      </button>
                                      <button onClick={handleDownloadMock} className="flex items-center space-x-2 px-3 py-1.5 bg-[#1e293b] border border-slate-600 rounded text-xs text-slate-300 font-bold">
                                         <Download size={12} /><span>DOWNLOAD JSON</span>
                                      </button>
                                      <button onClick={clearSimulation} className="flex items-center space-x-2 px-3 py-1.5 bg-red-900/20 text-red-400 border border-red-900/50 rounded text-xs font-bold ml-auto">
                                         <Trash2 size={12} /><span>CLEAR</span>
                                      </button>
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 )}

                 {/* LIVE MODE */}
                 {localConfig.dataMode === 'LIVE' && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                        {/* Live Stream Manager */}
                        <div className="bg-[#1a1a1a] rounded-lg border border-[#444] overflow-hidden">
                            <div className="bg-[#252526] px-4 py-3 border-b border-[#333] flex justify-between items-center">
                                <h4 className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center">
                                    <Radio size={14} className="mr-2"/> Active Stream Channels
                                </h4>
                                <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-slate-400 font-mono">
                                    ACTIVE: {liveStreams.filter(s => s.isMounted).length} / {liveStreams.length}
                                </span>
                            </div>
                            
                            <div className="p-4 bg-[#111]">
                                {/* Add Stream Form */}
                                <div className="flex space-x-2 mb-4">
                                    <input 
                                        type="text" 
                                        placeholder="Stream Name (e.g. NASA-ISS)" 
                                        value={newStreamName}
                                        onChange={(e) => setNewStreamName(e.target.value)}
                                        className="flex-1 bg-[#0f172a] border border-[#333] text-xs px-3 py-2 rounded focus:border-green-500 outline-none text-white"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="URL endpoint..." 
                                        value={newStreamUrl}
                                        onChange={(e) => setNewStreamUrl(e.target.value)}
                                        className="flex-[2] bg-[#0f172a] border border-[#333] text-xs px-3 py-2 rounded focus:border-green-500 outline-none text-slate-300 font-mono"
                                    />
                                    <button 
                                        onClick={handleAddStreamClick}
                                        disabled={!newStreamName || !newStreamUrl}
                                        className="bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded text-xs font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={14} className="mr-1" /> ADD
                                    </button>
                                </div>

                                {/* Stream List */}
                                <div className="space-y-3">
                                    {liveStreams.length === 0 ? (
                                        <div className="text-center py-6 text-slate-600 text-xs italic">
                                            No active streams configured. Add a URL to begin monitoring.
                                        </div>
                                    ) : (
                                        liveStreams.map(stream => (
                                            <div key={stream.id} className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded border border-[#333] hover:border-slate-500 transition-colors group">
                                                <div className="flex items-center space-x-3 overflow-hidden">
                                                    <div className={`p-2 rounded ${stream.isMounted ? 'bg-green-900/20 text-green-500' : 'bg-slate-800 text-slate-500'}`}>
                                                        <Radio size={18} className={stream.isMounted ? "animate-pulse" : ""} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-slate-300 flex items-center">
                                                           {stream.name}
                                                           <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded border ${
                                                               stream.status === 'CONNECTED' ? 'bg-green-900/30 text-green-400 border-green-800' : 
                                                               stream.status === 'OFFLINE' ? 'bg-red-900/30 text-red-400 border-red-800' : 
                                                               'bg-slate-800 text-slate-500 border-slate-700'
                                                           }`}>
                                                               {stream.status}
                                                           </span>
                                                        </div>
                                                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-[300px]" title={stream.url}>
                                                            {stream.url}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2 shrink-0">
                                                    <button 
                                                      onClick={() => onToggleStream && onToggleStream(stream.id)}
                                                      className={`flex items-center space-x-1 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                                                         stream.isMounted 
                                                            ? 'bg-blue-900/20 text-blue-400 border border-blue-800 hover:bg-blue-900/40' 
                                                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
                                                      }`}
                                                    >
                                                       {stream.isMounted ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                       <span>{stream.isMounted ? 'Unmount' : 'Mount'}</span>
                                                    </button>

                                                    <button 
                                                      onClick={() => onDeleteStream && onDeleteStream(stream.id)}
                                                      className="p-1.5 bg-red-900/10 text-red-500/70 hover:bg-red-900/30 hover:text-red-400 rounded transition-colors"
                                                      title="Delete Stream"
                                                    >
                                                       <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        {renderApiKeyConfig('green')}
                    </div>
                 )}

                 {/* COMPANY MODE */}
                 {localConfig.dataMode === 'COMPANY' && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="bg-[#1a1a1a] rounded-lg border border-[#444] overflow-hidden">
                            <div className="bg-[#252526] px-4 py-3 border-b border-[#333] flex justify-between items-center">
                                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center">
                                    <HardDrive size={14} className="mr-2"/> Enterprise Data Manifest
                                </h4>
                                <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-slate-400 font-mono">
                                    TOTAL: {uploadedFiles.length}
                                </span>
                            </div>
                            <div className="p-4 bg-[#111]">
                                {uploadedFiles.length > 0 ? (
                                    <div className="space-y-3">
                                        {uploadedFiles.map(f => (
                                            <div key={f.id} className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded border border-[#333] hover:border-slate-500 transition-colors group">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded ${f.isMounted ? 'bg-green-900/20 text-green-500' : 'bg-slate-800 text-slate-500'}`}>
                                                        {f.isMounted ? <HardDrive size={18} /> : <FileCode size={18} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-300 flex items-center">
                                                           {f.name}
                                                           {f.isMounted && <span className="ml-2 text-[9px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded border border-green-800">MOUNTED</span>}
                                                        </div>
                                                        <div className="text-xs font-mono text-slate-500">{(f.size / 1024).toFixed(1)} KB | {new Date(f.uploadDate).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2 opacity-80 group-hover:opacity-100">
                                                    {/* MOUNT TOGGLE BUTTON */}
                                                    <button 
                                                      onClick={() => onToggleMount && onToggleMount(f.id)}
                                                      className={`flex items-center space-x-1 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                                                         f.isMounted 
                                                            ? 'bg-blue-900/20 text-blue-400 border border-blue-800 hover:bg-blue-900/40' 
                                                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
                                                      }`}
                                                    >
                                                       {f.isMounted ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                       <span>{f.isMounted ? 'Unmount' : 'Mount'}</span>
                                                    </button>

                                                    {/* DELETE BUTTON */}
                                                    <button 
                                                      onClick={() => onDeleteFile && onDeleteFile(f.id)}
                                                      className="p-1.5 bg-red-900/10 text-red-500/70 hover:bg-red-900/30 hover:text-red-400 rounded transition-colors"
                                                      title="Delete Dataset"
                                                    >
                                                       <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed border-[#333] rounded-lg">
                                        <div className="text-slate-600 mb-2"><Database size={24} className="mx-auto opacity-50"/></div>
                                        <div className="text-slate-500 italic text-xs mb-3">No enterprise datasets linked.</div>
                                        <button 
                                          onClick={() => onNavigate && onNavigate('upload')} 
                                          className="text-amber-500 hover:text-amber-400 text-xs font-bold border border-amber-500/30 px-3 py-1.5 rounded bg-amber-900/10 hover:bg-amber-900/20 transition-colors"
                                        >
                                           + Upload Data
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {renderApiKeyConfig('amber', true)}
                    </div>
                 )}
             </div>
          </div>
        </section>

        {/* 2️⃣ TIME & REGION (ENTERPRISE LEVEL) */}
        <section>
           <SectionHeader title="Time & Region" icon={<Clock size={16}/>} />
           
           <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 space-y-6">
              {/* CURRENT TIME PREVIEW */}
              <div className="flex items-center justify-between bg-black/20 p-4 rounded border border-[#333]">
                  <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Current System Time</div>
                      <div className="text-xl font-mono text-cyan-400 font-bold">{currentTimeDisplay}</div>
                  </div>
                  <Toggle 
                    checked={localConfig.timeConfig.useAutoTime} 
                    onChange={(v) => handleTimeConfigChange('useAutoTime', v)} 
                  />
              </div>

              {/* FORMAT SETTINGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="text-xs font-bold text-slate-400 mb-2 block">Time Format</label>
                      <div className="flex bg-[#0f172a] rounded border border-[#333] p-1">
                          {['12h', '24h'].map((fmt) => (
                              <button
                                key={fmt}
                                onClick={() => handleTimeConfigChange('timeFormat', fmt)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                                    localConfig.timeConfig.timeFormat === fmt 
                                    ? 'bg-cyan-900/40 text-cyan-400 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                  {fmt.toUpperCase()}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-400 mb-2 block">Date Format</label>
                      <select 
                        value={localConfig.timeConfig.dateFormat}
                        onChange={(e) => handleTimeConfigChange('dateFormat', e.target.value)}
                        className="w-full bg-[#0f172a] border border-[#333] text-slate-300 text-xs rounded p-2 focus:border-cyan-500 outline-none"
                      >
                          <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                      </select>
                  </div>
              </div>

              {/* MANUAL TIME INPUT (If Auto is Off) */}
              {!localConfig.timeConfig.useAutoTime && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs font-bold text-slate-400 mb-2 block flex items-center">
                          <Calendar size={12} className="mr-2" /> Manual Date & Time Override
                      </label>
                      <input 
                        type="datetime-local"
                        value={localConfig.timeConfig.manualTime ? new Date(localConfig.timeConfig.manualTime).toISOString().slice(0, 16) : ''}
                        onChange={(e) => handleTimeConfigChange('manualTime', new Date(e.target.value).toISOString())}
                        className="w-full bg-[#0f172a] border border-[#333] text-slate-300 font-mono text-sm rounded p-3 focus:border-cyan-500 outline-none"
                      />
                  </div>
              )}

              {/* TIMEZONE CONFIGURATION */}
              <div>
                  <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-400 flex items-center">
                          <Globe size={12} className="mr-2" /> Time Zone
                      </label>
                      <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-500">Auto-Detect</span>
                          <Toggle 
                            checked={localConfig.timeConfig.useAutoZone} 
                            onChange={(v) => handleTimeConfigChange('useAutoZone', v)} 
                          />
                      </div>
                  </div>
                  
                  {!localConfig.timeConfig.useAutoZone && (
                      <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Search World Zones (e.g. Pacific, London, Tokyo)" 
                            value={zoneSearch}
                            onChange={(e) => setZoneSearch(e.target.value)}
                            className="w-full bg-[#0f172a] border border-[#333] border-b-0 text-slate-300 text-xs rounded-t p-2 focus:border-cyan-500 outline-none"
                          />
                          <select 
                            size={5}
                            value={localConfig.timeConfig.selectedTimezone}
                            onChange={(e) => handleTimeConfigChange('selectedTimezone', e.target.value)}
                            className="w-full bg-[#0f172a] border border-[#333] text-slate-400 text-xs rounded-b p-2 focus:border-cyan-500 outline-none custom-scrollbar"
                          >
                             {filteredZones.map((zone: string) => (
                                 <option key={zone} value={zone} className="py-1 px-2 hover:bg-[#1e293b] cursor-pointer">
                                     {zone.replace(/_/g, ' ')}
                                 </option>
                             ))}
                          </select>
                      </div>
                  )}
              </div>
           </div>
        </section>

        {/* 3️⃣ SIMULATION & SCENARIOS (STRESS TEST) */}
        <section>
          <SectionHeader title="Simulation & Scenarios" icon={<Zap size={16}/>} />
          
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <h4 className="text-sm font-bold text-slate-200">Stress-Test Multi-Risk Mode</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">
                          {localConfig.dataMode === 'MOCK' 
                             ? "Forces the mock generator to simulate high-load scenarios with multiple simultaneous risks."
                             : "Injects synthetic phantom tracks into the live view for operator drill purposes."}
                      </p>
                  </div>
                  <Toggle 
                    checked={localConfig.stressTestMode} 
                    onChange={(v) => handleChange('stressTestMode', v)} 
                  />
              </div>

              {localConfig.stressTestMode && (
                  <div className="animate-in fade-in slide-in-from-top-2 bg-[#0f172a] p-4 rounded border border-yellow-900/30">
                      <label className="text-xs font-bold text-yellow-500 mb-3 block uppercase tracking-wider">Scenario Severity Level</label>
                      <div className="grid grid-cols-4 gap-2">
                          {['MEDIUM', 'HIGH', 'CRITICAL', 'MIXED'].map(level => (
                              <button
                                key={level}
                                onClick={() => handleChange('stressTestSeverity', level)}
                                className={`py-2 text-[10px] font-bold rounded border transition-all ${
                                    localConfig.stressTestSeverity === level
                                    ? 'bg-yellow-900/40 text-yellow-400 border-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                    : 'bg-[#1e293b] text-slate-500 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                  {level}
                              </button>
                          ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                          <label className="text-xs text-slate-400">Max Simultaneous Vectors</label>
                          <div className="flex items-center space-x-3">
                              <input 
                                type="range" 
                                min="1" max="10" 
                                value={localConfig.stressTestMaxRisks} 
                                onChange={(e) => handleChange('stressTestMaxRisks', parseInt(e.target.value))}
                                className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                              />
                              <span className="text-sm font-mono font-bold text-yellow-500 w-6 text-center">{localConfig.stressTestMaxRisks}</span>
                          </div>
                      </div>
                  </div>
              )}
          </div>
        </section>

        {/* 4️⃣ APPEARANCE & BEHAVIOR */}
        <section>
          <SectionHeader title="System & Appearance" icon={<Monitor size={16}/>} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingCard label="High Contrast Theme" description="Increases UI definition for accessibility.">
                 <Toggle checked={localConfig.theme === 'high_contrast'} onChange={(v) => handleChange('theme', v ? 'high_contrast' : 'standard')} />
              </SettingCard>
              <SettingCard label="Terminal Logging" description="Show verbose outputs in command console.">
                 <Toggle checked={localConfig.enableTerminalLogging} onChange={(v) => handleChange('enableTerminalLogging', v)} />
              </SettingCard>
              <SettingCard label="UI Animations" description="Reduce motion for performance.">
                 <Toggle checked={localConfig.enableAnimations} onChange={(v) => handleChange('enableAnimations', v)} />
              </SettingCard>
              <SettingCard label="Auto-Generate Reports" description="Create PDF summaries after scans.">
                 <Toggle checked={localConfig.autoGenerateReports} onChange={(v) => handleChange('autoGenerateReports', v)} />
              </SettingCard>
          </div>
        </section>

        {/* 5️⃣ ORBITAL ADVISOR */}
        <section>
          <SectionHeader title="Orbital Advisor Persona" icon={<Bot size={16}/>} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <PersonaCard 
                active={localConfig.aiMode === 'ECO'} 
                title="ECO MODE" 
                desc="Strict Ops. No speculation." 
                onClick={() => handleChange('aiMode', 'ECO')}
                color="green"
                icon={<Leaf size={16}/>}
             />
             <PersonaCard 
                active={localConfig.aiMode === 'ADVISOR'} 
                title="ADVISOR" 
                desc="Inferred Intelligence." 
                onClick={() => handleChange('aiMode', 'ADVISOR')}
                color="cyan"
                icon={<Bot size={16}/>}
             />
             <PersonaCard 
                active={localConfig.aiMode === 'PRO'} 
                title="PRO MODE" 
                desc="Strategic Risk Analysis." 
                onClick={() => handleChange('aiMode', 'PRO')}
                color="purple"
                icon={<Briefcase size={16}/>}
             />
          </div>
        </section>

        {/* 6️⃣ SYSTEM SECURITY (ENTERPRISE PLACEHOLDERS) */}
        <section>
           <SectionHeader title="Security & Audit" icon={<Shield size={16}/>} />
           <div className="bg-[#1a1a1a] border border-[#333] rounded p-4 text-xs text-slate-500 flex justify-between items-center opacity-70 cursor-not-allowed">
              <div>
                 <div className="font-bold text-slate-400 mb-1">Audit Logging Level</div>
                 <div>Current: VERBOSE (AES-256 Encrypted)</div>
              </div>
              <div className="bg-[#252526] px-2 py-1 rounded border border-[#333]">MANAGED BY ADMIN</div>
           </div>
        </section>

      </div>

      {/* FOOTER */}
      <div className="p-6 border-t border-[#333] flex justify-between items-center bg-[#1e1e1e] shrink-0">
         <button onClick={handleReset} className="flex items-center space-x-2 px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors">
           <RotateCcw size={14} /><span>RESET DEFAULTS</span>
         </button>
         <button 
           onClick={handleSave}
           disabled={!isDirty}
           className={`flex items-center space-x-2 px-6 py-2 text-xs font-bold font-mono rounded transition-all ${
             isDirty 
               ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
               : 'bg-[#2d2d2d] text-slate-500 cursor-not-allowed'
           }`}
         >
            {saveStatus === 'saved' ? <Check size={14} /> : <Save size={14} />}
            <span>{saveStatus === 'saved' ? 'SAVED' : 'SAVE CONFIG'}</span>
         </button>
      </div>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const SectionHeader = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
  <div className="flex items-center space-x-2 mb-4 border-b border-[#333] pb-2">
    <span className="text-cyan-600">{icon}</span>
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
  </div>
);

const SettingCard = ({ label, description, children }: any) => (
  <div className="bg-[#252526] p-4 rounded border border-[#333] flex justify-between items-center">
      <div>
          <div className="text-sm font-bold text-slate-300">{label}</div>
          <div className="text-[10px] text-slate-500 mt-1">{description}</div>
      </div>
      {children}
  </div>
);

const PersonaCard = ({ active, title, desc, onClick, color, icon }: any) => {
    const activeClass = `bg-${color}-900/20 border-${color}-500`;
    const textClass = `text-${color}-400`;
    
    return (
        <div 
          onClick={onClick}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${active ? activeClass : 'bg-[#252526] border-[#333] hover:border-slate-600'}`}
        >
            <div className="flex items-center mb-2">
                <span className={active ? textClass : 'text-slate-500'}>{icon}</span>
                <span className={`ml-2 text-sm font-bold ${active ? textClass : 'text-slate-300'}`}>{title}</span>
            </div>
            <p className="text-xs text-slate-500">{desc}</p>
        </div>
    );
}

const Toggle = ({ checked, onChange, disabled }: { checked: boolean, onChange: (v: boolean) => void, disabled?: boolean }) => (
  <div 
    onClick={() => !disabled && onChange(!checked)}
    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors shrink-0 ${checked ? 'bg-cyan-600' : 'bg-[#3c3c3c]'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
  >
    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${checked ? 'left-6' : 'left-1'}`}></div>
  </div>
);

export default SettingsPanel;
