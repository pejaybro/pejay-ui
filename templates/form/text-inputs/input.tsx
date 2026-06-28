import React, { useRef } from "react";
import { cn } from "@/pejay-ui/utils/cn";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */
export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "prefix"
> {
  /** Optional main text label displayed above or next to the input */
  label?: string;
  /** Optional secondary text helper details shown underneath the label */
  description?: string;
  /** Validation error text which triggers error borders and shows below the input */
  error?: string;
  /** Explicit left-side icon Node */
  leftIcon?: React.ReactNode;
  /** Optional right-side clickable/decorative icon Node */
  rightIcon?: React.ReactNode;
  /** Static text content displayed inside the input box on the left */
  prefix?: React.ReactNode;
  /** Static text content displayed inside the input box on the right */
  suffix?: React.ReactNode;
  /** Click action handler triggered when clicking the rightIcon */
  onRightIconClick?: (e: React.MouseEvent) => void;
  /** Controls layout position of label relative to the input box */
  labelPlacement?: "top" | "left" | "right";
  /** Sets standard width constraints when using horizontal/side labels */
  labelWidth?: string;
  /** Custom horizontal text alignments for the label content */
  "labelAlign-X"?: "left" | "center" | "right";
  /** Custom vertical cross-axis alignments for side label layout blocks */
  "labelAlign-Y"?: "top" | "middle" | "bottom";
}

/*
 * ============================================================================
 * Main Input Component (ForwardRef Enabled)
 * ============================================================================
 */

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      description,
      error,
      leftIcon,
      rightIcon,
      prefix,
      suffix,
      onRightIconClick,
      labelPlacement = "top",
      labelWidth = "w-32",
      "labelAlign-X": labelAlignX,
      "labelAlign-Y": labelAlignY = "middle",
      ...props
    },
    ref,
  ) => {
    /* Stores previous input content to revert/roll back invalid characters */
    const prevValueRef = useRef(
      props.value?.toString() || props.defaultValue?.toString() || "",
    );

    /*
     * ------------------------------------------------------------------------
     * Event Handlers & Sanitizers
     * ------------------------------------------------------------------------
     */

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      /* Sanitization rules for numbers (Forces float formats, locks max value limits) */
      if (props.type === "number") {
        const cleanVal = val.replace(/[^0-9.]/g, "");
        const dots = cleanVal.split(".").length - 1;
        if (dots > 1) {
          e.target.value = prevValueRef.current;
          return;
        }
        val = cleanVal;
      }

      /* Sanitization rules for tel (Allows numeric dialing codes and keys) */
      if (props.type === "tel") {
        val = val.replace(/[^0-9+\s()-]/g, "");
      }

      prevValueRef.current = val;
      e.target.value = val;
      props.onChange?.(e);
    };

    /*
     * ------------------------------------------------------------------------
     * Layout & Position Compilations
     * ------------------------------------------------------------------------
     */

    const isSideLabel = labelPlacement === "left" || labelPlacement === "right";
    const xAlignment =
      labelAlignX || (labelPlacement === "left" ? "right" : "left");
    const yAlignmentClass =
      labelAlignY === "top"
        ? "items-start"
        : labelAlignY === "bottom"
          ? "items-end"
          : "items-center";

    /*
     * ------------------------------------------------------------------------
     * Renders Component Layout Tree
     * ------------------------------------------------------------------------
     */

    return (
      <div
        className={cn(
          "flex w-full",
          labelPlacement === "top" && "flex-col gap-1.5",
          labelPlacement === "left" && cn("flex-row gap-4", yAlignmentClass),
          labelPlacement === "right" &&
            cn("flex-row-reverse gap-4", yAlignmentClass),
        )}
      >
        {/* Standard Label & Optional Helper Text Block */}
        {label && (
          <div
            className={cn(
              "flex flex-col",
              isSideLabel ? "shrink-0" : "w-full",
              labelAlignY === "top" && isSideLabel && "mt-2.5",
            )}
          >
            <div
              className={cn(
                isSideLabel ? labelWidth : "w-full",
                "flex flex-col",
                xAlignment === "left" && "items-start text-left",
                xAlignment === "right" && "items-end text-right",
                xAlignment === "center" && "items-center text-center",
              )}
            >
              <span className="text-md font-medium text-black">{label}</span>
              {description && (
                <span className="text-xs text-black font-medium mt-0.5">
                  {description}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Input Wrapper Group */}
        <div className="flex-1 min-w-0 flex flex-col relative group">
          {/* Dynamic Flex Container representing the input borders and decorators */}
          <div
            className={cn(
              "flex items-center transition-all duration-200 gap-0",
              "rounded-lg w-full border-[1.5px] bg-white border-black h-9",
              "focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10",
              error
                ? "border-red-600 focus-within:border-red-600 focus-within:ring-red-600/10"
                : "",
              props.readOnly && "cursor-pointer",
            )}
          >
            {/* Left Content Decorators (Icon / Prefix) */}
            {(leftIcon || prefix) && (
              <div
                className={cn(
                  "flex items-center pl-2 pr-2 shrink-0 gap-1.5",
                  "text-black",
                )}
              >
                {leftIcon}
                {prefix && <span className="font-medium">{prefix}</span>}
              </div>
            )}

            {/* Native HTML Input Element */}
            <input
              ref={ref}
              {...props}
              type={
                props.type === "number" || props.type === "tel"
                  ? "text"
                  : props.type
              }
              inputMode={
                props.type === "number"
                  ? "decimal"
                  : props.type === "tel"
                    ? "numeric"
                    : props.inputMode
              }
              onChange={handleChange}
              placeholder={props.placeholder}
              className={cn(
                "flex-1 w-full min-w-0 bg-transparent border-none outline-none h-full py-1.5 truncate",
                "text-md font-medium text-black",
                "placeholder:text-black/40 placeholder:text-sm placeholder:font-medium placeholder:truncate",
                !(leftIcon || prefix) && "pl-2",
                !(rightIcon || suffix) && "pr-2",
                props.readOnly && "cursor-pointer",
              )}
            />

            {/* Right Content Decorators (Suffix / Interactive Right Action Icon) */}
            {(rightIcon || suffix) && (
              <div
                className={cn(
                  "flex items-center pr-2.25 pl-2 shrink-0",
                  "text-black",
                )}
              >
                {suffix && <span className="font-medium">{suffix}</span>}
                {rightIcon && (
                  <div
                    onClick={onRightIconClick}
                    className={cn(
                      "transition-colors group-focus-within:text-white",
                      onRightIconClick && "cursor-pointer",
                    )}
                  >
                    {rightIcon}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Validation Error Message Display */}
          {error && (
            <span
              className={cn(
                "text-red-600 text-xs font-medium",
                "mt-1.5 ml-1 block animate-in fade-in slide-in-from-top-1",
              )}
            >
              {error}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
