export function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export function isModKey(event: KeyboardEvent) {
  return isMacPlatform() ? event.metaKey : event.ctrlKey;
}

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;

  return Boolean(target.closest("[data-overlay-popover]"));
}

export function formatModKey() {
  return isMacPlatform() ? "⌘" : "Ctrl";
}
