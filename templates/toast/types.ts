export type ToastType = "info" | "error" | "warning" | "success" | "custom";

export type Listener = (toasts: ToastData[]) => void;
export interface ToastData {
  id?: string;
  title?: string;
  description?: string;
  message?: string;
  type?: ToastType;
  duration?: number;
  showClose?: boolean;
  dismiss?: string;
  icon?: React.ReactNode;
  content?: React.ReactNode | ((id: string) => React.ReactNode);
}
