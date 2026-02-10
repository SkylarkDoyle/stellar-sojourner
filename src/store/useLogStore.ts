import { create } from "zustand";

export interface LogEntry {
  id: string;
  timestamp: string; // ISO string
  level: "info" | "success" | "warning" | "error" | "critical";
  source: string; // e.g., 'NAV', 'ENG', 'COMMS'
  message: string;
}

interface LogState {
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [
    {
      id: "init-1",
      timestamp: new Date().toISOString(),
      level: "info",
      source: "SYSTEM",
      message: "Mission Control initialized. Systems nominal.",
    },
  ],

  addLog: (entry) =>
    set((state) => ({
      logs: [
        {
          ...entry,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
        },
        ...state.logs,
      ].slice(0, 1000), // Keep last 100 entries
    })),

  clearLogs: () => set({ logs: [] }),
}));
