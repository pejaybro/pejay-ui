import React, { useState, useRef, useEffect, type ReactNode } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
  type Placement,
  type Side,
} from "@floating-ui/react";
import { cn } from "@/pejay-ui/utils/cn";

/* ─────────────────────────────────────────────
   Types & Interfaces
   ───────────────────────────────────────────── */

export type PopoverPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export interface PopoverRenderProps {
  /** Closes the popover */
  close: () => void;
  /** Opens the popover */
  open: () => void;
  /** Toggles the popover open state */
  toggle: () => void;
  /** Whether the popover is currently open */
  isOpen: boolean;
}

export interface PopoverProps {
  /**
   * The trigger element that toggles the popover.
   * Can be a standard React node or a render function receiving { isOpen, open, close, toggle }.
   */
  children: ReactNode | ((props: PopoverRenderProps) => ReactNode);

  /**
   * The content to display inside the floating popover container (menu, filter card, settings, form, etc.).
   * Can be a React node or a render function receiving { close, open, toggle, isOpen }.
   */
  content: ReactNode | ((props: PopoverRenderProps) => ReactNode);

  /**
   * Preferred placement of the popover relative to the trigger.
   * Auto edge-detection will automatically flip (e.g., bottom -> top) or shift when viewport space is restricted.
   * @default "bottom"
   */
  placement?: PopoverPlacement;

  /**
   * Direction alias for placement (e.g. "top" | "bottom" | "left" | "right").
   * @default "bottom"
   */
  direction?: PopoverPlacement;

  /**
   * Distance in pixels between the trigger element and the floating popover.
   * @default 8
   */
  offset?: number;

  /**
   * Controlled open state.
   */
  isOpen?: boolean;

  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Callback fired whenever the popover open state changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether interactions with the popover are disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to show an arrow pointing towards the trigger.
   * @default false
   */
  showArrow?: boolean;

  /**
   * Whether to render inside a React Portal to break out of parent overflow:hidden containers.
   * @default true
   */
  usePortal?: boolean;

  /**
   * Whether to trap focus and behave like a modal dialog.
   * @default false
   */
  modal?: boolean;

  /**
   * Custom CSS class names applied to the floating popover container.
   */
  className?: string;

  /**
   * Custom CSS class names applied to the trigger wrapper element.
   */
  wrapperClassName?: string;

  /**
   * If true, trigger wrapper takes 100% width instead of inline fit-content.
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether clicking inside the popover automatically closes it (useful for dropdown navigation items).
   * @default false
   */
  closeOnInsideClick?: boolean;

  /**
   * Accessibility role for the floating element.
   * @default "dialog"
   */
  role?: "dialog" | "menu" | "listbox" | "tooltip";
}

/**
 * A flexible, accessible Popover component built with Floating UI.
 * Features auto edge detection, auto flip (e.g. bottom -> top), auto shift,
 * click-outside dismiss, and portal rendering for cards, menus, and filter dropdowns.
 */
export const Popover = ({
  children,
  content,
  placement,
  direction = "bottom",
  offset: offsetDistance = 8,
  isOpen: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  showArrow = false,
  usePortal = true,
  modal = false,
  className,
  wrapperClassName,
  fullWidth = false,
  closeOnInsideClick = false,
  role = "dialog",
}: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const arrowRef = useRef<HTMLDivElement | null>(null);

  // Close when disabled
  useEffect(() => {
    if (disabled && open) {
      if (!isControlled) setUncontrolledOpen(false);
      onOpenChange?.(false);
    }
  }, [disabled, open, isControlled, onOpenChange]);

  const setOpen = (nextOpen: boolean) => {
    if (disabled && nextOpen) return;
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const desiredPlacement = (placement || direction || "bottom") as Placement;

  // 1. Floating UI configuration with auto edge-detection
  const {
    refs,
    floatingStyles,
    context,
    middlewareData,
    placement: computedPlacement,
  } = useFloating({
    open: open && !disabled,
    onOpenChange: setOpen,
    placement: desiredPlacement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetDistance),
      flip({
        fallbackAxisSideDirection: "start",
        padding: 8,
      }),
      shift({
        padding: 8,
      }),
      ...(showArrow ? [arrow({ element: arrowRef, padding: 4 })] : []),
    ],
  });

  // 2. Setup standard user interactions
  const click = useClick(context, { enabled: !disabled });
  const dismiss = useDismiss(context, {
    outsidePress: true,
    escapeKey: true,
  });
  const roleInteraction = useRole(context, { role });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    roleInteraction,
  ]);

  // Helper callbacks passed to render props
  const renderHelpers: PopoverRenderProps = {
    close: () => setOpen(false),
    open: () => setOpen(true),
    toggle: () => setOpen(!open),
    isOpen: open,
  };

  const triggerContent =
    typeof children === "function" ? children(renderHelpers) : children;

  const popoverBody =
    typeof content === "function" ? content(renderHelpers) : content;

  if (disabled) {
    return <>{triggerContent}</>;
  }

  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[computedPlacement.split("-")[0] as Side];

  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;

  const floatingNode = (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      onClick={(e) => {
        if (closeOnInsideClick) {
          setOpen(false);
        }
      }}
      className={cn(
        "z-50 min-w-[180px] rounded-xl border border-slate-700/60 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur-md transition-all duration-150 ease-out focus:outline-none",
        open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
        className,
      )}
    >
      {popoverBody}

      {showArrow && (
        <div
          ref={arrowRef}
          style={{
            left: arrowX != null ? `${arrowX}px` : "",
            top: arrowY != null ? `${arrowY}px` : "",
            [staticSide as string]: "-4px",
          }}
          className="absolute w-2 h-2 rotate-45 bg-inherit border-inherit"
        />
      )}
    </div>
  );

  const managedFloating = modal ? (
    <FloatingFocusManager context={context} modal={modal}>
      {floatingNode}
    </FloatingFocusManager>
  ) : (
    floatingNode
  );

  return (
    <>
      {/* Trigger reference container */}
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={cn(
          fullWidth
            ? "w-full flex items-center min-w-0"
            : "w-fit inline-flex items-center min-w-0",
          wrapperClassName,
        )}
      >
        {triggerContent}
      </div>

      {/* Floating Popover Container */}
      {open && (
        usePortal ? (
          <FloatingPortal>{managedFloating}</FloatingPortal>
        ) : (
          managedFloating
        )
      )}
    </>
  );
};
