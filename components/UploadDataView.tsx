
import React, { useState, useRef } from 'react';
import { UploadedFile, SystemConfig } from '../types';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Database, ShieldCheck, HardDrive } from 'lucide-react';

interface UploadDataViewProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  config: SystemConfig;
}

const UploadDataView: React.FC<UploadDataViewProps> = ({ files, setFiles, config }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateContent = (content: string): boolean => {
    // Basic validation: check for required columns in CSV or keys in JSON
    const required = ['timestamp', 'position', 'velocity'];
    const lower = content.toLowerCase();
    return required.every(field => lower.includes(field));
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const isValid = validateContent(text);
      
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type || 'text/plain',
        uploadDate: new Date().toISOString(),
        content: text.substring(0, 5000), // Store first 5KB for context to save memory
        isValid,
        isMounted: true // Auto-mount on upload for better UX
      };
      
      setFiles(prev => [...prev, newFile]);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatTime = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const zone = config.timeConfig.useAutoZone 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : config.timeConfig.selectedTimezone;
    
    return date.toLocaleTimeString('en-GB', { 
        timeZone: zone,
        hour12: config.timeConfig.timeFormat === '12h'
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] p-6 text-slate-300">
      <div className="mb-6 border-b border-[#333] pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center mb-1">
            <Database size={20} className="mr-2 text-cyan-500" />
            SECURE DATA UPLINK
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Ingest external telemetry for COMPANY/NASA analysis modes.
          </p>
        </div>
        <div className="text-right">
           <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
             config.dataMode === 'COMPANY' 
               ? 'bg-amber-900/30 text-amber-500 border-amber-800' 
               : 'bg-[#252526] text-slate-500 border-[#444]'
           }`}>
             STATUS: {config.dataMode === 'COMPANY' ? 'ACTIVE' : 'STANDBY'}
           </span>
        </div>
      </div>

      {/* DROP ZONE */}
      <div 
        className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-all cursor-pointer mb-8 ${
          isDragging 
            ? 'border-cyan-500 bg-cyan-900/10' 
            : 'border-[#333] hover:border-slate-500 bg-[#151515]'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept=".csv,.json,.txt"
          onChange={(e) => {
            if (e.target.files) Array.from(e.target.files).forEach(processFile);
          }}
        />
        <div className="bg-[#252526] p-4 rounded-full mb-4">
           <Upload size={32} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-200 mb-2">Drag & Drop Telemetry Files</h3>
        <p className="text-xs text-slate-500 text-center max-w-sm">
          Supports CSV, JSON, TXT. Required fields: Timestamp, Position (XYZ), Velocity (XYZ).
        </p>
      </div>

      {/* FILE LIST */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
           <HardDrive size={14} className="mr-2" /> Uploaded Datasets ({files.length})
        </h3>
        
        {files.length === 0 ? (
          <div className="text-center py-12 text-slate-600 font-mono text-xs italic">
            No datasets loaded. Analysis will rely on default models.
          </div>
        ) : (
          <div className="space-y-3">
            {files.map(file => (
              <div key={file.id} className="bg-[#252526] border border-[#333] rounded p-3 flex items-center justify-between group hover:border-slate-500 transition-colors">
                <div className="flex items-center space-x-3">
                   <div className={`p-2 rounded ${file.isValid ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                      <FileText size={18} />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-200">{file.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-2">
                         <span>{(file.size / 1024).toFixed(1)} KB</span>
                         <span>|</span>
                         <span>{formatTime(file.uploadDate)}</span>
                         <span>|</span>
                         <span className={file.isValid ? "text-green-500" : "text-red-500"}>
                            {file.isValid ? "VALID FORMAT" : "MISSING REQUIRED FIELDS"}
                         </span>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center space-x-3">
                   {file.isValid && (
                     <div className="flex items-center text-[10px] text-cyan-500 bg-cyan-900/10 px-2 py-1 rounded border border-cyan-900/30">
                        <ShieldCheck size={12} className="mr-1" />
                        LINKED
                     </div>
                   )}
                   <button 
                     onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                     className="p-1.5 hover:bg-red-900/20 text-slate-500 hover:text-red-400 rounded transition-colors"
                   >
                      <X size={14} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDataView;
