export const electronQueryTags = ["Demo", "System"] as const;

export type ElectronTagType = (typeof electronQueryTags)[number];
