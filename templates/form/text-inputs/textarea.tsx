import React, { useState, useRef, useLayoutEffect } from "react";
import { cn } from "@/pejay-ui/utils/cn";

/*
 * ============================================================================
 * Types & Interfaces for TextArea Component
 * ============================================================================
 */
export interface TextAreaStyles {
  /** Decorative classes for the textarea box container (e.g. bg color, border color, focus rings) */
  inputBox?: string;
  /** Decorative classes for the inner textarea text, font, and placeholder */
  input?: string;
  /** Decorative classes for the main label */
  label?: string;
  /** Decorative classes for the secondary description helper text */
  description?: string;
  /** Decorative classes for character and word count labels */
  count?: string;
}

interface TextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "prefix"
> {
  /** Optional custom styles object for decorative overrides (input box, label, description, count) */
  styles?: TextAreaStyles;
  /** Main label displayed above or next to the textarea */
  label?: string;
  /** Helper description text shown below the label */
  description?: string;
  /** Validation error message that triggers error styling and displays at the bottom */
  error?: string;
  /** Corner style variant for the input container */
  variant?: "rounded" | "curved" | "square";
  /** Position of the label relative to the textarea input box */
  labelPlacement?: "top" | "left" | "right";
  /** Explicit width constraints when using horizontal/side labels */
  labelWidth?: string;
  /** Horizontal alignment of the label text */
  "labelAlign-X"?: "left" | "center" | "right";
  /** Vertical alignment of side labels relative to the input container */
  "labelAlign-Y"?: "top" | "middle" | "bottom";
  /** Auto-resizes the height of the textarea based on content length */
  autoResize?: boolean;
  /** Maximum height constraint when autoResize is enabled */
  maxHeight?: string;
  /** Native resize behavior constraint */
  allowResize?: "none" | "both" | "vertical" | "horizontal";
  /** Controls displaying character, word, or both counters in the bottom right corner */
  showCount?: "characters" | "words" | "both" | "none";
  /** Enforces a strict word count limit on user inputs */
  maxWordLimit?: number;
  /** Additional tailwind custom classes for the outer wrapper */
  wrapperClassName?: string;
  /** Additional tailwind custom classes for the textarea element */
  inputClassName?: string;
}

/*
 * ============================================================================
 * TextArea Component (ForwardRef Enabled)
 * ============================================================================
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      description,
      error,
      variant = "curved",
      labelPlacement = "top",
      labelWidth = "w-32",
      "labelAlign-X": labelAlignX,
      "labelAlign-Y": labelAlignY = "middle",
      autoResize = false,
      maxHeight,
      allowResize = "none",
      showCount = "none",
      maxWordLimit,
      wrapperClassName,
      inputClassName,
      className,
      styles,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalHasContent, setInternalHasContent] = useState(
      !!props.defaultValue || !!props.value,
    );
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // Merge outer forwarded ref with our internal ref for autoResize calculations
    const setRefs = (node: HTMLTextAreaElement) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as any).current = node;
      }
      (internalRef as any).current = node;
    };

    // Calculate height adjustment on text change if autoResize is enabled
    useLayoutEffect(() => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = "auto";
        const newHeight = internalRef.current.scrollHeight;
        internalRef.current.style.height = maxHeight
          ? `${Math.min(newHeight, parseInt(maxHeight))}px`
          : `${newHeight}px`;
      }
    }, [autoResize, maxHeight, props.value]);

    // Track word and char counts on input mutations
    const handleTextCounts = (val: string) => {
      setCharCount(val.length);
      const words = val.trim().split(/\s+/).filter(Boolean);
      setWordCount(val.trim() === "" ? 0 : words.length);
    };

    // Event interception logic for tracking and enforcing length and word constraints
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (maxWordLimit) {
        const words = val.trim().split(/\s+/).filter(Boolean);
        if (words.length > maxWordLimit && val.length > (props.value?.toString().length || 0)) {
          return;
        }
      }
      setInternalHasContent(val.length > 0);
      handleTextCounts(val);
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Layout alignment presets for side-by-side placements
    const isSideLabel = labelPlacement === "left" || labelPlacement === "right";
    const xAlignment = labelAlignX || (labelPlacement === "left" ? "right" : "left");
    const yAlignmentClass =
      labelAlignY === "top"
        ? "items-start"
        : labelAlignY === "bottom"
          ? "items-end"
          : "items-center";

    // Rounded variant resolution
    const radiusClass =
      variant === "rounded"
        ? "rounded-2xl"
        : variant === "square"
          ? "rounded-none"
          : "rounded-lg";

    return (
      <div
        className={cn(
          "flex w-full",
          labelPlacement === "top" && "flex-col gap-1.5",
          labelPlacement === "left" && cn("flex-row gap-4", yAlignmentClass),
          labelPlacement === "right" &&
            cn("flex-row-reverse gap-4", yAlignmentClass),
          className,
        )}
      >
        {/* Standard Label Element */}
        {label && (
          <div
            className={cn(
              "flex flex-col",
              isSideLabel ? "shrink-0" : "w-full",
              labelAlignY === "top" && isSideLabel && "mt-2.5",
            )}
          >
            <div
              className={cn(
                isSideLabel ? labelWidth : "w-full",
                "flex flex-col",
                xAlignment === "left" && "items-start text-left",
                xAlignment === "right" && "items-end text-right",
                xAlignment === "center" && "items-center text-center",
              )}
            >
              <span
                className={cn(
                  "text-md font-medium text-black",
                  styles?.label,
                )}
              >
                {label}
              </span>
              {description && (
                <span
                  className={cn(
                    "text-xs font-medium text-black mt-0.5",
                    styles?.description,
                  )}
                >
                  {description}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Input Wrapper Group */}
        <div className="flex-1 flex flex-col relative group">
          {/* Styled wrapper container for borders and states */}
          <div
            className={cn(
              "relative w-full bg-white border-[1.5px] border-black transition-all duration-200 min-h-20",
              radiusClass,
              isFocused
                ? "border-sky-500 ring-4 ring-sky-500/10 shadow-sm"
                : "hover:border-gray-800",
              error ? "border-red-600 ring-4 ring-red-600/10" : "",
              styles?.inputBox,
              wrapperClassName,
            )}
          >
            <textarea
              ref={setRefs}
              {...props}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder={props.placeholder}
              style={{ resize: allowResize }}
              className={cn(
                "w-full bg-transparent border-none text-md text-black outline-none p-2.5 pb-1",
                "placeholder:text-black/40 placeholder:text-sm placeholder:font-medium",
                autoResize && "overflow-hidden",
                styles?.input,
                inputClassName,
              )}
            />

            {/* Display character/word counters in a dedicated footer row to prevent overlap */}
            {showCount !== "none" && (
              <div className="flex justify-end gap-3 px-4 pb-2 select-none pointer-events-none">
                {(showCount === "characters" || showCount === "both") && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold text-black/40 uppercase",
                      styles?.count,
                    )}
                  >
                    {charCount}
                    {props.maxLength ? ` / ${props.maxLength}` : ""} CHR
                  </span>
                )}
                {(showCount === "words" || showCount === "both") && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold text-black/40 uppercase",
                      styles?.count,
                    )}
                  >
                    {wordCount}
                    {maxWordLimit ? ` / ${maxWordLimit}` : ""} WRD
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Validation Error Message Display */}
          {error && (
            <span className="text-xs font-medium text-red-600 mt-1.5 ml-1 block animate-in fade-in slide-in-from-top-1">
              {error}
            </span>
          )}
        </div>
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
