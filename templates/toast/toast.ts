import { toastStore } from "./store";
import type { ToastData } from "./types";

type ToastOptions = ToastData;
type ShortcutOptions = Omit<ToastData, "type">;

function createToast(options: ToastOptions) {
  if (options.dismiss) {
    toastStore.remove(options.dismiss);
  }
  return toastStore.add(options);
}

const handleShortcut = (
  type: ToastData["type"],
  messageOrOptions: string | ShortcutOptions,
  options?: ShortcutOptions
) => {
  if (typeof messageOrOptions === "string") {
    return createToast({ message: messageOrOptions, ...options, type });
  }
  return createToast({ ...messageOrOptions, type });
};

export const toast = Object.assign(
  (options: ToastOptions) => {
    return createToast(options);
  },
  {
    success: (messageOrOptions: string | ShortcutOptions, options?: ShortcutOptions) => {
      return handleShortcut("success", messageOrOptions, options);
    },

    error: (messageOrOptions: string | ShortcutOptions, options?: ShortcutOptions) => {
      return handleShortcut("error", messageOrOptions, options);
    },

    info: (messageOrOptions: string | ShortcutOptions, options?: ShortcutOptions) => {
      return handleShortcut("info", messageOrOptions, options);
    },

    warning: (messageOrOptions: string | ShortcutOptions, options?: ShortcutOptions) => {
      return handleShortcut("warning", messageOrOptions, options);
    },

    custom: (options: { content: React.ReactNode | ((id: string) => React.ReactNode); id?: string; duration?: number; dismiss?: string }) => {
      return createToast({ ...options, type: "custom" });
    },

    dismiss: (id: string) => {
      toastStore.remove(id);
    },
  },
);