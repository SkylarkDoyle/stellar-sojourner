# Stellar Sojourner

> A next-generation holographic starship navigation interface built with React Three Fiber.

<!-- ![Cover Image](./public/cover-placeholder.png) -->

## Overview

**Stellar Sojourner** is an immersive, 3D web application simulating a futuristic spaceship's holographic navigation deck. Heavily inspired by the aesthetics of _No Man's Sky_ and _Elite Dangerous_, it features a fully interactive 3D environment where users can pilot a ship, plot warp courses to distant star systems, and experience cinematic hyperspace travel.

Built with **React**, **Three.js (R3F)**, and **TailwindCSS**, this project demonstrates high-performance web graphics, procedural generation, and complex state management for a seamless "game-like" UI experience.

## ✨ Key Features

### 🛸 Interactive Holographic Deck

- **3D Ship Model**: A detailed spaceship with thruster animations, gimballed movement, and mouse-following orientation control.
- **Dynamic Star Field**: thousands of stars creating a sense of depth and motion.
- **Directional Lighting**: Realistic sun lighting with visible celestial bodies and shadows.

### 🌌 Cinematic Warp Travel

- **NMS-Style Warp Tunnel**: A completely custom warp effect featuring:
  - High-speed radial light streaks.
  - Luminous atmospheric bloom.
  - Distant vanishing point visualization.
  - Screen shake and flash transitions.
- **Audio Integration**: (Planned) Sound effects synced to warp charging, jumping, and exit.

### 🪐 Planetary Systems & Hazards

- **Unique Star Systems**: Distinct visual identities for Sol, Proxima Centauri, Wolf 359, Sirius, and TRAPPIST-1.
- **Procedural Asteroid Fields**:
  - High-performance `InstancedMesh` rendering (hundreds of asteroids).
  - Noise-based geometry deformation for realistic, lumpy rock shapes.
  - Per-instance color variation (drab greys, browns, rusts).
  - Dynamic hazard levels—asteroids only appear in dangerous sectors (e.g., TRAPPIST-1).

### 🗺️ Navigation Computer

- **3D Star Map**: Interactive rotatable map for selecting destinations.
- **Route Plotting**: Visual connection lines and distance calculations.
- **System Information**: Detailed readouts on star types, spectral classes, and hazards.

## 🛠️ Tech Stack

- **Core**: [React 18](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **3D Graphics**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [Drei](https://github.com/pmndrs/drei), [Three.js](https://threejs.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (for ship state, navigation, and warp status)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Linting**: ESLint, Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/stellar-sojourner.git
   cd stellar-sojourner
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## 🎮 Controls

- **Mouse**: Move cursor to orient the ship (pitch/yaw/roll).
- **Left Click**: Select systems in the Navigation sidebar.
- **Warp Engagement**: Click "ENGAGE WARP DRIVE" in the nav panel to travel to a selected system.

## 📂 Project Structure

```
src/
├── components/
│   ├── HologramDeck/       # Main 3D Scene Components
│   │   ├── DeckCanvas.tsx  # R3F Canvas setup
│   │   ├── ShipModel.tsx   # Spaceship mesh & animation
│   │   ├── WarpTunnel.tsx  # Cinematic warp effects
│   │   ├── AsteroidField.tsx # Instanced asteroid hazards
│   │   └── SystemBodies.tsx # Planetary bodies (Sol, Proxima, etc.)
│   └── Layout/             # UI Overlays (Sidebar, HUD)
├── store/
│   └── useNavStore.ts      # Global state (Navigation, Warp, Ship)
├── App.tsx                 # Main entry point
└── main.tsx
```

## 🔮 Future Roadmap

- [ ] Cockpit View mode.
- [ ] Procedural planet texturing with shaders.
- [ ] Combat simulation (laser systems).
- [ ] Multiplayer fleet integration.

<!-- ## 📄 License

MIT License. See `LICENSE` for details. -->
