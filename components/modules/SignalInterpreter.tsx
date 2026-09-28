
import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Radio, Activity, Search, Volume2, Play, AudioWaveform } from 'lucide-react';
import { generateModuleAnalysis } from '../../services/geminiService';

interface SignalInterpreterProps {
    config: SystemConfig;
}

const SignalInterpreter: React.FC<SignalInterpreterProps> = ({ config }) => {
    const [isDecoding, setIsDecoding] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [freq, setFreq] = useState(1420); // MHz
    const [snr, setSnr] = useState(15); // dB

    const handleDecode = async () => {
        setIsDecoding(true);
        const prompt = `Decode anomalous space signal.
        Frequency: ${freq} MHz (Hydrogen Line proximity). SNR: ${snr} dB.
        Signal Characteristics: Periodic pulsing with non-random prime number intervals.
        Analyze: Potential source (Pulsar, FRB, Artificial), content pattern, and scientific significance.`;

        const response = await generateModuleAnalysis('STSI', prompt, config);
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
                    <h1 className="text-xl font-bold text-white tracking-widest">STSI // SIGNAL INTERPRETER</h1>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Deep Space Anomaly Detection & Decoding</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-4 rounded border border-slate-700 space-y-4">
                        <div className="text-xs font-bold text-purple-400 uppercase flex items-center">
                            <Activity size={12} className="mr-2" /> Receiver Settings
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Activity size={10} className="mr-1 text-slate-400"/> Frequency (MHz)</span>
                                <span className="font-mono text-white">{freq}</span>
                            </div>
                            <input type="range" min="100" max="5000" value={freq} onChange={(e) => setFreq(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="flex items-center"><Volume2 size={10} className="mr-1 text-slate-400"/> Signal-to-Noise (dB)</span>
                                <span className="font-mono text-white">{snr}</span>
                            </div>
                            <input type="range" min="0" max="100" value={snr} onChange={(e) => setSnr(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </div>

                    <div className="bg-[#000] border border-slate-700 h-24 rounded flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center space-x-1 opacity-50">
                            {Array.from({length: 40}).map((_,i) => (
                                <div 
                                    key={i} 
                                    className="w-1 bg-purple-500/50 rounded-full animate-pulse" 
                                    style={{
                                        height: `${Math.random() * 80 + 10}%`, 
                                        animationDuration: `${Math.random() * 0.5 + 0.2}s`
                                    }}
                                ></div>
                            ))}
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 z-10 bg-black/50 px-2 py-1 rounded">LIVE SPECTRUM MONITOR</span>
                    </div>

                    <button 
                        onClick={handleDecode}
                        disabled={isDecoding}
                        className="w-full py-4 bg-purple-800 hover:bg-purple-700 text-white font-bold uppercase tracking-widest rounded shadow-lg shadow-purple-900/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {isDecoding ? <Search className="animate-spin mr-2" /> : <Play className="mr-2 fill-current" />}
                        {isDecoding ? "Decoding Patterns..." : "Analyze Signal"}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-[#0b0d10] border border-slate-800 rounded p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-4 border-b border-slate-800 pb-2">
                        <AudioWaveform size={14} className="mr-2" /> Decoded Intelligence
                    </div>
                    {report ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap animate-in fade-in">
                            {report}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-700 text-xs italic">
                            Acquiring signal lock...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignalInterpreter;
