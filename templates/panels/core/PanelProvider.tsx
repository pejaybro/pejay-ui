import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  PanelOverlayStateContext,
  PanelOverlayActionsContext,
} from "./panel-context";
import { APP_PROVIDER_TYPE } from "./constants";
import { useHotkey } from "@/pejay-ui/hotkeys";
import { requestOverlayCloseWithConfirm } from "./overlay-close";
import type { OverlayStackItem, OverlayContent, OverlayOptions } from "./types";
import { Modal } from "../components/modal/modal";
import {
  SidePanel,
  SidePanelContent,
} from "../components/side-panel/side-panel";
import { ModalRaw } from "../components/modal/modal-raw";
import { SidePanelRaw } from "../components/side-panel/side-panel-raw";

export interface PanelProviderProps {
  children: ReactNode;
}

export const PanelProvider = ({ children }: PanelProviderProps) => {
  const [stack, setStack] = useState<OverlayStackItem[]>([]);

  const open = useCallback(
    (type: string, content?: OverlayContent, options?: OverlayOptions) => {
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

  useHotkey(
    "escape",
    () => {
      requestOverlayCloseWithConfirm();
    },
    {
      category: "Overlays",
      description: "Close topmost active modal or side panel",
      disabled: !isOverlayOpen,
      enabledInInputs: true,
    },
  );

  const stateValue = useMemo(
    () => ({ stack, isOverlayOpen, stackDepth }),
    [stack, isOverlayOpen, stackDepth],
  );

  const actionsValue = useMemo(
    () => ({ open, close }),
    [open, close],
  );

  const topOverlayId = stack.at(-1)?.id;

  return (
    <PanelOverlayStateContext.Provider value={stateValue}>
      <PanelOverlayActionsContext.Provider value={actionsValue}>
        {children}

        {stack.map((item, index) => {
          const isActive = item.id === topOverlayId;
          const layer = index + 1;
          const onClose = () => close(item.id);
          const closeId = () => close(item.id);

          /* ── Form Side Panel ── */
          if (item.type === APP_PROVIDER_TYPE.SIDE_PANEL) {
            return (
              <SidePanel
                key={item.id}
                options={item.options || {}}
                isActive={isActive}
                layer={layer}
                onClose={onClose}
              >
                <SidePanelContent content={item.content} />
              </SidePanel>
            );
          }

          /* ── Form Modal ── */
          if (item.type === APP_PROVIDER_TYPE.MODAL) {
            return (
              <Modal
                key={item.id}
                options={item.options || {}}
                isActive={isActive}
                layer={layer}
                onClose={onClose}
              >
                {item.content?.({ close: closeId })}
              </Modal>
            );
          }

          /* ── Raw Side Panel (no chrome) ── */
          if (item.type === APP_PROVIDER_TYPE.SIDE_PANEL_RAW) {
            return (
              <SidePanel
                key={item.id}
                options={item.options || {}}
                isActive={isActive}
                layer={layer}
                onClose={onClose}
              >
                <SidePanelRaw>
                  {item.content?.({ close: closeId })}
                </SidePanelRaw>
              </SidePanel>
            );
          }

          /* ── Raw Modal (no chrome) ── */
          if (item.type === APP_PROVIDER_TYPE.MODAL_RAW) {
            return (
              <Modal
                key={item.id}
                options={item.options || {}}
                isActive={isActive}
                layer={layer}
                onClose={onClose}
              >
                <ModalRaw>
                  {item.content?.({ close: closeId })}
                </ModalRaw>
              </Modal>
            );
          }

          return null;
        })}
      </PanelOverlayActionsContext.Provider>
    </PanelOverlayStateContext.Provider>
  );
};
