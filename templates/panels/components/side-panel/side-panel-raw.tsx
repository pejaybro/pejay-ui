import type { ReactNode } from "react";
import { cn } from "@/pejay-ui/utils/cn";

interface SidePanelRawProps {
  children: ReactNode;
  className?: string;
}

/**
 * A bare side panel container with no title, no X button, and no footer.
 * Use this when you want to render fully custom content inside a side panel.
 * Mount it via `openRawSidePanel` from `useOverlay`.
 */
export function SidePanelRaw({ children, className }: SidePanelRawProps) {
  return (
    <div
      className={cn(
        "flex h-screen max-w-full flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-2xl p-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
