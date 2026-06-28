import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/pejay-ui/utils/cn";
import type { FormTabsConfig } from "../../core/types";
import { requestOverlayCloseWithConfirm } from "../../core/overlay-close";
import { useFormOverlayRegistration } from "../../hooks/useFormOverlayRegistration";

export type ModalCardSize = "sm" | "md" | "lg" | "xl";

const MODAL_WIDTH: Record<ModalCardSize, string> = {
  sm: "min(420px, 92vw)",
  md: "min(560px, 92vw)",
  lg: "min(720px, 92vw)",
  xl: "min(900px, 92vw)",
};

interface ModalCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: ReactNode;
  close?: () => void;
  /** Preset widths — use `width` to override entirely. */
  size?: ModalCardSize;
  /** Custom CSS width; overrides `size`. */
  width?: string;
  maxHeight?: string;
  /** Renders below title row (e.g. tabs). */
  headerSlot?: ReactNode;
  bodyClassName?: string;
  /** When provided, Ctrl+Enter triggers this handler. */
  onSubmit?: () => void;
  /** Enables unsaved-changes guard on close. */
  isDirty?: boolean;
  /** Blocks X button and Escape while an async action is in progress. */
  closeDisabled?: boolean;
  formTabs?: FormTabsConfig;
}

export function ModalCard({
  children,
  title,
  description,
  footer,
  className,
  close,
  size = "md",
  width,
  maxHeight = "min(90vh, 720px)",
  headerSlot,
  bodyClassName,
  onSubmit,
  isDirty = false,
  closeDisabled = false,
  formTabs,
}: ModalCardProps) {
  const modalWidth = width ?? MODAL_WIDTH[size];

  useFormOverlayRegistration({
    enabled: Boolean(close),
    onSubmit,
    isDirty,
    closeDisabled,
    formTabs,
  });

  const handleClose = () => {
    if (closeDisabled) return;
    if (close) requestOverlayCloseWithConfirm();
  };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl",
        className,
      )}
      style={{ width: modalWidth, maxHeight }}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 px-6 pt-5 pb-0">
        <div className="flex items-start justify-between gap-3 pb-4">
          <div className="min-w-0">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-bold tracking-tight text-slate-900"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {close && (
            <button
              type="button"
              onClick={handleClose}
              disabled={closeDisabled}
              className={cn(
                "shrink-0 rounded-full p-2 text-slate-400 transition-colors",
                closeDisabled
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer hover:bg-slate-100 hover:text-slate-600",
              )}
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>
        {headerSlot}
      </div>

      {/* Body */}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-6 py-5",
          bodyClassName,
        )}
      >
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}
