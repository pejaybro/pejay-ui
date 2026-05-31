import React, { useState } from "react";
import { Input } from "./input";
import { Check, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */

interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  /* Controls visibility of the toggle password visibility button */
  showToggle?: boolean;
  /* Displays a warning banner when Caps Lock is toggled on */
  showCapsLockWarning?: boolean;
  /* Displays a password strength meter containing color-coded bars */
  showStrengthMeter?: boolean;
  /* Displays requirement checklists (length, number, uppercase, special) */
  showRequirements?: boolean;
  /* Displays a warning banner when spaces are entered in the input */
  showWhitespaceWarning?: boolean;
}

/*
 * ============================================================================
 * PasswordInput Component
 * ============================================================================
 */

export const PasswordInput = ({
  showToggle = true,
  showCapsLockWarning,
  showStrengthMeter,
  showRequirements,
  showWhitespaceWarning,
  ...props
}: PasswordInputProps) => {
  /* Visibility and CapsLock detection states */
  const [isVisible, setIsVisible] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  /* Fallback internal value state for uncontrolled usage */
  const [internalValue, setInternalValue] = useState(
    props.defaultValue ? String(props.defaultValue) : "",
  );

  /* Prioritize parent value prop, fallback to internal state */
  const value = props.value !== undefined ? String(props.value) : internalValue;

  /* Toggle password plaintext visibility */
  const toggleVisibility = () => setIsVisible(!isVisible);

  /* Calculate password strength score based on length and patterns */
  const calculateStrength = (val: string) => {
    let score = 0;
    if (!val) return 0;
    if (val.length > 6) score++;
    if (val.length > 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    /* Exclude spaces from being counted as special characters */
    if (/[^A-Za-z0-9\s]/.test(val)) score++;
    return score;
  };

  const strength = calculateStrength(value);

  /* Detect keyboard modifier state for Caps Lock */
  const checkCapsLock = (
    e: React.KeyboardEvent | React.MouseEvent | React.FocusEvent,
  ) => {
    if (!showCapsLockWarning) return;
    if ("getModifierState" in e) {
      setIsCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  /* Get strength color mapping based on calculated score */
  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-amber-500";
    if (strength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  /* Get strength label text based on calculated score */
  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  /* Requirements tracking array containing checking logic */
  const requirements = [
    { label: "At least 8 characters", met: value.length >= 8 },
    { label: "At least one number", met: /[0-9]/.test(value) },
    { label: "One uppercase letter", met: /[A-Z]/.test(value) },
    /* Exclude spaces from being counted as special characters */
    { label: "One special character", met: /[^A-Za-z0-9\s]/.test(value) },
  ];

  return (
    <div className="flex flex-col w-full gap-1">
      {/* Base Input element */}
      <Input
        autoComplete="current-password"
        {...props}
        type={isVisible ? "text" : "password"}
        onChange={e => {
          const val = e.target.value;
          setInternalValue(val);
          props.onChange?.(e);
        }}
        onKeyUp={e => {
          checkCapsLock(e);
          props.onKeyUp?.(e);
        }}
        onFocus={e => {
          checkCapsLock(e);
          props.onFocus?.(e);
        }}
        onClick={e => {
          checkCapsLock(e);
          props.onClick?.(e);
        }}
        rightIcon={
          showToggle ? (
            isVisible ? (
              <EyeOff
                size={18}
                className="text-black"
              />
            ) : (
              <Eye
                size={18}
                className="text-black"
              />
            )
          ) : (
            props.rightIcon
          )
        }
        onRightIconClick={
          showToggle ? toggleVisibility : props.onRightIconClick
        }
      />

      {/* Strength indicator bars */}
      {showStrengthMeter && value !== "" && (
        <div className="flex flex-col gap-1 px-1">
          <div className="flex justify-between items-center">
            <div className="flex gap-1 flex-1 h-1 mt-1">
              {[1, 2, 3, 4, 5].map(step => (
                <div
                  key={step}
                  className={cn(
                    "h-full flex-1 rounded-full transition-all duration-500",
                    strength >= step
                      ? getStrengthColor()
                      : "bg-black/10",
                  )}
                />
              ))}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium ml-2 uppercase",
                strength > 0 ? "opacity-100" : "opacity-0",
              )}
            >
              {getStrengthLabel()}
            </span>
          </div>
        </div>
      )}

      {/* Requirement checks list */}
      {showRequirements && value !== "" && (
        <div className="flex flex-col gap-1.5 mt-2 px-1">
          {requirements.map((req, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all duration-300",
                  req.met ? "bg-green-500 border-green-500" : "border-gray-800",
                )}
              >
                {req.met && <Check size={10} className="text-white" />}
              </div>
              <span
                className={cn(
                  "text-[11px] transition-colors duration-300",
                  req.met ? "text-green-500 font-medium" : "text-gray-500",
                )}
              >
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Caps Lock warning banner */}
      {showCapsLockWarning && isCapsLockOn && (
        <div className={"flex items-center gap-1 mt-1 px-1"}>
          <AlertTriangle
            size={12}
            className="text-amber-500"
          />
          <span className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">
            Caps Lock is ON
          </span>
        </div>
      )}

      {/* Whitespace warning banner */}
      {showWhitespaceWarning && /\s/.test(value) && (
        <div className={"flex items-center gap-1 mt-1 px-1"}>
          <AlertTriangle
            size={12}
            className="text-red-500"
          />
          <span className="text-[10px] font-medium text-red-500 uppercase tracking-wider">
            Password contains spaces
          </span>
        </div>
      )}
    </div>
  );
};
