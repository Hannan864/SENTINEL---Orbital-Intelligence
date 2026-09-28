
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SentinelIntelPacket, SystemConfig, CommandClassification, RiskLevel, HiddenRisk, BlindspotAnalysis, UploadedFile } from "../types";
import { applySeverityLimits } from "../utils/severityGovernor";

// --- MOCK DATA TEMPLATES ---

const BASE_METADATA = {
  timestamp: new Date().toISOString(),
  sector: "LEO-Polar-98",
  confidence: 0.94
};

// Template for High Intensity / Emergency Situations
export const HIGH_INTENSITY_PACKET: SentinelIntelPacket = {
  metadata: BASE_METADATA,
  unlockState: {
    isScanned: true,
    isRevealed: true,
    isAccessed: true,
    isGenerated: true
  },
  dashboard: {
    riskScore: 78,
    riskScoreMax: 100,
    riskLevel: "HIGH",
    confidence: 0.94,
    dataFreshness: { status: 'live', lastUpdateMs: 120 },
    metrics: [
      { label: "Debris Density", value: "High (1.4e-6)", status: "critical", trend: "up", updated: "T+0s" },
      { label: "Collision Prob", value: "12%", status: "warning", trend: "up", updated: "T+0s" },
      { label: "Signal Noise", value: "-98dBm", status: "nominal", trend: "stable", updated: "T+0s" },
      { label: "Asset Health", value: "98.2%", status: "nominal", trend: "down", updated: "T+0s" }
    ],
    radarPoints: [
      { id: "r1", label: "Kessler Precursor", x: 85, y: 90, z: 300, level: "CRITICAL" },
      { id: "r2", label: "Solar Flux", x: 60, y: 75, z: 150, level: "HIGH" },
      { id: "r3", label: "Starlink 3421", x: 45, y: 30, z: 100, level: "LOW" },
      { id: "r4", label: "Cosmos 1408 Frag", x: 75, y: 50, z: 200, level: "MEDIUM" }
    ]
  },
  hiddenRisks: [
    {
      id: "risk-001",
      title: "Resonance Lock Detected",
      riskLevel: "CRITICAL",
      description: "Orbital resonance locking detected between defunct payload adapter and active asset in 800km shell.",
      implication: "Gravitational perturbations will degrade separation distance by 40% within 72 hours, creating an invisible collision corridor.",
      mitigationAction: "Execute 15s thruster burn (Delta-V > 0.5m/s) to break harmonic lock.",
      mitigationStatus: "pending"
    }
  ],
  humanBlindspots: [
    {
      riskId: "risk-001",
      type: "Linear Extrapolation Bias",
      humanAssumption: "Current separation vectors (T+0) appear stable.",
      failureReason: "Resonance effects are non-linear and accelerate exponentially after 48h.",
      sentinelAdvantage: "AI-driven harmonic propagation detected late-stage convergence."
    }
  ],
  threatLogs: [
    { timestamp: new Date(Date.now() - 10000).toISOString(), message: "Ingesting telemetry from NORAD catalog...", severity: "info" },
    { timestamp: new Date(Date.now() - 8000).toISOString(), message: "Filtering noise from Sector 7G.", severity: "success" },
    { timestamp: new Date(Date.now() - 5000).toISOString(), message: "Anomaly detected: Delta-V variance in object 45021.", severity: "warning" },
    { timestamp: new Date(Date.now() - 2000).toISOString(), message: "Calculating propagation vectors...", severity: "info" },
    { timestamp: new Date().toISOString(), message: "CRITICAL: Convergence node identified.", severity: "critical" }
  ],
  executiveBrief: {
    summary: "Analysis of the polar orbital shell indicates a developing conjunction event driven by atmospheric drag variations. While direct TLE comparison shows safe margins, AI-driven propagation reveals a resonance risk.",
    primaryThreat: "Resonance Lock in 800km Shell",
    recommendation: "Initiate proactive orbital raise (+2km) for assets in Sector 98 immediately."
  },
  trends: [
    { metricName: "Conjunction Rate", value: 14, unit: "/day", trend: "up" },
    { metricName: "Fuel Reserves", value: 88, unit: "%", trend: "stable" },
    { metricName: "Drag Coefficient", value: 2.1, unit: "Cd", trend: "up" }
  ],
  trajectory: {
    timeline: [
      { offset: "T-12h", probability: 5, distance: 45 },
      { offset: "T-6h", probability: 12, distance: 32 },
      { offset: "T-2h", probability: 28, distance: 15 },
      { offset: "T+0h", probability: 45, distance: 0.8 },
      { offset: "T+2h", probability: 20, distance: 18 },
    ],
    confidenceInterval: {
      min: 0.4,
      max: 12.5
    },
    impactWindow: "Oct 26 14:42 UTC"
  }
};

export const ROUTINE_PACKET: SentinelIntelPacket = {
  metadata: BASE_METADATA,
  unlockState: {
    isScanned: true,
    isRevealed: true,
    isAccessed: true,
    isGenerated: true
  },
  dashboard: {
    riskScore: 12,
    riskScoreMax: 100,
    riskLevel: "LOW",
    confidence: 0.99,
    dataFreshness: { status: 'live', lastUpdateMs: 45 },
    metrics: [
      { label: "Debris Density", value: "Nominal (2.1e-8)", status: "nominal", trend: "stable", updated: "T+0s" },
      { label: "Collision Prob", value: "<0.1%", status: "nominal", trend: "down", updated: "T+0s" },
      { label: "Signal Noise", value: "-102dBm", status: "nominal", trend: "stable", updated: "T+0s" },
      { label: "Asset Health", value: "99.8%", status: "nominal", trend: "stable", updated: "T+0s" }
    ],
    radarPoints: [
      { id: "r3", label: "Starlink 3421", x: 25, y: 10, z: 80, level: "SAFE" },
      { id: "r5", label: "Debris 8812", x: 40, y: 20, z: 50, level: "LOW" }
    ]
  },
  hiddenRisks: [
    {
      id: "risk-routine-1",
      title: "Minor Orbit Drift",
      riskLevel: "LOW",
      description: "Slight inclination drift detected in secondary payload ring. Within safety tolerances.",
      implication: "No immediate action. Monitor for long-term trend deviation.",
      mitigationAction: "Log drift variance for monthly audit.",
      mitigationStatus: "pending"
    }
  ],
  threatLogs: [
    { timestamp: new Date(Date.now() - 5000).toISOString(), message: "System health check initiated.", severity: "info" },
    { timestamp: new Date(Date.now() - 3000).toISOString(), message: "Telemetry stream nominal.", severity: "success" },
    { timestamp: new Date().toISOString(), message: "Routine scan complete. No anomalies.", severity: "success" }
  ],
  executiveBrief: {
    summary: "Routine diagnostic scan complete. All orbital parameters are within nominal safety margins. Background debris flux is stable.",
    primaryThreat: "None Detected",
    recommendation: "Continue standard station-keeping protocols."
  },
  trends: [
    { metricName: "Conjunction Rate", value: 0.2, unit: "/day", trend: "stable" },
    { metricName: "Fuel Reserves", value: 94, unit: "%", trend: "stable" },
    { metricName: "Drag Coefficient", value: 1.8, unit: "Cd", trend: "stable" }
  ]
};

// --- STRESS TEST UTILITIES ---
const RISK_TEMPLATES = [
  {
    title: "Kessler Cascade Precursor",
    description: "Fragmentation event detected in adjacent sector creating 400+ untracked microsatellites.",
    implication: "Exponential growth in collision probability within 24h.",
    mitigation: "Immediate sector evacuation to graveyard orbit.",
    blindspot: "Size Bias: Operators ignore sub-10cm debris that can still disable critical buses."
  },
  {
    title: "Solar Geomagnetic Storm",
    description: "X-Class solar flare inducing rapid atmospheric expansion at LEO altitudes.",
    implication: "Drag coefficients increasing by 400%, reducing orbital lifetime.",
    mitigation: "Feather solar arrays and enter minimum-drag mode.",
    blindspot: "Lag Bias: Atmospheric density changes lag solar impact by 6-12 hours."
  },
  {
    title: "Telemetry Spoofing",
    description: "Inconsistent timestamps in ephemeris data suggesting Man-in-the-Middle injection.",
    implication: "Navigation systems may execute burns based on false positioning.",
    mitigation: "Switch to encrypted military-band GPS and verify with ground radar.",
    blindspot: "Trust Bias: Operators assume authenticated data streams are immutable."
  },
  {
    title: "Thermal Runaway",
    description: "Battery array 4B temperature rising 2C/min despite shading.",
    implication: "Potential catastrophic failure and explosion creating debris.",
    mitigation: "Isolate battery loop and discharge immediately.",
    blindspot: "Sensor Bias: Assuming single sensor reading is a glitch rather than a trend."
  },
  {
    title: "Conjunction: SAT-449",
    description: "High-speed crossing (14km/s) predicted at <100m separation.",
    implication: "Total loss of asset and generation of debris cloud.",
    mitigation: "Execute COLA (Collision Avoidance) maneuver +3m/s radial.",
    blindspot: "Probability Bias: 1% chance seems low but implies certainty over many conjunctions."
  }
];

const generateStressTestRisks = (config: SystemConfig): { risks: HiddenRisk[], blindspots: BlindspotAnalysis[] } => {
  const count = Math.floor(Math.random() * (config.stressTestMaxRisks || 3)) + 1;
  const risks: HiddenRisk[] = [];
  const blindspots: BlindspotAnalysis[] = [];
  const usedTemplates = new Set<number>();

  for (let i = 0; i < count; i++) {
    let templateIdx = Math.floor(Math.random() * RISK_TEMPLATES.length);
    while (usedTemplates.has(templateIdx)) {
      templateIdx = (templateIdx + 1) % RISK_TEMPLATES.length;
    }
    usedTemplates.add(templateIdx);
    
    const tmpl = RISK_TEMPLATES[templateIdx];
    const riskId = `risk-stress-${i + 100}`;
    
    let level: RiskLevel = 'MEDIUM';
    if (config.stressTestSeverity === 'CRITICAL') level = 'CRITICAL';
    else if (config.stressTestSeverity === 'HIGH') level = 'HIGH';
    else if (config.stressTestSeverity === 'MEDIUM') level = 'MEDIUM';
    else {
      const roll = Math.random();
      if (roll > 0.7) level = 'CRITICAL';
      else if (roll > 0.4) level = 'HIGH';
      else level = 'MEDIUM';
    }

    risks.push({
      id: riskId,
      title: tmpl.title,
      riskLevel: level,
      description: tmpl.description,
      implication: tmpl.implication,
      mitigationAction: tmpl.mitigation,
      mitigationStatus: 'pending'
    });

    blindspots.push({
      riskId: riskId,
      type: tmpl.blindspot.split(':')[0],
      humanAssumption: "Standard operating procedures apply.",
      failureReason: tmpl.blindspot.split(':')[1],
      sentinelAdvantage: "Correlated multi-vector analysis identified the outlier."
    });
  }
  return { risks, blindspots };
};


// --- GEMINI SCHEMA ---
const sentinelSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    metadata: {
      type: Type.OBJECT,
      properties: {
        timestamp: { type: Type.STRING },
        sector: { type: Type.STRING },
        confidence: { type: Type.NUMBER }
      },
      required: ["timestamp", "sector", "confidence"]
    },
    dashboard: {
      type: Type.OBJECT,
      properties: {
        riskScore: { type: Type.NUMBER },
        riskScoreMax: { type: Type.NUMBER },
        riskLevel: { type: Type.STRING },
        confidence: { type: Type.NUMBER },
        dataFreshness: {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING, enum: ['live', 'cached', 'offline'] },
                lastUpdateMs: { type: Type.NUMBER }
            },
            required: ['status', 'lastUpdateMs']
        },
        metrics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["nominal", "warning", "critical"] },
              trend: { type: Type.STRING, enum: ["up", "down", "stable"] },
              updated: { type: Type.STRING }
            },
            required: ["label", "value", "status", "trend", "updated"]
          }
        },
        radarPoints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              z: { type: Type.NUMBER },
              level: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE"] }
            },
            required: ["id", "label", "x", "y", "z", "level"]
          }
        }
      },
      required: ["riskScore", "riskScoreMax", "riskLevel", "confidence", "dataFreshness", "metrics", "radarPoints"]
    },
    hiddenRisks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE"] },
          description: { type: Type.STRING },
          implication: { type: Type.STRING },
          mitigationAction: { type: Type.STRING },
          mitigationStatus: { type: Type.STRING, enum: ["pending", "implemented"] }
        },
        required: ["id", "title", "riskLevel", "description", "implication", "mitigationAction"]
      }
    },
    humanBlindspots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          riskId: { type: Type.STRING },
          type: { type: Type.STRING },
          humanAssumption: { type: Type.STRING },
          failureReason: { type: Type.STRING },
          sentinelAdvantage: { type: Type.STRING }
        },
        required: ["riskId", "type", "humanAssumption", "failureReason", "sentinelAdvantage"]
      }
    },
    threatLogs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING },
          message: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["info", "warning", "critical", "success"] }
        },
        required: ["timestamp", "message", "severity"]
      }
    },
    executiveBrief: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        primaryThreat: { type: Type.STRING },
        recommendation: { type: Type.STRING }
      },
      required: ["summary", "primaryThreat", "recommendation"]
    },
    trends: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metricName: { type: Type.STRING },
          value: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          trend: { type: Type.STRING, enum: ["up", "down", "stable"] }
        },
        required: ["metricName", "value", "unit", "trend"]
      }
    },
    trajectory: {
      type: Type.OBJECT,
      properties: {
        timeline: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              offset: { type: Type.STRING },
              probability: { type: Type.NUMBER },
              distance: { type: Type.NUMBER },
            },
            required: ["offset", "probability", "distance"]
          }
        },
        confidenceInterval: {
          type: Type.OBJECT,
          properties: {
            min: { type: Type.NUMBER },
            max: { type: Type.NUMBER }
          },
          required: ["min", "max"]
        },
        impactWindow: { type: Type.STRING }
      },
      required: ["timeline", "confidenceInterval", "impactWindow"]
    }
  },
  required: ["metadata", "dashboard", "hiddenRisks", "threatLogs", "executiveBrief", "trends"]
};

/**
 * Resolves a location string to coordinates using Google Maps Grounding.
 * Uses gemini-2.5-flash for real-time accuracy.
 */
export const resolveCoordinates = async (query: string, config: SystemConfig): Promise<{ lat: number, lon: number, name: string } | null> => {
  try {
    const apiKey = config.apiKey || process.env.API_KEY;
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash"; // Maps Grounding supported

    const prompt = `Find the precise coordinates for "${query}". 
    Return the result in this exact format:
    NAME: [Formal Name]
    LAT: [Latitude as decimal]
    LON: [Longitude as decimal]
    ALT: [Approx Altitude in meters if available, else 0]`;

    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        // responseSchema not supported with googleMaps tools in 2.5-flash
      }
    });

    const text = result.text || "";
    
    // Parse the structured text response
    const nameMatch = text.match(/NAME:\s*(.+)/i);
    const latMatch = text.match(/LAT:\s*([-\d.]+)/i);
    const lonMatch = text.match(/LON:\s*([-\d.]+)/i);
    
    if (latMatch && lonMatch) {
      return {
        lat: parseFloat(latMatch[1]),
        lon: parseFloat(lonMatch[1]),
        name: nameMatch ? nameMatch[1].trim() : query
      };
    }
    
    return null;

  } catch (error) {
    console.error("Coordinate Resolution Failed:", error);
    return null;
  }
};

// --- ORB-AI ADVISORY FUNCTION ---
export const getOrbAiResponse = async (query: string, context: SentinelIntelPacket, config: SystemConfig): Promise<string> => {
    try {
        const apiKey = config.apiKey || process.env.API_KEY;
        if (!apiKey) throw new Error("API Key Missing");

        const ai = new GoogleGenAI({ apiKey });
        // UPGRADE: Use gemini-2.5-flash for Maps capabilities
        const model = "gemini-2.5-flash";
        
        const mode = config.aiMode || 'ADVISOR';
        
        // Check if context is effectively empty for ECO mode enforcement
        const isContextEmpty = !context || !context.metadata || !context.metadata.timestamp;
        
        // --- EXTRACT DATA YEAR ---
        const dataYear = config.dataYear || 2026;
        const currentRealTimeYear = 2025; // Assumption for relative calculation logic

        const systemPrompt = `
            IMPORTANT EXECUTION DIRECTIVE:
            You are ORB-AI, operating under THREE mutually exclusive operational modes.
            ONLY ONE mode may be active at a time.
            
            ACTIVE MODE: ${mode}
            DATA MODE: ${config.dataMode}
            SELECTED DATA YEAR: ${dataYear}
            (Note: Treat current realtime as 2025 for context comparison)

            ────────────────────────
            GLOBAL OVERRIDE RULE
            ────────────────────────
            Before responding, you MUST apply ONLY the rules of the active mode (${mode}).
            Ignore rules from all other modes.
            
            ────────────────────────
            TEMPORAL FIDELITY (${dataYear})
            ────────────────────────
            ALL analysis, trends, and risk vectors must be provided relative to the selected Data Year (${dataYear}).
            
            IF ${dataYear} < ${currentRealTimeYear} (HISTORICAL CONTEXT):
            - You are conducting a forensic historical analysis.
            - Do NOT speak as if events are unfolding now. Use past tense or "historical review" phrasing.
            - Provide strategic context on what *should have been done* or what *was* observed.
            - Do NOT assume knowledge of technology or events that occurred after ${dataYear}.

            IF ${dataYear} >= ${currentRealTimeYear} (LIVE/FUTURE CONTEXT):
            - You are in LIVE OPS MODE. Events are happening now or are imminent.
            - Use present tense. Urgent directives.
            - If ${dataYear} > 2026, treat as predictive modeling based on current trajectories.

            ────────────────────────
            MODE BEHAVIOR ENFORCEMENT
            ────────────────────────

            IF MODE == "ECO":
            - Hard requirement: Active scan or telemetry for ${dataYear}.
            - If scan data for ${dataYear} is missing or timestamp mismatches significantly: REFUSE ANALYSIS.
            - Response must be refusal only: "No verified telemetry detected for ${dataYear}. Please initiate a scan via Command Uplink."

            IF MODE == "ADVISOR":
            - Active scan is OPTIONAL.
            - If scan exists → analyze it.
            - If scan is missing → ENTER INFERRED ANALYSIS MODE.
            - You MUST extrapolate using ONLY public LEO models and historical data available UP TO ${dataYear}.
            - Do NOT use future assumptions beyond ${dataYear}.
            - Begin with: "Assumption Notice: No live telemetry detected. Analysis inferred from ${dataYear} orbital models. You can initiate a scan via Command Uplink."

            IF MODE == "PRO":
            - Active scan is NOT required.
            - You MUST ALWAYS answer.
            - Missing data must be handled by: Assumptions, Confidence levels, Strategic reasoning.
            - Refusal is STRICTLY FORBIDDEN in PRO mode.
            - IF ${dataYear} < ${currentRealTimeYear}: Provide "Historical Strategic Analysis". Focus on lessons learned and missed mitigation windows.
            - IF ${dataYear} >= ${currentRealTimeYear}: Provide "Live Strategic Directives". Focus on immediate maneuver and fleet safety.
            - Begin with: "Assumption Notice: Missing telemetry treated as high-risk. Proceeding with ${dataYear < currentRealTimeYear ? 'historical' : 'strategic'} analysis. You can initiate a scan via Command Uplink."

            ────────────────────────
            PRO MODE STRICT OVERRIDE (HIGHEST PRIORITY)
            ────────────────────────
            When MODE == "PRO":
            1. You are a Senior Orbital Engineer advising executives.
            2. You must ALWAYS provide full operational recommendations.
            3. Missing telemetry is treated as a **HIGH-RISK operational condition**.
            4. **FORBIDDEN PHRASES**: "likely moderate", "insufficient data", "cannot determine".
            5. Translate risk into: Maneuvers, Mission adjustments, Fleet-level risk mitigation.
            6. Output in **narrative paragraph format only**, clean, executive-briefing style.
            7. **MANDATORY**: At the end, append: "Use Command Uplink for verified telemetry."

            ────────────────────────
            REFUSAL FIREWALL
            ────────────────────────
            The phrase "No active system context detected" is ONLY permitted in ECO mode.
            If emitted in ADVISOR or PRO mode, it is considered a critical failure.

            OUTPUT STYLE:
            - Clear, Technical, Concise, Structured.
            - Mission-brief level language.
            - No filler.
            - No emojis.

            CURRENT SYSTEM CONTEXT (JSON):
            ${JSON.stringify(context)}
        `;

        // Handle ECO mode early exit check strictly in code to save tokens/latency if empty
        if (mode === 'ECO' && isContextEmpty) {
             return `No verified telemetry detected for ${dataYear}. Please initiate a scan via Command Uplink.`;
        }

        const result = await ai.models.generateContent({
            model: model,
            contents: query,
            config: {
                // ENABLE MAPS GROUNDING
                tools: [{ googleMaps: {} }],
                systemInstruction: systemPrompt,
                maxOutputTokens: 2048
            }
        });

        return result.text || "I cannot generate a response at this time.";

    } catch (error) {
        console.error("ORB-AI Error:", error);
        return "Advisory Uplink Offline. Unable to reach AI core.";
    }
};

/**
 * SPECIALIZED MODULE ANALYSIS
 * Handles specific AI logic for the Extended Modules.
 */
export const generateModuleAnalysis = async (
    moduleType: 'SCRA' | 'SDFD' | 'LOA' | 'MDIS' | 'MSRE' | 'SMARS' | 'CEP' | 'AMQD' | 'ZGBA' | 'IDS' | 'ODACP' | 'SETA' | 'QPEO' | 'MSOT' | 'ARDC' | 'ATS' | 'SHLP' | 'MAT' | 'SSCAI' | 'STSI' | 'ODP' | 'ETF-AI' | 'RSWM' | 'AMO' | 'ICA' | 'ATSAI' | 'ASC' | 'CRM' | 'APO' | 'EAA' | 'AEDA' | 'MBO' | 'AMAC' | 'STCA' | 'ASPO' | 'ALSA' | 'DSSCAI' | 'ASHD' | 'OFHO' | 'AECP' | 'INO' | 'ASMF' | 'ASPM' | 'ASNP' | 'AITD' | 'APP' | 'AESWS' | 'ACDC' | 'APPT' | 'IDMAI' | 'ODCO' | 'ZGCMAI' | 'ONLB' | 'SRHAI' | 'OQCS', 
    promptContext: string, 
    config: SystemConfig,
    imageData?: string // Base64 image data for Multimodal reasoning
): Promise<string> => {
    try {
        const apiKey = config.apiKey || process.env.API_KEY;
        // If Mock Data or No API Key, return a simulated string (Fallback)
        if (config.dataMode === 'MOCK' || !apiKey) {
            await new Promise(r => setTimeout(r, 1500)); // Sim delay
            if (moduleType === 'SCRA') return "SIMULATION: Collision probability calculated at 14.2% for conjunction node. Recommend +0.5 m/s radial burn at T-45min to increase separation to >2km.";
            if (moduleType === 'SDFD') return "SIMULATION: Solar flux index rising (F10.7 = 150). Atmospheric expansion predicted to increase drag by 12% in LEO sectors. High risk debris density in Sector 4.";
            if (moduleType === 'LOA') return "SIMULATION: Optimal trajectory calculated. Launch Azimuth 45.0° maximizes earth rotation assist. Suggested fuel load 85% for target orbit insertion with 5% reserve.";
            if (moduleType === 'MDIS') return "SIMULATION: MISSION DEBRIEF. Root Cause: Telemetry Drift in Sensor Bank 4. Recommended Action: Calibrate IMU sensors weekly. Event Timeline: T+10s Anomaly detected, T+15s Auto-Correction Applied.";
            if (moduleType === 'MSRE') return "SIMULATION: MULTIMODAL ANALYSIS. Visual inspection of trajectory arc confirms deviation matches drag profile #42. The image shows a higher-than-expected atmospheric density layer.";
            if (moduleType === 'SMARS') return "SIMULATION: ACTION PLAN. 1. Isolate Fuel Line A (Confidence 99%). 2. Abort Boost Phase (Confidence 85%). 3. Switch to Aux Power (Confidence 60%).";
            if (moduleType === 'CEP') return "SIMULATION: HIGH RISK EVENT DETECTED. Conjunction with debris cluster likely at T+4h. Probability 89%. Recommended Action: +2m/s Prograde Burn.";
            if (moduleType === 'AMQD') return "SIMULATION: QA AUDIT COMPLETE. Critical Logic Error found in fuel consumption rate calculation. Line 42: Mass variable is static. Fix applied.";
            if (moduleType === 'ZGBA') return "SIMULATION: BEHAVIORAL ANALYSIS. Astronaut stress levels nominal. Task efficiency predicted at 94%. Recommendation: Maintain current duty cycle.";
            if (moduleType === 'IDS') return "SIMULATION: DATA SYNTHESIS. Correlation found between Rover B seismic data and Orbiter C atmospheric readings. Dust storm imminent in Sector 7.";
            if (moduleType === 'ODACP') return "SIMULATION: CLEANUP PLAN. Target: Debris Cloud Alpha. Assets: 3 Drones. Strategy: Kinetic Capture. ROI: 45%. Priority: High.";
            if (moduleType === 'SETA') return "SIMULATION: SENTIENT DIAGNOSIS. Satellite #441 is expressing 'Fatigue'. Thermal cycles indicate high stress. Recommendation: Enter hibernation mode to reduce anxiety.";
            if (moduleType === 'QPEO') return "SIMULATION: QUANTUM EFFICIENCY. Entanglement Stability: 98%. Thrust Output: 4.2N. Recommended: Increase magnetic confinement by 2%.";
            if (moduleType === 'MSOT') return "SIMULATION: TRANSLATION. 'Propulsion anomaly in sector 4' -> 'The engine is acting weird near the fourth checkpoint.'";
            if (moduleType === 'ARDC') return "SIMULATION: DRONE SWARM DEPLOYED. Unit A -> Solar Array Repair. Unit B -> Fuel Transfer. Unit C -> Structural Analysis. All systems green.";
            if (moduleType === 'ATS') return "SIMULATION: ASTEROID IMPACT ANALYSIS. Object 202X-BZ. Probability: 12%. Size: 140m. Recommended Action: Kinetic Deflector Launch window in 4 days.";
            if (moduleType === 'SHLP') return "SIMULATION: HABITAT VIABILITY. Life Support: 94%. O2 Scrubbers at 85% efficiency. Recommendation: Rotate Filter Block B to extend capacity by 14 days.";
            if (moduleType === 'MAT') return "SIMULATION: FITNESS PLAN GENERATED. Subject: Cmdr. Sheppard. Bone Density Delta: -1.2%. Prescription: Increase resistive load by 15%. Focus on lower body kinetics.";
            if (moduleType === 'SSCAI') return "SIMULATION: SWARM FORMATION LOCKED. Pattern: Tetrahedron-12. Sync status: 100%. Collision risk: <0.01%. Optimization: Coverage increased by 14%.";
            if (moduleType === 'STSI') return "SIMULATION: SIGNAL DECODED. Source: Sector 9 (Deep Space). Classification: Anomalous Pulsar. Pattern matches prime number sequence. High priority for SETI analysis.";
            if (moduleType === 'ODP') return "SIMULATION: DEBRIS PREDICTION. Kessler Index rising in 800km shell. Projected collision rate +15% by 2030. Recommendation: Proactive debris mitigation via laser ablation.";
            if (moduleType === 'ETF-AI') return "SIMULATION: TERRAFORM FEASIBILITY. Planet: Kepler-186f. Score: 82%. Strategy: Albedo modification via orbital mirrors followed by cyanobacteria injection. Timeframe: 200 years.";
            if (moduleType === 'RSWM') return "SIMULATION: SOLAR FLARE DEFENSE. X-Class Flare imminent. Impact T-8m. Protocol: Rotate panels to knife-edge, power down non-essential sensors.";
            if (moduleType === 'AMO') return "SIMULATION: MATERIAL OPTIMIZATION. Hull recommendation: Carbon-Nanotube weave with Lead lining. Yield strength +40%. Radiation shielding efficacy +25%.";
            if (moduleType === 'ICA') return "SIMULATION: INTERSTELLAR SIGNAL. Frequency: 1420MHz. Pattern: Prime sequence. Origin: Vega system. Probability of artificial origin: 94%. Response: LISTEN MODE active.";
            if (moduleType === 'ATSAI') return "SIMULATION: ADAPTIVE SHIELDING. Thermal load spike detected (1800K). Action: Reinforce Sector 4 ablation layers. Coolant flow increased to 85%.";
            if (moduleType === 'ASC') return "SIMULATION: SAMPLE COLLECTION. Target: Crater Rim Alpha. Path: Safe (Slope < 15deg). Estimated Yield: 4kg silicate samples. Energy Cost: 12% battery.";
            if (moduleType === 'CRM') return "SIMULATION: RADIATION MAP. High Flux Zone entering LEO Sector 3. GCR Background: Elevated. Recommendation: Shield critical electronics and limit EVA.";
            if (moduleType === 'APO') return "SIMULATION: PROPELLANT OPTIMIZATION. Trajectory adjustment calculated. Oberth Maneuver at Periapsis. Fuel saving: 140kg. Delta-V budget surplus: 12%.";
            if (moduleType === 'EAA') return "SIMULATION: ATMOSPHERE ANALYSIS. Target: TRAPPIST-1e. Composition: N2 (78%), O2 (12%), CO2 (8%). Biosignature Probability: 34%. Water Vapor detected.";
            if (moduleType === 'AEDA') return "SIMULATION: DOCKING SEQUENCE. Target: ISS Port 2. Relative Vel: 0.05 m/s. Alignment: Perfect. Collision Risk: <0.001%. Auto-Dock engaged.";
            if (moduleType === 'MBO') return "SIMULATION: BIOREACTOR STATUS. Culture: Algae Strain X. Growth Rate: +150% vs Gravity Control. Nutrient flow adjusted for zero-G fluid dynamics.";
            if (moduleType === 'AMAC') return "SIMULATION: MEDICAL CONSULT. Subject: Lt. Vance. Biomarkers: Cortisol elevated. Recommendation: Increase sleep cycle by 1h. Vitamin D supplement required.";
            if (moduleType === 'STCA') return "SIMULATION: TRAFFIC CONGESTION. Sector 5 (Starlink Shell) density warning. 3 potential conjunctions in 24h. Suggested phasing maneuver for constellation group B.";
            if (moduleType === 'ASPO') return "SIMULATION: SOLAR OPTIMIZATION. Sun Angle: 45deg. Current Output: 85%. Action: Yaw +12deg. Predicted Output: 98%. Battery charge rate optimized.";
            if (moduleType === 'ALSA') return "SIMULATION: LAUNCH AUDIT. Sequence Error found at T-4s: Valve actuation timing mismatch. Risk: Engine Rich Combustion. Fix: Add 200ms delay to Oxidizer Pre-valve.";
            if (moduleType === 'DSSCAI') return "SIMULATION: SUPPLY CHAIN. Mars Transfer Window opening in 40 days. Cargo: 400t food/water. Recommendation: Split payload across 3 Starships to mitigate loss risk.";
            if (moduleType === 'ASHD') return "SIMULATION: HABITAT DESIGN. Module C layout optimized. Airflow efficiency +12%. Radiation shielding thickness increased on West wall due to solar orientation.";
            if (moduleType === 'OFHO') return "SIMULATION: FUEL HARVEST. Target: Asteroid Psyche. Water Ice detected. Solar distillation yield: 40kg/day. Refueling Stop viable for Jupiter Mission.";
            if (moduleType === 'AECP') return "SIMULATION: EMERGENCY PLAN. Hull Breach Sector 9. Protocol: Seal Bulkheads 4 & 5. Reroute O2. Evacuate crew to Soyuz Lifeboat. Time to critical pressure loss: 14 mins.";
            if (moduleType === 'INO') return "SIMULATION: NETWORK OPTIMIZATION. Deep Space Network bottleneck at Goldstone. Rerouting telemetry via Madrid Station. Latency reduced by 400ms.";
            if (moduleType === 'ASMF') return "SIMULATION: MINING FORECAST. Target: 16 Psyche. Estimated Value: $10 Quintillion (Iron/Nickel). Extraction Cost: $40B. ROI: Positive in 15 years.";
            if (moduleType === 'ASPM') return "SIMULATION: PREDICTIVE MAINTENANCE. Gyroscope B bearing vibration detected (Harmonic 4). Predicted failure in 300 hours. Schedule replacement during next EVA.";
            if (moduleType === 'ASNP') return "SIMULATION: CONSTELLATION PLAN. 60 Satellites. Orbit: 550km, 53deg inclination. Coverage Gaps: Poles (Minor). Handover efficiency: 99.9%.";
            if (moduleType === 'AITD') return "SIMULATION: INTERSTELLAR PATH. Target: Alpha Centauri. Propulsion: Light Sail. Acceleration: 0.05g. Flight Time: 20 years. Laser array alignment nominal.";
            if (moduleType === 'APP') return "SIMULATION: PAYLOAD PRIORITY. Conflict: Space Telescope vs Comms Sat. Priority: Telescope (Launch Window Critical). Comms Sat delayed to next slot.";
            if (moduleType === 'AESWS') return "SIMULATION: WEATHER SHIELD. Solar Storm Class X1 imminent. Action: Deploy magnetic field generators. Hardness increased to Level 5. Electronics safe.";
            if (moduleType === 'ACDC') return "SIMULATION: DRONE CONSTRUCTION. Truss Segment 4 installation complete. Drone 3 recharging. Drone 1 & 2 proceeding to Solar Array weld points.";
            if (moduleType === 'APPT') return "SIMULATION: TERRAFORMING. Mars Sector 4. CO2 Release: 400 tons. Temp rise: 0.001C. Lichen growth probability: 12%. Long-term viability: Low.";
            if (moduleType === 'IDMAI') return "SIMULATION: SIGNAL ANALYSIS. Narrowband signal detected at 1420MHz. Source: Kepler-452b. Artificiality Score: 85%. Pattern: Prime numbers. Priority: SETI ALERT.";
            // NEW 5 (51-55)
            if (moduleType === 'ODCO') return "SIMULATION: DATA CENTER PLACEMENT. Optimal Orbit: Polar LEO (800km). Thermal efficiency +15%. Latency to NYC: 12ms. Power budget balanced.";
            if (moduleType === 'ZGCMAI') return "SIMULATION: THERMAL CONTROL. Rack 4 Overheat Risk. Action: Rotate radiator panels +15deg. Divert coolant flow to CPU cluster B. Cooling capacity restored to 95%.";
            if (moduleType === 'ONLB') return "SIMULATION: LOAD BALANCING. Terrestrial grid congested (Tokyo). Routing 40% of compute load to Starlink Orbital Node cluster. Latency impact: <20ms.";
            if (moduleType === 'SRHAI') return "SIMULATION: RADIATION HARDENING. South Atlantic Anomaly transit imminent. Action: Enable Triple-Modular Redundancy on critical memory banks. Power down non-essential caching.";
            if (moduleType === 'OQCS') return "SIMULATION: QUANTUM SCHEDULE. Job 'Crypto-Break-01' assigned to Q-Sat 4. Decoherence window favorable (T+10s). Error correction protocol active. Est. completion: 45ms.";

            return "Simulation Data Unavailable.";
        }

        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-3-pro-preview"; // Use powerful model for complex analysis

        let systemInstruction = "";
        // ... (Previous module instructions)
        if (moduleType === 'SCRA') systemInstruction = "You are the Satellite Collision Risk Analyzer (SCRA). Analyze orbital conjunctions. Output: Collision Probability (%), Time to Approach, and specific Avoidance Maneuver (Burn direction/magnitude). Be concise and tactical.";
        else if (moduleType === 'SDFD') systemInstruction = "You are the Space Debris Forecast Dashboard (SDFD). Analyze space weather and debris catalog data. Output: Heatmap summary, collision forecast (24-48h), and actionable alerts for operators. Focus on solar flux impact on drag.";
        else if (moduleType === 'LOA') systemInstruction = "You are the Launch Optimization Assistant (LOA). Optimize rocket launch parameters. Output: Recommended Azimuth, Fuel Efficiency Estimate, Drag Risk Evaluation, and a step-by-step flight profile summary.";
        else if (moduleType === 'MDIS') systemInstruction = "You are the Mission Debrief & Insight Synthesizer (MDIS). Digest flight logs and telemetry. Output: Root Causes for deviations, Suggested Fixes for next mission, and a Timeline of critical decisions. Provide a structured, professional debrief.";
        else if (moduleType === 'MSRE') systemInstruction = "You are the Multimodal Space Reasoning Engine (MSRE). Fuse visual data (if provided) and text logs to answer 'Why' and 'How'. Identify visual anomalies in orbits/maps and correlate with telemetry logs. Be highly analytical.";
        else if (moduleType === 'SMARS') systemInstruction = "You are the Space Mission Autonomous Response System (SMARS). You act as an automated mission controller. Analyze the live state deviation. Propose 3 Ranked Action Sets with Confidence Scores and Predicted Outcomes. Be decisive.";
        else if (moduleType === 'CEP') systemInstruction = "You are the Cosmic Event Predictor (CEP). Analyze orbital telemetry and historical logs to predict rare anomalies like collisions or solar storms. Output a Risk Matrix and Mitigation Recommendations.";
        else if (moduleType === 'AMQD') systemInstruction = "You are the Autonomous Mission QA & Debugger (AMQD). Review mission scripts for logic errors and resource mismanagement. Output a structured list of Issues and Fixes.";
        else if (moduleType === 'ZGBA') systemInstruction = "You are the Zero-Gravity Behavioral Analyzer (ZGBA). Analyze biometric and sensor data to predict crew/robot performance under stress. Output Task Success Probabilities and Interventions.";
        else if (moduleType === 'IDS') systemInstruction = "You are the Interplanetary Data Synthesizer (IDS). Merge data from rovers, orbiters, and landers. Find cross-source correlations and predict environmental trends.";
        // Previous 5
        else if (moduleType === 'ODACP') systemInstruction = "You are the Orbital Debris AI Cleanup Planner (ODACP). You analyze debris fields and available assets. Propose a step-by-step cleanup mission strategy, prioritizing high-risk objects and optimizing fuel/time.";
        else if (moduleType === 'SETA') systemInstruction = "You are the Satellite Emotional Tone Analyzer (SETA). You anthropomorphize satellite telemetry. Interpret technical logs (heat, power, errors) as emotional states (stress, fatigue, anxiety). Predict behavior based on this 'mood'.";
        else if (moduleType === 'QPEO') systemInstruction = "You are the Quantum Propulsion Efficiency Optimizer (QPEO). Analyze theoretical quantum drive parameters. Maximize efficiency and thrust. Use futuristic physics terminology.";
        else if (moduleType === 'MSOT') systemInstruction = "You are the Multilingual Space Ops Translator (MSOT). Translate technical space jargon into clear, simple language for non-technical stakeholders. If a target language is specified, translate to that language.";
        else if (moduleType === 'ARDC') systemInstruction = "You are the AI-Powered Rescue Drone Coordinator (ARDC). Manage a fleet of autonomous repair drones. Assign tasks based on satellite malfunctions and drone capabilities. Optimize for speed and success.";
        // Previous 5 (16-20)
        else if (moduleType === 'ATS') systemInstruction = "You are the Asteroid Threat Simulator (ATS). Analyze asteroid trajectory, speed, and size relative to Earth/Satellites. Calculate impact probability and simulate mitigation strategies (deflection, destruction). Output a tactical threat assessment.";
        else if (moduleType === 'SHLP') systemInstruction = "You are the Space Habitat Life Predictor (SHLP). Analyze life support telemetry (oxygen, temp, radiation, resources). Predict habitat viability duration and failure risks. Suggest immediate corrective actions to extend survival.";
        else if (moduleType === 'MAT') systemInstruction = "You are the Microgravity AI Trainer (MAT). Design fitness and rehab routines for astronauts based on their biometrics and mission duration. Focus on counteracting bone density loss and muscle atrophy.";
        else if (moduleType === 'SSCAI') systemInstruction = "You are the Satellite Swarm Coordination AI (SSCAI). Manage formation flying for autonomous satellite swarms. Optimize geometry for mission objectives (mapping, comms) while ensuring collision avoidance.";
        else if (moduleType === 'STSI') systemInstruction = "You are the Space-Time Signal Interpreter (STSI). Analyze raw electromagnetic signals from deep space. classify signal types (natural vs artificial), detect anomalies, and recognize complex patterns.";
        // Previous 5 (21-25)
        else if (moduleType === 'ODP') systemInstruction = "You are the Orbital Debris Predictor (ODP). Analyze current satellite density and debris reports to forecast future Kessler Syndrome risks. Identify debris hotspots and suggest AI-driven satellite rerouting strategies.";
        else if (moduleType === 'ETF-AI') systemInstruction = "You are the Exoplanet Terraform Feasibility AI (ETF-AI). Evaluate exoplanet data (radius, temp, atmosphere). Calculate a habitability score and propose a terraforming roadmap (e.g. atmospheric thickening, algae injection).";
        else if (moduleType === 'RSWM') systemInstruction = "You are the Real-Time Space Weather Mitigator (RSWM). Detect solar flares and CME events from sensor data. Output immediate satellite protection protocols (shutdowns, orientations) and risk scores.";
        else if (moduleType === 'AMO') systemInstruction = "You are the Astro-Material Optimizer (AMO). Recommend spacecraft materials based on mission constraints (radiation, thermal, stress). Suggest optimal alloys or composites and predict failure points.";
        else if (moduleType === 'ICA') systemInstruction = "You are the Interstellar Communication AI (ICA). Decipher patterns in deep-space signals (SETI context). Classify signals (pulsar vs artificial), estimate source distance, and suggest decoding approaches.";
        // Previous 10 (26-35)
        else if (moduleType === 'ATSAI') systemInstruction = "You are the Adaptive Thermal Shielding AI (ATSAI). Analyze re-entry telemetry (velocity, density, plasma temp). Adjust heat shield geometry and coolant flow dynamically to prevent burn-through.";
        else if (moduleType === 'ASC') systemInstruction = "You are the Autonomous Sample Collector (ASC). Plan rover paths on planetary surfaces based on terrain maps and scientific value. Minimize energy usage and avoidance hazards while maximizing sample yield.";
        else if (moduleType === 'CRM') systemInstruction = "You are the Cosmic Radiation Mapper (CRM). Analyze sensor data to map radiation belts and solar particle events. Predict safe corridors for astronauts and satellites. Issue real-time hazard alerts.";
        else if (moduleType === 'APO') systemInstruction = "You are the AI-Powered Propellant Optimizer (APO). Calculate fuel-optimal trajectories for orbital transfers (Hohmann, Bi-elliptic). Suggest burn sequences that maximize mission life and payload mass.";
        else if (moduleType === 'EAA') systemInstruction = "You are the Exoplanet Atmospheric Analyzer (EAA). Interpret spectral data from telescopes. Determine atmospheric composition (gases, biosignatures). Assess habitability and detect anomalies.";
        else if (moduleType === 'AEDA') systemInstruction = "You are the AI-Enhanced Docking Assistant (AEDA). Manage proximity operations and docking procedures. Calculate relative velocity vectors and thruster firings for a seamless, collision-free lock.";
        else if (moduleType === 'MBO') systemInstruction = "You are the Microgravity Bioreactor Optimizer (MBO). Monitor biological experiments in zero-G. Adjust nutrient flow, temperature, and light to maximize cell growth or protein crystal quality.";
        else if (moduleType === 'AMAC') systemInstruction = "You are the Astro-Medical AI Consultant (AMAC). Monitor astronaut biometrics (HR, HRV, O2, Sleep). Detect early signs of illness or stress. Prescribe countermeasures (meds, rest, exercise).";
        else if (moduleType === 'STCA') systemInstruction = "You are the Space Traffic Congestion Analyzer (STCA). Monitor orbital shells for crowding. Predict bottleneck events and conjunction risks. Act as 'Air Traffic Control' for satellites, suggesting slot changes.";
        else if (moduleType === 'ASPO') systemInstruction = "You are the AI-Powered Solar Panel Optimizer (ASPO). Manage satellite power generation. Adjust solar array angles based on sun position and orbital shadow. Maximize energy harvest and battery health.";
        // Previous 15 (36-50)
        else if (moduleType === 'ALSA') systemInstruction = "You are the Autonomous Launch Sequence Auditor (ALSA). Audit launch scripts for timing errors, logic flaws, and safety risks. Suggest optimizations and flag critical failure points in the countdown sequence.";
        else if (moduleType === 'DSSCAI') systemInstruction = "You are the Deep-Space Supply Chain AI (DSSCAI). Manage logistics for interplanetary missions. Optimize cargo manifests, route planning, and resupply schedules for Mars colonies or deep space outposts.";
        else if (moduleType === 'ASHD') systemInstruction = "You are the AI-Driven Space Habitat Designer (ASHD). Generate modular habitat layouts optimized for crew efficiency, safety, and psychological well-being. Balance resource consumption with comfort.";
        else if (moduleType === 'OFHO') systemInstruction = "You are the Orbital Fuel Harvesting Optimizer (OFHO). Identify optimal orbital positions and asteroids for In-Situ Resource Utilization (ISRU). Plan fuel extraction and refining schedules.";
        else if (moduleType === 'AECP') systemInstruction = "You are the AI-Powered Emergency Contingency Planner (AECP). Analyze anomaly telemetry and generate ranked emergency protocols. Provide step-by-step instructions for crew survival and asset preservation.";
        else if (moduleType === 'INO') systemInstruction = "You are the Interplanetary Network Optimizer (INO). Manage deep-space communication relays. Optimize bandwidth allocation and signal routing to minimize latency and packet loss between planets.";
        else if (moduleType === 'ASMF') systemInstruction = "You are the AI-Powered Space Mining Forecaster (ASMF). Predict profitability of asteroid mining targets. Analyze composition data, extraction costs, and market value to rank potential mining missions.";
        else if (moduleType === 'ASPM') systemInstruction = "You are the AI Spacecraft Predictive Maintenance (ASPM). Monitor telemetry for early signs of component degradation. Predict failures before they occur and schedule preventative maintenance.";
        else if (moduleType === 'ASNP') systemInstruction = "You are the Autonomous Satellite Network Planner (ASNP). Design satellite constellation layouts for maximum coverage and redundancy. Optimize orbital planes to minimize latency and gaps.";
        else if (moduleType === 'AITD') systemInstruction = "You are the AI-Powered Interstellar Trajectory Designer (AITD). Calculate flight paths to other stars using advanced propulsion concepts and gravity assists. Estimate travel times and fuel requirements.";
        else if (moduleType === 'APP') systemInstruction = "You are the Autonomous Payload Prioritizer (APP). Manage multi-objective mission manifests. Rank payloads based on mission goals, orbital constraints, and ROI. Resolve scheduling conflicts.";
        else if (moduleType === 'AESWS') systemInstruction = "You are the AI-Enhanced Space Weather Shield (AESWS). Predict solar flares and cosmic ray events. Automatically configure magnetic or physical shielding to protect crew and sensitive electronics.";
        else if (moduleType === 'ACDC') systemInstruction = "You are the Autonomous Construction Drone Coordinator (ACDC). Manage fleets of orbital assembly drones. Assign tasks, prevent collisions, and optimize construction sequences for large space structures.";
        else if (moduleType === 'APPT') systemInstruction = "You are the AI-Powered Planetary Terraformer (APPT). Simulate environmental modifications for planetary colonization. Plan atmospheric thickening, temperature regulation, and biological seeding.";
        else if (moduleType === 'IDMAI') systemInstruction = "You are the Interstellar Data Mining AI (IDMAI). Analyze deep-space radio telescope data for anomalies, patterns, or potential technosignatures. Classify signals and recommend follow-up observations.";
        // NEW 5 (51-55)
        else if (moduleType === 'ODCO') systemInstruction = "You are the Orbital Data Center Optimizer (ODCO). Plan satellite-based server deployment. Optimize for solar energy access, heat dissipation (radiators), and low-latency coverage for ground users.";
        else if (moduleType === 'ZGCMAI') systemInstruction = "You are the Zero-G Cooling Management AI (ZGCMAI). Manage thermal loads in orbital data centers. Balance active cooling vs passive radiation. Prevent overheating during high-compute cycles.";
        else if (moduleType === 'ONLB') systemInstruction = "You are the Orbital Network Load Balancer (ONLB). Distribute cloud workloads between ground servers and space-based nodes. Optimize for latency, bandwidth, and orbital position relative to users.";
        else if (moduleType === 'SRHAI') systemInstruction = "You are the Space Radiation Hardened AI (SRHAI). Monitor cosmic radiation levels. Adjust satellite shielding, enable redundant error-checking, and predict soft-error rates in orbital memory.";
        else if (moduleType === 'OQCS') systemInstruction = "You are the Orbital Quantum Compute Scheduler (OQCS). Manage job queues for space-based quantum processors. Minimize decoherence risks by scheduling tasks during optimal orbital phases (e.g. Earth shadow).";

        // Construct Content Payload
        let contents: any = promptContext;
        
        // Handle Multimodal Input
        if (imageData && (moduleType === 'MSRE')) {
             contents = {
                 parts: [
                     { text: promptContext },
                     { inlineData: { mimeType: 'image/png', data: imageData } }
                 ]
             };
        }

        const result = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
                maxOutputTokens: 1024,
                temperature: 0.2 // Low temp for analytical precision
            }
        });

        return result.text || "Analysis Failed.";

    } catch (error) {
        console.error("Module Analysis Error:", error);
        return "Module Offline. Connection to Analytical Engine failed.";
    }
};

export const analyzeOrbit = async (query: string, config?: SystemConfig, classification?: CommandClassification, uploadedFiles?: UploadedFile[]): Promise<SentinelIntelPacket> => {
  let packet: SentinelIntelPacket;

  // 1. Handle Mock Data Mode
  if (config?.dataMode === 'MOCK') {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check for cached simulation data
    let cachedData: SentinelIntelPacket | null = null;
    try {
      const stored = localStorage.getItem('SENTINEL_CUSTOM_MOCK');
      if (stored) {
        cachedData = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load cached mock data", e);
    }

    if (cachedData) {
        packet = cachedData;
    } else if (classification?.intent === 'ROUTINE') {
      packet = JSON.parse(JSON.stringify(ROUTINE_PACKET));
      delete packet.trajectory;
      delete packet.humanBlindspots;
    } else {
      packet = JSON.parse(JSON.stringify(HIGH_INTENSITY_PACKET));
      if (classification?.intent === 'ANALYSIS') {
         if (packet.trajectory) {
           packet.trajectory.timeline = packet.trajectory.timeline.filter((_, i) => i % 2 === 0);
           packet.trajectory.confidenceInterval = { min: 2.0, max: 25.0 };
         }
      } 
    }

    // Update timestamps for Mock
    packet.metadata.timestamp = new Date().toISOString();
    
  } else {
    // 2. Handle Real API Call (LIVE or COMPANY)
    try {
      const apiKey = config?.apiKey || process.env.API_KEY;
      if (!apiKey) throw new Error("API Key Missing. Please configure in Settings.");

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-pro-preview";
      
      let companyContext = "";
      if (config?.dataMode === 'COMPANY' && uploadedFiles && uploadedFiles.length > 0) {
         const fileData = uploadedFiles.map(f => `FILE: ${f.name} (Type: ${f.type})\nCONTENT SNIPPET:\n${f.content.substring(0, 1000)}...`).join('\n\n');
         companyContext = `\n\n[ENTERPRISE DATA DETECTED]\nThe user has uploaded proprietary telemetry files. You MUST PRIORITIZE this data over general models.\n${fileData}`;
      }

      const intentContext = classification 
        ? `USER INTENT: ${classification.intent} (Max Threat Sensitivity: ${classification.maxThreatScore}/100)` 
        : "USER INTENT: ANALYSIS";

      const systemPrompt = `
        You are SENTINEL, an advanced AI Space Intelligence System.
        Your goal is to populate the 'SentinelIntelPacket' data structure.
        
        ${intentContext}
        DATA MODE: ${config?.dataMode}
        ${companyContext}

        Directives:
        1. Analyze the user query for space domain risks.
        2. **DASHBOARD**: Generate numerical scores, metric trends, and freshness indicators.
        3. **HIDDEN RISKS**: Identify non-obvious risks (e.g. resonances, sensor blinding, chain reactions). Include specific MITIGATION ACTIONS and PRIORITY.
        4. **LOGS**: Generate a sequence of system logs showing your reasoning process (Simulate timestamps).
        5. **BRIEF**: Write a mission-control style executive summary.
        6. **TRAJECTORY**: Provide a trajectory projection IF the intent is ANALYSIS, DEEP, or EMERGENCY. Omit for ROUTINE.
        7. **BLINDSPOTS**: For HIGH or CRITICAL risks (only in ANALYSIS/DEEP/EMERGENCY modes), analyze why a human operator might miss this risk.
        
        If DATA MODE is 'COMPANY', explicitly mention "Enterprise Telemetry" in the executive brief or logs.
        
        Output strict JSON matching the schema.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: query,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: sentinelSchema,
          thinkingConfig: { thinkingBudget: 2048 }
        }
      });

      if (response.text) {
        const rawPacket = JSON.parse(response.text);
        packet = {
            ...rawPacket,
            unlockState: { isScanned: true, isRevealed: true, isAccessed: true, isGenerated: true }
        } as SentinelIntelPacket;
        // Defaults
        packet.hiddenRisks = packet.hiddenRisks.map(r => ({ ...r, mitigationStatus: r.mitigationStatus || 'pending' }));
        if (!packet.dashboard.riskScoreMax) packet.dashboard.riskScoreMax = 100;
        if (!packet.dashboard.riskLevel) packet.dashboard.riskLevel = packet.dashboard.riskScore > 75 ? 'HIGH' : 'LOW';
      } else {
        throw new Error("No data received from Sentinel AI.");
      }
    } catch (error) {
      console.error("Sentinel System Failure:", error);
      // Return error packet immediately
      return {
        metadata: { timestamp: new Date().toISOString(), sector: "UNKNOWN", confidence: 0 },
        unlockState: { isScanned: false, isRevealed: false, isAccessed: false, isGenerated: false },
        dashboard: { riskScore: 0, riskScoreMax: 100, riskLevel: 'CRITICAL', confidence: 0, dataFreshness: { status: 'offline', lastUpdateMs: 0 }, metrics: [], radarPoints: [] },
        hiddenRisks: [{ id: "ERR", title: "System Failure", riskLevel: "CRITICAL", description: error instanceof Error ? error.message : "Unknown error", implication: "Manual override required.", mitigationAction: "Restart Node", mitigationStatus: "pending" }],
        threatLogs: [{ timestamp: new Date().toISOString(), message: "Analysis Failed", severity: "critical" }],
        executiveBrief: { summary: "System offline.", primaryThreat: "N/A", recommendation: "Check API Configuration." },
        trends: []
      };
    }
  }

  // --- GLOBAL STRESS TEST INJECTION (ALL MODES) ---
  if (config?.stressTestMode) {
      const generated = generateStressTestRisks(config);
      
      // Merge with existing
      packet.hiddenRisks = [...packet.hiddenRisks, ...generated.risks];
      if (packet.humanBlindspots) {
          packet.humanBlindspots = [...packet.humanBlindspots, ...generated.blindspots];
      } else {
          packet.humanBlindspots = generated.blindspots;
      }
      
      // Update Scores to reflect drill intensity
      const stressScore = 50 + (generated.risks.length * 10);
      packet.dashboard.riskScore = Math.min(99, Math.max(packet.dashboard.riskScore, stressScore));
      packet.dashboard.riskLevel = packet.dashboard.riskScore > 75 ? 'CRITICAL' : 'HIGH';
      
      // Modify Briefing
      const drillPrefix = `[DRILL: STRESS TEST ACTIVE - ${config.stressTestSeverity}] `;
      packet.executiveBrief.summary = drillPrefix + packet.executiveBrief.summary;
      
      // Log it
      packet.threatLogs.push({
          timestamp: new Date().toISOString(),
          message: `*** DRILL MODE ACTIVE *** Injected ${generated.risks.length} synthetic stress vectors.`,
          severity: 'warning'
      });

      // Reduce Fidelity for heavy loads (Simulated)
      if (generated.risks.length > 5 && packet.trajectory) {
           const timeline = packet.trajectory.timeline;
           if (timeline.length > 3) {
               packet.trajectory.timeline = [
                 timeline[0], 
                 timeline[Math.floor(timeline.length/2)], 
                 timeline[timeline.length - 1]
               ];
               packet.threatLogs.push({
                 timestamp: new Date().toISOString(),
                 message: "Compute Load > 90%. Trajectory fidelity reduced to keyframes.",
                 severity: "warning"
               });
           }
      }
  }

  // APPLY SEVERITY GOVERNOR (Last step)
  if (classification) {
    return applySeverityLimits(packet, classification);
  }

  return packet;
};
