import { useVendorModalForm } from "./useVendorModalForm";
import type { Vendor } from "./vendor-types";

export default function VendorModalPage() {
  const openVendorModal = useVendorModalForm();

  const handleCreate = () => {
    openVendorModal("create");
  };

  const handleEdit = (vendor: Vendor) => {
    openVendorModal("update", vendor);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Vendors (Modal Demo)</h1>
      <p className="text-sm text-slate-500">
        Same Vendor form, same domain hook pattern — but opens in a centered modal instead of a side panel.
      </p>

      <div className="flex gap-4">
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded text-sm transition-colors cursor-pointer"
        >
          Add Vendor (Modal)
        </button>

        <button
          onClick={() =>
            handleEdit({
              id: "V-001",
              name: "Acme Supplies",
              email: "acme@mail.com",
              phone: "555-0100",
              status: "active",
            })
          }
          className="px-4 py-2 border border-slate-200 rounded text-sm hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Edit Acme (Modal)
        </button>
      </div>
    </div>
  );
}
