import React from "react";
import { useRouteError } from "react-router-dom";

export const ElectronErrorLayout: React.FC = () => {
  const error = useRouteError() as any;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-zinc-950 text-zinc-100">
      <h2 className="text-xl font-bold text-red-400 mb-2">Desktop Route Error</h2>
      <p className="text-xs font-mono bg-zinc-900 p-4 rounded border border-zinc-800 text-zinc-300 max-w-md">
        {error?.message || "An unexpected error occurred in Electron routing."}
      </p>
    </div>
  );
};
