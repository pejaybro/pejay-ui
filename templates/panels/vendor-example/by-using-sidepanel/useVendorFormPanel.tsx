import { useCallback } from "react";
import { useFormPanel } from "../../hooks/useFormPanel";
import { VendorForm, type VendorFormMode } from "./vendor-form";
import type { Vendor } from "./vendor-types";

export function useVendorFormPanel() {
  const openForm = useFormPanel();

  return useCallback(
    (mode: VendorFormMode = "create", vendor?: Vendor) => {
      openForm(VendorForm, { mode, vendor });
    },
    [openForm],
  );
}
