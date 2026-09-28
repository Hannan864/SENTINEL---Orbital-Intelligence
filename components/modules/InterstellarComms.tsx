
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Radio, Activity, Search, Volume2, Play, AudioWaveform, MessageCircle } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface InterstellarCommsProps {
    config: SystemConfig;
}

const InterstellarComms: React.FC<InterstellarCommsProps> = ({ config }) => {
    const [isDecoding, setIsDecoding] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [freq, setFreq] = useState(1420); // MHz
    const [pattern, setPattern] = useState("Pulse Sequence");

    const handleDecode = async () => {
        setIsDecoding(true);
        const prompt = `Analyze Interstellar Signal.
        Frequency: ${freq} MHz. Pattern Type: ${pattern}.
        Detect potential extraterrestrial origin (SETI protocol).
        Classify as Natural (Pulsar) vs Artificial.
        If artificial, attempt basic mathematical decoding (primes, pi, geometry).`;

        const response = await generateModuleAnalysis('ICA', prompt, config);
        setReport(response);
        setIsDecoding(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-300 font-sans p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-6">
                <div className="p-2 bg-purple-900/20 border border-purple-900/50 rounded">
                    <Radio size={24} className="text-purple-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest">ICA // INTERSTELLAR COMMS</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Deep Space Signal Analysis & First Contact Protocol</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-purple-400 uppercase flex items-center">
                            <Activity size={12} className="mr-2" /> Signal Capture
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Volume2 size={10} className="mr-1 text-slate-400"/> Frequency (MHz)</span>
                                <span className="font-mono text-white">{freq}</span>
                            </div>
                            <input type="range" min="100" max="5000" value={freq} onChange={(e) => setFreq(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Pattern Signature</label>
                            <select value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full bg-black/30 border border-slate-600 rounded p-2 text-xs font-mono text-white">
                                <option value="Pulse Sequence">Regular Pulse Sequence</option>
                                <option value="Narrowband">Narrowband Continuous</option>
                                <option value="Chirp">Frequency Chirp</option>
                                <option value="Binary Stream">Complex Binary Stream</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-[#000] border border-slate-700 h-24 rounded flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center space-x-0.5 opacity-60">
                            {Array.from({length: 60}).map((_,i) => (
                                <div 
                                    key={i} 
                                    className="w-0.5 bg-purple-500/50" 
                                    style={{
                                        height: `${Math.random() * 100}%`, 
                                        opacity: Math.random()
                                    }}
                                ></div>
                            ))}
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 z-10 bg-black/50 px-2 py-1 rounded">SPECTROGRAM LIVE</span>
                    </div>

                    <button 
                        onClick={handleDecode}
                        disabled={isDecoding}
                        className="w-full py-4 bg-purple-800 hover:bg-purple-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-purple-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isDecoding ? <Search className="animate-spin mr-2" /> : <MessageCircle className="mr-2 fill-current" />}
                        {isDecoding ? "Deciphering Syntax..." : "Analyze Signal"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <AudioWaveform size={14} className="mr-2" /> Decoded Transmission
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Listening on configured band...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterstellarComms;
