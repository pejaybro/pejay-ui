import type { ReactNode } from "react";
import { cn } from "@/pejay-ui/utils/cn";

interface ModalRawProps {
  children: ReactNode;
  className?: string;
  width?: string;
  maxHeight?: string;
}

/**
 * A bare modal container with no title, no X button, and no footer.
 * Use this when you want to render fully custom content inside a centered modal.
 * Mount it via `openRawModal` from `useOverlay`.
 */
export function ModalRaw({
  children,
  className,
  width = "min(560px, 92vw)",
  maxHeight = "min(90vh, 720px)",
}: ModalRawProps) {
  return (
    <div
      className={cn(
        "overflow-y-auto rounded-xl bg-white shadow-2xl p-2",
        className,
      )}
      style={{ width, maxHeight }}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}
