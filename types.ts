
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';

export type DataMode = 'MOCK' | 'LIVE' | 'COMPANY';

export interface TrajectoryPoint {
  offset: string; // e.g. "T+12h"
  probability: number; // 0-100%
  distance: number; // km
}

export interface TrajectoryProjection {
  timeline: TrajectoryPoint[];
  confidenceInterval: {
    min: number; // km
    max: number; // km
  };
  impactWindow: string; // e.g. "Oct 24 14:00 UTC"
}

export interface BlindspotAnalysis {
  riskId: string; // Links to hiddenRisks.id
  type: string; // e.g. "Time Horizon Bias"
  humanAssumption: string;
  failureReason: string;
  sentinelAdvantage: string;
}

export interface HiddenRisk {
  id: string;
  title: string;
  riskLevel: RiskLevel;
  description: string;
  implication: string;
  mitigationAction: string;
  mitigationStatus: 'pending' | 'implemented';
}

export interface SentinelIntelPacket {
  metadata: {
    timestamp: string;
    sector: string;
    confidence: number; // 0.0 to 1.0
  };
  // Progression Flags for the Command Engine
  unlockState: {
    isScanned: boolean;
    isRevealed: boolean;
    isAccessed: boolean;
    isGenerated: boolean;
  };
  dashboard: {
    riskScore: number; // 0 to 100
    riskScoreMax: number;
    riskLevel: string;
    confidence: number;
    dataFreshness: {
      status: 'live' | 'cached' | 'offline';
      lastUpdateMs: number;
    };
    metrics: Array<{ 
      label: string; 
      value: string; 
      status: 'nominal' | 'warning' | 'critical';
      trend: 'up' | 'down' | 'stable';
      updated: string;
    }>;
    radarPoints: Array<{
      id: string;
      label: string;
      x: number; // Impact 0-100
      y: number; // Probability 0-100
      z: number; // Size/Severity
      level: RiskLevel;
    }>;
  };
  hiddenRisks: Array<HiddenRisk>;
  humanBlindspots?: Array<BlindspotAnalysis>;
  threatLogs: Array<{
    timestamp: string;
    message: string;
    severity: 'info' | 'warning' | 'critical' | 'success';
  }>;
  executiveBrief: {
    summary: string;
    primaryThreat: string;
    recommendation: string;
  };
  trends: Array<{
    metricName: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  trajectory?: TrajectoryProjection;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export type ViewType = 'dashboard' | 'monitor' | '3d_orb' | 'risks' | 'intel' | 'uplink' | 'upload' | 'report' | 'insights' | 'settings' | 'debug' | 'orb_ai' | 'more';

export interface TimeConfig {
  useAutoTime: boolean;
  useAutoZone: boolean;
  selectedTimezone: string; // IANA string e.g. 'America/New_York'
  manualTime?: string; // ISO string
  timeFormat: '12h' | '24h';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  content: string; // Parsed content or raw string
  isValid: boolean;
  isMounted: boolean; // New field for mount status
}

export interface LiveStream {
  id: string;
  name: string;
  url: string;
  status: 'CONNECTED' | 'ERROR' | 'OFFLINE';
  addedDate: string;
  isMounted: boolean;
}

export interface SystemConfig {
  dataMode: DataMode; // Replaces useMockData
  enableGeminiApi: boolean;
  useSystemKey: boolean; // New field for default key toggle
  apiKey: string;
  enableLiveTelemetry: boolean;
  enableAnimations: boolean;
  autoGenerateReports: boolean;
  enableTerminalLogging: boolean;
  theme: 'standard' | 'high_contrast';
  fontSize: number;
  // Stress Test Configuration
  stressTestMode: boolean;
  stressTestSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'MIXED';
  stressTestMaxRisks: number;
  // Temporal Configuration
  timeConfig: TimeConfig;
  // AI Persona
  aiMode: 'ECO' | 'ADVISOR' | 'PRO';
  dataYear: number;
}

export type IntentType = 'ROUTINE' | 'ANALYSIS' | 'DEEP' | 'EMERGENCY';
export type VerbosityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CommandClassification {
  intent: IntentType;
  maxThreatScore: number;
  verbosity: VerbosityLevel;
}

// --- TERMINAL ENGINE TYPES ---
export interface Suggestion {
  value: string;
  description: string;
  type: 'root' | 'object' | 'target' | 'option';
}

export interface CommandContext {
  packet: SentinelIntelPacket | null;
  config: SystemConfig;
  setPacket: (p: SentinelIntelPacket | null) => void;
  addLog: (msg: string, type: 'info' | 'warning' | 'error' | 'success') => void;
  uploadedFiles: UploadedFile[]; 
  liveStreams: LiveStream[]; // Added for Live Mode context
  onNavigate: (view: ViewType) => void; // New for navigation commands
}
