import React from "react";
import { cn } from "@/pejay-ui/utils/cn";

interface RangeSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /* Title label of the range slider */
  label?: string;
  /* Help or descriptive text for the slider */
  description?: string;
  /* Validation error message specific to the slider value */
  error?: string;
  /* Layout alignment position of the label relative to the slider bar */
  labelDirection?: 
    | "label-left" | "label-left-top" | "label-left-bottom"
    | "label-right" | "label-right-top" | "label-right-bottom"
    | "label-top" | "label-top-right" | "label-top-center";
  /* Custom visual width string for the label container */
  labelWidth?: string;
  /* Horizontal text alignment of the label */
  labelAlign?: "left" | "center" | "right";
  /* Visual flex-gap spacing class between the label and slider */
  labelGap?: string;
  /* Controls whether the current selected value is rendered numerically */
  showValue?: boolean;
  /* Custom unit string to append after the rendered numerical value */
  valueSuffix?: string;
  /* Callback triggered immediately on slider drag changes */
  onChange?: (value: number) => void;
}

export const RangeSlider = ({
  label,
  description,
  error,
  labelDirection = "label-top",
  labelWidth = "w-32",
  labelAlign,
  labelGap = "gap-4",
  showValue = true,
  valueSuffix = "",
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  id,
  ...props
}: RangeSliderProps) => {
  const sliderId = id || React.useId();
  
  /* Pure Controlled State: Source value directly from parent-provided props */
  const resolvedValue = props.value !== undefined ? Number(props.value) : Number(min);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    /* Notify parent immediately on slide changes */
    onChange?.(newValue);
  };

  const percentage = ((resolvedValue - Number(min)) / (Number(max) - Number(min))) * 100;
  const isSideLabel = labelDirection.startsWith("label-left") || labelDirection.startsWith("label-right");

  const alignment = labelAlign || (
    labelDirection.includes("-left") ? "left" : 
    labelDirection.includes("-right") ? "right" : 
    labelDirection.includes("-center") ? "center" : "left"
  );

  return (
    <div
      className={cn(
        "flex w-full",
        labelGap,
        isSideLabel ? "flex-row" : "flex-col",
        (labelDirection === "label-left" || labelDirection === "label-right") && "items-center",
        labelDirection.endsWith("-top") && isSideLabel && "mt-1 items-start",
        labelDirection.endsWith("-bottom") && isSideLabel && "items-end",
        labelDirection.startsWith("label-right") && "flex-row-reverse",
        className
      )}
    >
      {label && (
        <div 
          className={cn(
            "flex flex-col",
            isSideLabel ? "shrink-0" : "w-full",
            labelDirection.endsWith("-top") && isSideLabel && "mt-1.5"
          )}
        >
          <div className={cn(
            isSideLabel ? labelWidth : "w-full", 
            "flex flex-col gap-1", 
            alignment === "left" && "items-start text-left", 
            alignment === "right" && "items-end text-right", 
            alignment === "center" && "items-center text-center"
          )}>
            {/* Row 1: Label & Number */}
            <div className="flex justify-between items-center w-full gap-4">
              <label
                htmlFor={sliderId}
                className="text-sm font-medium text-black cursor-pointer select-none whitespace-normal wrap-break-word"
              >
                {label}
              </label>
              {showValue && !isSideLabel && (
                <span className="text-sm font-bold tabular-nums text-black shrink-0 leading-none">
                  {resolvedValue}{valueSuffix}
                </span>
              )}
            </div>
            
            {/* Row 2: Description */}
            {description && (
              <span className="text-xs text-black leading-tight whitespace-normal wrap-break-word w-full">
                {description}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Row 3: Slider */}
      <div className="flex-1 flex items-center gap-4">
        {showValue && isSideLabel && labelDirection.startsWith("label-left") && (
          <span className="text-sm font-semibold tabular-nums text-black shrink-0 min-w-[3ch] text-right">
            {resolvedValue}{valueSuffix}
          </span>
        )}

        <div className="relative flex-1 flex items-center h-6 group">
          <div className="absolute w-full h-[6px] bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-100 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <input
            {...props}
            type="range"
            id={sliderId}
            min={min}
            max={max}
            step={step}
            value={resolvedValue}
            onChange={handleChange}
            className={cn(
              "absolute w-full h-6 appearance-none bg-transparent cursor-pointer z-10",
              "focus:outline-none focus:ring-4 focus:ring-sky-500/10 rounded-lg",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/20 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:active:scale-90",
              "[&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black/20 [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb]:active:scale-90"
            )}
          />
        </div>

        {showValue && isSideLabel && labelDirection.startsWith("label-right") && (
          <span className="text-sm font-semibold tabular-nums text-black shrink-0 min-w-[3ch] text-left">
            {resolvedValue}{valueSuffix}
          </span>
        )}
      </div>

      {error && (
        <span className="text-xs font-medium text-red-500 italic tracking-tight">
          {error}
        </span>
      )}
    </div>
  );
};

/*
 * ============================================================================
 * State Lifting Explanation & Usage Guide
 * ============================================================================
 *
 * 1. What state was lifted up?
 *    The slider value state (`internalValue` number) has been lifted out of the
 *    local component scope. The local `useState` hook and lifecycle `useEffect` 
 *    synchronization logic have been completely removed.
 *
 * 2. How to work with this pure controlled component (Standard React State):
 *    Define a numeric state and its setter in the parent component:
 *
 *    const [sliderVal, setSliderVal] = useState(50);
 *
 *    Then render the component:
 *    <RangeSlider
 *      label="Expense Limit"
 *      min={0}
 *      max={100}
 *      value={sliderVal}
 *      onChange={setSliderVal}
 *    />
 *
 * 3. React Hook Form Integration:
 *    When using with React Hook Form, wrap this component inside a <Controller>:
 *
 *    <Controller
 *      name="budgetLimit"
 *      control={control}
 *      render={({ field }) => (
 *        <RangeSlider
 *          label="Monthly Budget"
 *          value={field.value}
 *          onChange={field.onChange}
 *        />
 *      )}
 *    />
 */

