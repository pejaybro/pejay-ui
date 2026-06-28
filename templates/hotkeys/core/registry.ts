import type { HotkeyConfig } from "./types";

type Listener = (hotkeys: HotkeyConfig[]) => void;

class HotkeyRegistry {
  private hotkeys: Map<string, HotkeyConfig> = new Map();
  private listeners: Set<Listener> = new Set();

  register(id: string, config: HotkeyConfig) {
    this.hotkeys.set(id, config);
    this.notify();
  }

  unregister(id: string) {
    if (this.hotkeys.delete(id)) {
      this.notify();
    }
  }

  getActiveHotkeys(): HotkeyConfig[] {
    return Array.from(this.hotkeys.values());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    // Initial call
    listener(this.getActiveHotkeys());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const list = this.getActiveHotkeys();
    this.listeners.forEach((listener) => listener(list));
  }
}

export const hotkeyRegistry = new HotkeyRegistry();
