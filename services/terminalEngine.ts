
import { SentinelIntelPacket, SystemConfig, Suggestion, CommandContext, UploadedFile, LiveStream } from "../types";
import { analyzeOrbit } from "./geminiService";

// --- CONSTANTS ---
const VALID_SECTORS = ["LEO-Polar-09", "GEO-Belt-01", "MEO-Nav-04", "HEO-Molniya-02"];
const MOCK_DATASETS = ["mock_leo_set.json", "legacy_debris_cat.csv", "nasa_ephemeris_v4.txt"];

// --- COMMAND DEFINITIONS ---
interface CommandDefinition {
  description: string;
  objects?: Record<string, ObjectDefinition>;
}

interface ObjectDefinition {
  description: string;
  // Dynamic targets function now receives context
  targets?: (context: { config: SystemConfig, uploadedFiles: UploadedFile[], liveStreams: LiveStream[] }) => string[]; 
  options?: string[]; // e.g. {depth=high}
  requiresUnlock?: 'scanned' | 'revealed' | 'accessed';
}

const COMMAND_REGISTRY: Record<string, CommandDefinition> = {
  scan: {
    description: "Initialize sector telemetry scan",
    objects: {
      sector: { 
          description: "Target specific orbital sector", 
          targets: ({ config }) => {
              // Sectors are valid in Mock and Company (if treating as standard sectors), 
              // but let's restrict to Mock for pure sector names to follow the request
              if (config.dataMode === 'MOCK') return VALID_SECTORS;
              return []; 
          }
      },
      dataset: { 
          description: "Scan mounted resource", 
          // Dynamic target logic: STRICT MODE FILTERING
          targets: ({ config, uploadedFiles, liveStreams }) => {
              if (config.dataMode === 'MOCK') return MOCK_DATASETS; // Only Mock files in Mock mode
              if (config.dataMode === 'COMPANY') {
                  // Only return MOUNTED company files
                  return uploadedFiles.filter(f => f.isMounted).map(f => f.name);
              }
              if (config.dataMode === 'LIVE') {
                  // Only return MOUNTED live streams
                  return liveStreams.filter(s => s.isMounted).map(s => s.name);
              }
              return [];
          }
      }
    }
  },
  fullscan: {
    description: "Execute complete intelligence cycle (Scan -> Reveal -> Access -> Generate)",
    objects: {
      sector: { 
          description: "Target sector for full analysis", 
          targets: ({ config }) => config.dataMode === 'MOCK' ? VALID_SECTORS : [] 
      }
    }
  },
  reveal: {
    description: "Decrypt hidden anomaly layers",
    objects: {
      risk: { description: "Unlock risk vectors", requiresUnlock: 'scanned', targets: () => [] }
    }
  },
  access: {
    description: "Decipher event logs and raw data",
    objects: {
      logs: { description: "Unlock system event logs", requiresUnlock: 'revealed', targets: () => [] }
    }
  },
  generate: {
    description: "Compute strategic analysis models",
    objects: {
      insights: { description: "Unlock predictive insights", requiresUnlock: 'accessed', targets: () => [] }
    }
  },
  trend: {
    description: "Visualize temporal metrics",
    objects: {
      sector: { description: "Show sector trends", requiresUnlock: 'revealed', targets: () => [] }
    }
  },
  mount: {
    description: "Mount external data source (Use Settings for Management)",
    objects: {
      dataset: { 
          description: "Load specific resource", 
          // For mounting, show UNMOUNTED resources relevant to the mode
          targets: ({ config, uploadedFiles, liveStreams }) => {
              if (config.dataMode === 'MOCK') return MOCK_DATASETS; // All mock are "mountable" conceptually
              if (config.dataMode === 'COMPANY') return uploadedFiles.filter(f => !f.isMounted).map(f => f.name);
              if (config.dataMode === 'LIVE') return liveStreams.filter(s => !s.isMounted).map(s => s.name);
              return [];
          }
      }
    }
  },
  render: {
    description: "Launch 3D Orbital Viewer Module",
    objects: {}
  },
  status: {
    description: "Check system integrity",
    objects: {
      system: { description: "Full diagnostic" }
    }
  },
  clear: {
    description: "Reset session state",
    objects: {
      session: { description: "Wipe all intelligence" }
    }
  },
  help: { description: "List available commands" }
};

// --- LOGIC ---

export const getSuggestions = (
    input: string, 
    config: SystemConfig, 
    packet: SentinelIntelPacket | null, 
    uploadedFiles: UploadedFile[] = [], 
    liveStreams: LiveStream[] = []
): Suggestion[] => {
  const parts = input.replace(/^\//, '').split(' ');
  const cmd = parts[0].toLowerCase(); // Case-insensitive match for command
  const obj = parts[1] ? parts[1].toLowerCase() : '';
  const isSlash = input.startsWith('/');

  // 1. Root Level (e.g. "/")
  if (!isSlash) return [];
  if (parts.length === 1) {
    return Object.keys(COMMAND_REGISTRY)
      .filter(k => k.startsWith(cmd))
      .map(k => ({ value: `/${k}`, description: COMMAND_REGISTRY[k].description, type: 'root' }));
  }

  // 2. Object Level (e.g. "/scan ")
  if (parts.length === 2 && COMMAND_REGISTRY[cmd]?.objects) {
    return Object.keys(COMMAND_REGISTRY[cmd].objects!)
      .filter(k => k.startsWith(obj))
      .map(k => ({ value: k, description: COMMAND_REGISTRY[cmd].objects![k].description, type: 'object' }));
  }

  // 3. Target Level (e.g. "/scan sector ")
  const targetsFilter = parts.length === 3 ? parts[2] : '';
  if (parts.length === 3 && COMMAND_REGISTRY[cmd]?.objects?.[obj]?.targets) {
    // Pass liveStreams to targets function
    const availableTargets = COMMAND_REGISTRY[cmd].objects![obj].targets!({ config, uploadedFiles, liveStreams });
    return availableTargets
      .filter(t => t.toLowerCase().includes(targetsFilter.toLowerCase()))
      .map(t => ({ value: t, description: "Valid Target", type: 'target' }));
  }

  return [];
};

export const processTerminalCommand = async (input: string, context: CommandContext) => {
  if (!input.startsWith('/')) {
    context.addLog("ERROR: Commands must start with '/'. Type /help.", 'error');
    return;
  }

  const parts = input.replace(/^\//, '').split(' ');
  const verb = parts[0].toLowerCase();
  const noun = parts[1] ? parts[1].toLowerCase() : undefined;
  const target = parts[2]; // Target is Case Sensitive

  // --- VALIDATION ---
  if (!COMMAND_REGISTRY[verb]) {
    context.addLog(`Unknown command: /${verb}`, 'error');
    return;
  }

  // RENDER (Launch 3D View)
  if (verb === 'render') {
      context.addLog("Initializing 3D Orbital Engine...", 'info');
      setTimeout(() => {
          context.onNavigate('3d_orb');
      }, 500);
      return;
  }

  // HELP
  if (verb === 'help') {
    context.addLog("AVAILABLE COMMANDS:", 'info');
    Object.keys(COMMAND_REGISTRY).forEach(key => {
      context.addLog(`/${key} - ${COMMAND_REGISTRY[key].description}`, 'info');
    });
    return;
  }

  // STATUS (Updated to check mounted files first)
  if (verb === 'status') {
    context.addLog(`SYSTEM STATUS: [${context.config.dataMode}]`, 'success');
    context.addLog(`YEAR CONTEXT: ${context.config.dataYear}`, 'info');
    
    // Check Data Availability logic
    let hasDataAvailable = false;
    
    if (context.config.dataMode === 'MOCK') {
        hasDataAvailable = true;
        context.addLog("DATA SOURCE: SIMULATION REPO (ONLINE)", 'info');
    } else if (context.config.dataMode === 'LIVE') {
        const mountedStreams = context.liveStreams.filter(s => s.isMounted);
        if (mountedStreams.length > 0) {
            hasDataAvailable = true;
            context.addLog(`DATA SOURCE: ${mountedStreams.length} LIVE STREAM(S) MOUNTED`, 'success');
            mountedStreams.forEach(s => context.addLog(`  > ${s.name} (${s.status})`, 'info'));
        } else {
            context.addLog("NO LIVE STREAMS MOUNTED. Go to Settings/Live to configure.", 'error');
        }
    } else if (context.config.dataMode === 'COMPANY') {
        // Check mounted files
        const mountedFiles = context.uploadedFiles.filter(f => f.isMounted);
        if (mountedFiles.length > 0) {
            hasDataAvailable = true;
            context.addLog(`DATA SOURCE: ${mountedFiles.length} FILE(S) MOUNTED`, 'success');
            mountedFiles.forEach(f => context.addLog(`  > ${f.name}`, 'info'));
        } else {
            context.addLog("NO DATA MOUNTED. Go to Settings/Upload to mount files.", 'error');
        }
    }

    if (context.packet) {
        context.addLog(`INTELLIGENCE STATE: Active (Confidence: ${(context.packet.metadata.confidence * 100).toFixed(0)}%)`, 'warning');
    } else {
        context.addLog("INTELLIGENCE STATE: Idle (No active analysis)", hasDataAvailable ? 'warning' : 'error');
    }
    return;
  }

  // MOUNT 
  if (verb === 'mount') {
      if (noun !== 'dataset') { context.addLog("Syntax: /mount dataset <name>", 'error'); return; }
      if (!target) { context.addLog("Missing target dataset.", 'error'); return; }
      
      // LIVE MODE MOUNT CHECK
      if (context.config.dataMode === 'LIVE') {
          const stream = context.liveStreams.find(s => s.name === target);
          if (!stream) { context.addLog(`Stream '${target}' not configured in Settings.`, 'error'); return; }
          
          if (stream.isMounted) {
              context.addLog(`Stream ${target} is already MOUNTED.`, 'success');
          } else {
              context.addLog(`Stream ${target} is UNMOUNTED. Use Settings Panel to mount.`, 'warning');
          }
          return;
      }

      // COMPANY MODE MOUNT CHECK
      if (context.config.dataMode === 'COMPANY') {
          const file = context.uploadedFiles.find(f => f.name === target);
          if (!file) { context.addLog(`File '${target}' not found in upload manifest.`, 'error'); return; }
          
          if (file.isMounted) {
              context.addLog(`Volume ${target} is already MOUNTED.`, 'success');
          } else {
              context.addLog(`Volume ${target} is UNMOUNTED. Use Settings Panel to mount securely.`, 'warning');
          }
          return;
      }

      // MOCK MODE
      context.addLog(`Mounting ${target}...`, 'info');
      await new Promise(r => setTimeout(r, 800));
      context.addLog(`Volume ${target} mounted successfully.`, 'success');
      return;
  }

  // CLEAR
  if (verb === 'clear') {
      context.setPacket(null);
      context.addLog("Session cleared. All intelligence wiped.", 'success');
      return;
  }

  // --- PROGRESSION COMMANDS ---

  // /FULLSCAN
  if (verb === 'fullscan') {
      // Fullscan is generally a Mock/Demo feature
      if (context.config.dataMode !== 'MOCK') {
          context.addLog("Fullscan macro not available in LIVE/COMPANY modes. Use granular /scan commands.", 'error');
          return;
      }
      
      if (noun !== 'sector') { context.addLog("Syntax: /fullscan sector <id>", 'error'); return; }
      if (!target) { context.addLog("Target sector required.", 'error'); return; }

      context.addLog(`INITIATING FULL SPECTRUM ANALYSIS: ${target}`, 'warning');
      context.addLog(`> Acquiring Telemetry (Year: ${context.config.dataYear})...`, 'info');

      const packet = await analyzeOrbit("Full spectrum scan request", context.config, { intent: 'DEEP', maxThreatScore: 85, verbosity: 'HIGH' }, context.uploadedFiles.filter(f => f.isMounted));
      packet.metadata.sector = target;
      packet.unlockState = { isScanned: true, isRevealed: true, isAccessed: true, isGenerated: true };
      
      context.setPacket(packet);

      setTimeout(() => context.addLog("> Telemetry Captured. [OK]", 'success'), 400);
      setTimeout(() => context.addLog("> Decrypting Risk Vectors... [OK]", 'success'), 800);
      setTimeout(() => context.addLog("> Accessing Event Logs... [OK]", 'success'), 1200);
      setTimeout(() => context.addLog("> Generating Strategic Insights... [OK]", 'success'), 1600);
      setTimeout(() => context.addLog("FULL SYSTEM UNLOCKED. ALL TABS ACTIVE.", 'success'), 1800);
      setTimeout(() => {
          context.addLog("3D RENDER GENERATED SUCCESSFULLY", 'success');
          // Auto-launch 3D view after fullscan
          context.onNavigate('3d_orb'); // Auto-redirect to 3D View to visualize results immediately
      }, 2000);
      
      return;
  }

  // /SCAN
  if (verb === 'scan') {
      // Check for dataset scan vs sector scan
      if (noun === 'dataset') {
          if (!target) { context.addLog("Target dataset required.", 'error'); return; }
          
          // COMPANY MODE CHECK
          if (context.config.dataMode === 'COMPANY') {
              const file = context.uploadedFiles.find(f => f.name === target && f.isMounted);
              if (!file) {
                  context.addLog(`Error: Dataset '${target}' not found or not mounted.`, 'error');
                  return;
              }
          }
          
          // LIVE MODE CHECK
          if (context.config.dataMode === 'LIVE') {
              const stream = context.liveStreams.find(s => s.name === target && s.isMounted);
              if (!stream) {
                  context.addLog(`Error: Stream '${target}' not connected or not mounted.`, 'error');
                  return;
              }
          }

          context.addLog(`Initiating deep scan of resource: ${target}...`, 'info');
      } else if (noun === 'sector') {
          if (context.config.dataMode !== 'MOCK') {
              context.addLog("Sector scan only available in Simulation Mode. Use /scan dataset <name> for active data.", 'error');
              return;
          }
          if (!target) { context.addLog("Target sector required.", 'error'); return; }
          context.addLog(`Initiating scan of ${target} (Year: ${context.config.dataYear})...`, 'info');
      } else {
          context.addLog("Syntax: /scan [sector|dataset] <id>", 'error'); 
          return; 
      }
      
      // Perform Generation
      const packet = await analyzeOrbit(
          `Auto-generated scan for ${target}`, 
          context.config, 
          { intent: 'ANALYSIS', maxThreatScore: 50, verbosity: 'LOW' }, 
          context.uploadedFiles.filter(f => f.isMounted)
      );
      
      // Enforce Locked State initially
      packet.unlockState = { isScanned: true, isRevealed: false, isAccessed: false, isGenerated: false };
      if (noun === 'sector') packet.metadata.sector = target;
      
      context.setPacket(packet);
      context.addLog(`SCAN COMPLETE. Found ${packet.hiddenRisks.length} potential vectors.`, 'success');
      context.addLog("Use /reveal risk <sector> to decrypt details.", 'warning');
      return;
  }

  // Check if packet exists for subsequent commands
  if (!context.packet || !context.packet.unlockState.isScanned) {
      context.addLog("ACCESS DENIED: No active scan. Run /scan dataset <id> first.", 'error');
      return;
  }

  // /REVEAL
  if (verb === 'reveal') {
      if (noun !== 'risk') { context.addLog("Syntax: /reveal risk <sector>", 'error'); return; }
      
      context.addLog("Decrypting anomaly layers...", 'info');
      await new Promise(r => setTimeout(r, 600));
      
      const newPacket = { ...context.packet };
      newPacket.unlockState.isRevealed = true;
      context.setPacket(newPacket);
      
      context.addLog("RISK VECTORS UNLOCKED. Check 'Risks' tab.", 'success');
      context.addLog("Use /access logs <sector> to view event stream.", 'warning');
      return;
  }

  // /ACCESS
  if (verb === 'access') {
      if (!context.packet.unlockState.isRevealed) { context.addLog("DENIED: Risks must be revealed first.", 'error'); return; }
      if (noun !== 'logs') { context.addLog("Syntax: /access logs <sector>", 'error'); return; }

      context.addLog("Deciphering event stream...", 'info');
      const newPacket = { ...context.packet };
      newPacket.unlockState.isAccessed = true;
      context.setPacket(newPacket);
      
      context.addLog("LOGS UNLOCKED. Check 'Intel' tab.", 'success');
      context.addLog("Use /generate insights <sector> for strategic analysis.", 'warning');
      return;
  }

  // /GENERATE
  if (verb === 'generate') {
      if (!context.packet.unlockState.isAccessed) { context.addLog("DENIED: Logs must be accessed first.", 'error'); return; }
      if (noun !== 'insights') { context.addLog("Syntax: /generate insights <sector>", 'error'); return; }

      context.addLog("Computing predictive models...", 'info');
      const newPacket = { ...context.packet };
      newPacket.unlockState.isGenerated = true;
      context.setPacket(newPacket);
      
      context.addLog("INSIGHTS GENERATED. Full system access granted.", 'success');
      return;
  }

  // /TREND
  if (verb === 'trend') {
      if (!context.packet.unlockState.isRevealed) { context.addLog("DENIED: Insufficient data. Reveal risks first.", 'error'); return; }
      context.addLog(`Fetching trend data for ${context.config.dataYear}...`, 'info');
      context.addLog("Trends projected on Dashboard.", 'success');
      return;
  }

  context.addLog("Command not recognized or context invalid.", 'error');
};
