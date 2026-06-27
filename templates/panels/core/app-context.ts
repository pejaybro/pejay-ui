import { createContext, useContext } from "react";
import type { OverlayStackItem, OverlayContent, OverlayOptions } from "./types";

export interface AppOverlayStateProps {
  stack: OverlayStackItem[];
  isOverlayOpen: boolean;
  stackDepth: number;
}

export interface AppOverlayActionsProps {
  open: (type: string, content?: OverlayContent, options?: OverlayOptions) => void;
  close: (id: string) => void;
}

export const AppOverlayStateContext = createContext<
  AppOverlayStateProps | undefined
>(undefined);

export const AppOverlayActionsContext = createContext<
  AppOverlayActionsProps | undefined
>(undefined);

export function useAppOverlayState() {
  const context = useContext(AppOverlayStateContext);
  if (context === undefined) {
    throw new Error("useAppOverlayState must be used within AppProvider");
  }
  return context;
}

export function useAppOverlayActions() {
  const context = useContext(AppOverlayActionsContext);
  if (context === undefined) {
    throw new Error("useAppOverlayActions must be used within AppProvider");
  }
  return context;
}
