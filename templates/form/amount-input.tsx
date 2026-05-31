import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/utils/cn";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */

interface AmountInputProps extends React.ComponentProps<typeof Input> {
  /* Minimum value constraint */
  min?: string | number;
  /* Maximum value constraint */
  max?: string | number;
  /* Allows typing and submitting negative values */
  allowNegative?: boolean;
  /* Forces trailing decimal precision on blur (e.g. 10 -> 10.00) */
  fixedDecimalOnBlur?: boolean;
  /* Controls visibility of right-side increment/decrement steppers */
  showSteppers?: boolean;
  /* Value delta to apply when stepping up or down */
  step?: number;
}

/*
 * ============================================================================
 * AmountInput Component
 * ============================================================================
 */

export const AmountInput = ({
  min,
  max,
  allowNegative = false,
  fixedDecimalOnBlur = false,
  showSteppers = false,
  step = 1,
  onChange,
  onBlur,
  className,
  ...props
}: AmountInputProps) => {
  /* Base amount string value state */
  const [value, setValue] = useState((props.value as string) || "");

  /* Synchronize value shifts programmatically from parents */
  useEffect(() => {
    if (props.value !== undefined) {
      setValue(String(props.value));
    }
  }, [props.value]);

  /*
   * ------------------------------------------------------------------------
   * Helper Math & Formatting Logic
   * ------------------------------------------------------------------------
   */

  /* Resolve the decimal scale: use max/min precision if present, else default to 2 */
  const getPrecision = (num?: string | number) => {
    if (num === undefined) return null;
    const parts = String(num).split(".");
    return parts.length > 1 ? parts[1].length : 0;
  };

  const maxPrecision = getPrecision(max);
  const minPrecision = getPrecision(min);
  let resolvedScale = 2;
  if (maxPrecision !== null || minPrecision !== null) {
    const derivedPrecision = Math.max(maxPrecision || 0, minPrecision || 0);
    resolvedScale = derivedPrecision > 0 ? derivedPrecision : 2;
  }

  /* Default min to 0 unless allowNegative is enabled */
  const resolvedMin = min !== undefined 
    ? (typeof min === "number" ? min : parseFloat(String(min))) 
    : (allowNegative ? undefined : 0);

  const resolvedMax = max !== undefined 
    ? (typeof max === "number" ? max : parseFloat(String(max))) 
    : undefined;

  /* Formats raw strings with dynamic decimal constraints and thousands groupings */
  const formatAmount = (val: string) => {
    if (!val || val === "-") return val;
    const isNegative = val.startsWith("-");
    const clean = val.replace(/[^\d.]/g, "");
    const parts = clean.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    let result = parts[0];
    if (parts.length >= 2) {
      result += `.${parts[1].slice(0, resolvedScale)}`;
    }

    return isNegative ? `-${result}` : result;
  };

  /* Unified value updater: performs min/max boundaries and RHF event propagation */
  const updateValue = (newVal: string | number, baseEvent?: React.ChangeEvent<HTMLInputElement>) => {
    const stringVal = String(newVal);
    let numeric = parseFloat(stringVal.replace(/,/g, ""));
    
    /* Handle empty/NaN values, including intermediate minus sign */
    if (isNaN(numeric)) {
      const emptyVal = allowNegative && stringVal === "-" ? "-" : "";
      setValue(emptyVal);
      
      const event = baseEvent ? {
        ...baseEvent,
        target: { ...baseEvent.target, value: emptyVal }
      } : {
        target: { value: emptyVal }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
      return;
    }

    /* Clamp numeric boundaries */
    if (resolvedMin !== undefined && numeric < resolvedMin) numeric = resolvedMin;
    if (resolvedMax !== undefined && numeric > resolvedMax) numeric = resolvedMax;

    /* Build clean string value while preserving trailing decimals and typing state */
    let finalVal = formatAmount(String(numeric));
    if (stringVal.endsWith(".") && !finalVal.includes(".")) {
      finalVal += ".";
    } else if (stringVal.includes(".")) {
      const [_, fractional] = stringVal.split(".");
      const [formattedInt] = finalVal.split(".");
      finalVal = `${formattedInt}.${fractional.slice(0, resolvedScale)}`;
    }

    setValue(finalVal);
    
    /* Propagate change up to React Hook Form listener */
    const event = baseEvent ? {
      ...baseEvent,
      target: { ...baseEvent.target, value: finalVal }
    } : {
      target: { value: finalVal }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(event);
  };

  /*
   * ------------------------------------------------------------------------
   * Event Action Handlers
   * ------------------------------------------------------------------------
   */

  /* Stepper button increment click action */
  const handleIncrement = () => {
    const current = parseFloat(value.replace(/,/g, "")) || 0;
    updateValue(current + step);
  };

  /* Stepper button decrement click action */
  const handleDecrement = () => {
    const current = parseFloat(value.replace(/,/g, "")) || 0;
    updateValue(current - step);
  };

  /* Input blur handler: enforces trailing precision logic */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (fixedDecimalOnBlur && value && value !== "-") {
      const numeric = parseFloat(value.replace(/,/g, ""));
      if (!isNaN(numeric)) {
        let fixedValue = value;

        /* Force decimal formatting on blur if no decimals exist */
        if (!value.includes(".")) {
          fixedValue = formatAmount(numeric.toFixed(resolvedScale));
        }

        if (fixedValue !== value) {
          setValue(fixedValue);
          const event = {
            ...e,
            target: { ...e.target, value: fixedValue },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          onChange?.(event);
        }
      }
    }
    onBlur?.(e);
  };

  /* Text input change handler: sanitizes and forwards to unified value updater */
  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;

    /* Lock raw text patterns based on negation rules */
    if (allowNegative) {
      rawValue = rawValue.replace(/(?!^)-/g, "").replace(/[^\d.-]/g, "");
      const dotParts = rawValue.split(".");
      if (dotParts.length > 2) rawValue = `${dotParts[0]}.${dotParts[1]}`;
    } else {
      rawValue = rawValue.replace(/[^\d.]/g, "");
    }

    updateValue(rawValue, e);
  };

  /*
   * ------------------------------------------------------------------------
   * Render Component Markup
   * ------------------------------------------------------------------------
   */

  return (
    <Input
      {...props}
      type="text"
      value={value}
      onChange={handleInternalChange}
      onBlur={handleBlur}
      className={className}
      rightIcon={
        (showSteppers || props.rightIcon) && (
          <div className="flex items-center gap-1.5 pl-2 ml-1">
            {showSteppers && (
              <div
                className={cn(
                  "flex items-center gap-1",
                  props.rightIcon && "border-r border-gray-250 pr-2 mr-1"
                )}
              >
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="p-0.5 rounded transition-colors bg-black text-white cursor-pointer hover:bg-gray-800"
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="p-0.5 rounded transition-colors bg-black text-white cursor-pointer hover:bg-gray-800"
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
