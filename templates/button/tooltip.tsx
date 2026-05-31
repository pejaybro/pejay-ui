import React, { useState, useEffect } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  type Placement,
} from "@floating-ui/react";
import { cn } from "@/utils/cn";

interface TooltipProps {
  children: React.ReactNode | string;
  content?: React.ReactNode | string | null | undefined;
  className?: string;
  /** Position of the tooltip relative to the trigger. Defaults to "top" */
  direction?: Placement;
  /** Whether the tooltip should be disabled */
  disabled?: boolean;
  /** Custom class for the reference wrapper element */
  wrapperClassName?: string;
  /** If true, the reference wrapper spans 100% width instead of shrink-wrapping */
  fullWidth?: boolean;
}


/**
 * A custom Tooltip component built with Floating UI for professional positioning
 * and Portals to avoid container clipping (overflow: hidden).
 */
export const Tooltip = ({
  children,
  content = null,
  className,
  direction = "top",
  disabled = false,
  wrapperClassName,
  fullWidth = false,
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Force close tooltip when it becomes disabled or content is removed
  useEffect(() => {
    const isContentEmpty = !content || (typeof content === "string" && content.trim() === "");
    if (disabled || isContentEmpty) {
      setIsOpen(false);
    }
  }, [disabled, content]);

  // 1. Setup Floating UI logic
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen && !disabled && !!content,
    onOpenChange: setIsOpen,
    placement: direction,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(16), // Matches Spotify's gap
      flip({ fallbackAxisSideDirection: "start" }), // Flips if hits screen edge
      shift({ padding: 5 }), // Shifts slightly if hitting side edge
    ],
  });

  // 2. Setup Interactions
  const hover = useHover(context, { move: false, delay: 50 });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);
  
  if (disabled) {
    return <>{children}</>;
  }

  // If disabled or no content provided, just return the trigger without the wrapper div
  if (!content || (typeof content === "string" && content.trim() === "")) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Trigger element - wrapped in a div to serve as the reference point */}
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={cn(
          fullWidth ? "w-full flex items-center min-w-0" : "w-fit inline-flex items-center min-w-0",
          wrapperClassName
        )}
      >
        {children}
      </div>

      {/* Floating element - rendered in a Portal to break out of overflow:hidden parents */}
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={cn(
              "z-9999 px-2 py-1 text-xs font-medium text-black bg-gray-100 rounded-sm max-w-xs whitespace-normal break-words pointer-events-none",
              isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95",
              className,
            )}
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};
