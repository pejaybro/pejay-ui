import React from "react";
import { cn } from "@/pejay-ui/utils/cn";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  /* Title label of the switch toggle */
  label?: string;
  /* Help or descriptive text for the switch */
  description?: string;
  /* Validation error message specific to this switch */
  error?: string;
  /* Controls placement of label relative to the switch toggle */
  labelPlacement?: "top" | "left" | "right";
  /* Sizing parameter for the label container width */
  labelWidth?: string;
  /* Horizontal alignment of the text label */
  "labelAlign-X"?: "left" | "center" | "right";
  /* Vertical alignment of the text label */
  "labelAlign-Y"?: "top" | "middle" | "bottom";
  /* Callback triggered on switch selection change */
  onChange?: (checked: boolean) => void;
}

export const Switch = ({
  label,
  description,
  error,
  labelPlacement = "right",
  labelWidth,
  "labelAlign-X": labelAlignX,
  "labelAlign-Y": labelAlignY = "middle",
  onChange,
  className,
  id,
  ...props
}: SwitchProps) => {
  const switchId = id || React.useId();
  
  /* Pure Controlled State: Read checked directly from parent-provided props */
  const checked = props.checked || false;

  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (props.disabled) return;
    e.preventDefault();
    /* Immediately notify parent of the state transition */
    onChange?.(!checked);
  };

  const isSideLabel = labelPlacement === "left" || labelPlacement === "right";
  const xAlignment = labelAlignX || (labelPlacement === "left" ? "left" : labelPlacement === "right" ? "right" : "left");
  const yAlignmentClass = labelAlignY === "top" ? "items-start" : labelAlignY === "bottom" ? "items-end" : "items-center";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={switchId}
        onClick={handleToggle}
        className={cn(
          "group flex cursor-pointer select-none transition-all duration-200 gap-4",
          labelPlacement === "top" && "flex-col",
          labelPlacement === "left" && cn("flex-row-reverse justify-between w-full", yAlignmentClass),
          labelPlacement === "right" && cn("flex-row justify-start", yAlignmentClass),
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="relative flex items-center shrink-0">
          <input 
            {...props} 
            type="checkbox" 
            id={switchId} 
            className="peer sr-only" 
            checked={checked} 
            readOnly 
          />
          <div className={cn(
            "w-[44px] h-[24px] rounded-full transition-all duration-200 ease-in-out border-[1.5px] border-black relative",
            checked ? "bg-black" : "bg-black/10",
            "peer-focus-visible:ring-4 peer-focus-visible:ring-sky-500/10 peer-focus-visible:border-sky-500"
          )}>
            <div className={cn(
              "w-4 h-4 rounded-full transition-all duration-200 ease-in-out absolute top-[2.5px] left-[3.5px]",
              checked ? "bg-white translate-x-[18px]" : "bg-black translate-x-0"
            )} />
          </div>
        </div>

        {(label || description) && (
          <div className={cn("flex flex-col gap-0.5 min-w-0", isSideLabel ? (labelWidth || "flex-1") : "w-full", xAlignment === "left" && "items-start text-left", xAlignment === "right" && "items-end text-right", xAlignment === "center" && "items-center text-center")}>
            {label && <span className="text-sm font-medium text-black whitespace-normal break-words w-full">{label}{props.required && <span className="text-red-500 ml-1 font-black">*</span>}</span>}
            {description && <span className="text-xs text-black leading-tight whitespace-normal break-words w-full">{description}</span>}
          </div>
        )}
      </label>
      {error && <span className="text-xs font-medium text-red-500 ml-1 italic tracking-tight animate-in fade-in slide-in-from-top-1">{error}</span>}
    </div>
  );
};

/*
 * ============================================================================
 * State Lifting Explanation & Usage Guide
 * ============================================================================
 *
 * 1. What state was lifted up?
 *    The selection/toggle state (`checked` boolean) has been completely lifted
 *    out of the local component scope. The local `useState` hook and corresponding
 *    effects have been removed.
 *
 * 2. How to work with this pure controlled component (Standard React State):
 *    Define a boolean state and its setter in the parent component:
 *
 *    const [isActive, setIsActive] = useState(false);
 *
 *    Then render the component:
 *    <Switch
 *      label="Toggle Active State"
 *      checked={isActive}
 *      onChange={setIsActive}
 *    />
 *
 * 3. React Hook Form Integration:
 *    When using with React Hook Form, wrap this component inside a <Controller>:
 *
 *    <Controller
 *      name="subscribe"
 *      control={control}
 *      render={({ field }) => (
 *        <Switch
 *          label="Subscribe"
 *          checked={field.value}
 *          onChange={field.onChange}
 *        />
 *      )}
 *    />
 */
