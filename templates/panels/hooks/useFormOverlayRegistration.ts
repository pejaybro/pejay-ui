import { useEffect } from "react";
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
}
