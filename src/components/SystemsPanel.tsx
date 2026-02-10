import clsx from "clsx";
import { useShipStore } from "../store/useShipStore";
import { Box, Activity, Zap, Thermometer } from "lucide-react";
import { TelemetryGraph } from "./TelemetryGraph";

export function SystemsPanel() {
  const { systems, telemetry, history, takeDamage } = useShipStore();

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Hull & Fuel Status */}
      <div className="border border-cyan-900/50 bg-gray-900/80 p-4 rounded-lg backdrop-blur-md shadow-lg">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
          <Box size={14} /> Vessel Status
        </h2>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] uppercase text-gray-500">
                Hull / Shields
              </span>
              <span
                className={clsx(
                  "font-mono font-bold",
                  telemetry.shieldIntegrity < 40
                    ? "text-red-500 animate-pulse"
                    : "text-cyan-300",
                )}
              >
                {telemetry.shieldIntegrity.toFixed(1)}%
              </span>
            </div>
            <div className="h-10 bg-black/40 rounded overflow-hidden border border-gray-800 relative">
              <TelemetryGraph
                data={history.shields}
                color={telemetry.shieldIntegrity < 40 ? "#ef4444" : "#06b6d4"}
                height={40}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] uppercase text-gray-500">
                Fuel Reserves
              </span>
              <span className="font-mono text-amber-400">
                {telemetry.fuelLevel.toFixed(2)}%
              </span>
            </div>
            <div className="h-10 bg-black/40 rounded overflow-hidden border border-gray-800 relative">
              <TelemetryGraph data={history.fuel} color="#f59e0b" height={40} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] uppercase text-gray-500">
                Life Support
              </span>
              <span className="font-mono text-emerald-400">
                {telemetry.lifeSupport.toFixed(1)}%
              </span>
            </div>
            <div className="h-10 bg-black/40 rounded overflow-hidden border border-gray-800 relative">
              <TelemetryGraph
                data={history.lifeSupport}
                color="#10b981"
                height={40}
              />
            </div>
          </div>

          <button
            onClick={() => takeDamage(15)}
            className="w-full mt-4 py-3 text-[10px] border border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-900/40 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Zap size={12} /> Simulate Impact
          </button>
        </div>
      </div>

      {/* Subsystems List */}
      <div className="flex-1 border border-cyan-900/50 bg-gray-900/80 p-4 rounded-lg backdrop-blur-md shadow-lg overflow-y-auto">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
          <Activity size={14} /> Subsystems
        </h2>
        <div className="space-y-3">
          {systems.map((sys) => (
            <div
              key={sys.id}
              className="group flex justify-between items-center bg-black/40 p-3 rounded border border-transparent hover:border-cyan-900/50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-xs text-gray-300 group-hover:text-cyan-200 transition-colors uppercase tracking-wider">
                  {sys.name}
                </span>
                <span className="text-[10px] text-gray-600 flex items-center gap-1 mt-1">
                  <Thermometer size={8} /> {sys.temperature}K
                </span>
              </div>
              {/* FIXED BADGE STYLES */}
              <div
                className={clsx(
                  "text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider",
                  sys.status === "nominal"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : sys.status === "warning"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20",
                )}
              >
                {sys.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
