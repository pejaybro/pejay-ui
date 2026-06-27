import type { Provider as Props } from "@/types";
import { useCallback, useMemo, useState } from "react";
import { Modal, SidePanel, SidePanelContent } from "../components/base/";
import { APP_PROVIDER_TYPE } from "@/utils";
import { AppContext } from "./app-context";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";

export { useAppProvider } from "./app-context";

export const AppProvider = ({ children }: Props.ProviderProps) => {
  const [stack, setStack] = useState<Props.OverlayStackItem[]>([]);

  const open = useCallback(
    (
      type: string,
      content?: Props.OverlayContent,
      options?: Props.OverlayOptions,
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

  const openModal = useCallback(
    (content: Props.OverlayContent, options?: Props.OverlayOptions) => {
      open(APP_PROVIDER_TYPE.MODAL, content, options);
    },
    [open],
  );

  useKeyboardShortcuts(isOverlayOpen, openModal);

  const contextValue = useMemo(
    () => ({
      open,
      close,
      stack,
      isOverlayOpen,
      stackDepth: stack.length,
    }),
    [open, close, stack, isOverlayOpen],
  );

  const topOverlayId = stack.at(-1)?.id;

  return (
    <AppContext.Provider value={contextValue}>
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
    </AppContext.Provider>
  );
};
