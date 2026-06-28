export type Vendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
};

export type VendorFormValues = {
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
};

export function getDefaultVendorFormValues(): VendorFormValues {
  return {
    vendorName: "",
    vendorEmail: "",
    vendorPhone: "",
  };
}

export function vendorToFormValues(vendor: Vendor): VendorFormValues {
  return {
    vendorName: vendor.name,
    vendorEmail: vendor.email,
    vendorPhone: vendor.phone,
  };
}
