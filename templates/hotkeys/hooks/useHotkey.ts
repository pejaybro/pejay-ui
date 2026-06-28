import { useEffect, useRef } from "react";
import { hotkeyRegistry } from "../core/registry";
import type { HotkeyConfig } from "../core/types";

interface UseHotkeyOptions {
  category?: string;
  description?: string;
  enabledInInputs?: boolean;
  disabled?: boolean;
}

export function useHotkey(
  keys: string,
  callback: (event: KeyboardEvent) => void,
  options: UseHotkeyOptions = {},
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const disabled = Boolean(options.disabled);
  const category = options.category;
  const description = options.description;
  const enabledInInputs = options.enabledInInputs;

  useEffect(() => {
    if (disabled) return;

    const id = crypto.randomUUID();
    const config: HotkeyConfig = {
      keys,
      description: description || keys,
      category,
      enabledInInputs,
      callback: (e) => callbackRef.current(e),
    };

    hotkeyRegistry.register(id, config);

    return () => {
      hotkeyRegistry.unregister(id);
    };
  }, [keys, disabled, category, description, enabledInInputs]);
}
