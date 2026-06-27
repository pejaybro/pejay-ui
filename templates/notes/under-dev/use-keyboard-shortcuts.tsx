import { useCallback, useEffect, useRef } from "react";
import { KeyboardShortcutsHelp } from "@/components/global/keyboard-shortcuts-help";
import {
  dismissActiveNotify,
  requestOverlayCloseWithConfirm,
} from "@/hooks/overlay-close";
import {
  getActiveFormOverlay,
  isUnsavedConfirmOpen,
} from "@/hooks/form-overlay-registry";
import { getPageNewRecordHandler } from "@/hooks/page-shortcut-registry";
import { isModKey, isTypingTarget } from "@/hooks/keyboard-utils";
import type { Provider as Props } from "@/types";

type OverlayContent = Props.OverlayContent;

function navigateFormTab(direction: "prev" | "next") {
  const tabs = getActiveFormOverlay()?.tabs;
  if (!tabs || tabs.order.length === 0) return;

  const currentIndex = tabs.order.indexOf(tabs.active);
  if (currentIndex === -1) return;

  const nextIndex =
    direction === "next"
      ? (currentIndex + 1) % tabs.order.length
      : (currentIndex - 1 + tabs.order.length) % tabs.order.length;

  tabs.setActive(tabs.order[nextIndex]!);
}

export function useKeyboardShortcuts(
  isOverlayOpen: boolean,
  openModal: (content: OverlayContent) => void,
) {
  const isOverlayOpenRef = useRef(isOverlayOpen);
  isOverlayOpenRef.current = isOverlayOpen;

  const openHelp = useCallback(() => {
    openModal(({ close }) => <KeyboardShortcutsHelp close={close} />);
  }, [openModal]);

  const openHelpRef = useRef(openHelp);
  openHelpRef.current = openHelp;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const typing = isTypingTarget(event.target);
      const mod = isModKey(event);

      if (
        event.key === "?" &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        if (typing) return;
        event.preventDefault();
        openHelpRef.current();
        return;
      }

      if (isOverlayOpenRef.current) {
        if (event.key === "Escape") {
          event.preventDefault();

          if (isUnsavedConfirmOpen()) {
            dismissActiveNotify();
            return;
          }

          requestOverlayCloseWithConfirm();
          return;
        }

        if (mod && event.key === "Enter") {
          event.preventDefault();
          getActiveFormOverlay()?.onSubmit?.();
          return;
        }

        if (event.altKey && event.key === "ArrowLeft") {
          if (typing) return;
          event.preventDefault();
          navigateFormTab("prev");
          return;
        }

        if (event.altKey && event.key === "ArrowRight") {
          if (typing) return;
          event.preventDefault();
          navigateFormTab("next");
          return;
        }

        return;
      }

      if (mod && event.altKey && event.key.toLowerCase() === "n") {
        if (typing) return;
        event.preventDefault();
        getPageNewRecordHandler()?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
