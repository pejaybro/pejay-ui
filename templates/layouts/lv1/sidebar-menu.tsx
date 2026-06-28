import { type ReactNode } from "react";
import { cn } from "@/pejay-ui/utils/cn";

// ============================================================================
// Types
// ============================================================================

export interface MenuItem {
  id: string | number;
  label: string;
  icon?: ReactNode;
  link?: string;
  children?: { id: string | number; label: string; link?: string; icon?: ReactNode }[];
}

export type MenuSection =
  | { id: string | number; type: "item"; label: string; icon?: ReactNode; link?: string; divider?: boolean }
  | { id: string | number; type: "group"; label: string; items: MenuItem[]; divider?: boolean }
  | { id: string | number; type: "bottom"; items: MenuItem[]; divider?: boolean };

export interface SidebarMenuProps {
  config: MenuSection[];
  isExpanded: boolean;
  activeId?: string | number;
  onItemClick?: (id: string | number) => void;
}

// ============================================================================
// Menu Button
// ============================================================================

const MenuBtn = ({
  label,
  icon,
  isExpanded,
  isActive,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  isExpanded: boolean;
  isActive?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer select-none",
      isExpanded ? "px-2.5 py-2 justify-start" : "p-2.5 justify-center aspect-square w-auto",
      isActive ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
    )}
  >
    <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">
      {icon ?? <span className="text-[13px] font-bold font-mono">{label.charAt(0)}</span>}
    </span>
    {isExpanded && <span className="whitespace-nowrap">{label}</span>}
  </button>
);

// ============================================================================
// SidebarMenu
// ============================================================================

export const SidebarMenu = ({ config, isExpanded, activeId, onItemClick }: SidebarMenuProps) => {
  if (!config.length) return null;

  const renderItem = (item: MenuItem) => (
    <MenuBtn
      key={item.id}
      label={item.label}
      icon={item.icon}
      isExpanded={isExpanded}
      isActive={item.id === activeId}
      onClick={() => onItemClick?.(item.id)}
    />
  );

  const topSections = config.filter((s) => s.type !== "bottom");
  const bottomSections = config.filter((s) => s.type === "bottom");

  const renderSection = (section: MenuSection) => {
    const el =
      section.type === "group" ? (
        <div key={section.id} className={cn("flex flex-col gap-0.5 w-full", isExpanded && "mt-2 first:mt-0")}>
          {isExpanded && (
            <span className="text-[9px] uppercase font-bold tracking-widest text-white/25 px-2.5 py-1 select-none">
              {section.label}
            </span>
          )}
          {section.items.map(renderItem)}
        </div>
      ) : section.type === "bottom" ? (
        <div key={section.id} className="flex flex-col gap-0.5 w-full">
          {section.items.map(renderItem)}
        </div>
      ) : (
        renderItem({ id: section.id, label: section.label, icon: section.icon, link: section.link })
      );

    return section.divider ? (
      <div key={section.id} className="flex flex-col gap-0.5 w-full">
        <div className="h-px bg-white/10 my-1.5 w-full" />
        {el}
      </div>
    ) : el;
  };

  return (
    <div className="flex flex-col justify-between flex-1 w-full h-full overflow-hidden gap-1">
      <div className="flex flex-col gap-0.5 w-full overflow-y-auto flex-1">
        {topSections.map(renderSection)}
      </div>
      {bottomSections.length > 0 && (
        <div className="flex flex-col gap-0.5 w-full shrink-0">
          {bottomSections.map(renderSection)}
        </div>
      )}
    </div>
  );
};
