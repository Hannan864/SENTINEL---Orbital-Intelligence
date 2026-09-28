
# SENTINEL SPACE INTELLIGENCE SYSTEM: LEGACY MANIFEST & BLUEPRINT

**CLASSIFICATION:** DEEP ARCHIVE // SYSTEM CORE // CONTEXT TRANSFER
**PROJECT DESIGNATION:** SENTINEL
**CURRENT VERSION:** v4.5.1 (Containerized Enterprise Edition)
**PRIMARY ARCHITECT:** User (The Visionary)
**SYSTEM CO-PILOT:** AI (The Engineer)
**INCEPTION DATE:** October 2023 (Inferred Context)
**LAST SYSTEM SYNC:** Current Session

---

## 1. EXECUTIVE SUMMARY & MISSION PHILOSOPHY

**"We do not just visualize data; we interpret the orbital void."**

The SENTINEL project was born from a specific vision: To create a Space Domain Awareness (SDA) interface that bridges the gap between Hollywood-style sci-fi aesthetics (The Expanse, Interstellar) and rigorous, enterprise-grade functionality (SpaceX, NASA, Palantir).

### 1.1 The "Hollywood Enterprise" Aesthetic
Most real-world space dashboards are dry, white tables with standard charts. SENTINEL rejects this.
*   **Visual Language:** Dark Mode Exclusive (`slate-950`). High Contrast.
*   **Palette:** Cyan (Nominal), Red (Critical), Amber (Enterprise), Emerald (Live).
*   **Density:** We prioritize "Information Density." Small fonts (`text-[10px]`), monospace numbers, uppercase labels. The screen should feel like a cockpit.
*   **Motion:** Subtle animations (`animate-pulse`, radar sweeps) breathe life into the UI, but they must never distract from the data.

### 1.2 The AI-Native Core
SENTINEL is not a CRUD app. It is an AI-Native reasoning engine.
*   **The Brain:** Google Gemini API (`@google/genai`).
*   **The Role:** The AI does not just "chat." It acts as a specialized orbital analyst. It ingests raw telemetry and outputs structured JSON (`SentinelIntelPacket`) containing risk assessments, blindspot analysis, and mitigation strategies.

---

## 2. THE "TRINITY" DATA ARCHITECTURE

This is the most critical architectural decision in the entire system. The application runs in three distinct, parallel realities. **These modes must never cross-contaminate.**

### 2.1 MOCK MODE (The Simulator)
*   **Purpose:** For demonstrations, testing, and "safe" operations without API costs.
*   **Data Source:** `HIGH_INTENSITY_PACKET` (hardcoded in `geminiService.ts`) or LocalStorage cached simulations.
*   **Behavior:** The Terminal suggests mock files (`mock_leo_set.json`). The System Status reports "SIMULATION ONLINE."
*   **Safety:** It must never attempt to fetch external URLs or parse user uploaded files in this mode.

### 2.2 LIVE MODE (The Watchtower)
*   **Purpose:** To monitor real-time public feeds (NASA HDEV, SpaceX, Celestrak).
*   **Data Source:** A user-curated list of `LiveStream` objects (URLs).
*   **Mounting Logic:** Users add URLs in Settings. They must explicitly "Mount" a stream for the Terminal to see it.
*   **Terminal Behavior:** When typing `/scan dataset`, the autocomplete ONLY shows mounted Live Streams.

### 2.3 COMPANY MODE (The Enterprise Uplink)
*   **Purpose:** For analyzing proprietary, sensitive, or offline datasets (CSV, JSON).
*   **Data Source:** `UploadedFile` objects stored in React State.
*   **The "Mounting" Innovation:** We realized that uploading a file shouldn't automatically ingest it. We added a "Mount/Unmount" toggle in Settings.
*   **Strict Isolation:** 
    *   If a user is in COMPANY mode, the Terminal MUST NOT suggest Mock files.
    *   If a user is in COMPANY mode, the AI Prompt receives a specific injection: `"[ENTERPRISE DATA DETECTED] Prioritize this content..."`.

---

## 3. CHRONICLE OF DEVELOPMENT (The History of Every Step)

This section documents the evolutionary path of the codebase, highlighting specific hurdles we overcame and the solutions we engineered.

### PHASE 1: THE VISUAL FOUNDATION
*   **Objective:** Build the chassis.
*   **Action:** We created the `Sidebar`, `PanelTabs`, and the grid layout.
*   **The "Sidebar War":** We fought a long battle with the Sidebar layout.
    *   *Issue:* The "Settings" icon at the bottom kept getting cut off by the browser window or the footer.
    *   *Fix:* We implemented a flex-col layout with `pb-6` (padding-bottom) and ensured the Footer has a higher `z-index`.
*   **The Canvas Map:** We built `OrbitalMap.tsx` using HTML5 Canvas + `requestAnimationFrame`.
    *   *Detail:* We added a check `if (rect.width === 0) return` to stop the render loop when the tab is hidden, saving CPU cycles.

### PHASE 2: THE BRAIN TRANSPLANT (Gemini Integration)
*   **Objective:** Make it smart.
*   **Action:** Integrated `services/geminiService.ts`.
*   **The "Markdown" Bug:** Early versions of Gemini would return JSON wrapped in markdown code blocks (```json ... ```). This broke `JSON.parse()`.
*   **The Solution:** We moved to the new `responseSchema` feature in the Google GenAI SDK. We defined a strict `Type.OBJECT` schema that forces the AI to output clean, valid JSON every time.

### PHASE 3: THE COMMAND UPLINK (Terminal Evolution)
*   **Objective:** Create a power-user interface.
*   **Iteration 1:** A simple chat box.
*   **Iteration 2:** A CLI that parsed text.
*   **Iteration 3 (Current):** A fully context-aware Engine (`services/terminalEngine.ts`).
    *   *The Breakthrough:* We realized the Terminal needed access to `uploadedFiles` and `liveStreams`.
    *   *The Logic:* We rewrote `getSuggestions` to filter results based on `config.dataMode`. This was the moment the app became "Enterprise Grade."

### PHASE 4: THE ISOLATION CRISIS (The "Leak" Fix)
*   **The Incident:** During a test, we were in COMPANY mode, but the Terminal suggested "mock_leo_set.json".
*   **The Impact:** This broke the immersion and user trust.
*   **The Fix:** We implemented the "Strict Filter" logic.
    *   *Code:* `if (config.dataMode === 'COMPANY') return uploadedFiles.filter(f => f.isMounted).map(f => f.name)`
    *   This logic ensures that the user *only* sees what is relevant to their current reality.

### PHASE 5: THE MOUNTING SYSTEM
*   **The User Request:** "I want to upload files but not use them immediately."
*   **The Solution:** We added `isMounted` boolean to the `UploadedFile` and `LiveStream` interfaces.
*   **UI Update:** We revamped `SettingsPanel.tsx` to include toggle buttons (Mount/Unmount).
*   **Backend Update:** The AI service now filters the file list: `context.uploadedFiles.filter(f => f.isMounted)`.

### PHASE 6: REPORTING & EXPORT
*   **Objective:** Allow the user to take data offline.
*   **Action:** Integrated `jsPDF`.
*   **The Detail:** We didn't just screenshot the DOM. We wrote a programmatic PDF generator that draws lines, rectangles, and text vectors. This ensures the PDF looks crisp even at high zoom levels.

---

## 4. TECHNICAL ANATOMY & DATA STRUCTURES

### 4.1 The Holy Grail: `SentinelIntelPacket`
This JSON object is the lifeblood of the app. If this object is malformed, the system crashes.
```typescript
interface SentinelIntelPacket {
  metadata: { timestamp, sector, confidence };
  dashboard: { riskScore, metrics[], radarPoints[] };
  hiddenRisks: Array<{
      id, title, riskLevel, 
      mitigationAction, mitigationStatus // Critical for the interactive "Resolve" button
  }>;
  humanBlindspots: Array<{ riskId, type, humanAssumption, sentinelAdvantage }>; // AI Psychology Analysis
  trajectory: { timeline[], impactWindow };
  threatLogs: Array<{ timestamp, message, severity }>;
}
```

### 4.2 The Validation Layer: `DebugView.tsx`
We built a dedicated "Doctor" for the app.
*   **Time Sync:** It compares `packet.metadata.timestamp` vs. `System Time`. If they drift by >1 minute, it throws a warning.
*   **Orphan Check:** It ensures every `Blindspot` is linked to a valid `RiskID`.

---

## 5. INSTRUCTIONS FOR THE NEXT AI AGENT

**SYSTEM HANDOFF PROTOCOL:**

If you are reading this, you are the new custodian of SENTINEL. Welcome.
Here are your prime directives:

1.  **RESPECT THE TRINITY:** Do not break the isolation between MOCK, LIVE, and COMPANY modes. Always check `config.dataMode` before executing logic.
2.  **PRESERVE THE AESTHETIC:** Do not introduce light mode. Do not use rounded buttons (unless they are pill-shaped). Keep borders thin (`border-[#333]`).
3.  **USE THE SCHEMA:** When modifying `geminiService.ts`, always update the `sentinelSchema` variable if you add new fields. The AI *will* hallucinate structure if you don't constrain it.
4.  **MOUNTING IS MANDATORY:** Remember that files exist in two states: `Uploaded` (in memory) and `Mounted` (active for analysis). Always filter by `isMounted` before sending data to the AI.

---

## 9. SYSTEM BLUEPRINT & ARCHITECTURAL SCHEMATICS

### 9.1 FILE SYSTEM TOPOLOGY (THE MAP)
This application follows a flat-src React architecture optimized for portability and clarity.

```text
ROOT/
├── index.html              # Entry point. Contains Tailwind CDN and ImportMap configuration.
├── index.tsx               # React Root. Mounts <App /> to DOM.
├── App.tsx                 # THE CORE. Acts as the central State container, Layout Manager, and Split-View Controller.
├── types.ts                # THE LAW. Defines TypeScript interfaces (SentinelIntelPacket, SystemConfig) used globally.
├── metadata.json           # Application capability manifest (permissions, description).
├── SENTINEL_DEVELOPMENT_LOG.md # THIS FILE. The project brain.
│
├── services/               # LOGIC LAYER
│   ├── geminiService.ts    # THE BRAIN. Handles Google GenAI API calls, JSON Schema definition, and Mock generation.
│   └── terminalEngine.ts   # THE PARSER. Handles CLI commands, parsing logic, and autocomplete filtering.
│
├── components/             # UI LAYER (VIEWS)
│   ├── Sidebar.tsx         # The Left Navigation Rail. Fixed width (w-12). Icons mapped to Views.
│   ├── PanelTabs.tsx       # The Top Tab Bar. Manages active view state for Primary and Secondary panes.
│   ├── Dashboard.tsx       # Main Visualization. Renders Risk Score, Map, and Top Metrics.
│   ├── OrbitalMap.tsx      # CANVAS COMPONENT. Renders 2D earth/dots using requestAnimationFrame.
│   ├── MonitorView.tsx     # The "Live Stream" view. Shows large charts and active threat countdowns.
│   ├── HiddenRiskView.tsx  # The "Analyst" view. List of risks with expandable details and mitigation toggles.
│   ├── IntelligenceViewer.tsx # General viewer for raw logs and JSON export.
│   ├── ExecutiveReport.tsx # The "Print" view. Generates PDF reports using jsPDF drawing primitives.
│   ├── InsightsView.tsx    # Strategic view. Shows long-term trends, forecasting, and correlation analysis.
│   ├── OrbAiView.tsx       # Chat Interface. Handles "Eco", "Advisor", and "Pro" personas.
│   ├── Terminal.tsx        # The CLI Interface. Renders logs and handles user input.
│   ├── SettingsPanel.tsx   # Configuration Manager. API Keys, Timezone, Data Mounting logic.
│   ├── UploadDataView.tsx  # Drag-and-drop zone. Parses CSV/JSON into UploadedFile objects.
│   ├── DebugView.tsx       # Internal State Validator. Checks consistency between packet timestamp and system clock.
│   └── RadarChart.tsx      # Recharts wrapper for the 3-axis Scatter Plot (Impact vs Probability vs Severity).
│
└── utils/                  # HELPER LAYER
    ├── commandClassifier.ts # Intent Analysis. Classifies input strings as 'ROUTINE', 'EMERGENCY', etc.
    └── severityGovernor.ts  # Safety Logic. Prevents 'CRITICAL' risks from showing during 'ROUTINE' checks.
```

### 9.2 REACT COMPONENT HIERARCHY & DATA FLOW
The application uses a "Push Down" data flow architecture. State is held in `App.tsx` and drilled down.

```text
<App> (State: packet, config, uploadedFiles, liveStreams, logs)
  │
  ├── <Sidebar> (Props: activeView, onViewChange)
  │     └── Renders Icons (Layout, Activity, Shield...)
  │
  └── <MainContainer> (Flex Row)
        │
        ├── <PrimaryPane> (Flex Col)
        │     ├── <PanelTabs> (Props: activeView, openTabs)
        │     └── {RenderView(primaryActive)} -> Switch Statement
        │           ├── <Dashboard> (Props: packet, isProcessing)
        │           │     └── <OrbitalMap> (Canvas Ref)
        │           │     └── <MetricCard> (Repeated)
        │           │
        │           ├── <Terminal> (Props: packet, setPacket, uploadedFiles)
        │           │     └── Calls processTerminalCommand() -> Updates App State
        │           │
        │           ├── <SettingsPanel> (Props: config, setConfig)
        │           │     └── <Toggle>
        │           │     └── <ApiKeyConfig>
        │           │
        │           └── ... (Other Views)
        │
        └── <SecondaryPane> (Conditional: isSplitOpen)
              ├── <PanelTabs> (Props: activeView, openTabs)
              └── {RenderView(secondaryActive)}
                    └── ... (Reuses same components as Primary)
```

### 9.3 DATA PIPELINE MECHANICS

**Pipeline A: The Intelligence Loop (Gemini Generation)**
1.  **Trigger:** User types `/scan dataset X` in `<Terminal>`.
2.  **Parser:** `terminalEngine.ts` parses `verb` (scan) and `noun` (dataset).
3.  **Context Assembly:** Engine gathers `uploadedFiles` (if Company Mode) or `liveStreams`.
4.  **Service Call:** `geminiService.analyzeOrbit(query, context)` is invoked.
5.  **Mode Check & Injection:**
    *   *IF MOCK:* Load `HIGH_INTENSITY_PACKET` template. Mutate timestamps. Return immediately.
    *   *IF COMPANY:* Inject first 5KB of file content into System Prompt: `"[ENTERPRISE DATA]..."`.
    *   *IF LIVE:* Inject stream status into System Prompt.
6.  **LLM Execution:** Google Gemini models (`gemini-3-pro`) generate JSON string.
7.  **Schema Validation:** `@google/genai` Schema forces output to match `SentinelIntelPacket` interface.
8.  **State Update:** `App.tsx` receives `packet`. Calls `setPacket(data)`.
9.  **Render:** All views (<Dashboard>, <Monitor>, etc.) re-render automatically via React props.

**Pipeline B: The "Mounting" Logic (Data Isolation)**
1.  **Upload:** User drops file in `<UploadDataView>`. File is added to `uploadedFiles[]` state with `isMounted: true`.
2.  **Storage:** File content string is stored in memory (React State).
3.  **Settings:** User toggles "Unmount" in `<SettingsPanel>`. `isMounted` becomes `false`.
4.  **Terminal Access:** User types `/scan`.
    *   `getSuggestions()` runs in real-time.
    *   It filters: `files.filter(f => f.isMounted)`.
    *   Unmounted files do not appear in autocomplete.
5.  **Execution:** If user forces name of unmounted file, Engine returns "Target not mounted."

### 9.4 VISUAL DESIGN SYSTEM (THE "SKIN")

**Color Palette (Tailwind Utility Classes):**
*   **Backgrounds:**
    *   `bg-[#020617]` (Slate-950): Global Body Background. Deep Space.
    *   `bg-[#1e1e1e]` (Custom): Component Cards / Panels.
    *   `bg-[#252526]` (Custom): Headers / Tab Bars.
    *   `bg-[#0f172a]` (Slate-900): Inputs / Darker areas.
*   **Accents (Semantic Meaning):**
    *   `text-cyan-500` / `border-cyan-500`: Nominal / System / Radar / Info.
    *   `text-red-500` / `border-red-500`: Critical Risk / Attack / Error / Emergency.
    *   `text-amber-500` / `border-amber-500`: Company Data / Warning / Caution.
    *   `text-green-500` / `border-green-500`: Live Data / Success / Resolved / Safe.
    *   `text-slate-500`: Labels / Inactive Text / Meta-data.
*   **Typography:**
    *   Font Family: System Sans (UI Elements), Monospace (Data Values, Logs, Terminal).
    *   Size: Base `text-sm`, Data `text-xs` or `text-[10px]`.
    *   Weight: Labels `font-bold` + `uppercase` + `tracking-widest`.

**Layout Grid Strategy:**
*   **Sidebar:** Fixed `w-12`. Flex-col. `z-20`.
*   **Main Container:** `flex-1`. `flex-col`.
*   **Split View:** Flex Row. Dynamic Width % controlled by drag handle state in `App.tsx`.
*   **Footer:** Fixed `h-6`. `z-30`. `bg-[#007acc]`.

### 9.5 CRITICAL INTERFACES (THE "DNA")

**1. SystemConfig**
Controls the physics of the application universe.
```typescript
interface SystemConfig {
  dataMode: 'MOCK' | 'LIVE' | 'COMPANY'; // The Reality Stone
  aiMode: 'ECO' | 'ADVISOR' | 'PRO';     // The Personality Stone
  dataYear: number;                      // The Time Stone
  apiKey: string;                        // The Key
  enableGeminiApi: boolean;
  timeConfig: { ... };                   // The Clock
}
```

**2. SentinelIntelPacket (The Response)**
The structured output of the AI that drives the entire UI.
```typescript
interface SentinelIntelPacket {
  metadata: { timestamp, sector, confidence };
  dashboard: { 
      riskScore: number; 
      metrics: Metric[]; 
      radarPoints: Point[]; 
  }; 
  hiddenRisks: { 
      id: string; 
      title: string; 
      severity: RiskLevel; 
      mitigationAction: string; 
      mitigationStatus: 'pending' | 'implemented'; 
  }[]; 
  humanBlindspots: { 
      riskId: string; 
      type: string; 
      humanAssumption: string; 
  }[];
  trajectory: { timeline: Point[] };
  executiveBrief: { summary: string };
}
```

### 9.6 SECURITY & ISOLATION PROTOCOLS

1.  **The API Key Firewall:**
    *   The API Key is stored in `SystemConfig`.
    *   It is **NEVER** logged to the console.
    *   It is **NEVER** included in exported JSON/PDF reports (only the *status* of the key is shown).

2.  **The Cross-Mode Contamination Lock:**
    *   In `geminiService.ts`: `if (config.dataMode === 'MOCK') { ... return MOCK_DATA ... }`
    *   This `if` block executes *before* any API initialization, guaranteeing zero API usage in Mock mode.

3.  **The Browser Sandbox:**
    *   The app uses `localStorage` *only* for caching the Mock Data Template (`SENTINEL_CUSTOM_MOCK`).
    *   API Keys are NOT persisted to `localStorage` in this version (kept in React State only for session security).

---

## 10. FINAL SYSTEM STATUS

**SYSTEM HEALTH:** GREEN (NOMINAL)
**DATA INTEGRITY:** SECURE
**RENDER ENGINE:** OPTIMIZED
**USER SATISFACTION:** PROJECTED HIGH

The SENTINEL system is a testament to iterative, disciplined engineering. It is ready for the next phase of evolution.

**END OF MANIFEST**
