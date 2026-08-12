import { useState, useLayoutEffect, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { PanelLeftOpen, X } from "lucide-react";
import { Button } from "@/pejay-ui/components/button";
import { cn } from "@/pejay-ui/utils/cn";

// ============================================================================
// Constants
// ============================================================================

const MOBILE_BREAKPOINT = 786;
const DEFAULT_SIDEBAR_WIDTH = 220;
const WIDTH_TRANSITION = "width 280ms cubic-bezier(0.4, 0, 0.2, 1)";

const isMobileViewport = () => window.innerWidth < MOBILE_BREAKPOINT;

// ============================================================================
// Feature flags
// ============================================================================

export type MobileMenuMode = "drawer" | "fullscreen";

export type AppLayout3Features = {
  /** Auto hide sidebar below breakpoint; top-bar icon opens it */
  autoCollapseOnResize: boolean;
  /** Mobile menu style: partial drawer or full-screen slide */
  mobileMenuMode: MobileMenuMode;
};

export const DEFAULT_APP_LAYOUT_3_FEATURES: AppLayout3Features = {
  autoCollapseOnResize: true,
  mobileMenuMode: "drawer",
};

// ============================================================================
// AppLayout3 — left sidebar with mobile drawer/fullscreen overlay
// ============================================================================

type AppLayout3Props = {
  features?: Partial<AppLayout3Features>;
};

export const AppLayout3 = ({
  features: featuresProp,
}: AppLayout3Props = {}) => {
  const features: AppLayout3Features = {
    ...DEFAULT_APP_LAYOUT_3_FEATURES,
    ...featuresProp,
  };

  const [sidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isMobile, setIsMobile] = useState(
    () => features.autoCollapseOnResize && isMobileViewport(),
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- breakpoint ---
  useLayoutEffect(() => {
    if (!features.autoCollapseOnResize) {
      setIsMobile(false);
      setMobileMenuOpen(false);
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const apply = (mobile: boolean) => {
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };

    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mql.addEventListener("change", onChange);
    apply(mql.matches);

    return () => mql.removeEventListener("change", onChange);
  }, [features.autoCollapseOnResize]);

  // Escape closes mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const showInlineSidebar = !isMobile;
  const showMobileDrawer = isMobile && mobileMenuOpen;
  const isFullscreenMenu = features.mobileMenuMode === "fullscreen";

  const sidebarContent = (
    <div className="flex flex-col gap-1.5 w-full h-full overflow-y-auto">
      <div className="flex flex-row items-center justify-between gap-1 w-full">
        <span className="text-md font-medium">Menu</span>
        {isMobile && (
          <Button
            variant="white-ghost"
            rounded="full"
            className="h-auto p-2"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={16} />
          </Button>
        )}
      </div>
      {/* Place nav items here */}
    </div>
  );

  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden relative">
      <div className="flex flex-row flex-1 w-full gap-0 overflow-hidden">
        {/* Desktop sidebar */}
        {showInlineSidebar && (
          <div
            style={{
              width: `${sidebarWidth}px`,
              transition: WIDTH_TRANSITION,
            }}
            className="bg-dark-c1 border-r border-chalk-10 h-full py-2 px-3 overflow-hidden relative flex flex-col justify-between shrink-0 select-none"
          >
            {sidebarContent}
          </div>
        )}

        {/* Main */}
        <div className="flex flex-col flex-1 h-full overflow-y-auto gap-0 relative min-w-0">
          <div className="flex flex-row items-center h-14 py-2 px-3 w-full bg-dark-c1 border-b border-chalk-10 gap-2">
            {isMobile && (
              <Button
                variant="white-ghost"
                rounded="full"
                className="h-auto p-2"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <PanelLeftOpen size={20} />
              </Button>
            )}
            <span>top bar</span>
          </div>
          <div className="flex flex-row flex-1 p-4 w-full overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile: backdrop + left slide menu */}
      {isMobile && (
        <>
          {!isFullscreenMenu && (
            <div
              className={cn(
                "absolute inset-0 z-40 bg-black/50 transition-opacity duration-300",
                showMobileDrawer
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none",
              )}
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          <div
            className={cn(
              "absolute top-0 left-0 z-50 h-full bg-dark-c1 py-2 px-3 flex flex-col overflow-hidden transition-transform duration-300 ease-out",
              isFullscreenMenu ? "w-full" : "border-r border-chalk-10",
              showMobileDrawer ? "translate-x-0" : "-translate-x-full",
            )}
            style={
              isFullscreenMenu
                ? undefined
                : { width: `${DEFAULT_SIDEBAR_WIDTH}px` }
            }
          >
            {sidebarContent}
          </div>
        </>
      )}
    </div>
  );
};
