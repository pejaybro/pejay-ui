import type { ReactNode } from "react";

export type OverlayContent = (helpers: { close: () => void }) => ReactNode;

export interface OverlayOptions {
  onSide?: "left" | "right";
  width?: string;
  [key: string]: any;
}

export interface OverlayStackItem {
  id: string;
  type: string;
  content?: OverlayContent;
  options?: OverlayOptions;
}

export interface AppContextProps {
  open: (type: string, content?: OverlayContent, options?: OverlayOptions) => void;
  close: (id: string) => void;
  stack: OverlayStackItem[];
  isOverlayOpen: boolean;
  stackDepth: number;
}

export interface ProviderProps {
  children: ReactNode;
}

export type FormTabsConfig = {
  active: string;
  setActive: (id: string) => void;
  order: string[];
};

export type FormOverlayRegistration = {
  onSubmit?: () => void;
  isDirty?: () => boolean;
  isCloseBlocked?: () => boolean;
  tabs?: FormTabsConfig;
};
