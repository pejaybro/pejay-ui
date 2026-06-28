// @ts-ignore
import "./skeleton.css";
import type { SkeletonProps } from "./types";
import { cn } from "@/pejay-ui/utils/cn";

export function Skeleton({
  variant = "rect",
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  // Shape configurations based on variant
  const variantClass =
    variant === "circle"
      ? "rounded-full shrink-0"
      : variant === "text"
      ? "rounded h-[10px] w-3/4"
      : "rounded-xl";

  const resolvedStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    ...style,
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton-shimmer-bg select-none pointer-events-none border border-zinc-900/10",
        variantClass,
        className
      )}
      style={resolvedStyle}
      {...props}
    />
  );
}
