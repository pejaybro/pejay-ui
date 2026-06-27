import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AppOverlayStateContext, AppOverlayActionsContext } from "./app-context";
import { APP_PROVIDER_TYPE } from "./constants";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import type { OverlayStackItem, OverlayContent, OverlayOptions } from "./types";
import { Modal } from "../components/modal/modal";
import { SidePanel, SidePanelContent } from "../components/side-panel/side-panel";

export interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [stack, setStack] = useState<OverlayStackItem[]>([]);

  const open = useCallback(
    (
      type: string,
      content?: OverlayContent,
      options?: OverlayOptions,
    ) => {
      const id = crypto.randomUUID();
      setStack((prev) => [...prev, { id, type, content, options }]);
    },
    [],
  );

  const close = useCallback((id: string) => {
    setStack((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isOverlayOpen = stack.length > 0;
  const stackDepth = stack.length;

  const openModal = useCallback(
    (content: OverlayContent, options?: OverlayOptions) => {
      open(APP_PROVIDER_TYPE.MODAL, content, options);
    },
    [open],
  );

  useKeyboardShortcuts(isOverlayOpen, openModal);

  const stateValue = useMemo(
    () => ({
      stack,
      isOverlayOpen,
      stackDepth,
    }),
    [stack, isOverlayOpen, stackDepth],
  );

  const actionsValue = useMemo(
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const topOverlayId = stack.at(-1)?.id;

  return (
    <AppOverlayStateContext.Provider value={stateValue}>
      <AppOverlayActionsContext.Provider value={actionsValue}>
        {children}
        {stack.map((item, index) => {
          const isActive = item.id === topOverlayId;
          const layer = index + 1;

          if (item.type === APP_PROVIDER_TYPE.MODAL) {
            return (
              <Modal
                key={item.id}
                options={item.options || {}}
                isActive={isActive}
                layer={layer}
                onClose={() => close(item.id)}
              >
                {item.content?.({ close: () => close(item.id) })}
              </Modal>
            );
          }

          if (item.type === APP_PROVIDER_TYPE.SIDE_PANEL) {
            return (
              <SidePanel
                key={item.id}
                options={item.options || {}}
                isActive={isActive}
                layer={layer}
                onClose={() => close(item.id)}
              >
                <SidePanelContent content={item.content} />
              </SidePanel>
            );
          }

          return null;
        })}
      </AppOverlayActionsContext.Provider>
    </AppOverlayStateContext.Provider>
  );
};
