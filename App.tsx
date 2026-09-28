
import React, { useState, useEffect, useRef } from 'react';
import { SentinelIntelPacket, LogEntry, ViewType, SystemConfig, RiskLevel, HiddenRisk, UploadedFile, LiveStream } from './types';
import Sidebar from './components/Sidebar';
import PanelTabs from './components/PanelTabs';
import Terminal from './components/Terminal'; 
import Dashboard from './components/Dashboard';
import IntelligenceViewer from './components/IntelligenceViewer';
import SettingsPanel from './components/SettingsPanel';
import MonitorView from './components/MonitorView';
import HiddenRiskView from './components/HiddenRiskView';
import InsightsView from './components/InsightsView';
import DebugView from './components/DebugView';
import OrbAiView from './components/OrbAiView';
import UploadDataView from './components/UploadDataView';
import OrbitalView3D from './components/OrbitalView3D';
import MoreMenu from './components/MoreMenu';
import { 
  Globe, 
  GitBranch,
  Bell,
  CheckCircle2,
  AlertTriangle,
  GripVertical
} from 'lucide-react';

// Default configuration
const DEFAULT_CONFIG: SystemConfig = {
  dataMode: 'MOCK', 
  enableGeminiApi: false,
  useSystemKey: true, // Default to using system key
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
    selectedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    manualTime: new Date().toISOString(),
    timeFormat: '24h',
    dateFormat: 'YYYY-MM-DD'
  },
  aiMode: 'ADVISOR',
  dataYear: 2026
};

// Default Live Streams
const DEFAULT_STREAMS: LiveStream[] = [
  { id: 'ls-1', name: 'NASA-ISS-HDEV', url: 'https://video.ibm.com/channel/iss-hdev-payload', status: 'CONNECTED', addedDate: new Date().toISOString(), isMounted: true },
  { id: 'ls-2', name: 'SpaceX-Starlink-Relay', url: 'https://api.spacex.com/v2/telemetry', status: 'OFFLINE', addedDate: new Date().toISOString(), isMounted: false }
];

export default function App() {
  // --- INDEPENDENT TAB STATE ---
  const [primaryTabs, setPrimaryTabs] = useState<ViewType[]>(['dashboard', 'uplink']);
  const [primaryActive, setPrimaryActive] = useState<ViewType>('dashboard');

  const [secondaryTabs, setSecondaryTabs] = useState<ViewType[]>([]);
  const [secondaryActive, setSecondaryActive] = useState<ViewType | null>(null);

  // Focus Tracking ('primary' or 'secondary') to know where sidebar opens tabs
  const [focusedPane, setFocusedPane] = useState<'primary' | 'secondary'>('primary');
  
  // Split View Resizing
  const [splitRatio, setSplitRatio] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [packet, setPacket] = useState<SentinelIntelPacket | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Data State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(DEFAULT_STREAMS);

  // Initial welcome log
  useEffect(() => {
    addLog("SENTINEL v4.5.1 Containerized. UI Matrix Loaded.", 'info');
    addLog(`System Config: ${config.dataMode}_DATA`, 'warning');
    addLog("System ready. Please input orbital telemetry.", 'info');
  }, []);

  // --- RESIZING LOGIC ---
  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newRatio = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Clamp between 20% and 80%
      const clampedRatio = Math.min(80, Math.max(20, newRatio));
      setSplitRatio(clampedRatio);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);


  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      message,
      type
    }]);
  };

  const handleConfigSave = (newConfig: SystemConfig) => {
    setConfig(newConfig);
    addLog("System Configuration Updated. Rebooting modules...", 'success');
  };

  // Allow direct config updates from sub-components
  const handleDirectConfigChange = (key: keyof SystemConfig, value: any) => {
      setConfig(prev => ({ ...prev, [key]: value }));
  };

  // --- FILE MANAGEMENT ---
  const handleFileMountToggle = (fileId: string) => {
    setUploadedFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const newState = !f.isMounted;
        addLog(`${newState ? 'MOUNTING' : 'UNMOUNTING'} DATASET: ${f.name}`, 'info');
        return { ...f, isMounted: newState };
      }
      return f;
    }));
  };

  const handleFileDelete = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
      addLog(`REMOVED DATASET: ${file.name}`, 'warning');
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  // --- LIVE STREAM MANAGEMENT ---
  const handleStreamAdd = (name: string, url: string) => {
      const newStream: LiveStream = {
          id: Math.random().toString(36).substr(2, 9),
          name: name.replace(/\s+/g, '-').toUpperCase(),
          url,
          status: 'CONNECTED',
          addedDate: new Date().toISOString(),
          isMounted: true
      };
      setLiveStreams(prev => [...prev, newStream]);
      addLog(`LIVE STREAM ADDED: ${newStream.name}`, 'success');
  };

  const handleStreamToggle = (streamId: string) => {
      setLiveStreams(prev => prev.map(s => {
          if (s.id === streamId) {
              const newState = !s.isMounted;
              addLog(`${newState ? 'MOUNTING' : 'UNMOUNTING'} STREAM: ${s.name}`, 'info');
              return { ...s, isMounted: newState };
          }
          return s;
      }));
  };

  const handleStreamDelete = (streamId: string) => {
      const stream = liveStreams.find(s => s.id === streamId);
      if (stream) {
          addLog(`REMOVED STREAM: ${stream.name}`, 'warning');
          setLiveStreams(prev => prev.filter(s => s.id !== streamId));
      }
  };

  // --- MITIGATION & STATE UPDATE LOGIC ---
  const handleRiskMitigation = (riskId: string) => {
    if (!packet) return;
    
    addLog(`INITIATING MITIGATION PROTOCOL: ${riskId}`, 'warning');

    // 1. Validate ID exists
    const targetRisk = packet.hiddenRisks.find(r => r.id === riskId);
    if (!targetRisk) {
         addLog(`COMMAND ERROR: Risk ID '${riskId}' not found in current sector manifest.`, 'error');
         return;
    }

    // 2. Toggle Status & Calculate Impact
    let isMitigated = false;
    const updatedRisks: HiddenRisk[] = packet.hiddenRisks.map(r => {
      if (r.id === riskId) {
        // Toggle: pending -> implemented (Mitigate) OR implemented -> pending (Undo)
        const newStatus: 'pending' | 'implemented' = r.mitigationStatus === 'pending' ? 'implemented' : 'pending';
        isMitigated = newStatus === 'implemented';
        return { ...r, mitigationStatus: newStatus };
      }
      return r;
    });

    // 3. Update Aggregate Risk Score
    let newScore = packet.dashboard.riskScore;
    if (isMitigated) {
        // Reduce risk score (reward for mitigation)
        newScore = Math.max(0, newScore - 15);
    } else {
        // Increase risk score (penalty for undoing)
        newScore = Math.min(100, newScore + 15);
    }

    // 4. Determine New Risk Level
    let newLevel: RiskLevel = 'LOW';
    if (newScore > 75) newLevel = 'CRITICAL';
    else if (newScore > 50) newLevel = 'HIGH';
    else if (newScore > 25) newLevel = 'MEDIUM';

    // 5. Commit Updates
    const updatedPacket: SentinelIntelPacket = { 
        ...packet, 
        hiddenRisks: updatedRisks,
        dashboard: {
            ...packet.dashboard,
            riskScore: newScore,
            riskLevel: newLevel
        }
    };
    
    setPacket(updatedPacket);
    
    if (isMitigated) {
      addLog(`SUCCESS: ${riskId} status updated to RESOLVED.`, 'success');
      addLog(`SYSTEM UPDATE: Aggregate Risk Score reduced to ${newScore}.`, 'success');
    } else {
      addLog(`WARNING: Mitigation for ${riskId} REVERTED. Risk Score increased to ${newScore}.`, 'warning');
    }
  };

  // --- TAB MANAGEMENT ---

  const handleSidebarOpen = (view: ViewType) => {
    if (focusedPane === 'primary') {
      if (!primaryTabs.includes(view)) {
        setPrimaryTabs(prev => [...prev, view]);
      }
      setPrimaryActive(view);
    } else {
      // Secondary Pane
      if (!secondaryTabs.includes(view)) {
        setSecondaryTabs(prev => [...prev, view]);
      }
      setSecondaryActive(view);
    }
  };

  // Generic close handler
  const closeTab = (pane: 'primary' | 'secondary', view: ViewType) => {
    if (pane === 'primary') {
      const newTabs = primaryTabs.filter(t => t !== view);
      setPrimaryTabs(newTabs);
      if (primaryActive === view) {
         const index = primaryTabs.indexOf(view);
         const newIndex = index > 0 ? index - 1 : 0;
         setPrimaryActive(newTabs[newIndex] || 'dashboard'); // Fallback to something if empty?
      }
    } else {
      const newTabs = secondaryTabs.filter(t => t !== view);
      setSecondaryTabs(newTabs);
      if (newTabs.length === 0) {
        // Close split if last tab closed
        setSecondaryActive(null);
        setFocusedPane('primary');
        setSplitRatio(100); // Reset to full width
      } else if (secondaryActive === view) {
         const index = secondaryTabs.indexOf(view);
         const newIndex = index > 0 ? index - 1 : 0;
         setSecondaryActive(newTabs[newIndex]);
      }
    }
  };

  // --- SPLIT SCREEN LOGIC ---

  const handleSplitScreen = () => {
    // 1. Take current primary active tab
    const tabToMove = primaryActive;
    
    // 2. Add to secondary if not there
    if (!secondaryTabs.includes(tabToMove)) {
      setSecondaryTabs(prev => [...prev, tabToMove]);
    }
    
    // 3. Activate it on secondary
    setSecondaryActive(tabToMove);
    
    // 4. Set focus to secondary
    setFocusedPane('secondary');
    setSplitRatio(50); // Default to 50/50
  };

  const handleCloseSplit = () => {
    setSecondaryTabs([]);
    setSecondaryActive(null);
    setFocusedPane('primary');
    setSplitRatio(100);
  };

  // Component Factory
  const renderView = (view: ViewType, pane: 'primary' | 'secondary') => {
    const isActive = pane === 'primary' ? view === primaryActive : view === secondaryActive;
    
    switch (view) {
      case 'dashboard':
        return <Dashboard isProcessing={isProcessing} packet={packet} config={config} />;
      case 'monitor':
        return <MonitorView packet={packet} isProcessing={isProcessing} config={config} />;
      case '3d_orb':
        return <OrbitalView3D packet={packet} config={config} active={isActive} />;
      case 'risks':
        return <HiddenRiskView packet={packet} onToggleMitigation={handleRiskMitigation} config={config} />;
      case 'insights': 
        return <InsightsView packet={packet} config={config} />;
      case 'uplink':
        // Replaced CommandUplink with Terminal
        return (
          <Terminal 
            isProcessing={isProcessing} 
            logs={logs} 
            config={config} 
            packet={packet} 
            setPacket={setPacket} 
            addLog={addLog}
            onTriggerMitigation={handleRiskMitigation}
            uploadedFiles={uploadedFiles}
            liveStreams={liveStreams} // Pass live streams to terminal
            onNavigate={handleSidebarOpen}
          />
        );
      case 'upload':
        return <UploadDataView files={uploadedFiles} setFiles={setUploadedFiles} config={config} />;
      case 'settings':
        return (
          <SettingsPanel 
            config={config} 
            onSave={handleConfigSave} 
            uploadedFiles={uploadedFiles}
            liveStreams={liveStreams} 
            onNavigate={handleSidebarOpen}
            onToggleMount={handleFileMountToggle}
            onDeleteFile={handleFileDelete}
            onAddStream={handleStreamAdd}
            onToggleStream={handleStreamToggle}
            onDeleteStream={handleStreamDelete}
          />
        );
      case 'debug':
        return <DebugView packet={packet} config={config} />;
      case 'orb_ai':
        return (
          <OrbAiView 
            packet={packet} 
            config={config}
            onNavigateToUplink={() => handleSidebarOpen('uplink')}
            onConfigChange={handleDirectConfigChange}
          />
        );
      case 'more':
        return <MoreMenu />;
      default:
        // Fallback for reports/intel/insights
        return (
          <IntelligenceViewer 
            view={view} 
            packet={packet} 
            onNavigateToUplink={() => handleSidebarOpen('uplink')} 
            onToggleMitigation={handleRiskMitigation} 
            config={config}
          />
        );
    }
  };

  const isSplitOpen = secondaryTabs.length > 0 || secondaryActive !== null;

  return (
    <div className={`flex h-screen w-screen bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden ${config.theme === 'high_contrast' ? 'contrast-125' : ''}`}>
      
      {/* LEFT ACTIVITY BAR (SIDEBAR) */}
      <Sidebar activeView={focusedPane === 'primary' ? primaryActive : (secondaryActive || primaryActive)} onViewChange={handleSidebarOpen} />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] pb-6"> {/* pb-6 ensures footer doesn't overlap content */}
        
        {/* VIEWPORT CONTAINER (FLEX ROW FOR SPLIT) */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
            
            {/* PRIMARY PANE */}
            <div 
              className={`flex flex-col h-full border-r border-[#1e1e1e] transition-none ${focusedPane === 'primary' ? 'ring-1 ring-inset ring-cyan-900/50 z-10' : 'opacity-90 hover:opacity-100'}`}
              style={{ width: isSplitOpen ? `${splitRatio}%` : '100%' }}
              onClick={() => setFocusedPane('primary')}
            >
                <PanelTabs 
                  openTabs={primaryTabs} 
                  activeView={primaryActive} 
                  onTabClick={(v) => { setPrimaryActive(v); setFocusedPane('primary'); }} 
                  onTabClose={(v, e) => { e.stopPropagation(); closeTab('primary', v); }} 
                  onSplit={handleSplitScreen}
                />
                
                <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]" style={{ fontSize: `${config.fontSize}px` }}>
                   {primaryTabs.map(tab => (
                     <div 
                        key={`pri-${tab}`} 
                        className="h-full w-full bg-[#1e1e1e]"
                        style={{ display: tab === primaryActive ? 'block' : 'none' }}
                     >
                        {renderView(tab, 'primary')}
                     </div>
                   ))}

                   {primaryTabs.length === 0 && (
                     <div className="h-full w-full flex items-center justify-center text-slate-600 select-none">
                        <div className="text-center">
                           <div className="text-4xl font-bold mb-2 opacity-20">SENTINEL</div>
                           <div className="text-xs tracking-widest opacity-40">NO ACTIVE MODULES</div>
                        </div>
                     </div>
                   )}
                </div>
            </div>

            {/* DRAGGER HANDLE (Only visible if split is open) */}
            {isSplitOpen && (
              <div 
                className={`w-1 h-full cursor-col-resize hover:bg-cyan-500 active:bg-cyan-400 z-50 flex items-center justify-center transition-colors ${isResizing ? 'bg-cyan-500' : 'bg-[#333]'}`}
                onMouseDown={startResizing}
              >
                 <GripVertical size={12} className={`text-black ${isResizing ? 'opacity-50' : 'opacity-0 hover:opacity-100'}`} />
              </div>
            )}

            {/* SECONDARY PANE (SPLIT VIEW) */}
            {isSplitOpen && secondaryActive && (
                <div 
                  className={`flex flex-col h-full bg-[#1e1e1e] border-l border-slate-800 ${focusedPane === 'secondary' ? 'ring-1 ring-inset ring-cyan-900/50 z-10' : 'opacity-90 hover:opacity-100'}`}
                  style={{ width: `${100 - splitRatio}%` }}
                  onClick={() => setFocusedPane('secondary')}
                >
                    <PanelTabs 
                      openTabs={secondaryTabs} 
                      activeView={secondaryActive} 
                      onTabClick={(v) => { setSecondaryActive(v); setFocusedPane('secondary'); }} 
                      onTabClose={(v, e) => { e.stopPropagation(); closeTab('secondary', v); }}
                      onCloseSplit={handleCloseSplit}
                      isSecondary={true}
                    />
                    
                    <div className="flex-1 relative overflow-hidden bg-[#1a1a1a]" style={{ fontSize: `${config.fontSize}px` }}>
                         {secondaryTabs.map(tab => (
                             <div 
                                key={`sec-${tab}`} 
                                className="h-full w-full bg-[#1a1a1a]"
                                style={{ display: tab === secondaryActive ? 'block' : 'none' }}
                             >
                                {renderView(tab, 'secondary')}
                             </div>
                         ))}
                         
                         {secondaryTabs.length === 0 && (
                           <div className="h-full w-full flex items-center justify-center text-slate-600">
                             <div className="text-xs opacity-50">EMPTY SPLIT</div>
                           </div>
                         )}
                    </div>
                </div>
            )}

        </div>

      </div>

      {/* BOTTOM STATUS BAR */}
      <footer className="fixed bottom-0 left-0 right-0 h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] font-sans select-none z-30">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 hover:bg-[#ffffff20] px-1 cursor-pointer">
            <GitBranch size={10} />
            <span>main*</span>
          </div>
          <div className="flex items-center space-x-1 hover:bg-[#ffffff20] px-1 cursor-pointer">
             <CheckCircle2 size={10} />
             <span>0 Errors</span>
          </div>
          <div className="flex items-center space-x-1 hover:bg-[#ffffff20] px-1 cursor-pointer">
             <span>Build: v4.5.1</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-1">
             <Globe size={10} className={config.dataMode === 'MOCK' ? "text-yellow-300" : "text-white"} />
             <span>DSN: {config.dataMode === 'MOCK' ? "OFFLINE (SIM)" : isProcessing ? "TRANSMITTING" : "CONNECTED"}</span>
           </div>
           
           {config.dataMode !== 'MOCK' && !config.apiKey && !config.useSystemKey && (
             <div className="flex items-center space-x-1 text-red-200 animate-pulse">
               <AlertTriangle size={10} />
               <span>NO API KEY</span>
             </div>
           )}

           <div className="flex items-center space-x-1 hover:bg-[#ffffff20] px-1 cursor-pointer">
             <Bell size={10} />
             <span>Notifications</span>
           </div>
           <div className="px-1">UTF-8</div>
           <div className={`px-1 font-bold ${focusedPane === 'secondary' ? 'text-cyan-200' : ''}`}>
             {isSplitOpen ? (focusedPane === 'secondary' ? 'FOCUS: RIGHT' : 'FOCUS: LEFT') : 'SINGLE VIEW'}
           </div>
        </div>
      </footer>
    </div>
  );
}
