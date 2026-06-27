# AppProvider Overlay & Form Panel Guidelines

This document details how the global modal and side-panel overlay systems operate and provides rules for creating new panels.

## 1. High-Level Overlay Flow
Instead of declaring `<Modal>` or `<SidePanel>` in layout components:
1. Components are programmatically opened using hooks: `openSidePanel()` or `openModal()`.
2. `AppProvider` stores them in a dynamic overlay stack.
3. The stack is rendered inside a root portal, guaranteeing escaping local Z-index issues.

```
Page (index.tsx)
  └── useMyEntityFormPanel()      ← domain hook
        └── useFormPanel()        ← generic form opener
              └── useOverlay()    ← openSidePanel / openModal
                    └── useAppProvider() → open()
```

## 2. Coding Rules for Forms & Overlays
When implementing new overlays or forms, follow these rules:

1. **Prop Requirements**: Every form component designed to run in a side panel or modal must accept a `close: () => void` callback prop.
2. **Layout Wrappers**:
   - **Forms (Create/Edit)**: Wrap in `<SidePanelCard>` (supports `isDirty` checks, tabs, and layout sizes).
   - **Dialogs (Read-only/Quick confirms)**: Wrap in `<ModalCard>` (centered dialog window).
3. **Closing Safely**:
   - **Save Success**: Call `close()` directly to start close animations.
   - **Cancel/X/Backdrop/Escape**: Invoke `requestOverlayCloseWithConfirm()` to trigger unsaved changes prompts if the form is dirty (`isDirty={true}`).
4. **Async Protection**: For long-running API operations, set `closeDisabled={true}` on `<SidePanelCard>` to temporarily disable backdrop clicks, Escape keys, and close buttons.
5. **Keyboard Shortcuts**: Pass `onSubmit` to `<SidePanelCard>` to automatically wire `Ctrl+Enter` or `Cmd+Enter` form submissions.
