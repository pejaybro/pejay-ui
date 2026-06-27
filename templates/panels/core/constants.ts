export const APP_PROVIDER_TYPE = {
  MODAL: "modal",
  SIDE_PANEL: "side-panel",
} as const;

export const getOverlayBackdropZ = (layer: number) => 1000 + layer * 10;
export const getOverlayContentZ = (layer: number) => 1000 + layer * 10 + 1;
