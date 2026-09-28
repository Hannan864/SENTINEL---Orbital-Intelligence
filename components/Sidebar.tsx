
import React from 'react';
import { 
  Layout, 
  ShieldAlert, 
  FileJson, 
  TerminalSquare, 
  Briefcase, 
  LineChart, 
  Settings, 
  Cpu,
  Activity,
  Bug,
  Bot,
  UploadCloud,
  Globe,
  ChevronsRight
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <aside className="w-12 flex flex-col items-center py-2 bg-[#333333] border-r border-[#1e1e1e] z-20 select-none pb-6">
      <div className="mb-2 p-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-cyan-400">
         <Cpu className="w-5 h-5" />
      </div>

      <div className="flex flex-col w-full items-center space-y-0.5">
        <SidebarIcon 
          icon={<Layout size={18} />} 
          active={activeView === 'dashboard'} 
          onClick={() => onViewChange('dashboard')} 
          tooltip="Dashboard"
        />
        <SidebarIcon 
          icon={<Activity size={18} />} 
          active={activeView === 'monitor'} 
          onClick={() => onViewChange('monitor')} 
          tooltip="Live Monitor"
        />
        <SidebarIcon 
          icon={<Globe size={18} />} 
          active={activeView === '3d_orb'} 
          onClick={() => onViewChange('3d_orb')} 
          tooltip="3D Orbital Map"
        />
        <SidebarIcon 
          icon={<ShieldAlert size={18} />} 
          active={activeView === 'risks'} 
          onClick={() => onViewChange('risks')} 
          tooltip="Hidden Risks"
        />
        <SidebarIcon 
          icon={<FileJson size={18} />} 
          active={activeView === 'intel'} 
          onClick={() => onViewChange('intel')} 
          tooltip="Threat Intelligence Logs"
        />
        <SidebarIcon 
          icon={<TerminalSquare size={18} />} 
          active={activeView === 'uplink'} 
          onClick={() => onViewChange('uplink')} 
          tooltip="Terminal"
        />
        <SidebarIcon 
          icon={<UploadCloud size={18} />} 
          active={activeView === 'upload'} 
          onClick={() => onViewChange('upload')} 
          tooltip="Upload Data"
        />
        <SidebarIcon 
          icon={<Briefcase size={18} />} 
          active={activeView === 'report'} 
          onClick={() => onViewChange('report')} 
          tooltip="Intel Report"
        />
        <SidebarIcon 
          icon={<LineChart size={18} />} 
          active={activeView === 'insights'} 
          onClick={() => onViewChange('insights')} 
          tooltip="Insights & Trends"
        />
        <SidebarIcon 
          icon={<Bot size={18} />} 
          active={activeView === 'orb_ai'} 
          onClick={() => onViewChange('orb_ai')} 
          tooltip="Orb-AI Advisor"
        />
        <SidebarIcon 
          icon={<Bug size={18} />} 
          active={activeView === 'debug'} 
          onClick={() => onViewChange('debug')} 
          tooltip="Debug & Validator"
        />
        
        {/* NEW MORE BUTTON */}
        <SidebarIcon 
          icon={<ChevronsRight size={18} />} 
          active={activeView === 'more'} 
          onClick={() => onViewChange('more')} 
          tooltip="More Modules"
        />
      </div>

      <div className="mt-auto flex flex-col w-full items-center">
         <SidebarIcon 
          icon={<Settings size={18} />} 
          active={activeView === 'settings'} 
          onClick={() => onViewChange('settings')} 
          tooltip="System Configuration"
        />
      </div>
    </aside>
  );
};

const SidebarIcon = ({ icon, active, onClick, tooltip }: any) => (
  <div 
    onClick={onClick}
    title={tooltip}
    className={`w-12 h-9 flex items-center justify-center cursor-pointer transition-all border-l-2 shrink-0 ${
      active 
        ? 'border-cyan-500 text-white bg-[#ffffff10]' 
        : 'border-transparent text-[#858585] hover:text-white'
    }`}
  >
    {icon}
  </div>
);

export default Sidebar;
