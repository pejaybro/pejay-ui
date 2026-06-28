import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { hotkeyRegistry } from "../core/registry";
import { isTypingTarget, matchHotkey } from "../core/key-matcher";
import { HotkeysHelpModal } from "./HotkeysHelpModal";

interface HotkeyContextProps {
  showHelp: () => void;
  hideHelp: () => void;
  isHelpOpen: boolean;
}

const HotkeyContext = createContext<HotkeyContextProps | undefined>(undefined);

export function useHotkeyContext() {
  const context = useContext(HotkeyContext);
  if (!context) {
    throw new Error("useHotkeyContext must be used within HotkeyProvider");
  }
  return context;
}

interface HotkeyProviderProps {
  children: ReactNode;
  /** Custom overlay triggers, e.g. custom key combination to open helper. Default is 'shift+?' */
  helpTriggerKey?: string;
  /** Disable the built-in help dialog overlay. Default: false. */
  disableHelpOverlay?: boolean;
}

export function HotkeyProvider({
  children,
  helpTriggerKey = "shift+?",
  disableHelpOverlay = false,
}: HotkeyProviderProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const showHelp = () => setIsHelpOpen(true);
  const hideHelp = () => setIsHelpOpen(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isTyping = isTypingTarget(event.target);

      // Check help trigger first
      if (!disableHelpOverlay && matchHotkey(event, helpTriggerKey)) {
        if (isTyping) return;
        event.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // Process active hotkeys in reverse order (newest registered / topmost takes priority)
      const activeHotkeys = [...hotkeyRegistry.getActiveHotkeys()].reverse();
      for (const config of activeHotkeys) {
        if (matchHotkey(event, config.keys)) {
          if (isTyping && !config.enabledInInputs) {
            continue; // Skip because focused in input
          }
          event.preventDefault();
          config.callback(event);
          break; // Stop at first match
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [helpTriggerKey, disableHelpOverlay]);

  return (
    <HotkeyContext.Provider value={{ showHelp, hideHelp, isHelpOpen }}>
      {children}
      {!disableHelpOverlay && isHelpOpen && (
        <HotkeysHelpModal close={hideHelp} />
      )}
    </HotkeyContext.Provider>
  );
}
