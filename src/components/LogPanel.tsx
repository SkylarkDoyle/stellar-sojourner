import { useEffect, useRef } from "react";
import clsx from "clsx";
import { useLogStore } from "../store/useLogStore";
import { FileText, Plus } from "lucide-react";

export function LogPanel() {
  const { logs, addLog } = useLogStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col border border-cyan-900/50 bg-gray-900/80 p-4 rounded-lg backdrop-blur-md shadow-lg min-h-0">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 border-b border-gray-800 pb-2 flex items-center gap-2">
        <FileText size={14} /> Data Stream
      </h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {logs.map((log) => (
          <div
            key={log.id}
            className="text-[10px] font-mono leading-relaxed border-l-2 border-cyan-900/30 pl-3 py-1 opacity-80 hover:opacity-100 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-gray-600">
                [
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour12: false,
                })}
                ]
              </span>
              <span
                className={clsx(
                  "font-bold tracking-wider",
                  log.level === "error"
                    ? "text-red-500"
                    : log.level === "warning"
                      ? "text-amber-500"
                      : "text-cyan-400",
                )}
              >
                {log.source}
              </span>
            </div>
            <div className="text-gray-300 break-words">{log.message}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <button
        onClick={() =>
          addLog({
            level: "info",
            source: "CAPTAIN",
            message: "Manual log entry recorded.",
          })
        }
        className="mt-2 text-[10px] text-gray-600 hover:text-cyan-400 flex items-center gap-1 justify-center w-full py-1 border border-transparent hover:border-cyan-900/30 rounded transition-colors"
      >
        <Plus size={10} /> Add Log Entry
      </button>
    </div>
  );
}
