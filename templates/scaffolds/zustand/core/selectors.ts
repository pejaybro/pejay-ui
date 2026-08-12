import { useShallow } from "zustand/react/shallow";

/**
 * Shallow-compare helper for selectors that return objects or arrays.
 *
 * Use when a component needs multiple fields from one store in a single selector.
 * Without shallow compare, a new object reference on every run forces a re-render
 * even when the underlying values did not change.
 */
export { useShallow };

/**
 * Type-safe helper to build a shallow selector for multiple store keys.
 *
 * @example
 * const { sidebarOpen, modalOpen } = useUiStore(
 *   pickState(["sidebarOpen", "modalOpen"])
 * );
 */
export function pickState<State extends object, Keys extends keyof State>(
  keys: Keys[],
) {
  return (state: State): Pick<State, Keys> => {
    const picked = {} as Pick<State, Keys>;
    for (const key of keys) {
      picked[key] = state[key];
    }
    return picked;
  };
}
