import React from "react";
import { cn } from "@/utils/cn";

import { Tooltip } from "./tooltip";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

export type ButtonVariant =
  /* ── Solid (filled bg, white text) ──────── */
  | "primary"
  | "danger"
  | "success"
  | "warning"
  | "black"
  | "white"
  /* ── Soft (coloured text, tinted bg) ────── */
  | "primary-soft"
  | "danger-soft"
  | "success-soft"
  | "warning-soft"
  | "black-soft"
  | "white-soft"
  /* ── Ghost (transparent bg → soft on hover) ─ */
  | "primary-ghost"
  | "danger-ghost"
  | "success-ghost"
  | "warning-ghost"
  | "black-ghost"
  | "white-ghost";
export type RoundedStyle = "full" | "lg" | "md" | "sm" | "none";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  rounded?: RoundedStyle;
  /** Removes all hover and active state classes from the variant. */
  disableHoverEffect?: boolean;
  /** When true the button is disabled and shows the loader or fallback text. */
  isLoading?: boolean;
  /** Custom loader — pass any React node (e.g. a spinner component). */
  loader?: React.ReactNode;
  /** Sets width to 100% of the parent container. */
  fullWidth?: boolean;
  /** Optional content to show inside a hover tooltip. */
  tooltipContent?: React.ReactNode | string | null;
}


/* ─────────────────────────────────────────────
   Maps
   ───────────────────────────────────────────── */

/*
 * Solid  variants — filled background, white (or black for 'white') text.
 * Soft   variants — coloured text + bg-current/10. Tint always matches text.
 * Ghost  variants — transparent bg, coloured text. On hover, bg-current/10
 *   fades in (same soft tint), giving a clean "reveal on hover" effect.
 *   bg-transparent → hover:bg-current/10 → active:bg-current/15
 */
const variantMap: Record<ButtonVariant, string> = {
  /* ── Solid ─────────────────────────────────────────── */
  primary: "bg-sky-500     hover:bg-sky-600     active:bg-sky-700     text-white",
  danger:  "bg-red-600     hover:bg-red-700     active:bg-red-800     text-white",
  success: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white",
  warning: "bg-amber-500   hover:bg-amber-600   active:bg-amber-700   text-white",
  black:   "bg-black       hover:bg-black/80    active:bg-black/70    text-white",
  white:   "bg-white       hover:bg-white/80    active:bg-white/70    text-black",

  /* ── Soft (coloured text, always-visible tint) ───────── */
  "primary-soft": "text-sky-500     bg-current/10 hover:bg-current/15 active:bg-current/20",
  "danger-soft":  "text-red-600     bg-current/10 hover:bg-current/15 active:bg-current/20",
  "success-soft": "text-emerald-600 bg-current/10 hover:bg-current/15 active:bg-current/20",
  "warning-soft": "text-amber-500   bg-current/10 hover:bg-current/15 active:bg-current/20",
  "black-soft":   "text-black       bg-current/10 hover:bg-current/15 active:bg-current/20",
  "white-soft":   "text-white       bg-current/10 hover:bg-current/15 active:bg-current/20",

  /* ── Ghost (transparent → soft tint on hover) ──────── */
  "primary-ghost": "text-sky-500     bg-transparent hover:bg-current/10 active:bg-current/15",
  "danger-ghost":  "text-red-600     bg-transparent hover:bg-current/10 active:bg-current/15",
  "success-ghost": "text-emerald-600 bg-transparent hover:bg-current/10 active:bg-current/15",
  "warning-ghost": "text-amber-500   bg-transparent hover:bg-current/10 active:bg-current/15",
  "black-ghost":   "text-black       bg-transparent hover:bg-current/10 active:bg-current/15",
  "white-ghost":   "text-white       bg-transparent hover:bg-current/10 active:bg-current/15",
};

const roundedMap: Record<RoundedStyle, string> = {
  full: "rounded-full",
  lg: "rounded-lg",
  md: "rounded-md",
  sm: "rounded-sm",
  none: "rounded-none",
};

/* Strip hover: and active: modifier classes so the button stays visually static */
const stripInteractive = (classes: string) =>
  classes
    .split(" ")
    .filter((c) => !c.startsWith("hover:") && !c.startsWith("active:"))
    .join(" ");

export const Button = ({
  variant = "primary",
  rounded = "lg",
  disableHoverEffect = false,
  isLoading = false,
  loader,
  fullWidth = false,
  tooltipContent,
  className,
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) => {
  /* Resolve variant classes, stripping hover/active when disableHoverEffect is set */
  const variantClasses = disableHoverEffect
    ? stripInteractive(variantMap[variant])
    : variantMap[variant];

  /* Render content: loader node / fallback text / normal children */
  const content = isLoading
    ? (loader ?? <span className="text-sm font-medium">Loading…</span>)
    : children;

  return (
    <Tooltip content={tooltipContent}>
      <button
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          /* Base layout & typography */
          "inline-flex items-center justify-center gap-2 px-5 h-9",
          "whitespace-nowrap text-sm font-medium",
          /* Smooth state transitions */
          "transition-colors duration-150 cursor-pointer",
          /* Keyboard focus ring (Accessibility) */
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500",
          /* Disabled state (covers isLoading too) */
          "disabled:opacity-50 disabled:cursor-not-allowed",
          /* Full width utility */
          fullWidth && "w-full",
          variantClasses,
          roundedMap[rounded],
          className,
        )}
        {...props}
      >
        {content}
      </button>
    </Tooltip>
  );
};


