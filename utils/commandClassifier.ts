import { CommandClassification } from '../types';

export const classifyCommand = (input: string): CommandClassification => {
  const lowerInput = input.toLowerCase();

  // EMERGENCY
  // Keywords: critical, emergency, collision imminent, immediate
  if (['critical', 'emergency', 'collision imminent', 'immediate'].some(k => lowerInput.includes(k))) {
    return { 
      intent: 'EMERGENCY', 
      maxThreatScore: 100, 
      verbosity: 'HIGH' 
    };
  }

  // DEEP
  // Keywords: deep, anomaly, focused, investigate
  if (['deep', 'anomaly', 'focused', 'investigate'].some(k => lowerInput.includes(k))) {
    return { 
      intent: 'DEEP', 
      maxThreatScore: 85, 
      verbosity: 'HIGH' 
    };
  }

  // ROUTINE
  // Keywords: status, standard, routine, baseline, check
  if (['status', 'standard', 'routine', 'baseline', 'check'].some(k => lowerInput.includes(k))) {
    return { 
      intent: 'ROUTINE', 
      maxThreatScore: 30, 
      verbosity: 'LOW' 
    };
  }

  // DEFAULT: ANALYSIS
  // Keywords: scan, survey, assess, monitor (and anything else)
  return { 
    intent: 'ANALYSIS', 
    maxThreatScore: 60, 
    verbosity: 'MEDIUM' 
  };
};
