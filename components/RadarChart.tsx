import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { SentinelIntelPacket } from '../types';

interface RadarChartProps {
  points: SentinelIntelPacket['dashboard']['radarPoints'];
}

const RiskRadar: React.FC<RadarChartProps> = ({ points }) => {
  
  // Map level to colors
  const getColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444'; // Red
      case 'HIGH': return '#f97316'; // Orange
      case 'MEDIUM': return '#eab308'; // Yellow
      case 'LOW': return '#22d3ee'; // Cyan
      case 'SAFE': return '#10b981'; // Green
      default: return '#94a3b8';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl max-w-xs z-50">
          <div className="flex justify-between items-center mb-1">
            <span className="font-mono text-[10px] text-slate-400">{d.id}</span>
            <span className="font-bold text-[10px]" style={{color: d.fill}}>{d.level}</span>
          </div>
          <p className="font-bold text-slate-100 mb-1">{d.label}</p>
          <div className="text-[10px] text-slate-400 font-mono">
            <div>IMPACT: {d.x}</div>
            <div>PROBABILITY: {d.y}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full bg-slate-900/50 rounded-lg border border-slate-800 relative overflow-hidden">
      <div className="absolute top-2 left-2 text-xs font-mono text-slate-500 uppercase tracking-widest z-10">
        Tactical Risk Radar
      </div>
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{
             backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
             backgroundSize: '20px 20px'
           }} 
      />

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 30, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="number" dataKey="x" name="Impact" hide domain={[0, 100]} />
          <YAxis type="number" dataKey="y" name="Probability" hide domain={[0, 100]} />
          <ZAxis type="number" dataKey="z" range={[50, 400]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
          <ReferenceLine x={50} stroke="#334155" strokeDasharray="3 3" />
          
          {/* Central Zone Marker */}
          <ReferenceLine x={100} stroke="transparent" label={{ position: 'insideTopRight', value: 'HIGH IMPACT', fontSize: 10, fill: '#475569' }} />

          <Scatter name="Risks" data={points}>
            {points.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.level)} stroke="#fff" strokeWidth={1} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskRadar;
