import { useEffect, useState, useRef } from "react";
import type { ToastData } from "./types";
import { toastStore } from "./store";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Portal } from "../overlays";

// Dictionary mapping toast types to their respective Lucide icons and Tailwind styles
const TOAST_STYLES = {
  success: {
    Icon: CheckCircle,
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
    bgGlow: "shadow-emerald-500/5",
    accentColor: "bg-emerald-500",
  },
  error: {
    Icon: AlertCircle,
    iconColor: "text-red-500",
    borderColor: "border-red-500/20",
    bgGlow: "shadow-red-500/5",
    accentColor: "bg-red-500",
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/20",
    bgGlow: "shadow-amber-500/5",
    accentColor: "bg-amber-500",
  },
  info: {
    Icon: Info,
    iconColor: "text-sky-500",
    borderColor: "border-sky-500/20",
    bgGlow: "shadow-sky-500/5",
    accentColor: "bg-sky-500",
  },
} as const;

function ToastItem({
  toast,
  placement = "top-right",
  animationType = "fade",
}: {
  toast: ToastData;
  placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  animationType?: "slide" | "fade";
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [animateState, setAnimateState] = useState(false);
  
  const startXRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringRef = useRef(false);

  const isLeft = placement.endsWith("-left");
  const slideOffset = isLeft ? -500 : 500;

  // Helper to trigger the exit animation and remove toast from store after transition
  const triggerDismiss = (customOffset?: number) => {
    setIsDismissing(true);
    if (customOffset !== undefined) {
      setDragOffset(customOffset);
    }
    setTimeout(() => {
      toastStore.remove(toast.id);
    }, 400);
  };

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isHoveringRef.current) return;
    const duration = toast.duration ?? 4000;
    if (duration === Infinity) return;
    timerRef.current = setTimeout(() => {
      triggerDismiss();
    }, duration);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [toast.id, toast.duration]);

  // Use requestAnimationFrame to guarantee the browser registers the initial off-screen paint before triggering the transition
  useEffect(() => {
    let frame1: number;
    let frame2: number;
    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        setAnimateState(true);
      });
    });
    return () => {
      cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
    };
  }, []);

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    stopTimer();
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    startTimer();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDismissing) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // Prevent dragging when clicking interactive elements (buttons, inputs, links, etc.)
    const target = e.target as HTMLElement;
    if (target.closest("button, input, select, textarea, a")) return;

    setIsDragging(true);
    startXRef.current = e.clientX;
    stopTimer();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const offset = e.clientX - startXRef.current;
    setDragOffset(offset);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Dismiss toast if dragged beyond threshold, otherwise snap back
    if (Math.abs(dragOffset) > 100) {
      triggerDismiss(dragOffset > 0 ? 500 : -500);
    } else {
      setDragOffset(0);
      startTimer();
    }
  };

  // Determine transition styles based on active animation option
  const opacity = Math.max(0, 1 - Math.abs(dragOffset) / 300);

  const opacityStyle = animationType === "slide"
    ? (isDragging ? opacity : 1)
    : (isDismissing || !animateState ? 0 : opacity);

  const transformStyle = animationType === "slide"
    ? (isDismissing
        ? `translate3d(${dragOffset === 0 ? slideOffset : (dragOffset > 0 ? 500 : -500)}px, 0, 0)`
        : (!animateState ? `translate3d(${slideOffset}px, 0, 0)` : `translate3d(${dragOffset}px, 0, 0)`))
    : `translate3d(${dragOffset}px, 0, 0)`;

  const itemStyle = {
    transform: transformStyle,
    opacity: opacityStyle,
    touchAction: "none" as const,
    willChange: "transform, opacity",
    transition: isDragging
      ? "none"
      : "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease-in-out",
  };

  // Return custom component directly, avoiding standard layout properties
  if (toast.type === "custom") {
    return (
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={itemStyle}
        className={cn(
          "relative overflow-hidden min-w-[320px] max-w-[400px] rounded-xl border backdrop-blur-md shadow-2xl flex items-start",
          "select-none cursor-pointer active:cursor-grabbing",
          "bg-gray-950/95 border-violet-500/20 shadow-violet-500/5",
        )}
      >
        {typeof toast.content === "function" ? toast.content(toast.id!) : toast.content}
      </div>
    );
  }

  // Standard toast style configuration mapping
  const typeKey = (toast.type && toast.type in TOAST_STYLES) ? (toast.type as keyof typeof TOAST_STYLES) : "info";
  const { Icon, iconColor, borderColor, bgGlow, accentColor } = TOAST_STYLES[typeKey];

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={itemStyle}
      className={cn(
        "relative overflow-hidden min-w-[320px] max-w-[400px] rounded-xl border backdrop-blur-md p-4 shadow-2xl flex gap-3 items-start",
        "select-none cursor-pointer active:cursor-grabbing",
        "bg-gray-950/95",
        borderColor,
        bgGlow,
      )}
    >
      {accentColor && (
        <div
          className={cn("absolute left-0 top-0 bottom-0 w-[3px]", accentColor)}
        />
      )}

      {toast.icon ? (
        <div className="shrink-0 mt-0.5 ml-1 pointer-events-none flex items-center justify-center">
          {toast.icon}
        </div>
      ) : (
        <Icon
          className={cn("shrink-0 mt-0.5 ml-1 pointer-events-none", iconColor)}
          size={18}
        />
      )}

      <div className="flex-1 flex flex-col gap-0.5 pointer-events-none">
        {toast.message && (
          <p className="text-sm font-medium text-white leading-normal pr-4">
            {toast.message}
          </p>
        )}
        {toast.title && (
          <h3
            className="font-semibold text-sm tracking-tight leading-tight pr-4 text-white"
          >
            {toast.title}
          </h3>
        )}
        {toast.description && (
          <p
            className="text-xs font-medium mt-1 leading-normal text-gray-400"
          >
            {toast.description}
          </p>
        )}
      </div>

      {toast.showClose && (
        <button
          onClick={e => {
            e.stopPropagation();
            triggerDismiss();
          }}
          className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-900 shrink-0 relative z-10"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

interface ToastContainerProps {
  placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  "animation-type"?: "slide" | "fade";
  animationType?: "slide" | "fade";
}

export function ToastContainer({
  placement = "top-right",
  "animation-type": animationTypeHyphen,
  animationType = animationTypeHyphen ?? "fade",
}: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastData[]>(toastStore.getToasts());

  useEffect(() => {
    const unsubscribe = toastStore.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const placementClasses = {
    "top-right": "fixed top-4 right-4 flex-col",
    "top-left": "fixed top-4 left-4 flex-col",
    "bottom-right": "fixed bottom-4 right-4 flex-col-reverse",
    "bottom-left": "fixed bottom-4 left-4 flex-col-reverse",
  };

  const containerClass = placementClasses[placement] || placementClasses["top-right"];

  return (
    <Portal>
      <div className={cn("z-[9999] flex gap-3", containerClass)}>
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            placement={placement}
            animationType={animationType}
          />
        ))}
      </div>
    </Portal>
  );
}
