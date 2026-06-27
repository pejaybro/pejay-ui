import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { Portal } from "../portal";
import type { OverlayContent, OverlayOptions } from "../../core/types";
import {
  getOverlayBackdropZ,
  getOverlayContentZ,
} from "../../core/constants";
import {
  registerActiveOverlayClose,
  unregisterActiveOverlayClose,
} from "../../core/form-overlay-registry";
import { requestOverlayCloseWithConfirm } from "../../core/overlay-close";

const panelSpring = { type: "spring" as const, damping: 25, stiffness: 200 };

const SidePanelCloseContext = createContext<(() => void) | null>(null);

/** Animated close — use this instead of AppProvider's immediate close. */
export function useAnimatedSidePanelClose() {
  const close = useContext(SidePanelCloseContext);
  if (!close) {
    throw new Error("useAnimatedSidePanelClose must be used within SidePanel");
  }
  return close;
}

interface SidePanelBaseProps {
  children?: ReactNode;
  onClose?: () => void;
  options: OverlayOptions;
  isActive?: boolean;
  layer?: number;
}

export function SidePanel({
  children,
  onClose,
  options,
  isActive = true,
  layer = 1,
}: SidePanelBaseProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isLeft = options?.onSide === "left";

  const requestClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isActive) return;
    registerActiveOverlayClose(requestClose);
    return () => unregisterActiveOverlayClose(requestClose);
  }, [isActive, requestClose]);

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isActive, isOpen]);

  const offscreenX = isLeft ? "-100%" : "100%";
  const panelPosition = isLeft ? "left-0" : "right-0";
  const backdropZ = getOverlayBackdropZ(layer);
  const panelZ = getOverlayContentZ(layer);

  if (!isActive) {
    return (
      <Portal>
        <div
          className="pointer-events-none invisible fixed inset-0"
          aria-hidden
        >
          <SidePanelCloseContext.Provider value={requestClose}>
            {children}
          </SidePanelCloseContext.Provider>
        </div>
      </Portal>
    );
  }

  return (
    <Portal>
      <SidePanelCloseContext.Provider value={requestClose}>
        <AnimatePresence onExitComplete={() => onClose?.()}>
          {isOpen && (
            <>
              <motion.div
                key="side-panel-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm"
                style={{ zIndex: backdropZ }}
                onClick={requestOverlayCloseWithConfirm}
                aria-hidden
              />
              <motion.div
                key="side-panel-panel"
                initial={{ x: offscreenX }}
                animate={{ x: 0 }}
                exit={{ x: offscreenX }}
                transition={panelSpring}
                className={`fixed inset-y-0 flex h-full ${panelPosition}`}
                style={{ zIndex: panelZ }}
              >
                {children}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </SidePanelCloseContext.Provider>
    </Portal>
  );
}

type SidePanelContentProps = {
  content?: OverlayContent;
};

/** Renders provider content with animated `close` wired to the panel. */
export function SidePanelContent({ content }: SidePanelContentProps) {
  const requestClose = useAnimatedSidePanelClose();
  return content?.({ close: requestClose }) ?? null;
}
