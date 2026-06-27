import { useEffect } from "react";
import {
  registerActiveFormOverlay,
  type FormOverlayRegistration,
  type FormTabsConfig,
} from "./form-overlay-registry";

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
    if (!enabled) {
      registerActiveFormOverlay(null);
      return;
    }

    const registration: FormOverlayRegistration = {
      onSubmit,
      isDirty: () => isDirty,
      isCloseBlocked: () => closeDisabled,
      tabs: formTabs,
    };

    registerActiveFormOverlay(registration);
    return () => registerActiveFormOverlay(null);
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
