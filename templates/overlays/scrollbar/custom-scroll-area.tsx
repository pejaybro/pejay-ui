/**
 * ============================================================================
 * CUSTOM SCROLL AREA — Reusable React & Tailwind Component
 * ============================================================================
 *
 * Provides smooth lerp-momentum scrolling and auto-vanishing floating
 * scrollbars for BOTH vertical and horizontal axes. Bars appear on scroll
 * or mouse-move and fade out automatically when idle.
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
 *        <CustomScrollArea>
 *          <p>Your long scrollable content here...</p>
 *        </CustomScrollArea>
 *      );
 *    }
 *
 * 4. All available props:
 *
 *    <CustomScrollArea
 *      hideDelay={2000}           // Idle time (ms) before scrollbar fades out  (Default: 1800ms)
 *      fadeDurationMs={500}       // Fade-out transition duration in ms          (Default: 700ms)
 *      thumbWidth="w-2"           // Tailwind class — vertical thumb thickness   (Default: "w-1.5")
 *      thumbHoverWidth="w-2.5"    // Vertical thumb thickness on hover/drag      (Default: "w-2")
 *      thumbColor="bg-zinc-500"   // Idle thumb color (Tailwind class)           (Default: "bg-chalk-40")
 *      thumbHoverColor="bg-white" // Thumb color on hover/drag                   (Default: "bg-chalk-70")
 *      smoothWheel={true}         // Enable smooth lerp momentum scrolling       (Default: true)
 *    >
 *      {content}
 *    </CustomScrollArea>
 *
 * 5. Scrolling behaviour:
 *    - Mouse wheel (deltaY)          → vertical scroll
 *    - Trackpad two-finger swipe (deltaX) → horizontal scroll
 *    - Shift + Mouse wheel           → horizontal scroll
 *    - Both scrollbars are draggable; corner gap is applied automatically
 *      when both axes are simultaneously scrollable.
 * ============================================================================
 */

import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/pejay-ui/utils/cn";

export interface CustomScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
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

  // ── Vertical smooth-scroll state ──────────────────────────────────────────
  const targetScrollTop = useRef(0);
  const isAnimatingScrollY = useRef(false);

  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop]       = useState(0);

  // ── Horizontal smooth-scroll state ────────────────────────────────────────
  const targetScrollLeft = useRef(0);
  const isAnimatingScrollX = useRef(false);

  const [thumbWidthH, setThumbWidthH] = useState(0);   // horizontal thumb pixel width
  const [thumbLeft, setThumbLeft]     = useState(0);

  // ── Shared UI state ────────────────────────────────────────────────────────
  const [isVisible, setIsVisible]             = useState(false);
  const [isThumbHoveredV, setIsThumbHoveredV] = useState(false);
  const [isDraggingV, setIsDraggingV]         = useState(false);
  const [isThumbHoveredH, setIsThumbHoveredH] = useState(false);
  const [isDraggingH, setIsDraggingH]         = useState(false);

  const hideTimeoutRef = useRef<number | null>(null);

  const isInteracting = isThumbHoveredV || isDraggingV || isThumbHoveredH || isDraggingH;

  /* ==========================================================================
   * [1] Scroll Position & Thumb Calculations (Instant 1:1 sync)
   * ========================================================================== */
  const updateScrollbar = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = el;

    // ── Vertical thumb ──────────────────────────────────────────────────────
    if (scrollHeight <= clientHeight + 1) {
      setThumbHeight(0);
    } else {
      const trackPadding        = 12; // top-1.5 (6px) + bottom-1.5 (6px)
      const availableTrackHeight = Math.max(0, clientHeight - trackPadding);
      const minThumbHeight      = 32;
      const calcHeight = Math.max(
        (clientHeight / scrollHeight) * availableTrackHeight,
        minThumbHeight
      );
      const maxScrollTop = scrollHeight - clientHeight;
      const maxThumbTop  = availableTrackHeight - calcHeight;
      const calcTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

      setThumbHeight(calcHeight);
      setThumbTop(calcTop);
    }

    // ── Horizontal thumb ────────────────────────────────────────────────────
    if (scrollWidth <= clientWidth + 1) {
      setThumbWidthH(0);
    } else {
      const trackPadding        = 12; // left-1.5 + right-1.5
      const availableTrackWidth = Math.max(0, clientWidth - trackPadding);
      const minThumbWidth       = 32;
      const calcWidth = Math.max(
        (clientWidth / scrollWidth) * availableTrackWidth,
        minThumbWidth
      );
      const maxScrollLeft = scrollWidth - clientWidth;
      const maxThumbLeft  = availableTrackWidth - calcWidth;
      const calcLeft = maxScrollLeft > 0 ? (scrollLeft / maxScrollLeft) * maxThumbLeft : 0;

      setThumbWidthH(calcWidth);
      setThumbLeft(calcLeft);
    }
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
      if (!isInteracting) {
        setIsVisible(false);
      }
    }, hideDelay);
  }, [hideDelay, isInteracting]);

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

    // ── Vertical lerp ───────────────────────────────────────────────────────
    const animateSmoothScrollY = () => {
      if (!el) { isAnimatingScrollY.current = false; return; }
      const diff = targetScrollTop.current - el.scrollTop;
      if (Math.abs(diff) < 0.5) {
        el.scrollTop = targetScrollTop.current;
        isAnimatingScrollY.current = false;
        updateScrollbar();
        return;
      }
      el.scrollTop += diff * 0.18;
      updateScrollbar();
      requestAnimationFrame(animateSmoothScrollY);
    };

    // ── Horizontal lerp ─────────────────────────────────────────────────────
    const animateSmoothScrollX = () => {
      if (!el) { isAnimatingScrollX.current = false; return; }
      const diff = targetScrollLeft.current - el.scrollLeft;
      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = targetScrollLeft.current;
        isAnimatingScrollX.current = false;
        updateScrollbar();
        return;
      }
      el.scrollLeft += diff * 0.18;
      updateScrollbar();
      requestAnimationFrame(animateSmoothScrollX);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const maxScrollY = el.scrollHeight - el.clientHeight;
      const maxScrollX = el.scrollWidth  - el.clientWidth;

      // ── Vertical (deltaY, no shift) ────────────────────────────────────────
      if (maxScrollY > 0 && e.deltaY !== 0 && !e.shiftKey) {
        if (!isAnimatingScrollY.current) targetScrollTop.current = el.scrollTop;
        targetScrollTop.current = Math.min(maxScrollY, Math.max(0, targetScrollTop.current + e.deltaY));
        if (!isAnimatingScrollY.current) {
          isAnimatingScrollY.current = true;
          requestAnimationFrame(animateSmoothScrollY);
        }
      }

      // ── Horizontal (native deltaX, e.g. trackpad two-finger swipe) ─────────
      if (maxScrollX > 0 && e.deltaX !== 0) {
        if (!isAnimatingScrollX.current) targetScrollLeft.current = el.scrollLeft;
        targetScrollLeft.current = Math.min(maxScrollX, Math.max(0, targetScrollLeft.current + e.deltaX));
        if (!isAnimatingScrollX.current) {
          isAnimatingScrollX.current = true;
          requestAnimationFrame(animateSmoothScrollX);
        }
      }

      // ── Shift+Wheel → horizontal scroll (common mouse UX pattern) ──────────
      if (maxScrollX > 0 && e.deltaY !== 0 && e.shiftKey) {
        if (!isAnimatingScrollX.current) targetScrollLeft.current = el.scrollLeft;
        targetScrollLeft.current = Math.min(maxScrollX, Math.max(0, targetScrollLeft.current + e.deltaY));
        if (!isAnimatingScrollX.current) {
          isAnimatingScrollX.current = true;
          requestAnimationFrame(animateSmoothScrollX);
        }
      }

      triggerVisibility();
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
   * [4] Zero-Lag 1:1 Direct Mouse Dragging — Vertical
   * ========================================================================== */
  const handleThumbMouseDownV = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const el = containerRef.current;
    if (!el) return;

    setIsDraggingV(true);
    document.body.style.userSelect = "none";

    const startY         = e.clientY;
    const startScrollTop = el.scrollTop;
    const { scrollHeight, clientHeight } = el;
    const maxScrollTop   = scrollHeight - clientHeight;
    const maxThumbTop    = clientHeight - thumbHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (maxThumbTop <= 0) return;
      const deltaY = moveEvent.clientY - startY;
      const newScrollTop = Math.min(
        maxScrollTop,
        Math.max(0, startScrollTop + (deltaY / maxThumbTop) * maxScrollTop)
      );
      el.scrollTop = newScrollTop;
      targetScrollTop.current = newScrollTop;
      const newThumbTop = (newScrollTop / maxScrollTop) * maxThumbTop;
      setThumbTop(newThumbTop);
    };

    const onMouseUp = () => {
      setIsDraggingV(false);
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  /* ==========================================================================
   * [4H] Zero-Lag 1:1 Direct Mouse Dragging — Horizontal
   * ========================================================================== */
  const handleThumbMouseDownH = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const el = containerRef.current;
    if (!el) return;

    setIsDraggingH(true);
    document.body.style.userSelect = "none";

    const startX          = e.clientX;
    const startScrollLeft = el.scrollLeft;
    const { scrollWidth, clientWidth } = el;
    const maxScrollLeft   = scrollWidth - clientWidth;
    const maxThumbLeft    = clientWidth - thumbWidthH;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (maxThumbLeft <= 0) return;
      const deltaX = moveEvent.clientX - startX;
      const newScrollLeft = Math.min(
        maxScrollLeft,
        Math.max(0, startScrollLeft + (deltaX / maxThumbLeft) * maxScrollLeft)
      );
      el.scrollLeft = newScrollLeft;
      targetScrollLeft.current = newScrollLeft;
      const newThumbLeft = (newScrollLeft / maxScrollLeft) * maxThumbLeft;
      setThumbLeft(newThumbLeft);
    };

    const onMouseUp = () => {
      setIsDraggingH(false);
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
  const showScrollbars = isVisible || isInteracting;

  // When both axes are scrollable, offset track ends to avoid the corner overlap
  const hasV = thumbHeight > 0;
  const hasH = thumbWidthH > 0;

  return (
    <div
      className="relative overflow-hidden w-full h-full"
      onMouseMove={handleMouseMove}
    >
      {/* Main Scrollable Content Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        {...props}
      >
        {children}
      </div>

      {/* ── Vertical Floating Track & Thumb ──────────────────────────────── */}
      {hasV && (
        <div
          onMouseEnter={() => { setIsThumbHoveredV(true); setIsVisible(true); }}
          onMouseLeave={() => { setIsThumbHoveredV(false); triggerVisibility(); }}
          style={{ transitionDuration: `${fadeDurationMs}ms` }}
          className={cn(
            "absolute right-1.5 top-1.5 w-3 z-50 pointer-events-auto transition-opacity ease-out flex justify-end",
            hasH ? "bottom-4" : "bottom-1.5",
            showScrollbars ? "opacity-100" : "opacity-0",
          )}
        >
          <div
            onMouseDown={handleThumbMouseDownV}
            style={{
              height: `${thumbHeight}px`,
              transform: `translate3d(0, ${thumbTop}px, 0)`,
              willChange: "transform",
            }}
            className={cn(
              "rounded-full cursor-pointer pointer-events-auto transition-[background-color,width] duration-150",
              thumbWidth,
              thumbColor,
              (isThumbHoveredV || isDraggingV) && `${thumbHoverWidth} ${thumbHoverColor}`,
            )}
          />
        </div>
      )}

      {/* ── Horizontal Floating Track & Thumb ────────────────────────────── */}
      {hasH && (
        <div
          onMouseEnter={() => { setIsThumbHoveredH(true); setIsVisible(true); }}
          onMouseLeave={() => { setIsThumbHoveredH(false); triggerVisibility(); }}
          style={{ transitionDuration: `${fadeDurationMs}ms` }}
          className={cn(
            "absolute left-1.5 bottom-1.5 h-3 z-50 pointer-events-auto transition-opacity ease-out flex flex-col justify-end",
            hasV ? "right-4" : "right-1.5",
            showScrollbars ? "opacity-100" : "opacity-0",
          )}
        >
          <div
            onMouseDown={handleThumbMouseDownH}
            style={{
              width: `${thumbWidthH}px`,
              transform: `translate3d(${thumbLeft}px, 0, 0)`,
              willChange: "transform",
            }}
            className={cn(
              "rounded-full cursor-pointer pointer-events-auto transition-[background-color,height] duration-150 h-1.5",
              thumbColor,
              (isThumbHoveredH || isDraggingH) && `h-2 ${thumbHoverColor}`,
            )}
          />
        </div>
      )}
    </div>
  );
};
