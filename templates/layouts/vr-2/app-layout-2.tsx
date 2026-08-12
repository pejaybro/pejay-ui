import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import {
  Maximize2,
  Minimize2,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { Button } from "@/pejay-ui/components/button";
import { cn } from "@/pejay-ui/utils/cn";

// ============================================================================
// Constants
// ============================================================================

const MOBILE_BREAKPOINT = 900;
const COLLAPSE_THRESHOLD = 120;
const MAX_SIDEBAR_WIDTH = 300;
const DEFAULT_SIDEBAR_WIDTH = 220;
const MIN_RIGHT_SIDEBAR_WIDTH = 160;
const MAX_RIGHT_SIDEBAR_WIDTH = 360;
const DEFAULT_RIGHT_SIDEBAR_WIDTH = 240;
const RIGHT_COLLAPSE_THRESHOLD = 120;
const WIDTH_TRANSITION = "width 280ms cubic-bezier(0.4, 0, 0.2, 1)";

const isMobileViewport = () => window.innerWidth < MOBILE_BREAKPOINT;

// ============================================================================
// Feature flags
// ============================================================================

export type AppLayout2Features = {
  resize: boolean;
  fullscreen: boolean;
  collapseOnClick: boolean;
  autoCollapseOnResize: boolean;
  rightSidebar: boolean;
  rightResize: boolean;
  rightCollapseOnClick: boolean;
};

export const DEFAULT_APP_LAYOUT_2_FEATURES: AppLayout2Features = {
  resize: true,
  fullscreen: true,
  collapseOnClick: true,
  autoCollapseOnResize: true,
  rightSidebar: true,
  rightResize: true,
  rightCollapseOnClick: true,
};

// ============================================================================
// AppLayout2 — dual sidebar (left + right)
// ============================================================================

type AppLayout2Props = {
  features?: Partial<AppLayout2Features>;
};

export const AppLayout2 = ({
  features: featuresProp,
}: AppLayout2Props = {}) => {
  const features: AppLayout2Features = {
    ...DEFAULT_APP_LAYOUT_2_FEATURES,
    ...featuresProp,
  };

  // --- left sidebar state ---
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(
    () => features.autoCollapseOnResize && isMobileViewport(),
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [suppressHover, setSuppressHover] = useState(false);

  // --- right sidebar state ---
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT_SIDEBAR_WIDTH);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [suppressRightHover, setSuppressRightHover] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const lastWidth = useRef(DEFAULT_SIDEBAR_WIDTH);
  const lastRightWidth = useRef(DEFAULT_RIGHT_SIDEBAR_WIDTH);
  const sidebarWidthRef = useRef(sidebarWidth);
  sidebarWidthRef.current = sidebarWidth;
  const rightWidthRef = useRef(rightWidth);
  rightWidthRef.current = rightWidth;
  const isCollapsedRef = useRef(isCollapsed);
  isCollapsedRef.current = isCollapsed;
  const isRightCollapsedRef = useRef(isRightCollapsed);
  isRightCollapsedRef.current = isRightCollapsed;
  const isFullscreenRef = useRef(isFullscreen);
  isFullscreenRef.current = isFullscreen;

  // --- derived ---
  const isCompact = !isFullscreen && isCollapsed;
  const isExpanded = isFullscreen || !isCollapsed;
  const hoverAnim =
    features.collapseOnClick && !isFullscreen && !isResizing && !suppressHover;

  const isRightCompact = isRightCollapsed;
  const isRightExpanded = !isRightCollapsed;
  const rightHoverAnim =
    features.rightCollapseOnClick && !isResizingRight && !suppressRightHover;

  const showRight = features.rightSidebar && !isFullscreen;

  const sidebarStyle = isFullscreen
    ? { width: "100%", transition: WIDTH_TRANSITION }
    : !isCompact
      ? {
          width: `${sidebarWidth}px`,
          transition: isResizing ? "none" : WIDTH_TRANSITION,
        }
      : undefined;

  const rightSidebarStyle = !isRightCompact
    ? {
        width: `${rightWidth}px`,
        transition: isResizingRight ? "none" : WIDTH_TRANSITION,
      }
    : undefined;

  // --- auto collapse on window resize ---
  useLayoutEffect(() => {
    if (!features.autoCollapseOnResize) return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const applyBreakpoint = (mobile: boolean) => {
      if (isFullscreenRef.current) return;

      if (mobile) {
        if (!isCollapsedRef.current) {
          lastWidth.current = sidebarWidthRef.current;
        }
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        setSidebarWidth(lastWidth.current);
      }
    };

    const onChange = (e: MediaQueryListEvent) => applyBreakpoint(e.matches);
    mql.addEventListener("change", onChange);
    applyBreakpoint(mql.matches);

    return () => mql.removeEventListener("change", onChange);
  }, [features.autoCollapseOnResize]);

  // --- left drag resize ---
  useEffect(() => {
    if (!isResizing || !features.resize) return;

    const onMove = (e: MouseEvent) => {
      if (isFullscreenRef.current || !sidebarRef.current) return;

      const left = sidebarRef.current.getBoundingClientRect().left;
      const width = e.clientX - left;

      if (width < COLLAPSE_THRESHOLD) {
        if (!isCollapsedRef.current) {
          lastWidth.current = sidebarWidthRef.current;
        }
        setIsCollapsed(true);
      } else if (width <= MAX_SIDEBAR_WIDTH) {
        lastWidth.current = width;
        setIsCollapsed(false);
        setSidebarWidth(width);
      }
    };

    const onUp = () => setIsResizing(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing, features.resize]);

  // --- right drag resize ---
  useEffect(() => {
    if (!isResizingRight || !features.rightResize) return;

    const onMove = (e: MouseEvent) => {
      if (!rightSidebarRef.current) return;

      const right = rightSidebarRef.current.getBoundingClientRect().right;
      const width = right - e.clientX;

      if (width < RIGHT_COLLAPSE_THRESHOLD) {
        if (!isRightCollapsedRef.current) {
          lastRightWidth.current = rightWidthRef.current;
        }
        setIsRightCollapsed(true);
      } else if (width <= MAX_RIGHT_SIDEBAR_WIDTH) {
        lastRightWidth.current = Math.max(width, MIN_RIGHT_SIDEBAR_WIDTH);
        setIsRightCollapsed(false);
        setRightWidth(lastRightWidth.current);
      }
    };

    const onUp = () => setIsResizingRight(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizingRight, features.rightResize]);

  useEffect(() => {
    if (!features.fullscreen && isFullscreen) {
      setIsFullscreen(false);
      setSidebarWidth(lastWidth.current);
    }
  }, [features.fullscreen, isFullscreen]);

  // --- left actions ---
  const expandToLastWidth = () => {
    setIsCollapsed(false);
    setSidebarWidth(lastWidth.current);
  };

  const toggleCompact = () => {
    if (!features.collapseOnClick || isFullscreen) return;
    if (isCompact) {
      expandToLastWidth();
    } else {
      lastWidth.current = sidebarWidth;
      setIsCollapsed(true);
    }
  };

  const toggleFullscreen = () => {
    if (!features.fullscreen) return;

    if (isFullscreen) {
      setIsFullscreen(false);
      setSuppressHover(true);
      if (features.autoCollapseOnResize && isMobileViewport()) {
        setIsCollapsed(true);
      } else {
        expandToLastWidth();
      }
      return;
    }

    if (!isCollapsed) lastWidth.current = sidebarWidth;
    setIsFullscreen(true);
  };

  // --- right actions ---
  const expandRightToLastWidth = () => {
    setIsRightCollapsed(false);
    setRightWidth(lastRightWidth.current);
  };

  const toggleRightCompact = () => {
    if (!features.rightCollapseOnClick) return;
    if (isRightCompact) {
      expandRightToLastWidth();
    } else {
      lastRightWidth.current = rightWidth;
      setIsRightCollapsed(true);
      setSuppressRightHover(true);
    }
  };

  // --- render ---
  return (
    <div className="flex flex-col flex-1 w-full p-2.5 gap-2 overflow-hidden">
      <div className="flex flex-row flex-1 w-full gap-2 overflow-hidden">
        {/* Left sidebar */}
        <div
          ref={sidebarRef}
          style={sidebarStyle}
          onMouseLeave={() => setSuppressHover(false)}
          className={cn(
            "bg-dark-c1 rounded-lg border border-chalk-10 h-full py-2 px-3 overflow-hidden relative flex flex-col justify-between shrink-0 select-none",
            hoverAnim && "group",
            isCompact && "w-max p-3",
          )}
        >
          <div className="flex flex-col gap-1.5 w-full overflow-y-auto">
            <div className="flex flex-row items-center justify-between gap-1 w-full">
              <Button
                variant="custom"
                rounded="full"
                className={cn(
                  !features.collapseOnClick && "pointer-events-none",
                )}
                onClick={toggleCompact}
              >
                {isExpanded ? (
                  <>
                    {hoverAnim && (
                      <div className="flex flex-row w-0 h-5 overflow-hidden transition-all group-hover:w-5 duration-300 group-hover:mr-1.5">
                        <PanelLeftClose
                          className="shrink-0 -translate-x-4 opacity-0 group-hover:translate-x-0 duration-300 group-hover:opacity-100"
                          size={20}
                        />
                      </div>
                    )}
                    <span className="text-md font-medium">Menu</span>
                  </>
                ) : (
                  <PanelLeftOpen size={20} />
                )}
              </Button>

              {isExpanded && features.fullscreen && (
                <Button
                  variant="white-ghost"
                  rounded="full"
                  className="h-auto p-2.5"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </Button>
              )}
            </div>
          </div>

          {features.resize && !isFullscreen && (
            <div
              onMouseDown={() => setIsResizing(true)}
              title="Drag to resize menu"
              className={cn(
                "absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-amber-500/60 active:bg-amber-500 transition-colors z-30",
                isResizing && "bg-amber-500",
              )}
            />
          )}
        </div>

        {/* Main */}
        {!isFullscreen && (
          <div className="flex flex-col flex-1 bg-dark-c1 rounded-lg border border-chalk-10 p-4 h-full overflow-y-auto relative min-w-0">
            <Outlet />
          </div>
        )}

        {/* Right sidebar */}
        {showRight && (
          <div
            ref={rightSidebarRef}
            style={rightSidebarStyle}
            onMouseLeave={() => setSuppressRightHover(false)}
            className={cn(
              "bg-dark-c1 rounded-lg border border-chalk-10 h-full py-2 px-3 overflow-hidden relative flex flex-col shrink-0 select-none",
              rightHoverAnim && "group",
              isRightCompact && "w-max p-3",
            )}
          >
            <div className="flex flex-row items-center w-full">
              <Button
                variant="custom"
                rounded="full"
                className={cn(
                  !features.rightCollapseOnClick && "pointer-events-none",
                )}
                onClick={toggleRightCompact}
              >
                {isRightExpanded ? (
                  <>
                    {rightHoverAnim && (
                      <div className="flex flex-row w-0 h-5 overflow-hidden transition-all group-hover:w-5 duration-300 group-hover:mr-1.5">
                        <PanelRightClose
                          className="shrink-0 -translate-x-4 opacity-0 group-hover:translate-x-0 duration-300 group-hover:opacity-100"
                          size={20}
                        />
                      </div>
                    )}
                    <span className="text-md font-medium">Panel</span>
                  </>
                ) : (
                  <PanelRightOpen size={20} />
                )}
              </Button>
            </div>

            {features.rightResize && (
              <div
                onMouseDown={() => setIsResizingRight(true)}
                title="Drag to resize panel"
                className={cn(
                  "absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-amber-500/60 active:bg-amber-500 transition-colors z-30",
                  isResizingRight && "bg-amber-500",
                )}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
