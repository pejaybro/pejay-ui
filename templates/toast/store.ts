import type { Listener, ToastData } from "./types";

class ToastStore {
  private toasts: ToastData[] = [];
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  private publish() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }
  add(toast: ToastData) {
    const newToast: ToastData = {
      id: toast.id ?? crypto.randomUUID(),
      ...toast,
    };
    this.toasts = [newToast, ...this.toasts];
    this.publish();
    return newToast.id!;
  }
  remove(id: string | undefined) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);

    this.publish();
  }
  getToasts() {
    return this.toasts;
  }
}

export const toastStore = new ToastStore();