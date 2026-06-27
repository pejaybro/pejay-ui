import { useCallback } from "react";
import { useAppOverlayActions, useAppOverlayState } from "../core/app-context";
import { APP_PROVIDER_TYPE } from "../core/constants";
import type { OverlayContent, OverlayOptions } from "../core/types";

export function useOverlay() {
  const { open } = useAppOverlayActions();
  const { isOverlayOpen, stackDepth } = useAppOverlayState();

  const openSidePanel = useCallback(
    (content: OverlayContent, options?: OverlayOptions) => {
      open(APP_PROVIDER_TYPE.SIDE_PANEL, content, {
        onSide: "right",
        ...options,
      });
    },
    [open],
  );

  const openModal = useCallback(
    (content: OverlayContent, options?: OverlayOptions) => {
      open(APP_PROVIDER_TYPE.MODAL, content, options);
    },
    [open],
  );

  return { openSidePanel, openModal, isOverlayOpen, stackDepth };
}

/** @deprecated Prefer `useOverlay` */
export function useSidePanel() {
  return useOverlay();
}

/** @deprecated Prefer `useOverlay` */
export function useModal() {
  const { openModal, isOverlayOpen, stackDepth } = useOverlay();
  return { openModal, isOverlayOpen, stackDepth };
}
