import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ELECTRON_PATH } from "../path";
import {
  LayoutDashboard,
  Settings,
  Database,
  Minus,
  Square,
  X,
  Radio,
} from "lucide-react";

export const ElectronAppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen] = useState(true);

  const isElectron = typeof window !== "undefined" && Boolean((window as any).electronAPI);

  const handleMinimize = () => {
    if (isElectron) (window as any).electronAPI.minimize();
  };

  const handleMaximize = () => {
    if (isElectron) (window as any).electronAPI.maximize();
  };

  const handleClose = () => {
    if (isElectron) (window as any).electronAPI.close();
  };

  const navItems = [
    { label: "Dashboard", path: ELECTRON_PATH.root(), icon: LayoutDashboard },
    { label: "Database IPC", path: ELECTRON_PATH.database(), icon: Database },
    { label: "Settings", path: ELECTRON_PATH.settings(), icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 select-none overflow-hidden">
      {/* Frameless Custom Window Titlebar (Drag Region) */}
      <header className="h-9 bg-zinc-900 border-b border-zinc-800/80 flex items-center justify-between px-3 shrink-0 [app-region:drag]">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>Electron Desktop App</span>
        </div>

        {/* Window Controls (No-Drag Region) */}
        <div className="flex items-center gap-1 [app-region:no-drag]">
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-red-600 rounded text-zinc-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar Navigation */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-zinc-900/90 border-r border-zinc-800/80 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "w-56" : "w-14"
          }`}
        >
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Route Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
