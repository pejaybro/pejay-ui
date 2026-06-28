export function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export function formatKeyCombo(keys: string): string {
  const parts = keys.toLowerCase().split("+");
  const isMac = isMacPlatform();

  return parts
    .map((part) => {
      switch (part) {
        case "ctrl":
          return isMac ? "⌘" : "Ctrl";
        case "alt":
          return isMac ? "⌥" : "Alt";
        case "shift":
          return isMac ? "⇧" : "Shift";
        case "meta":
          return isMac ? "⌘" : "Win";
        case "enter":
          return "Enter";
        case "escape":
          return "Esc";
        case "arrowleft":
          return "←";
        case "arrowright":
          return "→";
        case "arrowup":
          return "↑";
        case "arrowdown":
          return "↓";
        default:
          return part.charAt(0).toUpperCase() + part.slice(1);
      }
    })
    .join(" + ");
}

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;

  return Boolean(target.closest("[data-overlay-popover]"));
}

export function matchHotkey(event: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split("+");
  const isMac = isMacPlatform();

  let requiredCtrl = false;
  let requiredAlt = false;
  let requiredShift = false;
  let requiredMeta = false;
  let targetKey: string | null = null;

  for (const part of parts) {
    if (part === "ctrl") {
      if (isMac) {
        requiredMeta = true; // Use Meta (⌘) instead of Control on Mac by default
      } else {
        requiredCtrl = true;
      }
    } else if (part === "mod") {
      if (isMac) {
        requiredMeta = true;
      } else {
        requiredCtrl = true;
      }
    } else if (part === "alt") {
      requiredAlt = true;
    } else if (part === "shift") {
      requiredShift = true;
    } else if (part === "meta") {
      requiredMeta = true;
    } else {
      targetKey = part;
    }
  }

  // Check modifiers
  const ctrlMatch = event.ctrlKey === requiredCtrl;
  const altMatch = event.altKey === requiredAlt;
  const shiftMatch = event.shiftKey === requiredShift;
  const metaMatch = event.metaKey === requiredMeta;

  if (!ctrlMatch || !altMatch || !shiftMatch || !metaMatch) {
    return false;
  }

  if (!targetKey) return false;

  const eventKey = event.key.toLowerCase();

  // Normalize simple keys
  if (targetKey === "esc") targetKey = "escape";
  if (targetKey === "up") targetKey = "arrowup";
  if (targetKey === "down") targetKey = "arrowdown";
  if (targetKey === "left") targetKey = "arrowleft";
  if (targetKey === "right") targetKey = "arrowright";

  return eventKey === targetKey;
}
