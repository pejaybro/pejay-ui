import type { ReactNode } from "react";
import { cn } from "@/utils";

interface BaseCardProps {
  children?: ReactNode;
  /** Override padding. Defaults to "p-2.5" */
  padding?: string;
  /** Override border radius. Defaults to "rounded-md" */
  rounded?: string;
  /** CSS height value e.g. "200px" | "50vh". min-h-0 is always applied. */
  height?: string;
  /** Override width. Defaults to "w-full" */
  width?: string;
  className?: string;
}

export function BaseCard({
  children,
  padding = "p-2.5",
  rounded = "rounded-md",
  height,
  width = "w-full",
  className,
}: BaseCardProps) {
  return (
    <div
      className={cn("flex flex-row min-h-0", rounded, width, padding, className)}
      style={height ? { height } : undefined}
    >
      {children}
    </div>
  );
}
