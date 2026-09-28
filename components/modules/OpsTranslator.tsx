
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Languages, ArrowRightLeft, FileText, CheckCircle, MessageSquare } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface OpsTranslatorProps {
    config: SystemConfig;
}

const OpsTranslator: React.FC<OpsTranslatorProps> = ({ config }) => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [output, setOutput] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [targetLang, setTargetLang] = useState("Simplified English");

    const handleTranslate = async () => {
        if (!input.trim()) return;
        setIsTranslating(true);
        const prompt = `Translate and simplify the following Space Operations text.
        Target Audience/Language: ${targetLang}.
        Context: Explain technical jargon clearly for non-engineers.
        TEXT:
        ${input}`;

        const response = await generateModuleAnalysis('MSOT', prompt, config);
        setOutput(response);
        setIsTranslating(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-teal-900/20 border border-teal-900/50 rounded">
                    <Languages size={24} className="text-teal-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">MSOT // OPS TRANSLATOR</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Multilingual Technical Simplification Engine</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                <div className="flex flex-col space-y-4">
                    <div className="bg-[#1e293b] p-3 rounded border border-slate-700">
                        <label className="text-[10px] text-teal-400 font-bold uppercase mb-2 block">Target Language / Context</label>
                        <select 
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                            className="w-full bg-black/30 border border-slate-600 rounded p-2 text-sm font-mono text-white focus:border-teal-500 outline-none"
                        >
                            <option value="Simplified English">Simplified English (Executive Brief)</option>
                            <option value="Spanish">Spanish (Español)</option>
                            <option value="French">French (Français)</option>
                            <option value="Japanese">Japanese (日本語)</option>
                            <option value="Russian">Russian (Русский)</option>
                            <option value="Mandarin">Mandarin (中文)</option>
                        </select>
                    </div>

                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste technical logs, commands, or engineering jargon here..."
                        className="flex-1 bg-[#1e293b] border border-slate-700 rounded p-3 text-sm font-mono text-slate-300 focus:border-teal-500 outline-none resize-none"
                    />
                    
                    <button 
                        onClick={handleTranslate}
                        disabled={isTranslating || !input}
                        className="py-3 bg-teal-700 hover:bg-teal-600 text-white font-bold uppercase tracking-widest rounded flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isTranslating ? <ArrowRightLeft className="animate-spin mr-2" /> : <MessageSquare className="mr-2 fill-current" />}
                        {isTranslating ? "Translating..." : "Translate & Simplify"}
                    </button>
                </div>

                <div className="bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <FileText size={14} className="mr-2" /> Translated Briefing
                    </div>
                    {output ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {output}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Awaiting input text...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpsTranslator;
