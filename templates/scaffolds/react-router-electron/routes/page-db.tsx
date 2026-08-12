import React from "react";

const PageDb: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Database & IPC Portal</h1>
      <p className="text-xs text-zinc-400">
        Interact with local SQLite database handlers over Electron IPC.
      </p>
    </div>
  );
};

export default PageDb;
