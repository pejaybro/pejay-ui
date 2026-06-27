import React, { useEffect } from "react";
import { Flex } from "../layout/flex";
import type { FlexProps } from "@/types";
import { getOverlayBackdropZ } from "@/utils/constants/z-index";
import { requestOverlayCloseWithConfirm } from "@/hooks/overlay-close";

interface BackdropProps {
  children?: React.ReactNode;
  onClose?: () => void;
  justify?: FlexProps["justify"];
  items?: FlexProps["items"];
  direction?: FlexProps["direction"];
  visible?: boolean;
  isActive?: boolean;
  layer?: number;
}

export function Backdrop({
  children,
  onClose,
  justify,
  items,
  direction,
  visible = true,
  isActive = true,
  layer = 1,
}: BackdropProps) {
  useEffect(() => {
    if (!isActive) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isActive]);

  if (!isActive) {
    return (
      <div className="pointer-events-none invisible fixed inset-0" aria-hidden>
        {children}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes backdropFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(4px);
          }
        }
        @keyframes backdropFadeOut {
          from {
            opacity: 1;
            backdrop-filter: blur(4px);
          }
          to {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
        }
        .animate-backdrop-fade {
          animation: backdropFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-backdrop-fade-out {
          animation: backdropFadeOut 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <Flex
        direction={direction || "row"}
        items={items || "center"}
        justify={justify || "center"}
        className="inset-0 fixed overflow-hidden"
        style={{ zIndex: getOverlayBackdropZ(layer) }}
      >
        <div
          onClick={() => requestOverlayCloseWithConfirm()}
          className={`absolute inset-0 cursor-pointer bg-black/50 ${
            visible ? "animate-backdrop-fade" : "animate-backdrop-fade-out"
          }`}
        />
        <div className="relative z-10">{children}</div>
      </Flex>
    </>
  );
}
