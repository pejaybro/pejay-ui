import { useState } from "react";
import { ModalCard } from "./modal/modal-card";
import { formatModKey } from "../core/keyboard-utils";

const MOD = formatModKey();

const SHORTCUT_GROUPS = [
  {
    title: "Form (side panel / modal)",
    items: [
      { keys: `${MOD} + Enter`, action: "Submit form" },
      { keys: "Alt + ← / →", action: "Previous / next form tab" },
      { keys: "Esc", action: "Close form" },
    ],
  },
  {
    title: "List pages",
    items: [
      { keys: `${MOD} + Alt + N`, action: "New record / open add form" },
    ],
  },
  {
    title: "Global",
    items: [
      { keys: "Shift + ?", action: "Show this shortcut guide" },
      { keys: `${MOD} + K`, action: "Focus search" },
    ],
  },
];

type KeyboardShortcutsHelpProps = {
  close: () => void;
};

export function KeyboardShortcutsHelp({ close }: KeyboardShortcutsHelpProps) {
  return (
    <ModalCard
      close={close}
      title="Keyboard shortcuts"
      description="Shortcuts for forms, lists, and navigation."
      width="min(36rem, 92vw)"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={close}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {SHORTCUT_GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              {group.title}
            </h3>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li
                  key={item.keys}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm text-slate-600">{item.action}</span>
                  <kbd className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-800">
                    {item.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ModalCard>
  );
}

export function useKeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  return { helpOpen: open, setHelpOpen: setOpen };
}
