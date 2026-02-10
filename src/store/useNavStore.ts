import { create } from "zustand";
import {
  setEngineIntensity,
  playWarpEngage,
  playWarpExit,
} from "../audio/SoundEngine";

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface StarSystem {
  id: string;
  name: string;
  type: "star" | "black_hole" | "nebula" | "binary" | "pulsar";
  coordinates: Vector3;
  hazardLevel: number; // 0-10
  spectralClass?: string;
  description: string;
}

export interface NavigationState {
  currentSystem: StarSystem;
  targetSystem: StarSystem | null;
  knownSystems: StarSystem[];
  warpStatus: "idle" | "charging" | "jumping" | "cooling";
  warpProgress: number; // 0-100%

  // Manual Flight
  shipPosition: Vector3;
  shipRotation: Vector3;

  // Actions
  setTargetSystem: (system: StarSystem | null) => void;
  initiateWarp: () => void;
  updateWarpProgress: (progress: number) => void;
  completeWarp: () => void;
  moveShip: (delta: Vector3) => void;
  rotateShip: (delta: Vector3) => void;
}

const SOLAR_SYSTEM: StarSystem = {
  id: "sol",
  name: "Sol System",
  type: "star",
  coordinates: { x: 0, y: 0, z: 0 },
  hazardLevel: 0,
  spectralClass: "G2V",
  description: "Home system. Cradle of humanity.",
};

const KNOWN_SYSTEMS: StarSystem[] = [
  SOLAR_SYSTEM,
  {
    id: "proxima",
    name: "Proxima Centauri",
    type: "star",
    coordinates: { x: 4.2, y: 0.5, z: -1.2 },
    hazardLevel: 2,
    spectralClass: "M5Ve",
    description: "Nearest stellar neighbor. High flare activity.",
  },
  {
    id: "wolf359",
    name: "Wolf 359",
    type: "star",
    coordinates: { x: -2.4, y: 5.1, z: 3.8 },
    hazardLevel: 5,
    spectralClass: "M6.5Ve",
    description: "Strategic outpost. Site of historical conflict.",
  },
  {
    id: "sirius",
    name: "Sirius",
    type: "binary",
    coordinates: { x: 1.8, y: -3.2, z: 7.5 },
    hazardLevel: 3,
    spectralClass: "A1V",
    description: "Brightest star. Binary system with white dwarf.",
  },
  {
    id: "trapist",
    name: "TRAPPIST-1",
    type: "star",
    coordinates: { x: -8.1, y: 12.4, z: -4.3 },
    hazardLevel: 8,
    spectralClass: "M8V",
    description: "Seven temperate planets. Potential alien biosignatures.",
  },
];

export const useNavStore = create<NavigationState>((set, get) => ({
  currentSystem: SOLAR_SYSTEM,
  targetSystem: null,
  knownSystems: KNOWN_SYSTEMS,
  warpStatus: "idle",
  warpProgress: 0,
  shipPosition: { x: 0, y: 0, z: 0 },
  shipRotation: { x: 0, y: 0, z: 0 },

  setTargetSystem: (system) => set({ targetSystem: system }),

  moveShip: (delta) =>
    set((state) => ({
      shipPosition: {
        x: state.shipPosition.x + delta.x,
        y: state.shipPosition.y + delta.y,
        z: state.shipPosition.z + delta.z,
      },
      // Update coordinates of current system for display
      currentSystem: {
        ...state.currentSystem,
        coordinates: {
          x: state.currentSystem.coordinates.x + delta.x / 100, // Scale down for "sectors"
          y: state.currentSystem.coordinates.y + delta.y / 100,
          z: state.currentSystem.coordinates.z + delta.z / 100,
        },
      },
    })),

  rotateShip: (delta) =>
    set((state) => ({
      shipRotation: {
        x: state.shipRotation.x + delta.x,
        y: state.shipRotation.y + delta.y,
        z: state.shipRotation.z + delta.z,
      },
    })),

  initiateWarp: () => {
    const { targetSystem, warpStatus } = get();
    if (!targetSystem || warpStatus !== "idle") return;

    set({ warpStatus: "charging", warpProgress: 0 });
    setEngineIntensity("charging");
    playWarpEngage();

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      set({ warpProgress: progress });
      if (progress >= 100) {
        clearInterval(interval);
        set({ warpStatus: "jumping" });
        setEngineIntensity("jumping");
        setTimeout(() => get().completeWarp(), 4000);
      }
    }, 50);
  },

  updateWarpProgress: (progress) => set({ warpProgress: progress }),

  completeWarp: () => {
    const { targetSystem } = get();
    if (targetSystem) {
      set({
        currentSystem: targetSystem,
        targetSystem: null,
        warpStatus: "cooling",
        warpProgress: 0,
      });
      playWarpExit();
      setEngineIntensity("cooling");
      setTimeout(() => {
        set({ warpStatus: "idle" });
        setEngineIntensity("idle");
      }, 3000);
    }
  },
}));
