import React from "react";
import { cn } from "@/pejay-ui/utils/cn";
import { Radio, type RadioProps } from "./radio";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */

/* Represents an individual radio item configuration */
export interface RadioOption {
  id?: string;
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

/* Prop configuration for the parent RadioGroup component */
interface RadioGroupProps extends Omit<
  RadioProps,
  | "label"
  | "description"
  | "value"
  | "onChange"
  | "defaultValue"
  | "options"
  | "error"
> {
  /* Title label of the group */
  label?: string;
  /* Help or descriptive text for the entire group */
  description?: string;
  /* Array of radio option objects */
  options: RadioOption[];
  /* Controlled selection value */
  value?: string;
  /* Default initial selection value */
  defaultValue?: string;
  /* Callback triggered on selection change */
  onChange?: (value: string) => void;
  /* Visual width class for the label area */
  labelWidth?: string;
  /* Horizontal alignment of the group label */
  labelAlign?: "left" | "center" | "right";
  /* Group-level validation error message */
  error?: string;
}

/*
 * ============================================================================
 * RadioGroup Component
 * ============================================================================
 */

export const RadioGroup = ({
  name,
  label,
  description,
  error,
  value,
  defaultValue,
  onChange,
  options = [],
  className,
  labelWidth = "w-full",
  labelAlign = "left",
  ...props
}: RadioGroupProps) => {
  const uniqueName = React.useId();
  const groupName = name || uniqueName;

  /* Pure Controlled State: Source value directly from parent-provided props */
  const activeValue = value !== undefined ? value : (defaultValue || "");

  /* Updates selected option and propagates changes back up */
  const handleRadioChange = (optionValue: string) => {
    onChange?.(optionValue);
  };

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {/* Group Label Area (contains label and description) */}
      {(label || description) && (
        <div className={cn("flex flex-col shrink-0", labelWidth)}>
          <div
            className={cn(
              "flex flex-col",
              labelAlign === "left" && "items-start text-left",
              labelAlign === "right" && "items-end text-right",
              labelAlign === "center" && "items-center text-center",
            )}
          >
            {label && (
              <span className="tracking-tight uppercase text-sm font-bold text-black">
                {label}
              </span>
            )}
            {description && (
              <span className="mt-0.5 leading-tight text-[11px] font-medium text-black">
                {description}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Radio Items Area (loops options and forwards rest parameters) */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex gap-4 flex-col">
          {options.map((option, index) => {
            const isChecked = activeValue === option.value;

            return (
              <div
                key={option.id || option.value || index}
                className="flex items-center gap-3 w-full"
              >
                <Radio
                  name={groupName}
                  label={option.label}
                  description={option.description}
                  disabled={option.disabled}
                  checked={isChecked}
                  onChange={() => handleRadioChange(option.value)}
                  className="flex-1 min-w-0"
                  value={option.value}
                  {...props}
                />
              </div>
            );
          })}
        </div>

        {/* Group Validation Error Message (displayed only once) */}
        {error && (
          <span className="text-[10px] font-medium mt-1.5 ml-1 block animate-in fade-in slide-in-from-top-1 text-red-500">
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

/*
 * ============================================================================
 * State Lifting Explanation & Usage Guide
 * ============================================================================
 *
 * 1. What state was lifted up?
 *    The selected option state (`internalValue` string) has been lifted out of the
 *    local group scope. The local `useState` hook and lifecycle `useEffect` 
 *    synchronization logic have been completely removed.
 *
 * 2. How to work with this pure controlled component (Standard React State):
 *    Define a string state and its setter in the parent component:
 *
 *    const [selectedOpt, setSelectedOpt] = useState("email");
 *
 *    Then render the component:
 *    <RadioGroup
 *      label="Notification Preference"
 *      value={selectedOpt}
 *      onChange={setSelectedOpt}
 *      options={[
 *        { label: "Email", value: "email" },
 *        { label: "SMS", value: "sms" }
 *      ]}
 *    />
 *
 * 3. React Hook Form Integration:
 *    When using with React Hook Form, wrap this component inside a <Controller>:
 *
 *    <Controller
 *      name="notificationPref"
 *      control={control}
 *      render={({ field }) => (
 *        <RadioGroup
 *          label="Notification Preferences"
 *          value={field.value}
 *          onChange={field.onChange}
 *          options={[
 *            { label: "Email", value: "email" },
 *            { label: "SMS", value: "sms" }
 *          ]}
 *        />
 *      )}
 *    />
 */
