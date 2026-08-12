import { useState, useLayoutEffect, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { PanelLeftOpen, X } from "lucide-react";
import { Button } from "@/pejay-ui/components/button";
import { cn } from "@/pejay-ui/utils/cn";

// ============================================================================
// Constants
// ============================================================================

const MOBILE_BREAKPOINT = 786;
const DRAWER_WIDTH = 220;

const isMobileViewport = () => window.innerWidth < MOBILE_BREAKPOINT;

// ------------------------------------------------------------------
// Replace NAV_ITEMS with your route config array.
// Each item should have { name: string; path: string }
// ------------------------------------------------------------------
const NAV_ITEMS: { name: string; path: string }[] = [];

// ============================================================================
// Feature flags
// ============================================================================

export type MobileMenuMode = "drawer" | "fullscreen";

export type AppLayout4Features = {
  /** Collapse top nav on mobile; icon opens slide menu */
  autoCollapseOnResize: boolean;
  /** Mobile menu: partial drawer or full-screen slide */
  mobileMenuMode: MobileMenuMode;
};

export const DEFAULT_APP_LAYOUT_4_FEATURES: AppLayout4Features = {
  autoCollapseOnResize: true,
  mobileMenuMode: "drawer",
};

// ============================================================================
// AppLayout4 — top-nav only, mobile slide drawer from left
// ============================================================================

type AppLayout4Props = {
  features?: Partial<AppLayout4Features>;
};

export const AppLayout4 = ({
  features: featuresProp,
}: AppLayout4Props = {}) => {
  const features: AppLayout4Features = {
    ...DEFAULT_APP_LAYOUT_4_FEATURES,
    ...featuresProp,
  };

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(
    () => features.autoCollapseOnResize && isMobileViewport(),
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const showMobileMenu = isMobile && mobileMenuOpen;
  const isFullscreenMenu = features.mobileMenuMode === "fullscreen";

  const goTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navLinks = (vertical = false) => (
    <div
      className={cn(
        "flex gap-1",
        vertical ? "flex-col items-stretch w-full" : "flex-row items-center",
      )}
    >
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Button
            key={item.path}
            variant="custom"
            rounded="md"
            className={cn(
              "justify-start px-3 py-2 text-sm font-medium",
              active
                ? "bg-chalk-10 text-pure-white"
                : "text-chalk-60 hover:bg-chalk-10/60 hover:text-pure-white",
            )}
            onClick={() => goTo(item.path)}
          >
            {item.name}
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden relative">
      {/* Top nav bar */}
      <div className="flex flex-row items-center justify-between h-14 py-2 px-3 w-full bg-dark-c1 border-b border-chalk-10 gap-3 shrink-0">
        <div className="flex flex-row items-center gap-2 min-w-0">
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
          <span className="text-md font-medium shrink-0">App</span>
          {!isMobile && navLinks(false)}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 p-4 w-full overflow-auto min-h-0">
        <Outlet />
      </div>

      {/* Mobile: slide menu from left */}
      {isMobile && (
        <>
          {!isFullscreenMenu && (
            <div
              className={cn(
                "absolute inset-0 z-40 bg-black/50 transition-opacity duration-300",
                showMobileMenu
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none",
              )}
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          <div
            className={cn(
              "absolute top-0 left-0 z-50 h-full bg-dark-c1 py-2 px-3 flex flex-col overflow-hidden transition-transform duration-300 ease-out gap-3",
              isFullscreenMenu ? "w-full" : "border-r border-chalk-10",
              showMobileMenu ? "translate-x-0" : "-translate-x-full",
            )}
            style={
              isFullscreenMenu ? undefined : { width: `${DRAWER_WIDTH}px` }
            }
          >
            <div className="flex flex-row items-center justify-between w-full shrink-0">
              <span className="text-md font-medium">Menu</span>
              <Button
                variant="white-ghost"
                rounded="full"
                className="h-auto p-2"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </Button>
            </div>
            {navLinks(true)}
          </div>
        </>
      )}
    </div>
  );
};
