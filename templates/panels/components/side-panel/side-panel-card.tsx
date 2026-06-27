import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils";
import type { FormTabsConfig } from "../../core/types";
import { requestOverlayCloseWithConfirm } from "../../core/overlay-close";
import { useFormOverlayRegistration } from "../../hooks/useFormOverlayRegistration";

export type SidePanelSize = "sm" | "md" | "lg" | "xl";

const PANEL_WIDTH: Record<SidePanelSize, string> = {
  sm: "min(480px, 100vw)",
  md: "min(560px, 100vw)",
  lg: "min(720px, 92vw)",
  xl: "min(840px, 95vw)",
};

interface SidePanelCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  close?: () => void;
  footer?: ReactNode;
  /** Preset widths — use `width` to override entirely. */
  size?: SidePanelSize;
  /** Custom CSS width; overrides `size`. */
  width?: string;
  /** Renders below title row (e.g. tabs). */
  headerSlot?: ReactNode;
  bodyClassName?: string;
  onSubmit?: () => void;
  isDirty?: boolean;
  /** Blocks close via X, Escape, and backdrop while an async action is in progress. */
  closeDisabled?: boolean;
  formTabs?: FormTabsConfig;
}

export function SidePanelCard({
  children,
  title,
  description,
  className,
  close,
  footer,
  size = "sm",
  width,
  headerSlot,
  bodyClassName,
  onSubmit,
  isDirty = false,
  closeDisabled = false,
  formTabs,
}: SidePanelCardProps) {
  const panelWidth = width ?? PANEL_WIDTH[size];

  useFormOverlayRegistration({
    enabled: Boolean(close),
    onSubmit,
    isDirty,
    closeDisabled,
    formTabs,
  });

  const handleClose = () => {
    if (closeDisabled) return;
    requestOverlayCloseWithConfirm();
  };

  return (
    <div
      className={cn(
        "flex flex-col items-stretch h-screen max-w-full overflow-hidden border-l border-slate-200 bg-white shadow-2xl",
        className,
      )}
      style={{ width: panelWidth }}
    >
      <div className="w-full shrink-0 border-b border-slate-200 px-6 pt-4 pb-0">
        <div className="flex flex-row items-center justify-between pb-4">
          <div className="flex flex-col min-w-0 gap-0.5">
            {title && (
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={closeDisabled}
            className={cn(
              "shrink-0 rounded-full p-2 text-slate-600 transition-colors",
              closeDisabled
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer hover:bg-slate-100 hover:text-slate-600",
            )}
            aria-label="Close panel"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        {headerSlot}
      </div>

      <div
        className={cn(
          "min-h-0 w-full flex-1 overflow-y-auto px-6 py-5",
          bodyClassName,
        )}
      >
        {children}
      </div>

      {footer && (
        <div className="w-full shrink-0 border-t border-slate-200 bg-white px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}
