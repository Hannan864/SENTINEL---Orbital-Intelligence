
# SENTINEL SYSTEM // TECHNOLOGY STACK MANIFEST
**CLASSIFICATION:** INTERNAL LOG
**GENERATED:** 2025-05-15
**STATUS:** ACTIVE

## 1. CORE ARCHITECTURE
- **Language:** TypeScript (Strict Mode)
- **Runtime:** ES6 Modules (Browser Native via Import Maps)
- **Framework:** React v19.2.4 (Hooks-based Architecture)
- **Styling:** Tailwind CSS (Utility-first) via CDN
- **Entry Point:** `index.html` -> `index.tsx` -> `App.tsx`

## 2. ARTIFICIAL INTELLIGENCE & APIs
- **LLM Engine:** Google Gemini API (`@google/genai` v1.38.0)
  - **Models:** `gemini-3-pro-preview` (Complex Reasoning), `gemini-2.5-flash` (Fast Tasks/Grounding)
  - **Grounding:** Google Maps Grounding (Coordinate Resolution)
- **Context Injection:** Dynamic System Prompts based on Data Mode (MOCK/LIVE/COMPANY)

## 3. VISUALIZATION & RENDERING
- **3D Engine:** Three.js (r160 & r182)
  - **Renderers:** WebGLRenderer (Logarithmic Depth Buffer)
  - **Shaders:** Custom GLSL Shaders (Atmosphere Glow, Earth Surface Transitions, Holograms)
  - **Controls:** OrbitControls
- **2D Charting:** Recharts v3.7.0 (Scatter, Area, Line Charts)
- **Icons:** Lucide React v0.563.0

## 4. SIMULATION & PHYSICS
- **Physics Engine:** Custom TypeScript Implementation
  - **Integrator:** Runge-Kutta 4 (RK4) Semi-Implicit
  - **Models:** US Standard Atmosphere 1976 (Simplified), WGS84 Geodetic
  - **Orbital Mechanics:** Keplerian Elements to ECI/ECEF conversion
  - **Rocket Dynamics:** Variable Mass Systems (Tsiolkovsky rocket equation), Drag, Thrust, Gravity

## 5. DATA & STATE MANAGEMENT
- **State Strategy:** React Hooks (`useState`, `useReducer`, `useRef`)
- **Persistence:** `localStorage` (Mock Data Caching, Settings)
- **File Handling:** Browser `FileReader` API (Client-side parsing of CSV/JSON)
- **PDF Generation:** `jspdf` (Programmatic Vector Drawing)

## 6. INFRASTRUCTURE & DEPLOYMENT
- **Environment:** Client-Side Single Page Application (SPA)
- **Build Tooling:** None (Direct ESM via `esm.sh` CDN for portability)
- **Hosting:** Static Web Host compatible (Vercel, Netlify, GitHub Pages)

## 7. KEY LIBRARIES
- `react`: UI Component Library
- `react-dom`: DOM Rendering
- `@google/genai`: AI Intelligence Layer
- `three`: 3D Graphics & Scene Graph
- `recharts`: Data Visualization
- `lucide-react`: SVG Iconography
- `jspdf`: Report Generation
- `html2canvas`: Canvas Capture (Auxiliary)

## 8. DESIGN SYSTEMS
- **Theme:** "Sentinel Dark" (Slate-950 Base)
- **Typography:** Monospace (Data), System Sans (UI)
- **Effects:** CSS Filters (Blur, Contrast), CSS Animations (Pulse, Spin)
