import { useEffect, useState } from "react";
import { hotkeyRegistry } from "../core/registry";
import { formatKeyCombo } from "../core/key-matcher";
import type { HotkeyConfig } from "../core/types";

interface HotkeysHelpModalProps {
  close: () => void;
}

export function HotkeysHelpModal({ close }: HotkeysHelpModalProps) {
  const [shortcuts, setShortcuts] = useState<HotkeyConfig[]>([]);

  useEffect(() => {
    // Esc key to close this modal directly
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => {
    return hotkeyRegistry.subscribe((list) => {
      setShortcuts(list);
    });
  }, []);

  // Group hotkeys by category
  const grouped = shortcuts.reduce<Record<string, HotkeyConfig[]>>((acc, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Keyboard Shortcuts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick access shortcuts available on this page</p>
          </div>
          <button
            onClick={close}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-center text-sm text-slate-400">No active shortcuts registered.</p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{category}</h3>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0"
                    >
                      <span className="text-slate-600 font-medium">{item.description}</span>
                      <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg shadow-sm text-xs font-semibold text-slate-700 font-mono tracking-wide">
                        {formatKeyCombo(item.keys)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={close}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
