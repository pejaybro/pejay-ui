import { useCallback, useState } from "react";
import { ModalCard } from "../../components/modal/modal-card";
import { useFormDirty } from "../../hooks/useFormDirty";
import { requestOverlayCloseWithConfirm } from "../../core/overlay-close";
import type { Vendor } from "./vendor-types";
import {
  getDefaultVendorFormValues,
  vendorToFormValues,
  type VendorFormValues,
} from "./vendor-types";

export type VendorFormMode = "create" | "update";

export type VendorModalFormProps = {
  close: () => void;
  mode?: VendorFormMode;
  vendor?: Vendor;
};

export function VendorModalForm({
  close,
  mode = "create",
  vendor,
}: VendorModalFormProps) {
  const isUpdate = mode === "update";

  const [values, setValues] = useState<VendorFormValues>(() => ({
    ...getDefaultVendorFormValues(),
    ...(vendor ? vendorToFormValues(vendor) : {}),
  }));

  const setField = useCallback(
    <K extends keyof VendorFormValues>(key: K, value: VendorFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const isDirty = useFormDirty(values);

  const handleSave = () => {
    if (!values.vendorName.trim()) {
      alert("Vendor name is required");
      return;
    }
    console.log("Saving vendor:", values);
    close();
  };

  return (
    <ModalCard
      title={isUpdate ? "Edit Vendor" : "Add Vendor"}
      description={isUpdate ? "Update the vendor's details below." : "Fill in the new vendor's details."}
      close={close}
      onSubmit={handleSave}
      isDirty={isDirty}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={requestOverlayCloseWithConfirm}
            className="px-4 py-2 border border-slate-200 rounded text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">
            Vendor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.vendorName}
            onChange={(e) => setField("vendorName", e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Email</label>
          <input
            type="email"
            value={values.vendorEmail}
            onChange={(e) => setField("vendorEmail", e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Phone</label>
          <input
            type="tel"
            value={values.vendorPhone}
            onChange={(e) => setField("vendorPhone", e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </ModalCard>
  );
}
