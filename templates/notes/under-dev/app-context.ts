import type { Provider as Props } from "@/types";
import { createContext, useContext } from "react";

export const AppContext = createContext<Props.AppContextProps | undefined>(
  undefined,
);

export function useAppProvider() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppProvider must be used within AppProvider");
  }
  return context;
}
