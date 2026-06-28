import React from "react";

export type SkeletonVariant = "text" | "circle" | "rect";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual preset shape. Default: "rect" */
  variant?: SkeletonVariant;
  /** Direct width string (e.g. '100%', '48px', or 48) */
  width?: string | number;
  /** Direct height string (e.g. '16px', or 16) */
  height?: string | number;
}
