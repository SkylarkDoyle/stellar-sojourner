# Stellar Sojourner - Mission Control Dashboard

## Architectural Design & Development Plan

### 1. Project Overview

**Concept**: A high-fidelity, sci-fi mission control interface for a deep-space exploration vessel. The dashboard visualizes real-time ship telemetry, navigation data, and external sensor readings using 3D visualizations and complex data grids.
**Platform**: Web (Modern Browsers).
**Architecture**: Client-side Single Page Application (SPA). No backend; data is mocked or procedurally generated locally.

---

### 2. Technology Stack

#### Core

- **Runtime**: Node.js (strictly for build environment).
- **Framework**: **React 19** (via Vite) - For component-based UI architecture.
- **Language**: **TypeScript** - Essential for strict typing of complex telemetry data structures.

#### Visuals & Interaction

- **3D Engine**: **Three.js** + **React Three Fiber (R3F)** - For the holographic ship display and star map.
- **3D Helpers**: **@react-three/drei** - For camera controls, environmental effects, and loaders.
- **Styling**: **Vanilla CSS / CSS Modules** - To achieve specific, high-performance "Sci-Fi HUD" effects (glowing borders, scanlines, matrix transforms) that are difficult to replicate with utility classes.
- **Motion**: **Framer Motion** - For complex UI transitions (panels sliding in, numbers ticking up).
- **Data Viz**: **Recharts** or **Visx** (or custom SVG) - For telemetry graphs (fuel graphs, power output).

#### State Management

- **Store**: **Zustand** - Lightweight state management. Perfect for bridging the gap between the React UI (DOM) and the R3F Canvas (3D), which often needs high-performance state updates without re-rendering the whole tree.

---

### 3. Data Architecture (Frontend Schema)

Since there is no backend, the "Schema" is defined by TypeScript Interfaces and Zustand Stores.

#### **ShipStatus Store**

Manages the physical state of the vessel.

```typescript
interface ShipSystem {
  id: string; // e.g., 'propulsion', 'life_support'
  name: string;
  integrity: number; // 0-100%
  powerAllocation: number; // 0-100%
  status: "nominal" | "warning" | "critical" | "offline";
  temperature: number; // in Kelvin
}

interface ShipTelemetry {
  velocity: number; // km/s
  fuelLevel: number; // percentage
  shieldIntegrity: number; // percentage
  internalTemperature: number; // Celsius
}
```

#### **Navigation Store**

Manages location and warp travel.

```typescript
interface StarSystem {
  id: string;
  name: string;
  type: "star" | "black_hole" | "nebula";
  coordinates: [x, y, z];
  hazardLevel: number;
}

interface NavigationState {
  currentSystem: StarSystem;
  targetSystem: StarSystem | null;
  warpStatus: "idle" | "charging" | "jumping" | "cooling";
  progress: number; // 0-100% (warp progress)
}
```

#### **MissionLog Store**

A rolling log of events.

```typescript
interface LogEntry {
  id: string;
  timestamp: string; // ISO or "Stardate"
  level: "info" | "alert" | "success";
  source: string; // e.g., "ENGINEERING", "SENSORS"
  message: string;
}
```

---

### 4. UI/UX Design System

#### **Aesthetic Direction: "Orbital Glass"**

- **Palette**: Deep space charcoal backgrounds (`#0a0a0f`), Electric Cyan (`#00f3ff`) for active elements, Alert Crimson (`#ff003c`) for critical warnings, Amber (`#ffbd00`) for secondary info.
- **Typography**:
  - Headers: **'Orbitron'** or **'Rajdhani'** (Google Fonts) - Technical, blocky.
  - Data: **'JetBrains Mono'** or **'Fira Code'** - Monospaced for rapidly changing numbers.
- **Visual Motif**:
  - **Glassmorphism**: Semi-transparent panels with background blur (`backdrop-filter`).
  - **Thin Lines**: 1px borders with glowing box-shadows.
  - **Corner Accents**: Bracketed corners on panels `[ ]`.
  - **Scanlines**: Subtle CSS overlay to simulate CRT/Holographic projection.

#### **Layout Strategy (The "Cockpit")**

1.  **Top Bar**: Global status (Stardate, Alert Level, FPS).
2.  **Left Sidebar (Engineering)**:
    - Vertical bars for Power, Fuel, Oxygen.
    - System health list (Propulsion, Shields, Comms).
3.  **Center Stage (Hologram)**:
    - Interactive 3D model of the _Stellar Sojourner_.
    - Rotatable, zoomable.
    - Shows damage visually (red mesh highlights).
4.  **Right Sidebar (Navigation)**:
    - Mini Star Map (2D or 3D).
    - Coordinate input.
    - "Warp" button (big, satisfying interaction).
5.  **Bottom Panel (Console)**:
    - Scrolling Mission Log.
    - Command Line input (optional, for "commands").

---

### 5. Implementation Roadmap

#### **Phase 1: Foundation (The Chassis)**

- Initialize Vite + React + TypeScript.
- Set up Vanilla CSS variables (colors, spacing).
- Configure Zustand stores (dummy data).
- Create the "Shell" layout (Top, Left, Right, Bottom, Center).

#### **Phase 2: The Hologram (Three.js Core)**

- Set up R3F Canvas in the Center Stage.
- Import a low-poly spaceship model (or use primitives for draft).
- Add orbit controls and "Holographic" shader material (wireframe + glow).

#### **Phase 3: Systems & Data (The Logic)**

- Connect Sidebars to `ShipStatus` store.
- Create reusable "HUD Components" (e.g., `ProgressBar`, `StatCard`, `SystemList`).
- Implement the "Heartbeat" (a `useEffect` loop that subtly fluctuates values like temperature and fuel to make the ship feel alive).

#### **Phase 4: Navigation & Logs (The Gameplay)**

- detailed Mission Log component.
- Interactive Star Map in the Right Sidebar.
- Warp Jump sequence (visual effect + state change).

#### **Phase 5: Polish (The "Wow" Factor)**

- Sound effects (UI clicks, hums - optional utilizing Web Audio API).
- Entry animations (dashboard "boot up" sequence).
- Responsive adjustments.
