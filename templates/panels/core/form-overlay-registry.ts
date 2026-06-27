import type { FormOverlayRegistration } from "./types";

let closeStack: (() => void)[] = [];
let formStack: FormOverlayRegistration[] = [];

export function registerActiveOverlayClose(handler: () => void) {
  closeStack.push(handler);
}

export function unregisterActiveOverlayClose(handler: (() => void) | null) {
  if (!handler) return;
  closeStack = closeStack.filter((h) => h !== handler);
}

export function getActiveOverlayClose() {
  return closeStack[closeStack.length - 1] || null;
}

export function registerActiveFormOverlay(
  registration: FormOverlayRegistration | null,
) {
  if (!registration) return;
  formStack.push(registration);
}

export function unregisterActiveFormOverlay(
  registration: FormOverlayRegistration | null,
) {
  if (!registration) return;
  formStack = formStack.filter((item) => item !== registration);
}

export function getActiveFormOverlay() {
  return formStack[formStack.length - 1] || null;
}
