
import React, { useState } from 'react';
import { 
  Radar, Satellite, Rocket, ChevronRight, ArrowLeft, LayoutGrid, ClipboardList, Eye, Bot, Telescope, Bug, User, Globe, Trash2, HeartPulse, Atom, Languages, AlertOctagon, Home, UserCheck, Grid, Radio, TrendingUp, Sprout, Sun, Box, Flame, Navigation, Anchor, FlaskConical, Network, FileCode, Package, Layout, Pickaxe, Siren, Gem, Wrench, Star, Scale, Umbrella, Hammer, Binary, Server, Snowflake, ShieldCheck, Cpu,
  Zap, Database, AlertTriangle
} from 'lucide-react';
import CollisionAnalyzer from './modules/CollisionAnalyzer';
import DebrisForecaster from './modules/DebrisForecaster';
import LaunchOptimizer from './modules/LaunchOptimizer';
import MissionDebrief from './modules/MissionDebrief';
import MultimodalReasoning from './modules/MultimodalReasoning';
import AutonomousResponse from './modules/AutonomousResponse';
import CosmicEventPredictor from './modules/CosmicEventPredictor';
import MissionQA from './modules/MissionQA';
import ZeroGravityBehavior from './modules/ZeroGravityBehavior';
import InterplanetarySynthesizer from './modules/InterplanetarySynthesizer';
import DebrisCleanupPlanner from './modules/DebrisCleanupPlanner';
import SatelliteStressAnalyzer from './modules/SatelliteStressAnalyzer';
import QuantumPropulsion from './modules/QuantumPropulsion';
import OpsTranslator from './modules/OpsTranslator';
import RescueDroneCoordinator from './modules/RescueDroneCoordinator';
import AsteroidThreatSimulator from './modules/AsteroidThreatSimulator';
import HabitatLifePredictor from './modules/HabitatLifePredictor';
import MicrogravityTrainer from './modules/MicrogravityTrainer';
import SwarmCoordinator from './modules/SwarmCoordinator';
import SignalInterpreter from './modules/SignalInterpreter';
import OrbitalDebrisPredictor from './modules/OrbitalDebrisPredictor';
import ExoplanetTerraform from './modules/ExoplanetTerraform';
import SpaceWeatherMitigator from './modules/SpaceWeatherMitigator';
import AstroMaterialOptimizer from './modules/AstroMaterialOptimizer';
import InterstellarComms from './modules/InterstellarComms';
import ThermalShielding from './modules/ThermalShielding';
import SampleCollector from './modules/SampleCollector';
import RadiationMapper from './modules/RadiationMapper';
import PropellantOptimizer from './modules/PropellantOptimizer';
import AtmosphericAnalyzer from './modules/AtmosphericAnalyzer';
import DockingAssistant from './modules/DockingAssistant';
import BioreactorOptimizer from './modules/BioreactorOptimizer';
import MedicalConsultant from './modules/MedicalConsultant';
import TrafficCongestion from './modules/TrafficCongestion';
import SolarPanelOptimizer from './modules/SolarPanelOptimizer';
import LaunchSequenceAuditor from './modules/LaunchSequenceAuditor';
import SupplyChainManager from './modules/SupplyChainManager';
import HabitatDesigner from './modules/HabitatDesigner';
import FuelHarvestingOptimizer from './modules/FuelHarvestingOptimizer';
import EmergencyPlanner from './modules/EmergencyPlanner';
import NetworkOptimizer from './modules/NetworkOptimizer';
import MiningForecaster from './modules/MiningForecaster';
import PredictiveMaintenance from './modules/PredictiveMaintenance';
import SatelliteNetworkPlanner from './modules/SatelliteNetworkPlanner';
import InterstellarTrajectory from './modules/InterstellarTrajectory';
import PayloadPrioritizer from './modules/PayloadPrioritizer';
import WeatherShield from './modules/WeatherShield';
import ConstructionCoordinator from './modules/ConstructionCoordinator';
import PlanetaryTerraformer from './modules/PlanetaryTerraformer';
import DataMiningAI from './modules/DataMiningAI';
import OrbitalDataCenter from './modules/OrbitalDataCenter';
import ZeroGCooling from './modules/ZeroGCooling';
import NetworkLoadBalancer from './modules/NetworkLoadBalancer';
import RadiationHardening from './modules/RadiationHardening';
import QuantumScheduler from './modules/QuantumScheduler';
import { SystemConfig } from '../types';

const DEFAULT_CONFIG: SystemConfig = {
    dataMode: 'MOCK',
    enableGeminiApi: true,
    useSystemKey: true,
    apiKey: '',
    enableLiveTelemetry: true,
    enableAnimations: true,
    autoGenerateReports: true,
    enableTerminalLogging: true,
    theme: 'standard',
    fontSize: 14,
    stressTestMode: false,
    stressTestSeverity: 'MIXED',
    stressTestMaxRisks: 3,
    timeConfig: { useAutoTime: true, useAutoZone: true, selectedTimezone: 'UTC', timeFormat: '24h', dateFormat: 'YYYY-MM-DD' },
    aiMode: 'ADVISOR',
    dataYear: 2026
};

interface MoreMenuProps {
    config?: SystemConfig;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ config = DEFAULT_CONFIG }) => {
  const [activeModule, setActiveModule] = useState<'NONE' | 'SCRA' | 'SDFD' | 'LOA' | 'MDIS' | 'MSRE' | 'SMARS' | 'CEP' | 'AMQD' | 'ZGBA' | 'IDS' | 'ODACP' | 'SETA' | 'QPEO' | 'MSOT' | 'ARDC' | 'ATS' | 'SHLP' | 'MAT' | 'SSCAI' | 'STSI' | 'ODP' | 'ETF-AI' | 'RSWM' | 'AMO' | 'ICA' | 'ATSAI' | 'ASC' | 'CRM' | 'APO' | 'EAA' | 'AEDA' | 'MBO' | 'AMAC' | 'STCA' | 'ASPO' | 'ALSA' | 'DSSCAI' | 'ASHD' | 'OFHO' | 'AECP' | 'INO' | 'ASMF' | 'ASPM' | 'ASNP' | 'AITD' | 'APP' | 'AESWS' | 'ACDC' | 'APPT' | 'IDMAI' | 'ODCO' | 'ZGCMAI' | 'ONLB' | 'SRHAI' | 'OQCS'>('NONE');

  // --- API STATUS LOGIC ---
  const getApiStatus = () => {
    // 1. Simulation Mode (Overrides everything)
    if (config.dataMode === 'MOCK') {
        return { 
            title: "SIMULATION CORE", 
            subtitle: "OFFLINE DATASET",
            color: "bg-blue-950/40 text-blue-400 border-blue-500/30", 
            icon: <Database size={16} /> 
        };
    }

    // 2. AI Disabled
    if (!config.enableGeminiApi) {
        return { 
            title: "AI ENGINE OFFLINE", 
            subtitle: "ENABLE IN SETTINGS",
            color: "bg-slate-800 text-slate-400 border-slate-600", 
            icon: <Bot size={16} /> 
        };
    }

    // 3. Check for Valid Key (System Key OR User Key)
    // We assume if useSystemKey is true, the system provides it implicitly.
    const hasKey = config.useSystemKey || (config.apiKey && config.apiKey.length > 5);
    
    if (hasKey) {
        return { 
            title: "GEMINI 3.0 PRO", 
            subtitle: "SYSTEM ONLINE",
            color: "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]", 
            icon: <Zap size={16} className="animate-pulse" /> 
        };
    }

    // 4. Missing Key
    return { 
        title: "API KEY REQUIRED", 
        subtitle: "CONNECTION HALTED",
        color: "bg-red-950/40 text-red-400 border-red-500/30 animate-pulse", 
        icon: <AlertTriangle size={16} /> 
    };
  };

  const apiStatus = getApiStatus();

  // --- CATEGORY DEFINITIONS ---
  const MODULE_CATEGORIES = [
    {
      title: "DEEP SPACE DATA CENTER (ENTERPRISE)",
      description: "Orbital compute infrastructure management and quantum processing nodes.",
      color: "text-blue-400",
      borderColor: "border-blue-900/50",
      modules: [
        { code: 'ODCO', title: 'Orbital Data Center', icon: <Server size={32} />, desc: 'Optimize placement and energy for satellite-based data centers.', color: 'blue', action: () => setActiveModule('ODCO') },
        { code: 'ZGCMAI', title: 'Zero-G Cooling AI', icon: <Snowflake size={32} />, desc: 'Manage thermal loads in microgravity for orbital server farms.', color: 'cyan', action: () => setActiveModule('ZGCMAI') },
        { code: 'ONLB', title: 'Network Load Balancer', icon: <Network size={32} />, desc: 'Balance cloud workloads between Earth and space nodes.', color: 'indigo', action: () => setActiveModule('ONLB') },
        { code: 'SRHAI', title: 'Radiation Hardened AI', icon: <ShieldCheck size={32} />, desc: 'Protect orbital data from cosmic rays and solar flares.', color: 'yellow', action: () => setActiveModule('SRHAI') },
        { code: 'OQCS', title: 'Quantum Scheduler', icon: <Cpu size={32} />, desc: 'Schedule quantum compute tasks on space-based nodes.', color: 'purple', action: () => setActiveModule('OQCS') },
      ]
    },
    {
      title: "ORBITAL SECURITY & DEFENSE",
      description: "Asset protection, debris mitigation, and threat assessment.",
      color: "text-red-400",
      borderColor: "border-red-900/50",
      modules: [
          { code: 'SCRA', title: 'Collision Risk Analyzer', icon: <Radar size={32} />, desc: 'Predict potential satellite collisions in LEO/Polar orbits.', color: 'red', action: () => setActiveModule('SCRA') },
          { code: 'SDFD', title: 'Debris Forecast', icon: <Satellite size={32} />, desc: 'Predictive analysis for orbital debris fields based on space weather.', color: 'amber', action: () => setActiveModule('SDFD') },
          { code: 'ODACP', title: 'Debris Cleanup Planner', icon: <Trash2 size={32} />, desc: 'Strategize debris removal using AI to optimize drone paths.', color: 'amber', action: () => setActiveModule('ODACP') },
          { code: 'ARDC', title: 'Rescue Drone Coord', icon: <Bot size={32} />, desc: 'Autonomous fleet management for coordinating drone swarms.', color: 'orange', action: () => setActiveModule('ARDC') },
          { code: 'ATS', title: 'Asteroid Threat Sim', icon: <AlertOctagon size={32} />, desc: 'Simulate asteroid impacts and calculate mitigation strategies.', color: 'red', action: () => setActiveModule('ATS') },
          { code: 'ODP', title: 'Debris Predictor', icon: <TrendingUp size={32} />, desc: 'Forecast future space debris formation and collision hotspots.', color: 'amber', action: () => setActiveModule('ODP') },
          { code: 'RSWM', title: 'Space Weather Mitigator', icon: <Sun size={32} />, desc: 'Real-time detection and mitigation strategies for solar flares.', color: 'yellow', action: () => setActiveModule('RSWM') },
          { code: 'AESWS', title: 'Space Weather Shield', icon: <Umbrella size={32} />, desc: 'Active defense system for solar storms and radiation.', color: 'yellow', action: () => setActiveModule('AESWS') },
          { code: 'CRM', title: 'Cosmic Radiation Map', icon: <Radar size={32} />, desc: 'Map orbital radiation hazards and predict safe corridors.', color: 'yellow', action: () => setActiveModule('CRM') },
          { code: 'ATSAI', title: 'Adaptive Thermal Shield', icon: <Flame size={32} />, desc: 'Dynamically adjust heat shields based on re-entry temperature.', color: 'orange', action: () => setActiveModule('ATSAI') },
      ]
    },
    {
        title: "MISSION CONTROL & FLIGHT OPS",
        description: "Launch logistics, trajectory optimization, and autonomous guidance.",
        color: "text-emerald-400",
        borderColor: "border-emerald-900/50",
        modules: [
          { code: 'LOA', title: 'Launch Optimizer', icon: <Rocket size={32} />, desc: 'Optimize rocket launch parameters for fuel efficiency.', color: 'cyan', action: () => setActiveModule('LOA') },
          { code: 'MDIS', title: 'Mission Debrief', icon: <ClipboardList size={32} />, desc: 'Ingest flight logs to produce smart structured debriefs.', color: 'purple', action: () => setActiveModule('MDIS') },
          { code: 'SMARS', title: 'Auto Response System', icon: <Bot size={32} />, desc: 'AI mission controller that monitors live state and proposes actions.', color: 'emerald', action: () => setActiveModule('SMARS') },
          { code: 'CEP', title: 'Cosmic Event Predictor', icon: <Telescope size={32} />, desc: 'Predict orbital anomalies and space hazards using historical data.', color: 'purple', action: () => setActiveModule('CEP') },
          { code: 'AMQD', title: 'Mission QA & Debugger', icon: <Bug size={32} />, desc: 'Automated audit of mission scripts to identify logic errors.', color: 'orange', action: () => setActiveModule('AMQD') },
          { code: 'MSOT', title: 'Ops Translator', icon: <Languages size={32} />, desc: 'Context-aware translation of technical logs into simplified language.', color: 'teal', action: () => setActiveModule('MSOT') },
          { code: 'APO', title: 'Propellant Optimizer', icon: <Box size={32} />, desc: 'Calculate fuel-optimal burn sequences for complex maneuvers.', color: 'blue', action: () => setActiveModule('APO') },
          { code: 'AEDA', title: 'Docking Assistant', icon: <Anchor size={32} />, desc: 'Autonomous AI guidance for spacecraft proximity operations.', color: 'indigo', action: () => setActiveModule('AEDA') },
          { code: 'STCA', title: 'Traffic Congestion', icon: <Network size={32} />, desc: 'Predict and manage orbital traffic bottlenecks.', color: 'blue', action: () => setActiveModule('STCA') },
          { code: 'ALSA', title: 'Launch Auditor', icon: <FileCode size={32} />, desc: 'Audit launch scripts in real-time to catch timing errors.', color: 'red', action: () => setActiveModule('ALSA') },
          { code: 'APP', title: 'Payload Prioritizer', icon: <Scale size={32} />, desc: 'Optimize mission manifests based on ROI and mass.', color: 'emerald', action: () => setActiveModule('APP') },
        ]
    },
    {
        title: "DEEP SPACE & EXPLORATION",
        description: "Exoplanet analysis, interstellar travel, and resource extraction.",
        color: "text-purple-400",
        borderColor: "border-purple-900/50",
        modules: [
          { code: 'IDS', title: 'Interplanetary Synth', icon: <Globe size={32} />, desc: 'Merge multi-source data to create environmental intelligence.', color: 'emerald', action: () => setActiveModule('IDS') },
          { code: 'ETF-AI', title: 'Terraform Feasibility', icon: <Sprout size={32} />, desc: 'Evaluate exoplanet terraforming potential.', color: 'green', action: () => setActiveModule('ETF-AI') },
          { code: 'ICA', title: 'Interstellar Comms', icon: <Radio size={32} />, desc: 'Decipher patterns in deep-space signals for SETI.', color: 'purple', action: () => setActiveModule('ICA') },
          { code: 'ASC', title: 'Sample Collector', icon: <Navigation size={32} />, desc: 'Plan autonomous rover paths for sample collection.', color: 'emerald', action: () => setActiveModule('ASC') },
          { code: 'EAA', title: 'Exoplanet Analyzer', icon: <Telescope size={32} />, desc: 'Analyze spectral data to determine atmosphere composition.', color: 'teal', action: () => setActiveModule('EAA') },
          { code: 'DSSCAI', title: 'Deep-Space Supply', icon: <Package size={32} />, desc: 'Manage logistics and cargo for interplanetary supply missions.', color: 'blue', action: () => setActiveModule('DSSCAI') },
          { code: 'OFHO', title: 'Fuel Harvesting Opt', icon: <Pickaxe size={32} />, desc: 'Plan ISRU fuel extraction from asteroids or lunar sources.', color: 'yellow', action: () => setActiveModule('OFHO') },
          { code: 'ASMF', title: 'Mining Forecaster', icon: <Gem size={32} />, desc: 'Predict ROI and feasibility for asteroid mining missions.', color: 'amber', action: () => setActiveModule('ASMF') },
          { code: 'AITD', title: 'Interstellar Trajectory', icon: <Star size={32} />, desc: 'Calculate flight paths for interstellar missions.', color: 'purple', action: () => setActiveModule('AITD') },
          { code: 'APPT', title: 'Planetary Terraformer', icon: <Sprout size={32} />, desc: 'Simulate environmental engineering for colonization.', color: 'green', action: () => setActiveModule('APPT') },
          { code: 'IDMAI', title: 'Data Mining AI', icon: <Binary size={32} />, desc: 'Analyze deep space signals for technosignatures.', color: 'purple', action: () => setActiveModule('IDMAI') },
          { code: 'STSI', title: 'Signal Interpreter', icon: <Radio size={32} />, desc: 'Decode and classify anomalous deep-space signals.', color: 'purple', action: () => setActiveModule('STSI') },
        ]
    },
    {
        title: "SATELLITE & INFRASTRUCTURE",
        description: "Constellation management, maintenance, and energy systems.",
        color: "text-cyan-400",
        borderColor: "border-cyan-900/50",
        modules: [
          { code: 'SETA', title: 'Satellite Emotions', icon: <HeartPulse size={32} />, desc: 'Anthropomorphize satellite telemetry to detect stress.', color: 'pink', action: () => setActiveModule('SETA') },
          { code: 'SSCAI', title: 'Swarm Coordinator', icon: <Grid size={32} />, desc: 'Optimize formation flying and task allocation for swarms.', color: 'teal', action: () => setActiveModule('SSCAI') },
          { code: 'ASNP', title: 'Sat Network Planner', icon: <Satellite size={32} />, desc: 'Design constellation layouts for global coverage.', color: 'blue', action: () => setActiveModule('ASNP') },
          { code: 'INO', title: 'Network Optimizer', icon: <Network size={32} />, desc: 'Optimize deep-space communication links and relay routing.', color: 'blue', action: () => setActiveModule('INO') },
          { code: 'ASPO', title: 'Solar Panel Opt', icon: <Sun size={32} />, desc: 'Dynamically adjust solar array angles for maximum energy.', color: 'yellow', action: () => setActiveModule('ASPO') },
          { code: 'ASPM', title: 'Predictive Maint.', icon: <Wrench size={32} />, desc: 'Forecast component failures using telemetry analysis.', color: 'orange', action: () => setActiveModule('ASPM') },
        ]
    },
    {
        title: "HUMAN & HABITAT",
        description: "Crew health, life support, and bio-regenerative systems.",
        color: "text-green-400",
        borderColor: "border-green-900/50",
        modules: [
          { code: 'ZGBA', title: 'Zero-G Behavior', icon: <User size={32} />, desc: 'Predict astronaut performance and stress reactions.', color: 'pink', action: () => setActiveModule('ZGBA') },
          { code: 'SHLP', title: 'Habitat Life Predictor', icon: <Home size={32} />, desc: 'Forecast space habitat sustainability based on telemetry.', color: 'green', action: () => setActiveModule('SHLP') },
          { code: 'MAT', title: 'Microgravity Trainer', icon: <UserCheck size={32} />, desc: 'Generate customized astronaut fitness routines.', color: 'blue', action: () => setActiveModule('MAT') },
          { code: 'MBO', title: 'Bioreactor Opt', icon: <FlaskConical size={32} />, desc: 'Optimize zero-G biological experiments.', color: 'green', action: () => setActiveModule('MBO') },
          { code: 'AMAC', title: 'Medical Consultant', icon: <HeartPulse size={32} />, desc: 'Monitor astronaut health metrics and prescribe countermeasures.', color: 'red', action: () => setActiveModule('AMAC') },
          { code: 'ASHD', title: 'Habitat Designer', icon: <Layout size={32} />, desc: 'Generate optimized layouts for space habitats.', color: 'green', action: () => setActiveModule('ASHD') },
          { code: 'AECP', title: 'Emergency Planner', icon: <Siren size={32} />, desc: 'Auto-generate contingency plans for critical failures.', color: 'red', action: () => setActiveModule('AECP') },
        ]
    },
    {
        title: "ADVANCED R&D",
        description: "Experimental propulsion, materials science, and cutting-edge tech.",
        color: "text-indigo-400",
        borderColor: "border-indigo-900/50",
        modules: [
          { code: 'MSRE', title: 'Multimodal Reasoning', icon: <Eye size={32} />, desc: 'Fuse visual data with telemetry logs.', color: 'blue', action: () => setActiveModule('MSRE') },
          { code: 'QPEO', title: 'Quantum Propulsion', icon: <Atom size={32} />, desc: 'Simulate and tune futuristic quantum drive parameters.', color: 'indigo', action: () => setActiveModule('QPEO') },
          { code: 'AMO', title: 'Material Optimizer', icon: <Box size={32} />, desc: 'Recommend optimal spacecraft materials.', color: 'indigo', action: () => setActiveModule('AMO') },
          { code: 'ACDC', title: 'Construction Coord', icon: <Hammer size={32} />, desc: 'Manage autonomous drone fleets for orbital assembly.', color: 'orange', action: () => setActiveModule('ACDC') },
        ]
    }
  ];

  // RENDER ACTIVE MODULE
  if (activeModule !== 'NONE') {
      return (
          <div className="h-full flex flex-col bg-[#0f172a]">
              {/* Back Navigation Bar */}
              <div className="bg-[#1e293b] border-b border-slate-800 p-2 flex items-center">
                  <button 
                    onClick={() => setActiveModule('NONE')}
                    className="flex items-center text-slate-400 hover:text-white px-3 py-1.5 rounded hover:bg-slate-700 transition-colors text-xs font-bold uppercase tracking-wider"
                  >
                      <ArrowLeft size={14} className="mr-2" /> Return to Registry
                  </button>
              </div>
              
              {/* Module Content */}
              <div className="flex-1 overflow-hidden">
                  {activeModule === 'SCRA' && <CollisionAnalyzer config={config} />}
                  {activeModule === 'SDFD' && <DebrisForecaster config={config} />}
                  {activeModule === 'LOA' && <LaunchOptimizer config={config} />}
                  {activeModule === 'MDIS' && <MissionDebrief config={config} />}
                  {activeModule === 'MSRE' && <MultimodalReasoning config={config} />}
                  {activeModule === 'SMARS' && <AutonomousResponse config={config} />}
                  {activeModule === 'CEP' && <CosmicEventPredictor config={config} />}
                  {activeModule === 'AMQD' && <MissionQA config={config} />}
                  {activeModule === 'ZGBA' && <ZeroGravityBehavior config={config} />}
                  {activeModule === 'IDS' && <InterplanetarySynthesizer config={config} />}
                  {activeModule === 'ODACP' && <DebrisCleanupPlanner config={config} />}
                  {activeModule === 'SETA' && <SatelliteStressAnalyzer config={config} />}
                  {activeModule === 'QPEO' && <QuantumPropulsion config={config} />}
                  {activeModule === 'MSOT' && <OpsTranslator config={config} />}
                  {activeModule === 'ARDC' && <RescueDroneCoordinator config={config} />}
                  {activeModule === 'ATS' && <AsteroidThreatSimulator config={config} />}
                  {activeModule === 'SHLP' && <HabitatLifePredictor config={config} />}
                  {activeModule === 'MAT' && <MicrogravityTrainer config={config} />}
                  {activeModule === 'SSCAI' && <SwarmCoordinator config={config} />}
                  {activeModule === 'STSI' && <SignalInterpreter config={config} />}
                  {activeModule === 'ODP' && <OrbitalDebrisPredictor config={config} />}
                  {activeModule === 'ETF-AI' && <ExoplanetTerraform config={config} />}
                  {activeModule === 'RSWM' && <SpaceWeatherMitigator config={config} />}
                  {activeModule === 'AMO' && <AstroMaterialOptimizer config={config} />}
                  {activeModule === 'ICA' && <InterstellarComms config={config} />}
                  {activeModule === 'ATSAI' && <ThermalShielding config={config} />}
                  {activeModule === 'ASC' && <SampleCollector config={config} />}
                  {activeModule === 'CRM' && <RadiationMapper config={config} />}
                  {activeModule === 'APO' && <PropellantOptimizer config={config} />}
                  {activeModule === 'EAA' && <AtmosphericAnalyzer config={config} />}
                  {activeModule === 'AEDA' && <DockingAssistant config={config} />}
                  {activeModule === 'MBO' && <BioreactorOptimizer config={config} />}
                  {activeModule === 'AMAC' && <MedicalConsultant config={config} />}
                  {activeModule === 'STCA' && <TrafficCongestion config={config} />}
                  {activeModule === 'ASPO' && <SolarPanelOptimizer config={config} />}
                  {activeModule === 'ALSA' && <LaunchSequenceAuditor config={config} />}
                  {activeModule === 'DSSCAI' && <SupplyChainManager config={config} />}
                  {activeModule === 'ASHD' && <HabitatDesigner config={config} />}
                  {activeModule === 'OFHO' && <FuelHarvestingOptimizer config={config} />}
                  {activeModule === 'AECP' && <EmergencyPlanner config={config} />}
                  {activeModule === 'INO' && <NetworkOptimizer config={config} />}
                  {activeModule === 'ASMF' && <MiningForecaster config={config} />}
                  {activeModule === 'ASPM' && <PredictiveMaintenance config={config} />}
                  {activeModule === 'ASNP' && <SatelliteNetworkPlanner config={config} />}
                  {activeModule === 'AITD' && <InterstellarTrajectory config={config} />}
                  {activeModule === 'APP' && <PayloadPrioritizer config={config} />}
                  {activeModule === 'AESWS' && <WeatherShield config={config} />}
                  {activeModule === 'ACDC' && <ConstructionCoordinator config={config} />}
                  {activeModule === 'APPT' && <PlanetaryTerraformer config={config} />}
                  {activeModule === 'IDMAI' && <DataMiningAI config={config} />}
                  {activeModule === 'ODCO' && <OrbitalDataCenter config={config} />}
                  {activeModule === 'ZGCMAI' && <ZeroGCooling config={config} />}
                  {activeModule === 'ONLB' && <NetworkLoadBalancer config={config} />}
                  {activeModule === 'SRHAI' && <RadiationHardening config={config} />}
                  {activeModule === 'OQCS' && <QuantumScheduler config={config} />}
              </div>
          </div>
      );
  }

  // RENDER REGISTRY (DEFAULT)
  return (
    <div className="h-full w-full bg-[#0f172a] text-slate-500 overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-800 bg-[#1e293b]">
          <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4 mb-2">
                 <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                    <LayoutGrid size={32} className="text-cyan-500" />
                 </div>
                 <div>
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Mission Module Registry</h1>
                    <p className="text-xs font-mono text-cyan-400">SENTINEL EXTENDED CAPABILITIES // v7.5.0</p>
                 </div>
              </div>

              {/* API STATUS INDICATOR */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${apiStatus.color} shadow-lg backdrop-blur-sm select-none`}>
                  {apiStatus.icon}
                  <div className="flex flex-col">
                      <span className="text-[10px] font-bold tracking-widest font-mono leading-none">{apiStatus.title}</span>
                      <span className="text-[8px] opacity-80 font-mono leading-none mt-1">{apiStatus.subtitle}</span>
                  </div>
              </div>
          </div>
          
          <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed border-l-2 border-slate-700 pl-4">
             Access specialized analytical engines for collision avoidance, space weather forecasting, launch trajectory optimization, and advanced AI-driven mission support. 
             All modules are powered by the Gemini-3 Neural Core.
          </p>
      </div>

      {/* Categories */}
      <div className="p-8 space-y-12">
        {MODULE_CATEGORIES.map((category, i) => (
            <div key={i} className="space-y-6">
                <div className={`border-b ${category.borderColor} pb-2`}>
                    <h2 className={`text-sm font-bold uppercase tracking-widest ${category.color} flex items-center`}>
                        <span className="mr-2 opacity-50">//{`0${i+1}`}</span>
                        {category.title}
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">{category.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {category.modules.map((mod) => (
                        <ModuleCard 
                            key={mod.code}
                            title={mod.title}
                            code={mod.code}
                            icon={mod.icon}
                            description={mod.desc}
                            color={mod.color}
                            onClick={mod.action}
                        />
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

const ModuleCard = ({ title, code, icon, description, color, onClick }: any) => {
    const colorStyles = {
        red: 'border-red-900/30 hover:border-red-500/50 hover:shadow-red-900/20 text-red-500',
        amber: 'border-amber-900/30 hover:border-amber-500/50 hover:shadow-amber-900/20 text-amber-500',
        cyan: 'border-cyan-900/30 hover:border-cyan-500/50 hover:shadow-cyan-900/20 text-cyan-500',
        purple: 'border-purple-900/30 hover:border-purple-500/50 hover:shadow-purple-900/20 text-purple-500',
        blue: 'border-blue-900/30 hover:border-blue-500/50 hover:shadow-blue-900/20 text-blue-500',
        emerald: 'border-emerald-900/30 hover:border-emerald-500/50 hover:shadow-emerald-900/20 text-emerald-500',
        orange: 'border-orange-900/30 hover:border-orange-500/50 hover:shadow-orange-900/20 text-orange-500',
        pink: 'border-pink-900/30 hover:border-pink-500/50 hover:shadow-pink-900/20 text-pink-500',
        indigo: 'border-indigo-900/30 hover:border-indigo-500/50 hover:shadow-indigo-900/20 text-indigo-500',
        teal: 'border-teal-900/30 hover:border-teal-500/50 hover:shadow-teal-900/20 text-teal-500',
        green: 'border-green-900/30 hover:border-green-500/50 hover:shadow-green-900/20 text-green-500',
        yellow: 'border-yellow-900/30 hover:border-yellow-500/50 hover:shadow-yellow-900/20 text-yellow-500',
    };

    const bgStyles = {
        red: 'bg-red-950/10 group-hover:bg-red-950/20',
        amber: 'bg-amber-950/10 group-hover:bg-amber-950/20',
        cyan: 'bg-cyan-950/10 group-hover:bg-cyan-950/20',
        purple: 'bg-purple-950/10 group-hover:bg-purple-950/20',
        blue: 'bg-blue-950/10 group-hover:bg-blue-950/20',
        emerald: 'bg-emerald-950/10 group-hover:bg-emerald-950/20',
        orange: 'bg-orange-950/10 group-hover:bg-orange-950/20',
        pink: 'bg-pink-950/10 group-hover:bg-pink-950/20',
        indigo: 'bg-indigo-950/10 group-hover:bg-indigo-950/20',
        teal: 'bg-teal-950/10 group-hover:bg-teal-950/20',
        green: 'bg-green-950/10 group-hover:bg-green-950/20',
        yellow: 'bg-yellow-950/10 group-hover:bg-yellow-950/20',
    };

    return (
        <div 
            onClick={onClick}
            className={`group relative border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-[#151515] flex flex-col h-full ${colorStyles[color as keyof typeof colorStyles]}`}
        >
            <div className={`absolute top-4 right-4 text-[10px] font-bold font-mono px-2 py-1 rounded bg-black/40 border border-white/5 opacity-70`}>
                MOD::{code}
            </div>
            
            <div className={`mb-6 p-4 rounded-full w-fit transition-colors ${bgStyles[color as keyof typeof bgStyles]}`}>
                {icon}
            </div>
            
            <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-white transition-colors">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">
                {description}
            </p>
            
            <div className="flex items-center text-xs font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                Launch Application <ChevronRight size={14} className="ml-2" />
            </div>
        </div>
    );
};

export default MoreMenu;
