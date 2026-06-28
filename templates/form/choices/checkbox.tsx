import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/pejay-ui/utils/cn";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */

/* Prop configuration for the Checkbox component */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /* Title label of the checkbox */
  label?: string;
  /* Help or descriptive text for the checkbox */
  description?: string;
  /* Validation error message specific to this checkbox */
  error?: string;
  /* Controls placement of label relative to the checkbox square */
  labelPlacement?: "top" | "left" | "right";
  /* Sizing parameter for the label container width */
  labelWidth?: string;
  /* Horizontal alignment of the text label */
  "labelAlign-X"?: "left" | "center" | "right";
  /* Vertical alignment of the text label */
  "labelAlign-Y"?: "top" | "middle" | "bottom";
  /* Visual border radius variant */
  variant?: "rounded" | "curved" | "square" | "circle";
  /* Callback triggered on selection change */
  onChange?: (checked: boolean) => void;
}

/*
 * ============================================================================
 * Checkbox Component
 * ============================================================================
 */

export const Checkbox = ({
  label,
  description,
  error,
  labelPlacement = "left",
  labelWidth,
  "labelAlign-X": labelAlignX,
  "labelAlign-Y": labelAlignY = "middle",
  variant = "rounded",
  onChange,
  className,
  id,
  ...props
}: CheckboxProps) => {
  const checkboxId = id || React.useId();
  
  /* Managed checked selection states supporting controlled and uncontrolled modes */
  const [internalChecked, setInternalChecked] = useState(props.defaultChecked || false);
  const isControlled = props.checked !== undefined;
  const checked = isControlled ? props.checked : internalChecked;

  /* Form event delegation and local state synchrony on changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.disabled) return;
    const newChecked = e.target.checked;
    if (!isControlled) setInternalChecked(newChecked);
    onChange?.(newChecked);
  };

  const isSideLabel = labelPlacement === "left" || labelPlacement === "right";
  const xAlignment = labelAlignX || (labelPlacement === "left" ? "left" : labelPlacement === "right" ? "right" : "left");
  const yAlignmentClass = labelAlignY === "top" ? "items-start" : labelAlignY === "bottom" ? "items-end" : "items-center";
  const borderRadius = variant === "circle" ? "rounded-full" : variant === "square" ? "rounded-none" : variant === "curved" ? "rounded-md" : "rounded-lg";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Checkbox Input and Selection Wrapper Label */}
      <label
        htmlFor={checkboxId}
        className={cn(
          "group flex cursor-pointer select-none transition-all duration-200 gap-4",
          labelPlacement === "top" && "flex-col",
          /* labelPlacement 'left' aligns the checkbox dot to the extreme right end */
          labelPlacement === "left" && cn("flex-row-reverse justify-between w-full", yAlignmentClass),
          labelPlacement === "right" && cn("flex-row justify-start", yAlignmentClass),
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="relative flex items-center shrink-0">
          <input 
            {...props} 
            type="checkbox" 
            id={checkboxId} 
            className="peer sr-only" 
            checked={checked} 
            onChange={handleChange} 
          />
          {/* Outer checkbox border and container */}
          <div
            className={cn(
              "w-5 h-5 transition-all duration-200 flex items-center justify-center border-[1.5px] border-black",
              borderRadius,
              checked
                ? "bg-white scale-110"
                : "bg-white",
              "peer-focus-visible:ring-4 peer-focus-visible:ring-sky-500/10 peer-focus-visible:border-sky-500"
            )}
          >
            {/* Checked checkmark icon indicator */}
            <Check
              size={12}
              strokeWidth={4}
              className={cn(
                "transition-all duration-200 transform",
                checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
                "text-black"
              )}
            />
          </div>
        </div>

        {/* Text Area (Option labels and descriptive help texts) */}
        {(label || description) && (
          <div className={cn("flex flex-col gap-0.5 min-w-0", isSideLabel ? (labelWidth || "flex-1") : "w-full", xAlignment === "left" && "items-start text-left", xAlignment === "right" && "items-end text-right", xAlignment === "center" && "items-center text-center")}>
            {label && (
              <span className="whitespace-normal break-words w-full capitalize text-sm font-medium text-black">
                {label}
                {props.required && (
                  <span className="ml-1 font-black text-red-500">*</span>
                )}
              </span>
            )}
            {description && (
              <span className="leading-tight whitespace-normal break-words w-full text-xs text-black">
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
