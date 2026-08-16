import React, { useState, useCallback, type MouseEvent } from "react";
import { Check } from "lucide-react";
import { toast } from "@/pejay-ui/components/toast";

/* ─────────────────────────────────────────────
   Types & Interfaces
   ───────────────────────────────────────────── */

export interface CopyToClipboardOptions {
  /**
   * Optional custom label or field name for the copied item (e.g. "Order ID", "Reference #", "Email")
   */
  label?: string;

  /**
   * Custom toast message text.
   * @default "Copied to clipboard"
   */
  toastMessage?: string;

  /**
   * Duration in ms for the toast alert.
   * @default 2000
   */
  duration?: number;

  /**
   * Whether to show the toast notification after copying.
   * @default true
   */
  showToast?: boolean;

  /**
   * Optional custom toast render function to override default custom toast UI.
   */
  customToast?: (data: { text: string; label?: string; id?: string }) => void;

  /**
   * Optional callback fired after successful copy.
   */
  onSuccess?: (text: string) => void;

  /**
   * Optional callback fired if copy fails.
   */
  onError?: (error: Error) => void;
}

/* ─────────────────────────────────────────────
   Core Clipboard Copy Function
   ───────────────────────────────────────────── */

/**
 * Copies a given text value to the system clipboard with modern async API
 * and legacy execCommand fallback, then triggers a custom toast via pejay-ui toast template.
 */
export async function copyToClipboard(
  value: unknown,
  options?: CopyToClipboardOptions,
): Promise<boolean> {
  const text =
    typeof value === "string"
      ? value
      : typeof value === "number" || typeof value === "boolean"
      ? String(value)
      : value !== null && typeof value === "object"
      ? JSON.stringify(value, null, 2)
      : "";

  if (!text) {
    return false;
  }

  let success = false;

  try {
    if (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      navigator?.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(text);
      success = true;
    } else if (typeof document !== "undefined") {
      // Fallback for older browsers / webview contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      success = document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    options?.onError?.(error);
    return false;
  }

  if (success) {
    options?.onSuccess?.(text);

    if (options?.showToast !== false) {
      if (options?.customToast) {
        options.customToast({ text, label: options.label });
      } else if (typeof toast?.custom === "function") {
        const truncatedText = text.length > 28 ? `${text.slice(0, 28)}…` : text;
        const message = options?.toastMessage || "Copied to clipboard";

        // Trigger custom toast using React.createElement
        toast.custom({
          duration: options?.duration ?? 2000,
          content: () =>
            React.createElement(
              "div",
              {
                className:
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-blue-500/35 text-xs text-white shadow-2xl backdrop-blur-md transition-all",
              },
              React.createElement(Check, {
                size: 14,
                className: "text-blue-400 shrink-0",
              }),
              React.createElement(
                "div",
                { className: "flex items-center gap-1 min-w-0" },
                options?.label
                  ? React.createElement(
                      "span",
                      { className: "text-slate-400 font-medium" },
                      `${options.label}:`,
                    )
                  : null,
                React.createElement(
                  "span",
                  {
                    className:
                      "font-mono text-blue-400 font-semibold truncate max-w-[160px]",
                  },
                  `"${truncatedText}"`,
                ),
                React.createElement(
                  "span",
                  { className: "text-slate-300 whitespace-nowrap" },
                  message,
                ),
              ),
            ),
        });
      }
    }
  }

  return success;
}

/* ─────────────────────────────────────────────
   Event Handler Helpers
   ───────────────────────────────────────────── */

/**
 * Returns a single-click `onClick` event handler for buttons or action links.
 *
 * @example
 * ```tsx
 * <button onClick={handleClickCopy(row.id, { label: "Ref ID" })}>
 *   <Copy size={14} />
 * </button>
 * ```
 */
export function handleClickCopy(
  value: unknown,
  options?: CopyToClipboardOptions,
) {
  return (e?: MouseEvent<HTMLElement>) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    return copyToClipboard(value, options);
  };
}

/**
 * Alias for `handleClickCopy`
 */
export const handleCopy = handleClickCopy;

/**
 * Returns a double-click `onDoubleClick` event handler for table rows, cells, or cards.
 *
 * @example
 * ```tsx
 * <div onDoubleClick={handleDoubleClickCopy(row.id, { label: "Ref ID" })}>
 *   {row.id}
 * </div>
 * ```
 */
export function handleDoubleClickCopy(
  value: unknown,
  options?: CopyToClipboardOptions,
) {
  return (e?: MouseEvent<HTMLElement>) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    return copyToClipboard(value, options);
  };
}

/* ─────────────────────────────────────────────
   React Hook for Copy Buttons
   ───────────────────────────────────────────── */

/**
 * React hook for copy buttons that provides an `isCopied` state flag
 * (turns true for duration ms) to toggle icons (e.g. Copy -> Check).
 *
 * @example
 * ```tsx
 * const { copy, isCopied } = useClipboardCopy({ label: "API Key" });
 *
 * <button onClick={() => copy(apiKey)}>
 *   {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
 * </button>
 * ```
 */
export function useClipboardCopy(defaultOptions?: CopyToClipboardOptions) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (value: unknown, overrideOptions?: CopyToClipboardOptions) => {
      const mergedOptions = { ...defaultOptions, ...overrideOptions };
      const success = await copyToClipboard(value, mergedOptions);
      if (success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), mergedOptions.duration ?? 2000);
      }
      return success;
    },
    [defaultOptions],
  );

  return {
    copy,
    isCopied,
    handleClickCopy: (value: unknown, overrideOptions?: CopyToClipboardOptions) => (e?: MouseEvent<HTMLElement>) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      return copy(value, overrideOptions);
    },
    handleDoubleClickCopy: (value: unknown, overrideOptions?: CopyToClipboardOptions) => (e?: MouseEvent<HTMLElement>) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      return copy(value, overrideOptions);
    },
  };
}
