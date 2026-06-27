import { useCallback } from "react";
import { useAppProvider } from "@/provider/app-context";
import { APP_PROVIDER_TYPE } from "@/utils";
import type { Provider } from "@/types";

type OverlayContent = Provider.OverlayContent;
type OverlayOptions = Provider.OverlayOptions;

export function useOverlay() {
  const { open, isOverlayOpen, stackDepth } = useAppProvider();

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
