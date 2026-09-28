
import React, { useState, useRef } from 'react';
import { SystemConfig } from '../../types';
import { Eye, Upload, MessageSquare, Image as ImageIcon, X, Send } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface MultimodalReasoningProps {
    config: SystemConfig;
}

const MultimodalReasoning: React.FC<MultimodalReasoningProps> = ({ config }) => {
    const [isThinking, setIsThinking] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [imageData, setImageData] = useState<string | null>(null); // Base64 string
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (evt) => {
                const result = evt.target?.result as string;
                // Remove data URL prefix for API (if needed by specific SDK, but usually full string is fine or just base64 part)
                // Google GenAI usually expects base64 string without prefix for inlineData
                const base64 = result.split(',')[1];
                setImageData(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!query.trim()) return;
        setIsThinking(true);
        
        // Combine inputs logic handled in service
        const result = await generateModuleAnalysis('MSRE', query, config, imageData || undefined);
        
        setResponse(result);
        setIsThinking(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-blue-900/20 border border-blue-900/50 rounded">
                    <Eye size={24} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">MSRE // MULTIMODAL REASONING</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Visual & Telemetry Fusion Engine</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                
                {/* LEFT: INPUTS */}
                <div className="flex flex-col space-y-4">
                    {/* Image Upload Area */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden min-h-[200px] ${imageData ? 'border-blue-500/50 bg-blue-900/10' : 'border-slate-700 hover:border-slate-500 bg-[#1e293b]'}`}
                    >
                        {imageData ? (
                            <>
                                <img src={`data:image/png;base64,${imageData}`} alt="Uploaded Context" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                <div className="z-10 bg-black/60 p-2 rounded text-xs font-bold text-white flex items-center">
                                    <ImageIcon size={14} className="mr-2" /> Image Context Loaded
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setImageData(null); }}
                                    className="absolute top-2 right-2 p-1 bg-red-900/80 text-white rounded hover:bg-red-700 transition-colors z-20"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Upload size={32} className="text-slate-500 mb-2" />
                                <div className="text-xs text-slate-400 font-bold uppercase">Upload Visual Evidence</div>
                                <div className="text-[9px] text-slate-600 mt-1">Orbit Screenshots / Heatmaps / Graphs</div>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>

                    {/* Query Input */}
                    <div className="bg-[#1e293b] p-3 rounded border border-slate-700 flex flex-col">
                        <label className="text-[10px] text-blue-400 font-bold uppercase mb-2 block flex items-center">
                            <MessageSquare size={12} className="mr-2" /> Analyst Query
                        </label>
                        <textarea 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. 'Why did the trajectory diverge near epoch T+170?'"
                            className="w-full bg-black/30 border border-slate-600 rounded p-3 text-sm font-mono text-white focus:border-blue-500 outline-none h-24 resize-none"
                        />
                        <button 
                            onClick={handleAnalyze}
                            disabled={isThinking || !query}
                            className="mt-3 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold uppercase tracking-widest rounded flex items-center justify-center transition-all disabled:opacity-50"
                        >
                            {isThinking ? "Reasoning..." : <><Send size={14} className="mr-2" /> Analyze Correlation</>}
                        </button>
                    </div>
                </div>

                {/* RIGHT: OUTPUT */}
                <div className="bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <Eye size={14} className="mr-2" /> Reasoning Output
                    </div>
                    
                    {response ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {response}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Awaiting multimodal inputs...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MultimodalReasoning;
