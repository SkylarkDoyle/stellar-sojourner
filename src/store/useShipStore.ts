import { create } from "zustand";

export interface ShipSystem {
  id: string; // e.g., 'propulsion', 'life_support'
  name: string;
  integrity: number; // 0-100%
  powerAllocation: number; // 0-100%
  status: "nominal" | "warning" | "critical" | "offline";
  temperature: number; // in Kelvin
}

export interface ShipTelemetry {
  velocity: number; // km/s
  fuelLevel: number; // percentage
  powerOutput: number; // percentage
  shieldIntegrity: number; // percentage
  internalTemperature: number; // Celsius
  lifeSupport: number; // percentage
}

interface TelemetryHistory {
  fuel: number[];
  shields: number[];
  lifeSupport: number[];
}

interface ShipState {
  systems: ShipSystem[];
  telemetry: ShipTelemetry;
  history: TelemetryHistory;
  alertLevel: "normal" | "caution" | "warning" | "emergency";

  // Actions
  updateSystem: (id: string, updates: Partial<ShipSystem>) => void;
  updateTelemetry: (updates: Partial<ShipTelemetry>) => void;
  setAlertLevel: (level: ShipState["alertLevel"]) => void;
  takeDamage: (amount: number) => void;
}

const INITIAL_SYSTEMS: ShipSystem[] = [
  {
    id: "reactor",
    name: "Fusion Reactor",
    integrity: 100,
    powerAllocation: 100,
    status: "nominal",
    temperature: 3000,
  },
  {
    id: "propulsion",
    name: "Ion Drives",
    integrity: 100,
    powerAllocation: 80,
    status: "nominal",
    temperature: 450,
  },
  {
    id: "shields",
    name: "Deflector Shields",
    integrity: 100,
    powerAllocation: 60,
    status: "nominal",
    temperature: 200,
  },
  {
    id: "lifesupport",
    name: "Life Support",
    integrity: 100,
    powerAllocation: 100,
    status: "nominal",
    temperature: 295,
  },
];

export const useShipStore = create<ShipState>((set) => ({
  systems: INITIAL_SYSTEMS,
  telemetry: {
    velocity: 0,
    fuelLevel: 98.5,
    powerOutput: 85,
    shieldIntegrity: 100,
    internalTemperature: 22.5,
    lifeSupport: 100,
  },
  history: {
    fuel: Array(50).fill(98.5),
    shields: Array(50).fill(100),
    lifeSupport: Array(50).fill(100),
  },
  alertLevel: "normal",

  updateSystem: (id, updates) =>
    set((state) => ({
      systems: state.systems.map((sys) =>
        sys.id === id ? { ...sys, ...updates } : sys,
      ),
    })),

  updateTelemetry: (updates) =>
    set((state) => {
      const newTelemetry = { ...state.telemetry, ...updates };

      // Update history
      const newHistory = { ...state.history };
      if (updates.fuelLevel !== undefined) {
        newHistory.fuel = [...state.history.fuel.slice(1), updates.fuelLevel];
      }
      if (updates.shieldIntegrity !== undefined) {
        newHistory.shields = [
          ...state.history.shields.slice(1),
          updates.shieldIntegrity,
        ];
      }
      if (updates.lifeSupport !== undefined) {
        newHistory.lifeSupport = [
          ...state.history.lifeSupport.slice(1),
          updates.lifeSupport,
        ];
      }

      return {
        telemetry: newTelemetry,
        history: newHistory,
      };
    }),

  setAlertLevel: (level) => set({ alertLevel: level }),

  takeDamage: (amount) =>
    set((state) => {
      const newShields = Math.max(0, state.telemetry.shieldIntegrity - amount);
      const hullDamage =
        amount > state.telemetry.shieldIntegrity
          ? amount - state.telemetry.shieldIntegrity
          : 0;

      // Update history for damage event
      const newHistory = { ...state.history };
      newHistory.shields = [...state.history.shields.slice(1), newShields];

      // Random system takes damage if hull is hit
      let newSystems = state.systems;
      if (hullDamage > 0) {
        newSystems = state.systems.map((sys) => {
          if (Math.random() > 0.7) {
            const dmg = Math.floor(Math.random() * hullDamage);
            return {
              ...sys,
              integrity: Math.max(0, sys.integrity - dmg),
              status:
                sys.integrity - dmg < 30
                  ? "critical"
                  : sys.integrity - dmg < 60
                    ? "warning"
                    : "nominal",
            };
          }
          return sys;
        });
      }

      return {
        telemetry: { ...state.telemetry, shieldIntegrity: newShields },
        history: newHistory,
        systems: newSystems,
        alertLevel:
          newShields < 20
            ? "emergency"
            : newShields < 50
              ? "warning"
              : state.alertLevel,
      };
    }),
}));
