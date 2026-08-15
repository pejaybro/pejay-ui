import { LayoutDashboard, type LucideIcon } from "lucide-react";

export interface HorizontalTabItem {
  id: string;
  name: string;
  icon?: LucideIcon;
}

export const MY_TABS: HorizontalTabItem[] = [
  {
    id: "tab-1",
    name: "Tab 1",
    icon: LayoutDashboard,
  },
  {
    id: "tab-2",
    name: "Tab 2",
  },
];
