import React, { useState } from "react";
import { cn } from "@/pejay-ui/utils/cn";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */

export interface RadioStyles {
  /** Decorative classes for the label */
  label?: string;
  /** Decorative classes for the description */
  description?: string;
  /** Decorative classes for the outer radio circle border/container */
  box?: string;
  /** Decorative classes for the inner selected dot */
  dot?: string;
}

/* Prop configuration for the Radio button component */
export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Optional custom styles object for decorative overrides */
  styles?: RadioStyles;
  /* Title label of the radio option */
  label?: string;
  /* Help or descriptive text for the radio option */
  description?: string;
  /* Validation error message specific to this option */
  error?: string;
  /* Controls alignment of label relative to the radio dot */
  labelPlacement?: "top" | "left" | "right";
  /* Sizing parameter for the label container width */
  labelWidth?: string;
  /* Horizontal alignment of the text label */
  "labelAlign-X"?: "left" | "center" | "right";
  /* Vertical alignment of the text label */
  "labelAlign-Y"?: "top" | "middle" | "bottom";
}

/*
 * ============================================================================
 * Radio Component
 * ============================================================================
 */

export const Radio = ({
  label,
  description,
  error,
  labelPlacement = "right",
  labelWidth,
  "labelAlign-X": labelAlignX,
  "labelAlign-Y": labelAlignY = "middle",
  className,
  id,
  styles,
  ...props
}: RadioProps) => {
  const radioId = id || React.useId();

  /* Managed selection states supporting controlled and uncontrolled modes */
  const [internalChecked, setInternalChecked] = useState(
    props.defaultChecked || false,
  );
  const isControlled = props.checked !== undefined;
  const checked = isControlled ? props.checked : internalChecked;

  /* Form event delegation and local state synchrony on changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.disabled) return;
    const newChecked = e.target.checked;
    if (!isControlled) setInternalChecked(newChecked);
    props.onChange?.(e);
  };

  const isSideLabel = labelPlacement === "left" || labelPlacement === "right";
  const xAlignment =
    labelAlignX || (labelPlacement === "left" ? "right" : "left");
  const yAlignmentClass =
    labelAlignY === "top"
      ? "items-start"
      : labelAlignY === "bottom"
        ? "items-end"
        : "items-center";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Radio Input and Selection Wrapper Label */}
      <label
        htmlFor={radioId}
        className={cn(
          "group flex cursor-pointer select-none transition-all duration-200 gap-2",
          labelPlacement === "top" && "flex-col",
          /* labelPlacement 'left' aligns the radio button to the extreme right end */
          labelPlacement === "left" &&
            cn("flex-row-reverse justify-between w-full", yAlignmentClass),
          labelPlacement === "right" &&
            cn("flex-row justify-start", yAlignmentClass),
          props.disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <div className="relative flex items-center shrink-0">
          <input
            {...props}
            type="radio"
            id={radioId}
            className="peer sr-only"
            checked={checked}
            onChange={handleChange}
          />
          {/* Outer circle indicator border */}
          <div
            className={cn(
              "w-5 h-5 rounded-full border-[1.5px] border-black flex items-center justify-center bg-white",
              checked && "scale-110",
              "peer-focus-visible:ring-4 peer-focus-visible:ring-sky-500/10 peer-focus-visible:border-sky-500",
              styles?.box,
            )}
          >
            {/* Inner selected dot */}
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full bg-black",
                checked ? "opacity-100 scale-100" : "opacity-0 scale-100",
                styles?.dot,
              )}
            />
          </div>
        </div>

        {/* Text Area (Option labels and descriptive help texts) */}
        {(label || description) && (
          <div
            className={cn(
              "flex flex-col gap-0.5 min-w-0",
              isSideLabel ? labelWidth || "flex-1" : "w-full",
              xAlignment === "left" && "items-start text-left",
              xAlignment === "right" && "items-end text-right",
              xAlignment === "center" && "items-center text-center",
            )}
          >
            {label && (
              <span
                className={cn(
                  "whitespace-normal break-words w-full text-sm font-medium text-black",
                  styles?.label,
                )}
              >
                {label}
                {props.required && (
                  <span className="ml-1 font-black text-red-500">
                    *
                  </span>
                )}
              </span>
            )}
            {description && (
              <span
                className={cn(
                  "text-xs text-black leading-tight whitespace-normal break-words w-full",
                  styles?.description,
                )}
              >
                {description}
              </span>
            )}
          </div>
        )}
      </label>

      {/* Option Validation Error Message */}
      {error && (
        <span className="text-xs font-medium ml-1 italic tracking-tight animate-in fade-in slide-in-from-top-1 text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};
