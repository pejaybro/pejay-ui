import { createContext, useContext } from "react";
import type { OverlayStackItem, OverlayContent, OverlayOptions } from "./types";

export interface PanelOverlayStateProps {
  stack: OverlayStackItem[];
  isOverlayOpen: boolean;
  stackDepth: number;
}

export interface PanelOverlayActionsProps {
  open: (
    type: string,
    content?: OverlayContent,
    options?: OverlayOptions,
  ) => void;
  close: (id: string) => void;
}

export const PanelOverlayStateContext = createContext<
  PanelOverlayStateProps | undefined
>(undefined);

export const PanelOverlayActionsContext = createContext<
  PanelOverlayActionsProps | undefined
>(undefined);

export function usePanelOverlayState() {
  const context = useContext(PanelOverlayStateContext);
  if (context === undefined) {
    throw new Error("usePanelOverlayState must be used within PanelProvider");
  }
  return context;
}

export function usePanelOverlayActions() {
  const context = useContext(PanelOverlayActionsContext);
  if (context === undefined) {
    throw new Error("usePanelOverlayActions must be used within PanelProvider");
  }
  return context;
}
