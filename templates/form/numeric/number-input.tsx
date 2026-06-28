import React, { useState, useEffect } from "react";
import { Input } from "../text-inputs/input";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/pejay-ui/utils/cn";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */

interface NumberInputProps extends React.ComponentProps<typeof Input> {
  /* Controls visibility of right-side increment/decrement steppers */
  showSteppers?: boolean;
  /* Value delta to apply when stepping up or down */
  step?: number;
  /* Minimum value constraint */
  min?: string | number;
  /* Maximum value constraint */
  max?: string | number;
  /* Allows typing and submitting negative values */
  allowNegative?: boolean;
  /* Max number of decimal places allowed (undefined for unlimited) */
  decimalScale?: number;
}

/*
 * ============================================================================
 * NumberInput Component
 * ============================================================================
 */

export const NumberInput = ({
  showSteppers = true,
  step = 1,
  min,
  max,
  allowNegative = false,
  decimalScale,
  onChange,
  className,
  ...props
}: NumberInputProps) => {
  /* Base amount string value state */
  const [value, setValue] = useState((props.value as string) || "");

  /* Synchronize value shifts programmatically from parents */
  useEffect(() => {
    if (props.value !== undefined) {
      setValue(String(props.value));
    }
  }, [props.value]);

  /* Default min to 0 unless allowNegative is enabled */
  const resolvedMin = min !== undefined 
    ? (typeof min === "number" ? min : parseFloat(String(min))) 
    : (allowNegative ? undefined : 0);

  const resolvedMax = max !== undefined 
    ? (typeof max === "number" ? max : parseFloat(String(max))) 
    : undefined;

  /* Unified value updater: performs min/max boundaries and RHF event propagation */
  const updateValue = (newVal: number | string) => {
    let rawValue = String(newVal);

    /* Sanitize non-numeric characters (allowing decimal point and negative sign) */
    if (allowNegative) {
      rawValue = rawValue.replace(/(?!^)-/g, "").replace(/[^\d.-]/g, "");
      const dotParts = rawValue.split(".");
      if (dotParts.length > 2) rawValue = `${dotParts[0]}.${dotParts[1]}`;
    } else {
      rawValue = rawValue.replace(/[^\d.]/g, "");
    }

    let numeric = parseFloat(rawValue);

    /* Handle empty/NaN values, including intermediate minus sign */
    if (isNaN(numeric)) {
      const emptyVal = allowNegative && rawValue === "-" ? "-" : "";
      setValue(emptyVal);

      const event = {
        target: { value: emptyVal },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
      return;
    }

    /* Clamp numeric boundaries */
    if (resolvedMin !== undefined && numeric < resolvedMin)
      numeric = resolvedMin;
    if (resolvedMax !== undefined && numeric > resolvedMax) numeric = resolvedMax;

    /* Apply decimalScale truncation if provided */
    let finalVal = String(numeric);
    if (decimalScale !== undefined) {
      const parts = String(numeric).split(".");
      if (parts.length > 1) {
        if (decimalScale === 0) {
          finalVal = parts[0];
        } else {
          finalVal = `${parts[0]}.${parts[1].slice(0, decimalScale)}`;
        }
      }
    }

    /* Preserve the typed trailing dot (e.g. "2.") so they can continue typing decimals */
    if (rawValue.endsWith(".") && !finalVal.includes(".")) {
      finalVal += ".";
    } else if (rawValue.includes(".") && decimalScale !== 0) {
      const [_, fractional] = rawValue.split(".");
      const [intPart] = finalVal.split(".");
      const scale = decimalScale !== undefined ? decimalScale : fractional.length;
      finalVal = `${intPart}.${fractional.slice(0, scale)}`;
    }

    setValue(finalVal);

    /* Propagate change up to React Hook Form listener */
    const event = {
      target: { value: finalVal },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(event);
  };

  /* Text input change handler: forwards to unified value updater */
  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateValue(e.target.value);
  };

  /* Stepper button increment click action */
  const handleIncrement = () => {
    const current = Number(value) || 0;
    updateValue(current + step);
  };

  /* Stepper button decrement click action */
  const handleDecrement = () => {
    const current = Number(value) || 0;
    updateValue(current - step);
  };

  const isNegativeValue = value.startsWith("-");

  return (
    <Input
      placeholder="0"
      {...props}
      type="text"
      value={value}
      onChange={handleInternalChange}
      className={cn(isNegativeValue && "text-red-500 font-medium focus-within:border-red-500 focus-within:ring-red-500/20", className)}
      rightIcon={
        (showSteppers || props.rightIcon) && (
          <div className="flex items-center gap-1.5 pl-2 ml-1">
            {showSteppers && (
              <div
                className={cn(
                  "flex items-center gap-1",
                  props.rightIcon && "border-r border-gray-250 pr-2 mr-1",
                )}
              >
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="p-0.5 rounded transition-colors text-white bg-black hover:bg-gray-800"
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="p-0.5 rounded transition-colors text-white bg-black hover:bg-gray-800"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
            {props.rightIcon}
          </div>
        )
      }
    />
  );
};
