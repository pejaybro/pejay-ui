export interface HotkeyConfig {
  /**
   * The key combination string, e.g., 'ctrl+enter', 'escape', 'alt+arrowleft', 'shift+?'.
   * Separate keys with '+'. Case-insensitive.
   */
  keys: string;
  /** Description of what this shortcut does. */
  description: string;
  /** Section/Category group to display this hotkey under in the help dialog. */
  category?: string;
  /** The action to execute when key combination matches. */
  callback: (event: KeyboardEvent) => void;
  /** If true, the hotkey will still trigger even if focusing an input, textarea, or contentEditable element. Default: false. */
  enabledInInputs?: boolean;
}
