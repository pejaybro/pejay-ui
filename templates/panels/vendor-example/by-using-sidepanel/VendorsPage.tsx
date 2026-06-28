import { useVendorFormPanel } from "./useVendorFormPanel";
import type { Vendor } from "./vendor-types";

export default function VendorsPage() {
  const openVendorForm = useVendorFormPanel();

  const handleCreate = () => {
    openVendorForm("create"); // no data — empty form
  };

  const handleEdit = (vendor: Vendor) => {
    openVendorForm("update", vendor); // passes row data into form
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Vendors Directory (Demo)</h1>
      <p className="text-sm text-slate-500">
        This is a demo page showing how to trigger the side panel form using the domain hook.
      </p>

      <div className="flex gap-4">
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          Add Vendor
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
          className="px-4 py-2 border border-slate-200 rounded text-sm hover:bg-slate-50 transition-colors"
        >
          Edit Acme Supplies
        </button>
      </div>
    </div>
  );
}
