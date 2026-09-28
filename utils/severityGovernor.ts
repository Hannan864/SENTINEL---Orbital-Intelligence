import { SentinelIntelPacket, CommandClassification, RiskLevel } from '../types';

/**
 * Enforces strict severity limits on the intelligence packet based on the command intent.
 * This acts as a safety layer to ensure the UI never displays data that contradicts the
 * current operating mode (e.g., showing Critical risks during a Routine check).
 */
export const applySeverityLimits = (
  packet: SentinelIntelPacket, 
  classifier: CommandClassification
): SentinelIntelPacket => {
  // Create a shallow copy to modify
  const governed = { ...packet };
  
  // Deep copy nested objects that we might mutate
  governed.dashboard = { ...packet.dashboard };
  governed.hiddenRisks = [...packet.hiddenRisks];
  governed.threatLogs = [...packet.threatLogs];
  if (governed.humanBlindspots) {
    governed.humanBlindspots = [...governed.humanBlindspots];
  }

  // 1. Enforce Max Threat Score
  if (governed.dashboard.riskScore > classifier.maxThreatScore) {
    governed.dashboard.riskScore = classifier.maxThreatScore;
  }

  // 2. Determine Allowed Risk Levels
  let allowedLevels: RiskLevel[] = ['SAFE', 'LOW']; // Baseline

  switch (classifier.intent) {
    case 'ROUTINE':
      // Strictly LOW/SAFE only
      allowedLevels = ['SAFE', 'LOW'];
      break;
    
    case 'ANALYSIS':
      // MEDIUM allowed. HIGH allowed only if score > 55
      allowedLevels = ['SAFE', 'LOW', 'MEDIUM'];
      if (governed.dashboard.riskScore > 55) {
        allowedLevels.push('HIGH');
      }
      break;
    
    case 'DEEP':
    case 'EMERGENCY':
      // All levels allowed
      allowedLevels = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      break;
  }

  // 3. Filter Hidden Risks
  governed.hiddenRisks = governed.hiddenRisks.filter(risk => 
    allowedLevels.includes(risk.riskLevel)
  );

  // 4. Sync Human Blindspots
  // If a risk was filtered out, remove its associated blindspot analysis
  if (governed.humanBlindspots) {
    const remainingRiskIds = new Set(governed.hiddenRisks.map(r => r.id));
    governed.humanBlindspots = governed.humanBlindspots.filter(spot => 
      remainingRiskIds.has(spot.riskId)
    );
  }

  // 5. Filter Radar Points (Visuals must match data)
  governed.dashboard.radarPoints = governed.dashboard.radarPoints.filter(point => 
    allowedLevels.includes(point.level)
  );

  // 6. Sanitize Logs for Routine Checks
  if (classifier.intent === 'ROUTINE') {
    governed.threatLogs = governed.threatLogs.filter(log => {
      const isCriticalLog = log.severity === 'critical' || 
                            log.message.toUpperCase().includes('CRITICAL') ||
                            log.message.toUpperCase().includes('FAILURE');
      return !isCriticalLog;
    });
  }

  return governed;
};
