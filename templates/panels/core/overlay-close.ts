import { getActiveFormOverlay, getActiveOverlayClose } from "./form-overlay-registry";

export function requestOverlayCloseWithConfirm() {
  const form = getActiveFormOverlay();
  if (form?.isCloseBlocked?.()) {
    return;
  }

  const requestClose = getActiveOverlayClose();
  requestClose?.();
}
