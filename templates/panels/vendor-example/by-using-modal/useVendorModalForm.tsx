import { useCallback } from "react";
import { useModalForm } from "../../hooks/useModalForm";
import { VendorModalForm, type VendorFormMode } from "./vendor-modal-form";
import type { Vendor } from "./vendor-types";

/**
 * Domain hook for opening the Vendor form inside a centered MODAL.
 * Uses useModalForm which automatically injects the `close` callback.
 */
export function useVendorModalForm() {
  const openForm = useModalForm();

  return useCallback(
    (mode: VendorFormMode = "create", vendor?: Vendor) => {
      openForm(VendorModalForm, { mode, vendor });
    },
    [openForm],
  );
}
