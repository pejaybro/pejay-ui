import React from "react";
import { Input } from "./input";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */

interface EmailInputProps extends React.ComponentProps<typeof Input> {
  /* Controls visibility of validation indicator icons (Check/Alert) */
  showValidationIcon?: boolean;
  /* Represents the validity status calculated by the parent form state */
  isValid?: boolean;
}

/*
 * ============================================================================
 * EmailInput Component
 * ============================================================================
 */

export const EmailInput = ({
  showValidationIcon = true,
  isValid = false,
  onChange,
  className,
  value,
  ...props
}: EmailInputProps) => {
  return (
    <Input
      autoComplete="email"
      type="email"
      leftIcon={<Mail size={18} />}
      {...props}
      value={value}
      onChange={onChange}
      rightIcon={
        /* Render check circle on success, alert circle on format errors */
        showValidationIcon && value ? (
          isValid ? (
            <CheckCircle2 size={18} className="text-green-500" />
          ) : (
            <AlertCircle size={18} className="text-amber-500" />
          )
        ) : (
          props.rightIcon
        )
      }
      className={className}
    />
  );
};
