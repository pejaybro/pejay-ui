import { useEffect, type ReactNode } from "react";
import { type Provider as Props } from "@/types";
import { setActiveOverlayClose } from "@/hooks/form-overlay-registry";
import { Portal } from "./portal";
import { Backdrop } from "./backdrop";
import { getOverlayContentZ } from "@/utils/constants/z-index";

interface ModalBaseProps {
  children?: ReactNode;
  onClose?: () => void;
  options: Props.OverlayOptions;
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
    setActiveOverlayClose(onClose);
    return () => setActiveOverlayClose(null);
  }, [isActive, onClose]);

  return (
    <Portal>
      <Backdrop
        {...options}
        onClose={onClose}
        isActive={isActive}
        layer={layer}
      >
        <div className="relative" style={{ zIndex: getOverlayContentZ(layer) }}>
          {children}
        </div>
      </Backdrop>
    </Portal>
  );
};
