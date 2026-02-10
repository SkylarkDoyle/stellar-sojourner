import { useState, useEffect } from "react";

import { useNavStore } from "./store/useNavStore";
import { useShipStore } from "./store/useShipStore";
import { useLogStore } from "./store/useLogStore";
import { DeckCanvas } from "./components/HologramDeck/DeckCanvas";
import { SystemsPanel } from "./components/SystemsPanel";
import { NavPanel } from "./components/NavPanel";
import { LogPanel } from "./components/LogPanel";
import { ChevronRight, ChevronLeft } from "lucide-react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  // Collapsible state (false by default as requested)
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Stores for the header info
  const { warpStatus, moveShip } = useNavStore();
  const { addLog } = useLogStore();

  // Simulation Loop ("Gamification")
  const { updateTelemetry, telemetry } = useShipStore();

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Fuel consumption
      const fuelConsume = 0.02 + Math.random() * 0.05;
      const newFuel = Math.max(0, telemetry.fuelLevel - fuelConsume);

      // 2. Life Support Fluctuation
      const lsFluctuation = (Math.random() - 0.5) * 0.2;
      const newLS = Math.min(
        100,
        Math.max(90, telemetry.lifeSupport + lsFluctuation),
      );

      // 3. Shield Regen (slow)
      let newShields = telemetry.shieldIntegrity;
      if (newShields < 100) {
        newShields = Math.min(100, newShields + 0.5);
      }

      updateTelemetry({
        fuelLevel: newFuel,
        lifeSupport: newLS,
        shieldIntegrity: newShields,
      });

      // Random Sensor Chatter
      if (Math.random() > 0.98) {
        addLog({
          level: "info",
          source: "SENSORS",
          message: `Background radiation levels nominal. Sector scan complete.`,
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [
    addLog,
    updateTelemetry,
    telemetry.fuelLevel,
    telemetry.lifeSupport,
    telemetry.shieldIntegrity,
  ]);

  // Auto-close panels when Warp is engaged
  useEffect(() => {
    if (warpStatus !== "idle") {
      setShowLeftPanel(false);
      setShowRightPanel(false);
    }
  }, [warpStatus]);

  // Mission Clock
  const [missionTime, setMissionTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMissionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Manual Flight Controls

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable controls if charging/jumping or if panels are focused (though panels are just divs)
      if (warpStatus !== "idle") return;

      const speed = 1; // Movement speed

      switch (e.key.toLowerCase()) {
        case "w":
          moveShip({ x: 0, y: 0, z: -speed });
          break; // Forward
        case "s":
          moveShip({ x: 0, y: 0, z: speed });
          break; // Backward
        case "a":
          moveShip({ x: -speed, y: 0, z: 0 });
          break; // Strafe Left
        case "d":
          moveShip({ x: speed, y: 0, z: 0 });
          break; // Strafe Right
        case "q":
          moveShip({ x: 0, y: speed, z: 0 });
          break; // Up
        case "e":
          moveShip({ x: 0, y: -speed, z: 0 });
          break; // Down
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveShip, warpStatus]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="h-screen bg-black text-cyan-400 font-mono flex overflow-hidden relative selection:bg-cyan-500/30">
      {/* === LEFT SIDEBAR === */}
      <AnimatePresence mode="wait">
        {showLeftPanel && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 flex-shrink-0 flex flex-col gap-4 p-4 z-20 bg-[#050508]/90 border-r border-cyan-900/30 backdrop-blur-xl h-full absolute left-0 top-0 bottom-0 md:relative md:bg-transparent md:backdrop-blur-none"
          >
            <SystemsPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* === TOGGLE LEFT BUTTON === */}
      <button
        onClick={() => setShowLeftPanel(!showLeftPanel)}
        className="absolute top-1/2 left-0 z-30 -translate-y-1/2 bg-cyan-900/50 hover:bg-cyan-600/50 text-cyan-200 p-1 rounded-r border-y border-r border-white/10 transition-colors"
      >
        {showLeftPanel ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* === CENTER ("THE DECK") === */}
      <div className="flex-1 flex flex-col relative min-w-0 h-full">
        {/* Header Overlay */}
        <header
          className={clsx(
            "absolute top-4 left-16 right-16 z-10 flex justify-between pointer-events-none transition-all duration-500",
            showLeftPanel || showRightPanel ? "opacity-50" : "opacity-100",
          )}
        >
          <div className="flex flex-col">
            <h1 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              STELLAR SOJOURNER
            </h1>
            <span className="text-xs text-cyan-500 font-mono tracking-[0.5em] pl-1">
              MK-IV EXPLORATION VESSEL
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">MISSION CLOCK</div>
            <div className="text-xl font-mono text-cyan-300">
              T+{formatTime(missionTime)}
            </div>
          </div>
        </header>

        {/* Main 3D Canvas */}
        <div className="flex-1 relative w-full h-full">
          <DeckCanvas />

          {/* Warp Overlay */}
          {(warpStatus === "jumping" || warpStatus === "cooling") && (
            <div
              className={clsx(
                "absolute inset-0 pointer-events-none z-0 transition-all duration-700",
                warpStatus === "cooling" ? "bg-white/80" : "bg-transparent",
              )}
            >
              {warpStatus === "jumping" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-purple-400 animate-pulse tracking-[0.3em] italic filter drop-shadow-[0_0_40px_rgba(192,132,252,0.8)] scale-110">
                    WARP ENGAGED
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* === TOGGLE RIGHT BUTTON === */}
      <button
        onClick={() => setShowRightPanel(!showRightPanel)}
        className="absolute top-1/2 right-0 z-30 -translate-y-1/2 bg-cyan-900/50 hover:bg-cyan-600/50 text-cyan-200 p-1 rounded-l border-y border-l border-white/10 transition-colors"
      >
        {showRightPanel ? (
          <ChevronRight size={20} />
        ) : (
          <ChevronLeft size={20} />
        )}
      </button>

      {/* === RIGHT SIDEBAR === */}
      <AnimatePresence mode="wait">
        {showRightPanel && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 flex-shrink-0 flex flex-col gap-4 p-4 z-20 bg-[#050508]/90 border-l border-cyan-900/30 backdrop-blur-xl h-full absolute right-0 top-0 bottom-0 md:relative md:bg-transparent md:backdrop-blur-none"
          >
            <NavPanel />
            <LogPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
