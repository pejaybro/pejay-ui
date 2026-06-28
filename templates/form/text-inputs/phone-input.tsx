import React, { useState, useEffect } from "react";
import { Input } from "./input";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */

interface PhoneInputProps extends React.ComponentProps<typeof Input> {
  /* Maximum characters allowed in phone number input string */
  maxLength?: number;
}

/*
 * ============================================================================
 * PhoneInput Component
 * ============================================================================
 */

export const PhoneInput = ({
  maxLength = 10,
  onChange,
  ...props
}: PhoneInputProps) => {
  /* Base phone string value state */
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

  /* Filters input to retain only raw numerical digits up to maxLength */
  const formatPhoneNumber = (digits: string) => {
    if (!digits) return "";
    return digits.replace(/\D/g, "").slice(0, maxLength);
  };

  /*
   * ------------------------------------------------------------------------
   * Event Action Handlers
   * ------------------------------------------------------------------------
   */

  /* Text input change handler: sanitizes and propagates to parents */
  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = formatPhoneNumber(e.target.value);
    setValue(val);
    const event = {
      ...e,
      target: {
        ...e.target,
        value: val,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(event);
  };

  /*
   * ------------------------------------------------------------------------
   * Render Component Markup
   * ------------------------------------------------------------------------
   */

  return (
    <Input
      {...props}
      type="tel"
      value={value}
      onChange={handleInternalChange}
    />
  );
};
