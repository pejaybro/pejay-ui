import React, { useEffect } from "react";
import { getOverlayBackdropZ } from "../../core/constants";
import { requestOverlayCloseWithConfirm } from "../../core/overlay-close";

interface BackdropProps {
  children?: React.ReactNode;
  onClose?: () => void;
  justify?: string;
  items?: string;
  visible?: boolean;
  isActive?: boolean;
  layer?: number;
}

export function Backdrop({
  children,
  onClose,
  justify = "justify-center",
  items = "items-center",
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

      <div
        className={`fixed inset-0 overflow-hidden flex flex-row ${items} ${justify}`}
        style={{ zIndex: getOverlayBackdropZ(layer) }}
      >
        <div
          onClick={() => requestOverlayCloseWithConfirm()}
          className={`absolute inset-0 cursor-pointer bg-slate-900/20 ${
            visible ? "animate-backdrop-fade" : "animate-backdrop-fade-out"
          }`}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </>
  );
}
