
import React, { useRef, useEffect } from 'react';
import { ViewType } from '../types';
import { 
  Layout, 
  ShieldAlert, 
  FileJson, 
  TerminalSquare, 
  Briefcase, 
  LineChart, 
  Settings,
  X,
  Activity,
  Columns,
  PanelRightClose,
  Bug,
  Bot,
  UploadCloud,
  Globe,
  ChevronsRight
} from 'lucide-react';

interface PanelTabsProps {
  openTabs: ViewType[];
  activeView: ViewType;
  onTabClick: (view: ViewType) => void;
  onTabClose: (view: ViewType, e: React.MouseEvent) => void;
  // Split Screen Props
  onSplit?: () => void;
  onCloseSplit?: () => void;
  isSecondary?: boolean;
}

const ACTIVE_TAB_COLOR = "bg-[#1e1e1e] border-t-2 border-t-cyan-500 text-slate-100";
const INACTIVE_TAB_COLOR = "bg-[#2d2d2d] text-slate-500 hover:bg-[#252526] hover:text-slate-300 border-t-2 border-transparent border-r border-[#1e1e1e]";
const SECONDARY_BG = "bg-[#1a1a1a]"; // Slightly darker for secondary header

const PanelTabs: React.FC<PanelTabsProps> = ({ 
  openTabs, 
  activeView, 
  onTabClick, 
  onTabClose,
  onSplit,
  onCloseSplit,
  isSecondary = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active tab
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-active="true"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeView, openTabs.length]);

  const getTabInfo = (view: ViewType) => {
    switch (view) {
      case 'dashboard': return { label: 'Orbital_Monitor.exe', icon: <Layout size={14} className="text-cyan-500" /> };
      case 'monitor': return { label: 'Live_Monitor.exe', icon: <Activity size={14} className="text-cyan-500" /> };
      case '3d_orb': return { label: 'Orbital_3D.exe', icon: <Globe size={14} className="text-cyan-400" /> };
      case 'risks': return { label: 'Risk_Vectors.json', icon: <ShieldAlert size={14} className="text-red-500" /> };
      case 'intel': return { label: 'System_Logs.log', icon: <FileJson size={14} className="text-yellow-500" /> };
      case 'uplink': return { label: 'Terminal.sh', icon: <TerminalSquare size={14} className="text-green-500" /> };
      case 'upload': return { label: 'Data_Ingest.sys', icon: <UploadCloud size={14} className="text-indigo-500" /> };
      case 'report': return { label: 'Intel_Report.enc', icon: <Briefcase size={14} className="text-purple-500" /> };
      case 'insights': return { label: 'Trends_Analysis.csv', icon: <LineChart size={14} className="text-blue-500" /> };
      case 'orb_ai': return { label: 'Orb_AI_Advisor.bot', icon: <Bot size={14} className="text-pink-500" /> };
      case 'settings': return { label: 'System_Config.yaml', icon: <Settings size={14} className="text-slate-400" /> };
      case 'debug': return { label: 'System_Validator.exe', icon: <Bug size={14} className="text-orange-500" /> };
      case 'more': return { label: 'Extended_Modules', icon: <ChevronsRight size={14} className="text-slate-200" /> };
      default: return { label: 'Unknown.exe', icon: <Activity size={14} /> };
    }
  };

  return (
    <div className={`flex h-9 select-none border-b border-[#1e1e1e] w-full ${isSecondary ? SECONDARY_BG : 'bg-[#252526]'}`}>
       <div 
         ref={scrollContainerRef}
         className="flex overflow-x-auto scrollbar-hide flex-1" 
         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
       >
         {openTabs.map((view) => {
           const { label, icon } = getTabInfo(view);
           const isActive = view === activeView;
           
           return (
             <div 
                key={view}
                data-active={isActive}
                onClick={() => onTabClick(view)}
                className={`flex items-center px-3 py-2 cursor-pointer text-xs min-w-fit max-w-[200px] group ${isActive ? ACTIVE_TAB_COLOR : INACTIVE_TAB_COLOR}`}
             >
                <span className="mr-2 shrink-0">{icon}</span>
                <span className={`font-mono truncate mr-2 ${isActive ? 'text-slate-100' : 'text-slate-500'}`}>{label}</span>
                
                {/* Close button now available on both primary and secondary tabs */}
                <div 
                  onClick={(e) => onTabClose(view, e)}
                  className={`ml-auto rounded p-0.5 hover:bg-slate-700/50 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <X size={12} className="text-slate-400 hover:text-white" />
                </div>
             </div>
           );
         })}
       </div>
       
       {/* Controls Area */}
       <div className={`flex items-center px-2 border-l border-[#1e1e1e] ${isSecondary ? 'bg-[#222]' : 'bg-[#252526]'}`}>
          {isSecondary ? (
             <button 
               onClick={onCloseSplit}
               className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
               title="Close Split View"
             >
               <PanelRightClose size={14} />
             </button>
          ) : (
             <button 
               onClick={onSplit}
               className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
               title="Split Editor Right"
             >
               <Columns size={14} />
             </button>
          )}
       </div>
    </div>
  );
};

export default PanelTabs;
