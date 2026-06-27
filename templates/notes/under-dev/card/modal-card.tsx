import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils";

interface ModalCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: ReactNode;
  close?: () => void;
  width?: string;
  maxHeight?: string;
  /** Renders below title row (e.g. tabs). */
  headerSlot?: ReactNode;
  bodyClassName?: string;
}

export function ModalCard({
  children,
  title,
  description,
  footer,
  className,
  close,
  width = "min(560px, 92vw)",
  maxHeight = "min(90vh, 720px)",
  headerSlot,
  bodyClassName,
}: ModalCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl",
        className,
      )}
      style={{ width, maxHeight }}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
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
              onClick={close}
              className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>
        {headerSlot}
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-6 py-5",
          bodyClassName,
        )}
      >
        {children}
      </div>

      {footer && (
        <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}
