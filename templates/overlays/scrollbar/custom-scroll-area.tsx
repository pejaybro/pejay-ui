/**
 * ============================================================================
 * CUSTOM SCROLL AREA — Reusable React & Tailwind Component
 * ============================================================================
 * 
 * HOW TO USE THIS COMPONENT IN ANY REACT + TAILWIND PROJECT:
 * 
 * 1. Copy this file into your project (e.g., `src/pejay-ui/components/custom-scroll-area.tsx`).
 * 2. Add native scrollbar suppression in your CSS (see readme.scrollbar.md).
 * 3. Import and wrap any overflow content:
 * 
 *    import { CustomScrollArea } from "@/src/pejay-ui/components";
 * 
 *    function MyPage() {
 *      return (
 *        <CustomScrollArea className="h-96 w-full p-4">
 *          <p>Your long scrollable content here...</p>
 *        </CustomScrollArea>
 *      );
 *    }
 * 
 * 4. Customizing Settings via Props:
 *    <CustomScrollArea 
 *      hideDelay={2000}          // Idle time (ms) before fade-out (Default: 1800ms)
 *      thumbWidth="w-2"          // Tailwind width class for thumb (Default: "w-1.5")
 *      thumbColor="bg-purple-500" // Tailwind color class (Default: "bg-chalk-40")
 *      smoothWheel={true}        // Enable smooth lerp momentum scrolling (Default: true)
 *    >
 *      {content}
 *    </CustomScrollArea>
 * ============================================================================
 */

import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/pejay-ui/utils/cn";

export interface CustomScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hideDelay?: number;         // Delay (ms) before auto-hiding when idle
  fadeDurationMs?: number;    // Fade transition duration (ms)
  thumbWidth?: string;        // Default thumb width Tailwind class
  thumbHoverWidth?: string;   // Hovered/Dragged thumb width Tailwind class
  thumbColor?: string;        // Idle thumb color
  thumbHoverColor?: string;   // Hovered/Dragged thumb color
  smoothWheel?: boolean;      // Enable smooth momentum wheel scroll
}

export const CustomScrollArea = ({
  children,
  className,
  hideDelay = 1800,
  fadeDurationMs = 700,
  thumbWidth = "w-1.5",
  thumbHoverWidth = "w-2",
  thumbColor = "bg-chalk-40",
  thumbHoverColor = "bg-chalk-70",
  smoothWheel = true,
  ...props
}: CustomScrollAreaProps) => {
  /* ==========================================================================
   * State & Refs
   * ========================================================================== */
  const containerRef = useRef<HTMLDivElement>(null);
  const targetScrollTop = useRef(0);
  const isAnimatingScroll = useRef(false);

  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isThumbHovered, setIsThumbHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const hideTimeoutRef = useRef<number | null>(null);

  /* ==========================================================================
   * [1] Scroll Position & Thumb Calculations (Instant 1:1 sync)
   * ========================================================================== */
  const updateScrollbar = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumbHeight(0);
      return;
    }

    // Inset track padding: top-1.5 (6px) + bottom-1.5 (6px) = 12px total
    const trackPadding = 12;
    const availableTrackHeight = Math.max(0, clientHeight - trackPadding);

    const minThumbHeight = 32;
    const calculatedHeight = Math.max(
      (clientHeight / scrollHeight) * availableTrackHeight,
      minThumbHeight
    );
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = availableTrackHeight - calculatedHeight;
    const calculatedTop =
      maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    setThumbHeight(calculatedHeight);
    setThumbTop(calculatedTop);
  }, []);

  /* ==========================================================================
   * [2] Visibility & Auto-Hide Fade Timing
   * ========================================================================== */
  const triggerVisibility = useCallback(() => {
    setIsVisible(true);

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      if (!isThumbHovered && !isDragging) {
        setIsVisible(false);
      }
    }, hideDelay);
  }, [hideDelay, isThumbHovered, isDragging]);

  const handleScroll = () => {
    updateScrollbar();
    triggerVisibility();
  };

  const handleMouseMove = () => {
    triggerVisibility();
  };

  /* ==========================================================================
   * [3] Silky Smooth Momentum Mouse-Wheel Scroll (Lerp interpolation)
   * ========================================================================== */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !smoothWheel) return;

    const animateSmoothScroll = () => {
      if (!el) {
        isAnimatingScroll.current = false;
        return;
      }

      const diff = targetScrollTop.current - el.scrollTop;
      if (Math.abs(diff) < 0.5) {
        el.scrollTop = targetScrollTop.current;
        isAnimatingScroll.current = false;
        updateScrollbar();
        return;
      }

      // Smooth Lerp momentum step
      el.scrollTop += diff * 0.18;
      updateScrollbar();
      requestAnimationFrame(animateSmoothScroll);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;

      if (!isAnimatingScroll.current) {
        targetScrollTop.current = el.scrollTop;
      }

      targetScrollTop.current = Math.min(
        maxScroll,
        Math.max(0, targetScrollTop.current + e.deltaY)
      );

      triggerVisibility();

      if (!isAnimatingScroll.current) {
        isAnimatingScroll.current = true;
        requestAnimationFrame(animateSmoothScroll);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [smoothWheel, triggerVisibility, updateScrollbar]);

  /* ==========================================================================
   * [3.5] ResizeObserver for Container & Content Expand/Collapse
   * ========================================================================== */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Use requestAnimationFrame to prevent set-state-in-effect warning
    const rafId = requestAnimationFrame(() => {
      updateScrollbar();
    });

    const resizeObserver = new ResizeObserver(() => {
      updateScrollbar();
    });

    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    window.addEventListener("resize", updateScrollbar);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollbar);
    };
  }, [updateScrollbar]);

  /* ==========================================================================
   * [4] Zero-Lag 1:1 Direct Mouse Dragging Handler
   * ========================================================================== */
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const el = containerRef.current;
    if (!el) return;

    setIsDragging(true);
    document.body.style.userSelect = "none";

    const startY = e.clientY;
    const startScrollTop = el.scrollTop;
    const { scrollHeight, clientHeight } = el;
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = clientHeight - thumbHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (maxThumbTop <= 0) return;
      const deltaY = moveEvent.clientY - startY;
      const newScrollTop = Math.min(
        maxScrollTop,
        Math.max(0, startScrollTop + (deltaY / maxThumbTop) * maxScrollTop)
      );

      // Instant 1:1 direct scroll update
      el.scrollTop = newScrollTop;
      targetScrollTop.current = newScrollTop;

      const newThumbTop = (newScrollTop / maxScrollTop) * maxThumbTop;
      setThumbTop(newThumbTop);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  /* ==========================================================================
   * [5] Render JSX
   * ========================================================================== */
  return (
    <div
      className="relative overflow-hidden w-full h-full"
      onMouseMove={handleMouseMove}
    >
      {/* Main Scrollable Content Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "w-full h-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
        {...props}
      >
        {children}
      </div>

      {/* Custom Floating Track & Thumb */}
      {thumbHeight > 0 && (
        <div
          onMouseEnter={() => {
            setIsThumbHovered(true);
            setIsVisible(true);
          }}
          onMouseLeave={() => {
            setIsThumbHovered(false);
            triggerVisibility();
          }}
          style={{ transitionDuration: `${fadeDurationMs}ms` }}
          className={cn(
            "absolute right-1.5 top-1.5 bottom-1.5 w-3 z-50 pointer-events-auto transition-opacity ease-out flex justify-end",
            isVisible || isThumbHovered || isDragging
              ? "opacity-100"
              : "opacity-0",
          )}
        >
          <div
            onMouseDown={handleThumbMouseDown}
            style={{
              height: `${thumbHeight}px`,
              transform: `translate3d(0, ${thumbTop}px, 0)`,
              willChange: "transform",
            }}
            className={cn(
              "rounded-full cursor-pointer pointer-events-auto transition-[background-color,width] duration-150",
              thumbWidth,
              thumbColor,
              (isThumbHovered || isDragging) && `${thumbHoverWidth} ${thumbHoverColor}`,
            )}
          />
        </div>
      )}
    </div>
  );
};
