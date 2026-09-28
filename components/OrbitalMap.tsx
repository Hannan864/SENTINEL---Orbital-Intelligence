import React, { useEffect, useRef } from 'react';
import { SentinelIntelPacket } from '../types';

interface OrbitalMapProps {
  active: boolean; // Controls the "Scanning" radar line
  points?: SentinelIntelPacket['dashboard']['radarPoints']; // Controls the dots shown
}

interface Satellite {
  angle: number;
  speed: number;
  radius: number;
  size: number;
  color: string;
  label?: string;
  pulse?: boolean;
}

const OrbitalMap: React.FC<OrbitalMapProps> = ({ active, points }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const satellitesRef = useRef<Satellite[]>([]);
  const pointsRef = useRef(points);

  // Update satellites when points data changes
  useEffect(() => {
    pointsRef.current = points;
    
    if (points && points.length > 0) {
      // Map actual risk data to visual satellites
      satellitesRef.current = points.map((p, i) => {
        let color = '#22d3ee'; // Default Cyan
        let size = 2;
        let pulse = false;

        if (p.level === 'CRITICAL') { color = '#ef4444'; size = 4; pulse = true; } // Red
        else if (p.level === 'HIGH') { color = '#f97316'; size = 3; } // Orange
        else if (p.level === 'MEDIUM') { color = '#eab308'; size = 2.5; } // Yellow

        return {
          angle: (i / points.length) * Math.PI * 2 + Math.random(), // Distribute
          speed: 0.002 + Math.random() * 0.005,
          radius: 60 + Math.random() * 100, // Varied depth
          size,
          color,
          label: p.id,
          pulse
        };
      });
    } else {
      // Default / Idle Mode: Show generic traffic
      satellitesRef.current = Array.from({ length: 15 }).map(() => ({
        angle: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.01,
        radius: 80 + Math.random() * 60,
        size: Math.random() > 0.8 ? 2.5 : 1.5,
        color: Math.random() > 0.9 ? '#64748b' : '#0e7490', // Dimmer colors for idle
        pulse: false
      }));
    }
  }, [points]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      
      // CRITICAL FIX: If tab is hidden (display: none), rect is 0. 
      // Skip render to avoid destroying canvas state, but keep loop alive.
      if (rect.width === 0 || rect.height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Handle High DPI
      const dpr = window.devicePixelRatio || 1;
      
      // Only resize if dimensions changed to avoid flickering
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          ctx.scale(dpr, dpr);
      }
      
      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2;

      // Clear
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Draw Earth
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      
      // Earth Atmosphere Glow
      const gradient = ctx.createRadialGradient(cx, cy, 35, cx, cy, 60);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.1)'); // Sky blue low opacity
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fill();

      // Earth Wireframe Grid (Static)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.stroke();
      
      // Crosshairs
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
      ctx.moveTo(0, cy); ctx.lineTo(width, cy);
      ctx.stroke();

      // Draw Satellites
      satellitesRef.current.forEach(sat => {
        sat.angle += active ? sat.speed * 2 : sat.speed; // Speed up when scanning
        const x = cx + Math.cos(sat.angle) * sat.radius;
        const y = cy + Math.sin(sat.angle) * (sat.radius * 0.4); // Elliptical orbit

        // Draw Trail
        ctx.beginPath();
        ctx.arc(x, y, sat.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `${sat.color}11`; // Very transparent trail
        ctx.fill();

        // Draw Satellite
        ctx.beginPath();
        ctx.arc(x, y, sat.size, 0, Math.PI * 2);
        ctx.fillStyle = sat.color;
        ctx.fill();

        // Pulse Effect for Critical
        if (sat.pulse) {
           const pulseSize = sat.size + Math.sin(time * 5) * 2;
           ctx.beginPath();
           ctx.arc(x, y, Math.max(0, pulseSize), 0, Math.PI * 2);
           ctx.strokeStyle = sat.color;
           ctx.lineWidth = 0.5;
           ctx.stroke();
        }
      });

      // Scanner Line (Active only)
      if (active) {
        time += 0.05;
        const scanY = (Math.sin(time * 2) * height / 2) + cy;
        
        // Scan Line
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)'; // Cyan
        ctx.lineWidth = 2;
        ctx.stroke();

        // Scan Glow
        const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
        scanGrad.addColorStop(0, 'rgba(34, 211, 238, 0)');
        scanGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.1)');
        scanGrad.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 20, width, 40);
        
        // Scan Text
        ctx.fillStyle = '#22d3ee';
        ctx.font = '10px monospace';
        ctx.fillText('SCANNING SECTOR...', 10, scanY - 5);
      } else {
        time += 0.01; // Slower time passage when idle
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [active]); // Re-bind if active state changes, but points update via ref

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
       <canvas ref={canvasRef} className="w-full h-full block" />
       <div className="absolute bottom-2 right-2 text-[10px] font-mono flex items-center space-x-2">
         {active ? (
            <span className="text-cyan-400 animate-pulse">● ACQUIRING TARGETS</span>
         ) : points ? (
            <span className="text-slate-500">● MONITORING ACTIVE</span>
         ) : (
            <span className="text-slate-600">● IDLE</span>
         )}
       </div>
    </div>
  );
};

export default OrbitalMap;
