import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { MY_TABS } from "./horizontal-tabs.config";

// ============================================================================
// Types
// ============================================================================

export interface HorizontalTabMenuFeatures {
  /** true → arrows cycle active tab | false (default) → arrows scroll the strip */
  arrowNavigation?: boolean;
}

export interface HorizontalTabMenuProps {
  features?: HorizontalTabMenuFeatures;
}

const DEFAULT_FEATURES: Required<HorizontalTabMenuFeatures> = {
  arrowNavigation: false,
};

// ============================================================================
// Component
// ============================================================================

export const HorizontalTabMenu = ({ features: featuresProp }: HorizontalTabMenuProps = {}) => {
  const features: Required<HorizontalTabMenuFeatures> = { ...DEFAULT_FEATURES, ...featuresProp };

  const [activeId, setActiveId] = useState<string>(MY_TABS[0]?.id ?? "");

  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // ── Scroll overflow state ────────────────────────────────────────────────────

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  // ── Auto-scroll active tab into view ────────────────────────────────────────

  useEffect(() => {
    tabRefs.current
      .get(activeId)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeId]);

  // ── Arrow handler ────────────────────────────────────────────────────────────

  const activeIdx = MY_TABS.findIndex(t => t.id === activeId);

  const handleArrow = (dir: "left" | "right") => {
    if (features.arrowNavigation) {
      const next =
        dir === "left"
          ? Math.max(0, activeIdx - 1)
          : Math.min(MY_TABS.length - 1, activeIdx + 1);
      setActiveId(MY_TABS[next].id);
    } else {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
    }
  };

  const leftEnabled = features.arrowNavigation ? activeIdx > 0 : canScrollLeft;
  const rightEnabled = features.arrowNavigation ? activeIdx < MY_TABS.length - 1 : canScrollRight;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full">
      {/* Tab Bar */}
      <div className="flex items-center w-full border-b border-white/10">

        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => handleArrow("left")}
          tabIndex={leftEnabled ? 0 : -1}
          aria-label={features.arrowNavigation ? "Previous tab" : "Scroll tabs left"}
          className={cn(
            "shrink-0 flex items-center justify-center w-7 h-7 rounded transition-all duration-200",
            leftEnabled
              ? "text-white/60 hover:text-white cursor-pointer"
              : "text-white/15 cursor-default pointer-events-none"
          )}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Scrollable Tab List */}
        <div
          ref={scrollRef}
          className="flex items-end flex-1 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {MY_TABS.map(tab => {
            const isActive = tab.id === activeId;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                ref={el => {
                  if (el) tabRefs.current.set(tab.id, el);
                  else tabRefs.current.delete(tab.id);
                }}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2",
                  "text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer",
                  "transition-all duration-200",
                  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                  "after:transition-all after:duration-200",
                  isActive
                    ? "text-white after:bg-white"
                    : "text-white/40 hover:text-white/70 after:bg-transparent"
                )}
              >
                {Icon && <Icon size={14} className="shrink-0" />}
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => handleArrow("right")}
          tabIndex={rightEnabled ? 0 : -1}
          aria-label={features.arrowNavigation ? "Next tab" : "Scroll tabs right"}
          className={cn(
            "shrink-0 flex items-center justify-center w-7 h-7 rounded transition-all duration-200",
            rightEnabled
              ? "text-white/60 hover:text-white cursor-pointer"
              : "text-white/15 cursor-default pointer-events-none"
          )}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
