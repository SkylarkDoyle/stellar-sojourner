import clsx from "clsx";
import { useNavStore } from "../store/useNavStore";
import { Compass, Zap, MapPin } from "lucide-react";
import { startEngineHum } from "../audio/SoundEngine";
import { StarMap3D } from "./StarMap3D";

export function NavPanel() {
  const { currentSystem, warpStatus, initiateWarp, targetSystem } =
    useNavStore();

  return (
    <div className="border border-cyan-900/50 bg-gray-900/80 p-4 rounded-lg backdrop-blur-md shadow-lg">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
        <Compass size={14} /> Navigation
      </h2>

      <div className="bg-black/50 p-3 rounded mb-4 border border-cyan-900/30 shadow-inner">
        <div className="text-[9px] text-gray-500 uppercase mb-1 flex items-center gap-1">
          <MapPin size={10} /> Current Sector
        </div>
        <div className="text-lg text-white font-bold tracking-wide">
          {currentSystem.name}
        </div>
        <div className="text-xs text-cyan-600 font-mono mt-1 opacity-70">
          COORD: {currentSystem.coordinates.x.toFixed(2)} /{" "}
          {currentSystem.coordinates.y.toFixed(2)} /{" "}
          {currentSystem.coordinates.z.toFixed(2)}
        </div>
      </div>

      {/* 3D Holographic Star Map */}
      <div className="mb-3">
        <StarMap3D />
      </div>

      {/* Target info */}
      {targetSystem && (
        <div className="text-[10px] text-cyan-400 font-mono mb-3 px-1 flex justify-between">
          <span>TARGET: {targetSystem.name}</span>
          <span className="text-gray-500">
            {Math.sqrt(
              Math.pow(
                targetSystem.coordinates.x - currentSystem.coordinates.x,
                2,
              ) +
                Math.pow(
                  targetSystem.coordinates.y - currentSystem.coordinates.y,
                  2,
                ) +
                Math.pow(
                  targetSystem.coordinates.z - currentSystem.coordinates.z,
                  2,
                ),
            ).toFixed(1)}{" "}
            LY
          </span>
        </div>
      )}

      <button
        onClick={() => {
          startEngineHum();
          initiateWarp();
        }}
        disabled={warpStatus !== "idle"}
        className={clsx(
          "w-full py-4 mt-2 font-bold text-xs tracking-[0.2em] uppercase rounded clip-corner transition-all duration-300 flex items-center justify-center gap-2",
          warpStatus === "idle"
            ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700",
        )}
      >
        <Zap
          size={14}
          className={warpStatus !== "idle" ? "animate-pulse" : ""}
        />
        {warpStatus === "idle" ? "Engage Warp Drive" : "Sequence Active"}
      </button>
    </div>
  );
}
