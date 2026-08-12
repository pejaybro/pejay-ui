import React from "react";
import { Outlet } from "react-router-dom";

export const ElectronGuard: React.FC = () => {
  // Centralized guard logic for Electron desktop apps
  return <Outlet />;
};
