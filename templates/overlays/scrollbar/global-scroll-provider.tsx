/**
 * ============================================================================
 * GLOBAL SMOOTH SCROLL PROVIDER — Call ONCE in App.tsx
 * ============================================================================
 *
 * Automatically detects the nearest scrollable element under the cursor and
 * renders smooth lerp-momentum scrolling + auto-vanishing floating scrollbars
 * for BOTH vertical and horizontal axes on every scrollable element app-wide.
 *
 * HOW TO USE THIS PROVIDER IN ANY REACT + TAILWIND PROJECT:
 *
 * 1. Copy this file into your project (e.g., `src/pejay-ui/components/global-scroll-provider.tsx`).
 * 2. Add native scrollbar suppression in your CSS (see readme.scrollbar.md).
 * 3. Wrap your root component ONCE in App.tsx:
 *
 *    import { GlobalScrollProvider } from "@/src/pejay-ui/components";
 *
 *    function App() {
 *      return (
 *        <GlobalScrollProvider>
 *          <RouterProvider router={router} />
 *        </GlobalScrollProvider>
 *      );
 *    }
 *
 * That's it! EVERY scrollable element in your entire app (pages, modals,
 * popups, dropdowns, sidebars, context menus, portals) automatically gets
 * smooth lerp momentum scrolling and auto-vanishing custom scrollbars for
 * both vertical and horizontal axes!
 *
 * Props:
 *   hideDelay     – Idle time (ms) before scrollbar fades out (default 1800ms)
 *   fadeDurationMs – Fade in/out transition duration (default 700ms)
 * ============================================================================
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/pejay-ui/utils/cn";

interface GlobalScrollProviderProps {
  children: React.ReactNode;
  hideDelay?: number;      // Idle time (ms) before scrollbar fades out (default 1800ms)
  fadeDurationMs?: number; // Fade in/out opacity duration (default 700ms)
}

interface ThumbRect {
  top: number;
  left: number;
  height: number;
  width: number;
}

export const GlobalScrollProvider: React.FC<GlobalScrollProviderProps> = ({
  children,
  hideDelay = 1800,
  fadeDurationMs = 700,
}) => {
  /* ==========================================================================
   * State & Refs for Active Target Tracking
   * ========================================================================== */
  const activeContainerRef = useRef<HTMLElement | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  // ── Vertical ──────────────────────────────────────────────────────────────
  const targetScrollTop    = useRef(0);
  const isAnimatingY       = useRef(false);
  const [thumbRectV, setThumbRectV] = useState<ThumbRect | null>(null);
  const [isThumbHoveredV, setIsThumbHoveredV] = useState(false);
  const [isDraggingV, setIsDraggingV]         = useState(false);

  // ── Horizontal ────────────────────────────────────────────────────────────
  const targetScrollLeft   = useRef(0);
  const isAnimatingX       = useRef(false);
  const [thumbRectH, setThumbRectH] = useState<ThumbRect | null>(null);
  const [isThumbHoveredH, setIsThumbHoveredH] = useState(false);
  const [isDraggingH, setIsDraggingH]         = useState(false);

  // ── Shared ─────────────────────────────────────────────────────────────────
  const [isVisible, setIsVisible] = useState(false);

  const isInteracting = isThumbHoveredV || isDraggingV || isThumbHoveredH || isDraggingH;

  /* ==========================================================================
   * Helper: Find Nearest Scrollable Element (vertical OR horizontal)
   * ========================================================================== */
  const findScrollableParent = useCallback((target: EventTarget | null): HTMLElement | null => {
    let el = target as HTMLElement | null;
    while (el && el !== document.body && el !== document.documentElement) {
      const style     = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;
      const scrollableY = (overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight + 2;
      const scrollableX = (overflowX === "auto" || overflowX === "scroll") && el.scrollWidth  > el.clientWidth  + 2;
      if (scrollableY || scrollableX) return el;
      el = el.parentElement;
    }
    return null;
  }, []);

  /* ==========================================================================
   * Position & Size Calculations for Both Floating Thumb Overlays
   * ========================================================================== */
  const updateThumbPosition = useCallback(() => {
    const el = activeContainerRef.current;
    if (!el) {
      setThumbRectV(null);
      setThumbRectH(null);
      return;
    }

    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = el;
    const bounds       = el.getBoundingClientRect();
    const marginOffset = 6;

    // ── Vertical thumb ──────────────────────────────────────────────────────
    if (scrollHeight <= clientHeight + 2) {
      setThumbRectV(null);
    } else {
      const availableH  = Math.max(0, clientHeight - marginOffset * 2);
      const minH        = 24;
      const calcHeight  = Math.max((clientHeight / scrollHeight) * availableH, minH);
      const maxScrollTop = scrollHeight - clientHeight;
      const maxThumbTop  = availableH - calcHeight;
      const topOffset    = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

      setThumbRectV({
        top:    bounds.top + marginOffset + topOffset,
        left:   bounds.right - 10,
        height: calcHeight,
        width:  isThumbHoveredV || isDraggingV ? 8 : 6,
      });
    }

    // ── Horizontal thumb ────────────────────────────────────────────────────
    if (scrollWidth <= clientWidth + 2) {
      setThumbRectH(null);
    } else {
      const availableW   = Math.max(0, clientWidth - marginOffset * 2);
      const minW         = 24;
      const calcWidth    = Math.max((clientWidth / scrollWidth) * availableW, minW);
      const maxScrollLeft = scrollWidth - clientWidth;
      const maxThumbLeft  = availableW - calcWidth;
      const leftOffset    = maxScrollLeft > 0 ? (scrollLeft / maxScrollLeft) * maxThumbLeft : 0;

      setThumbRectH({
        top:    bounds.bottom - 10,
        left:   bounds.left + marginOffset + leftOffset,
        height: isThumbHoveredH || isDraggingH ? 8 : 6,
        width:  calcWidth,
      });
    }
  }, [isThumbHoveredV, isDraggingV, isThumbHoveredH, isDraggingH]);

  /* ==========================================================================
   * Trigger Visibility & Auto-Hide Delay
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

  /* ==========================================================================
   * Global Event Listeners: Wheel, MouseMove, Scroll
   * ========================================================================== */
  useEffect(() => {
    // ── Vertical lerp loop ──────────────────────────────────────────────────
    const animateSmoothScrollY = () => {
      const el = activeContainerRef.current;
      if (!el) { isAnimatingY.current = false; return; }
      const diff = targetScrollTop.current - el.scrollTop;
      if (Math.abs(diff) < 0.5) {
        el.scrollTop = targetScrollTop.current;
        isAnimatingY.current = false;
        updateThumbPosition();
        return;
      }
      el.scrollTop += diff * 0.18;
      updateThumbPosition();
      requestAnimationFrame(animateSmoothScrollY);
    };

    // ── Horizontal lerp loop ────────────────────────────────────────────────
    const animateSmoothScrollX = () => {
      const el = activeContainerRef.current;
      if (!el) { isAnimatingX.current = false; return; }
      const diff = targetScrollLeft.current - el.scrollLeft;
      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = targetScrollLeft.current;
        isAnimatingX.current = false;
        updateThumbPosition();
        return;
      }
      el.scrollLeft += diff * 0.18;
      updateThumbPosition();
      requestAnimationFrame(animateSmoothScrollX);
    };

    const handleWheel = (e: WheelEvent) => {
      const scrollable = findScrollableParent(e.target);
      if (!scrollable) return;

      e.preventDefault();
      activeContainerRef.current = scrollable;

      const maxScrollY = scrollable.scrollHeight - scrollable.clientHeight;
      const maxScrollX = scrollable.scrollWidth  - scrollable.clientWidth;

      // ── Vertical (deltaY, no shift) ────────────────────────────────────────
      if (maxScrollY > 0 && e.deltaY !== 0 && !e.shiftKey) {
        if (!isAnimatingY.current) targetScrollTop.current = scrollable.scrollTop;
        targetScrollTop.current = Math.min(maxScrollY, Math.max(0, targetScrollTop.current + e.deltaY));
        if (!isAnimatingY.current) {
          isAnimatingY.current = true;
          requestAnimationFrame(animateSmoothScrollY);
        }
      }

      // ── Horizontal (native deltaX, e.g. trackpad swipe) ───────────────────
      if (maxScrollX > 0 && e.deltaX !== 0) {
        if (!isAnimatingX.current) targetScrollLeft.current = scrollable.scrollLeft;
        targetScrollLeft.current = Math.min(maxScrollX, Math.max(0, targetScrollLeft.current + e.deltaX));
        if (!isAnimatingX.current) {
          isAnimatingX.current = true;
          requestAnimationFrame(animateSmoothScrollX);
        }
      }

      // ── Shift + Wheel → horizontal ─────────────────────────────────────────
      if (maxScrollX > 0 && e.deltaY !== 0 && e.shiftKey) {
        if (!isAnimatingX.current) targetScrollLeft.current = scrollable.scrollLeft;
        targetScrollLeft.current = Math.min(maxScrollX, Math.max(0, targetScrollLeft.current + e.deltaY));
        if (!isAnimatingX.current) {
          isAnimatingX.current = true;
          requestAnimationFrame(animateSmoothScrollX);
        }
      }

      triggerVisibility();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingV || isDraggingH) return;
      const scrollable = findScrollableParent(e.target);
      if (scrollable) {
        activeContainerRef.current = scrollable;
        updateThumbPosition();
        triggerVisibility();
      }
    };

    const handleScroll = (e: Event) => {
      if (isAnimatingY.current || isAnimatingX.current || isDraggingV || isDraggingH) return;
      const scrollable = findScrollableParent(e.target);
      if (scrollable) {
        activeContainerRef.current = scrollable;
        updateThumbPosition();
        triggerVisibility();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("resize", updateThumbPosition);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", updateThumbPosition);
    };
  }, [findScrollableParent, triggerVisibility, updateThumbPosition, isDraggingV, isDraggingH]);

  /* ==========================================================================
   * ResizeObserver for Active Container Expand/Collapse Resizing
   * ========================================================================== */
  useEffect(() => {
    const el = activeContainerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      updateThumbPosition();
    });

    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateThumbPosition]);

  /* ==========================================================================
   * Vertical Thumb Drag Handler (Instant 1:1 mouse tracking)
   * ========================================================================== */
  const handleThumbMouseDownV = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const el = activeContainerRef.current;
    if (!el || !thumbRectV) return;

    setIsDraggingV(true);
    document.body.style.userSelect = "none";

    const startY         = e.clientY;
    const startScrollTop = el.scrollTop;
    const { scrollHeight, clientHeight } = el;
    const maxScrollTop   = scrollHeight - clientHeight;
    const maxThumbTop    = clientHeight - thumbRectV.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (maxThumbTop <= 0) return;
      const deltaY = moveEvent.clientY - startY;
      const newScrollTop = Math.min(maxScrollTop, Math.max(0, startScrollTop + (deltaY / maxThumbTop) * maxScrollTop));
      el.scrollTop = newScrollTop;
      targetScrollTop.current = newScrollTop;
      updateThumbPosition();
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
   * Horizontal Thumb Drag Handler (Instant 1:1 mouse tracking)
   * ========================================================================== */
  const handleThumbMouseDownH = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const el = activeContainerRef.current;
    if (!el || !thumbRectH) return;

    setIsDraggingH(true);
    document.body.style.userSelect = "none";

    const startX          = e.clientX;
    const startScrollLeft = el.scrollLeft;
    const { scrollWidth, clientWidth } = el;
    const maxScrollLeft   = scrollWidth - clientWidth;
    const maxThumbLeft    = clientWidth - thumbRectH.width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (maxThumbLeft <= 0) return;
      const deltaX = moveEvent.clientX - startX;
      const newScrollLeft = Math.min(maxScrollLeft, Math.max(0, startScrollLeft + (deltaX / maxThumbLeft) * maxScrollLeft));
      el.scrollLeft = newScrollLeft;
      targetScrollLeft.current = newScrollLeft;
      updateThumbPosition();
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
   * Render
   * ========================================================================== */
  const showScrollbars = isVisible || isInteracting;

  return (
    <>
      {children}

      {/* ── Global Vertical Floating Scrollbar Thumb ──────────────────────── */}
      {thumbRectV && (
        <div
          onMouseEnter={() => { setIsThumbHoveredV(true); setIsVisible(true); }}
          onMouseLeave={() => { setIsThumbHoveredV(false); triggerVisibility(); }}
          onMouseDown={handleThumbMouseDownV}
          style={{
            position:          "fixed",
            top:               `${thumbRectV.top}px`,
            left:              `${thumbRectV.left}px`,
            height:            `${thumbRectV.height}px`,
            width:             `${thumbRectV.width}px`,
            transitionDuration: `${fadeDurationMs}ms`,
          }}
          className={cn(
            "z-99999 rounded-full pointer-events-auto cursor-pointer transition-[opacity,width] ease-out",
            isThumbHoveredV || isDraggingV ? "bg-chalk-70" : "bg-chalk-40",
            showScrollbars ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* ── Global Horizontal Floating Scrollbar Thumb ────────────────────── */}
      {thumbRectH && (
        <div
          onMouseEnter={() => { setIsThumbHoveredH(true); setIsVisible(true); }}
          onMouseLeave={() => { setIsThumbHoveredH(false); triggerVisibility(); }}
          onMouseDown={handleThumbMouseDownH}
          style={{
            position:          "fixed",
            top:               `${thumbRectH.top}px`,
            left:              `${thumbRectH.left}px`,
            height:            `${thumbRectH.height}px`,
            width:             `${thumbRectH.width}px`,
            transitionDuration: `${fadeDurationMs}ms`,
          }}
          className={cn(
            "z-99999 rounded-full pointer-events-auto cursor-pointer transition-[opacity,height] ease-out",
            isThumbHoveredH || isDraggingH ? "bg-chalk-70" : "bg-chalk-40",
            showScrollbars ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </>
  );
};
