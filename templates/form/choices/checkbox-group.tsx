import React from "react";
import { cn } from "@/pejay-ui/utils/cn";
import { Checkbox, type CheckboxProps } from "./checkbox";

/*
 * ============================================================================
 * Types & Interfaces
 * ============================================================================
 */

/* Represents an individual checkbox item configuration */
interface CheckboxOption {
  id?: string;
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
  indicator?: React.ReactNode | "bullet" | "number";
}

/* Prop configuration for the parent CheckboxGroup component extending CheckboxProps */
interface CheckboxGroupProps extends Omit<
  CheckboxProps,
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
  /* Group-level validation error message */
  error?: string;
  /* Support single selection or multiple checkbox checks */
  type?: "single" | "multiple";
  /* Controlled selection value(s) */
  value?: string | string[];
  /* Default initial selection value(s) */
  defaultValue?: string | string[];
  /* Callback triggered on selection change */
  onChange?: (value: any) => void;
  /* Array of checkbox option objects */
  options: CheckboxOption[];
  /* Visual width class for the label area */
  labelWidth?: string;
  /* Horizontal alignment of the group label */
  labelAlign?: "left" | "center" | "right";
  /* Group-level bullets or numerical index prefix markers */
  indicator?: "dots" | "numbers" | React.ReactNode;
}

/*
 * ============================================================================
 * CheckboxGroup Component
 * ============================================================================
 */

export const CheckboxGroup = ({
  label,
  description,
  error,
  type = "multiple",
  value,
  defaultValue,
  onChange,
  options = [],
  className,
  labelWidth = "w-full",
  labelAlign = "left",
  indicator,
  ...props
}: CheckboxGroupProps) => {
  /* Pure Controlled State: Source value directly from parent-provided props */
  const activeValue = value !== undefined ? value : (defaultValue || (type === "multiple" ? [] : ""));

  /* Appends/removes option keys in array for multi-mode, or toggles value for single-mode */
  const handleCheckboxChange = (optionValue: string) => {
    let newValue: string | string[];

    if (type === "single") {
      newValue = activeValue === optionValue ? "" : optionValue;
    } else {
      const currentValues = Array.isArray(activeValue) ? activeValue : [];
      newValue = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
    }

    onChange?.(newValue);
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

      {/* Checkbox Options Area */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex gap-4 flex-col">
          {options.map((option, index) => {
            const isChecked =
              type === "single"
                ? activeValue === option.value
                : Array.isArray(activeValue) &&
                  activeValue.includes(option.value);

            /* Resolves bullet, number index, or custom indicators */
            const optIndicator = option.indicator || indicator;
            let indicatorNode = null;
            if (optIndicator === "bullet" || optIndicator === "dots") {
              indicatorNode = (
                <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-2" />
              );
            } else if (
              optIndicator === "number" ||
              optIndicator === "numbers"
            ) {
              indicatorNode = (
                <span className="text-sm font-bold shrink-0 mt-0.5 w-4 text-center text-gray-500">
                  {index + 1}.
                </span>
              );
            } else if (optIndicator) {
              indicatorNode = (
                <div className="shrink-0 mt-0.5 flex items-center justify-center text-sm font-medium text-gray-500">
                  {optIndicator}
                </div>
              );
            }

            return (
              <div
                key={option.id || option.value || index}
                className="flex gap-3 items-start"
              >
                {indicatorNode}
                <Checkbox
                  id={option.id}
                  label={option.label}
                  description={option.description}
                  disabled={option.disabled}
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(option.value)}
                  className="shrink-0 flex-1"
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
 *    The selection states (`internalValue` single string or array of strings) 
 *    have been completely lifted out of the local component scope. The local 
 *    `useState` hook and lifecycle `useEffect` synchronization logic have 
 *    been completely removed.
 *
 * 2. How to work with this pure controlled component (Standard React State):
 *    Define an array state and its setter in the parent component:
 *
 *    const [selectedItems, setSelectedItems] = useState(["design"]);
 *
 *    Then render the component:
 *    <CheckboxGroup
 *      label="Interests"
 *      type="multiple"
 *      value={selectedItems}
 *      onChange={setSelectedItems}
 *      options={[
 *        { label: "Technology", value: "technology" },
 *        { label: "Design", value: "design" }
 *      ]}
 *    />
 *
 * 3. React Hook Form Integration:
 *    When using with React Hook Form, wrap this component inside a <Controller>:
 *
 *    <Controller
 *      name="interests"
 *      control={control}
 *      render={({ field }) => (
 *        <CheckboxGroup
 *          label="Interests"
 *          value={field.value}
 *          onChange={field.onChange}
 *          options={[
 *            { label: "Technology", value: "technology" },
 *            { label: "Design", value: "design" }
 *          ]}
 *        />
 *      )}
 *    />
 */
