import { useEffect, type ReactNode } from "react";
import type { OverlayOptions } from "../../core/types";
import {
  registerActiveOverlayClose,
  unregisterActiveOverlayClose,
} from "../../core/form-overlay-registry";
import { Portal } from "@/pejay-ui/components/overlays";
import { Backdrop } from "./backdrop";
import { getOverlayContentZ } from "../../core/constants";

interface ModalBaseProps {
  children?: ReactNode;
  onClose?: () => void;
  options: OverlayOptions;
  isActive?: boolean;
  layer?: number;
}

export const Modal = ({
  children,
  onClose,
  options,
  isActive = true,
  layer = 1,
}: ModalBaseProps) => {
  useEffect(() => {
    if (!isActive || !onClose) return;
    registerActiveOverlayClose(onClose);
    return () => unregisterActiveOverlayClose(onClose);
  }, [isActive, onClose]);

  return (
    <Portal>
      <Backdrop
        {...options}
        onClose={onClose}
        isActive={isActive}
        layer={layer}
      >
        <div
          className="relative"
          style={{ zIndex: getOverlayContentZ(layer) }}
        >
          {children}
        </div>
      </Backdrop>
    </Portal>
  );
};
