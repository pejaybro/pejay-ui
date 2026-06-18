import { useState, useLayoutEffect, useEffect } from "react";
import { Menu, PanelLeftOpen, PanelRightOpen, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { MenuSection, SidebarMenu } from "./sidebar-menu";


// ============================================================================
// Config
// ============================================================================

const menuConfig: MenuSection[] = [];

// ============================================================================
// Types
// ============================================================================

type Variant = "none" | "semi" | "full" | "hybrid";
type ActiveVariant = "none" | "semi" | "full";

// ============================================================================
// Hook
// ============================================================================

const useAppMenu = (variant: Variant) => {
  const [expandMenu, setExpandMenu] = useState(false);
  const [activeVariant, setActiveVariant] = useState<ActiveVariant>("none");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpandMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useLayoutEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (variant === "hybrid") {
        setActiveVariant(w >= 1024 ? "none" : w >= 768 ? "semi" : "full");
      } else if (variant === "full") {
        setActiveVariant(w >= 768 ? "none" : "full");
      } else {
        setActiveVariant(variant as ActiveVariant);
      }
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, [variant]);

  return {
    activeVariant,
    isExpanded: activeVariant === "none" || expandMenu,
    expandMenu,
    setExpandMenu,
  };
};

// ============================================================================
// AppLayout
// ============================================================================

export const AppLayout = ({ variant = "hybrid" }: { variant?: Variant }) => {
  const { activeVariant, isExpanded, expandMenu, setExpandMenu } = useAppMenu(variant);

  return (
    <div className="flex flex-row flex-1 w-full h-screen overflow-hidden bg-[#0f0f11]">
      {activeVariant === "full" && isExpanded && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setExpandMenu(false)}
        />
      )}

      <SidePanel
        activeVariant={activeVariant}
        isExpanded={isExpanded}
        expandMenu={expandMenu}
        setExpandMenu={setExpandMenu}
      />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <TopBar
          activeVariant={activeVariant}
          isExpanded={isExpanded}
          setExpandMenu={setExpandMenu}
        />
        <MainArea />
      </div>
    </div>
  );
};

// ============================================================================
// SidePanel
// ============================================================================

const SidePanel = ({
  activeVariant,
  isExpanded,
  expandMenu,
  setExpandMenu,
}: {
  activeVariant: ActiveVariant;
  isExpanded: boolean;
  expandMenu: boolean;
  setExpandMenu: (v: boolean) => void;
}) => {
  const sidebar = (
    <div className="flex flex-col bg-[#141417] border-r border-white/[0.06] h-full p-2 gap-2 w-full overflow-hidden shrink-0">
      {/* Header */}
      {activeVariant === "none" ? (
        <div className="px-2.5 py-2 shrink-0 mb-1 flex items-center gap-2 text-sm font-bold text-white/80 select-none">
          <Menu size={18} />
          <span>Menu</span>
        </div>
      ) : (
        <button
          onClick={() => setExpandMenu(!expandMenu)}
          aria-expanded={isExpanded}
          className={cn(
            "w-full shrink-0 flex items-center gap-2 rounded-lg text-white/60 hover:bg-white/5 hover:text-white/90 transition-all duration-150 cursor-pointer select-none font-bold text-sm",
            isExpanded ? "px-2.5 h-9 justify-start mb-1" : "justify-center aspect-square p-2.5 w-auto"
          )}
        >
          {isExpanded ? <PanelLeftOpen size={18} /> : <PanelRightOpen size={18} />}
          {isExpanded && <span>Menu</span>}
        </button>
      )}

      <SidebarMenu
        config={menuConfig}
        isExpanded={activeVariant === "full" ? true : isExpanded}
      />
    </div>
  );

  if (activeVariant === "full") {
    return (
      <div className={cn(
        "fixed top-0 left-0 h-full z-50 w-52 transform transition-transform duration-300",
        isExpanded ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebar}
        <div className={cn(
          "absolute left-full top-3 ml-3 transition-opacity duration-150",
          expandMenu ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <button
            onClick={() => setExpandMenu(false)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/10 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full transition-all duration-200 shrink-0", isExpanded ? "w-52" : "w-max")}>
      {sidebar}
    </div>
  );
};

// ============================================================================
// TopBar / MainArea
// ============================================================================

const TopBar = ({
  activeVariant,
  isExpanded,
  setExpandMenu,
}: {
  activeVariant: ActiveVariant;
  isExpanded: boolean;
  setExpandMenu: (v: boolean) => void;
}) => (
  <div className="flex items-center h-14 px-3 border-b border-white/[0.06] bg-[#141417] shrink-0">
    {activeVariant === "full" && !isExpanded && (
      <button
        onClick={() => setExpandMenu(true)}
        aria-label="Open Menu"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white/80 transition-all duration-150 cursor-pointer"
      >
        <PanelRightOpen size={18} />
      </button>
    )}
  </div>
);

const MainArea = () => (
  <div className="flex-1 w-full bg-[#0f0f11] h-full overflow-y-auto" />
);
