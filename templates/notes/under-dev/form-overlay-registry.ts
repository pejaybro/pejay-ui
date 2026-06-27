export type FormTabsConfig = {
  active: string;
  setActive: (id: string) => void;
  order: string[];
};

export type FormOverlayRegistration = {
  onSubmit?: () => void;
  isDirty?: () => boolean;
  isCloseBlocked?: () => boolean;
  tabs?: FormTabsConfig;
};

let activeRequestClose: (() => void) | null = null;
let activeFormRegistration: FormOverlayRegistration | null = null;
let unsavedConfirmOpen = false;

export function setActiveOverlayClose(handler: (() => void) | null) {
  activeRequestClose = handler;
}

export function registerActiveFormOverlay(
  registration: FormOverlayRegistration | null,
) {
  activeFormRegistration = registration;
}

export function setUnsavedConfirmOpen(open: boolean) {
  unsavedConfirmOpen = open;
}

export function isUnsavedConfirmOpen() {
  return unsavedConfirmOpen;
}

export function getActiveOverlayClose() {
  return activeRequestClose;
}

export function getActiveFormOverlay() {
  return activeFormRegistration;
}
