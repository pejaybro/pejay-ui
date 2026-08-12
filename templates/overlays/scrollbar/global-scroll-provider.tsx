/**
 * ============================================================================
 * GLOBAL SMOOTH SCROLL PROVIDER — Call ONCE in App.tsx
 * ============================================================================
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
 * smooth lerp momentum scrolling and auto-vanishing custom scrollbars!
 * ============================================================================
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/pejay-ui/utils/cn";

interface GlobalScrollProviderProps {
  children: React.ReactNode;
  hideDelay?: number;      // Idle time (ms) before scrollbar fades out (default 1800ms)
  fadeDurationMs?: number; // Fade in/out opacity duration (default 700ms)
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
  const targetScrollTop = useRef(0);
  const isAnimating = useRef(false);
  const hideTimeoutRef = useRef<number | null>(null);

  const [thumbRect, setThumbRect] = useState<{
    top: number;
    left: number;
    height: number;
    width: number;
  } | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isThumbHovered, setIsThumbHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  /* ==========================================================================
   * Helper: Find Nearest Scrollable Element
   * ========================================================================== */
  const findScrollableParent = useCallback((target: EventTarget | null): HTMLElement | null => {
    let el = target as HTMLElement | null;
    while (el && el !== document.body && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const isScrollableType = overflowY === "auto" || overflowY === "scroll";
      
      if (isScrollableType && el.scrollHeight > el.clientHeight + 2) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }, []);

  /* ==========================================================================
   * Position & Size Calculations for Floating Thumb Overlay
   * ========================================================================== */
  const updateThumbPosition = useCallback(() => {
    const el = activeContainerRef.current;
    if (!el) {
      setThumbRect(null);
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 2) {
      setThumbRect(null);
      return;
    }

    const containerBounds = el.getBoundingClientRect();
    const minThumbHeight = 32;
    const calculatedHeight = Math.max((clientHeight / scrollHeight) * clientHeight, minThumbHeight);
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = clientHeight - calculatedHeight;
    const thumbTopOffset = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;
    const marginOffset = 6; // 6px margin away from top, bottom, and right edges

    setThumbRect({
      top: containerBounds.top + marginOffset + thumbTopOffset,
      left: containerBounds.right - 10,
     height: Math.max(calculatedHeight - (marginOffset * 2), 24),
      width: isThumbHovered || isDragging ? 8 : 6,
    });
  }, [isThumbHovered, isDragging]);

  /* ==========================================================================
   * Trigger Visibility & Auto-Hide Delay
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

  /* ==========================================================================
   * Global Event Listeners: Wheel, MouseMove, Scroll
   * ========================================================================== */
  useEffect(() => {
    // Smooth Lerp Momentum Loop
    const animateSmoothScroll = () => {
      const el = activeContainerRef.current;
      if (!el) {
        isAnimating.current = false;
        return;
      }

      const diff = targetScrollTop.current - el.scrollTop;
      if (Math.abs(diff) < 0.5) {
        el.scrollTop = targetScrollTop.current;
        isAnimating.current = false;
        updateThumbPosition();
        return;
      }

      el.scrollTop += diff * 0.18; // Smooth lerp step
      updateThumbPosition();
      requestAnimationFrame(animateSmoothScroll);
    };

    const handleWheel = (e: WheelEvent) => {
      const scrollable = findScrollableParent(e.target);
      if (!scrollable) return;

      e.preventDefault();
      activeContainerRef.current = scrollable;

      const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
      if (!isAnimating.current) {
        targetScrollTop.current = scrollable.scrollTop;
      }

      targetScrollTop.current = Math.min(
        maxScroll,
        Math.max(0, targetScrollTop.current + e.deltaY)
      );

      triggerVisibility();

      if (!isAnimating.current) {
        isAnimating.current = true;
        requestAnimationFrame(animateSmoothScroll);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) return;
      const scrollable = findScrollableParent(e.target);
      if (scrollable) {
        activeContainerRef.current = scrollable;
        updateThumbPosition();
        triggerVisibility();
      }
    };

    const handleScroll = (e: Event) => {
      if (isAnimating.current || isDragging) return;
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
  }, [findScrollableParent, triggerVisibility, updateThumbPosition, isDragging]);

  /* ==========================================================================
   * Thumb Drag Handler (Instant 1:1 mouse tracking)
   * ========================================================================== */
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const el = activeContainerRef.current;
    if (!el || !thumbRect) return;

    setIsDragging(true);
    document.body.style.userSelect = "none";

    const startY = e.clientY;
    const startScrollTop = el.scrollTop;
    const { scrollHeight, clientHeight } = el;
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = clientHeight - thumbRect.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (maxThumbTop <= 0) return;
      const deltaY = moveEvent.clientY - startY;
      const newScrollTop = Math.min(
        maxScrollTop,
        Math.max(0, startScrollTop + (deltaY / maxThumbTop) * maxScrollTop)
      );

      el.scrollTop = newScrollTop;
      targetScrollTop.current = newScrollTop;
      updateThumbPosition();
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

  return (
    <>
      {children}

      {/* Global Floating Custom Scrollbar Thumb Overlay */}
      {thumbRect && (
        <div
          onMouseEnter={() => {
            setIsThumbHovered(true);
            setIsVisible(true);
          }}
          onMouseLeave={() => {
            setIsThumbHovered(false);
            triggerVisibility();
          }}
          style={{
            position: "fixed",
            top: `${thumbRect.top}px`,
            left: `${thumbRect.left}px`,
            height: `${thumbRect.height}px`,
            width: `${thumbRect.width}px`,
            transitionDuration: `${fadeDurationMs}ms`,
          }}
          className={cn(
            "z-[99999] rounded-full pointer-events-auto cursor-pointer transition-opacity ease-out",
            isThumbHovered || isDragging ? "bg-chalk-70" : "bg-chalk-40",
            isVisible || isThumbHovered || isDragging ? "opacity-100" : "opacity-0"
          )}
          onMouseDown={handleThumbMouseDown}
        />
      )}
    </>
  );
};
