import { useEffect } from "react";
import { useHotkey } from "@/pejay-ui/hotkeys";
import {
  registerActiveFormOverlay,
  unregisterActiveFormOverlay,
} from "../core/form-overlay-registry";
import type { FormOverlayRegistration, FormTabsConfig } from "../core/types";

type UseFormOverlayRegistrationArgs = {
  enabled?: boolean;
  onSubmit?: () => void;
  isDirty?: boolean;
  closeDisabled?: boolean;
  formTabs?: FormTabsConfig;
};

export function useFormOverlayRegistration({
  enabled = true,
  onSubmit,
  isDirty = false,
  closeDisabled = false,
  formTabs,
}: UseFormOverlayRegistrationArgs) {
  useEffect(() => {
    if (!enabled) return;

    const registration: FormOverlayRegistration = {
      onSubmit,
      isDirty: () => isDirty,
      isCloseBlocked: () => closeDisabled,
      tabs: formTabs,
    };

    registerActiveFormOverlay(registration);
    return () => unregisterActiveFormOverlay(registration);
  }, [
    enabled,
    onSubmit,
    isDirty,
    closeDisabled,
    formTabs?.active,
    formTabs?.order.join(","),
    formTabs?.setActive,
  ]);

  // Dynamically register submitting key combo
  useHotkey(
    "ctrl+enter",
    () => {
      onSubmit?.();
    },
    {
      category: "Form Actions",
      description: "Submit and save current form",
      disabled: !enabled || !onSubmit || closeDisabled,
    },
  );

  const hasTabs = Boolean(formTabs && formTabs.order.length > 0);

  // Dynamically register tab switching combos
  useHotkey(
    "alt+arrowleft",
    () => {
      if (!formTabs) return;
      const currentIndex = formTabs.order.indexOf(formTabs.active);
      const prevIndex =
        (currentIndex - 1 + formTabs.order.length) % formTabs.order.length;
      formTabs.setActive(formTabs.order[prevIndex]!);
    },
    {
      category: "Form Navigation",
      description: "Switch to previous form tab",
      disabled: !enabled || !hasTabs || closeDisabled,
    },
  );

  useHotkey(
    "alt+arrowright",
    () => {
      if (!formTabs) return;
      const currentIndex = formTabs.order.indexOf(formTabs.active);
      const nextIndex = (currentIndex + 1) % formTabs.order.length;
      formTabs.setActive(formTabs.order[nextIndex]!);
    },
    {
      category: "Form Navigation",
      description: "Switch to next form tab",
      disabled: !enabled || !hasTabs || closeDisabled,
    },
  );
}
