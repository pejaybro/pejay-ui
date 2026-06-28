import { useCallback } from "react";
import {
  usePanelOverlayActions,
  usePanelOverlayState,
} from "../core/panel-context";
import { APP_PROVIDER_TYPE } from "../core/constants";
import type { OverlayContent, OverlayOptions } from "../core/types";

export function useOverlay() {
  const { open } = usePanelOverlayActions();
  const { isOverlayOpen, stackDepth } = usePanelOverlayState();

  /** Open a form side panel (with title, X, footer, keyboard shortcuts). */
  const openSidePanel = useCallback(
    (content: OverlayContent, options?: OverlayOptions) => {
      open(APP_PROVIDER_TYPE.SIDE_PANEL, content, {
        onSide: "right",
        ...options,
      });
    },
    [open],
  );

  /** Open a form modal (with title, X, footer, keyboard shortcuts). */
  const openModal = useCallback(
    (content: OverlayContent, options?: OverlayOptions) => {
      open(APP_PROVIDER_TYPE.MODAL, content, options);
    },
    [open],
  );

  /**
   * Open a raw side panel with no chrome (no title, X button, or footer).
   * Your content receives `{ close }` and is responsible for its own close trigger.
   */
  const openRawSidePanel = useCallback(
    (content: OverlayContent, options?: OverlayOptions) => {
      open(APP_PROVIDER_TYPE.SIDE_PANEL_RAW, content, {
        onSide: "right",
        ...options,
      });
    },
    [open],
  );

  /**
   * Open a raw modal with no chrome (no title, X button, or footer).
   * Your content receives `{ close }` and is responsible for its own close trigger.
   */
  const openRawModal = useCallback(
    (content: OverlayContent, options?: OverlayOptions) => {
      open(APP_PROVIDER_TYPE.MODAL_RAW, content, options);
    },
    [open],
  );

  return {
    openSidePanel,
    openModal,
    openRawSidePanel,
    openRawModal,
    isOverlayOpen,
    stackDepth,
  };
}
