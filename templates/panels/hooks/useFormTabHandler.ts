import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { FormTabsConfig } from "../core/types";

export function useFormTabHandler<T extends string>(
  setActive: Dispatch<SetStateAction<T>>,
) {
  return useCallback(
    (tab: T) => {
      setActive(tab);
    },
    [setActive],
  );
}

export function toFormTabsConfig<T extends string>(
  active: T,
  handleTabChange: (tab: T) => void,
  order: T[],
): FormTabsConfig {
  return {
    active,
    setActive: (id) => handleTabChange(id as T),
    order,
  };
}
