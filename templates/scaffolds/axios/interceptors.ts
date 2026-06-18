import { AxiosHeaders } from "axios";

import { axiosInstance } from ".";

let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

export const setupInterceptors = ({
  getAccessToken,
  onUnauthorized,
}: {
  getAccessToken: () => string;
  onUnauthorized: () => void;
}) => {
  if (requestInterceptorId !== null) {
    axiosInstance.interceptors.request.eject(requestInterceptorId);
  }

  if (responseInterceptorId !== null) {
    axiosInstance.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();

      if (token) {
        config.headers = AxiosHeaders.from(config.headers);
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  responseInterceptorId = axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        onUnauthorized?.();
      }

      /*
       const skipToast = error?.config?.skipErrorToast;
         if (!skipToast) {
                const message =
                      error?.response?.data?.message ||
                     error?.message || "Something went wrong";
                toast.error(message);
          }


          another method Handle only generic errors globally:
          (error) => {
  const status = error?.response?.status;

  if (status >= 500) {
    toast.error("Server error");
  }

  return Promise.reject(error);
}
  And let components handle:
  400 Validation Error
422 Form Error
409 Duplicate Record
because those errors are usually specific to the screen.

A practical setup is:
Interceptor:
  401 → logout / redirect
  500 → generic toast

Component:
  400 → form validation
  404 → custom UI
  409 → business logic errors

  This avoids flooding users with duplicate or overly generic error toasts while still preventing the UI from crashing.
      */

      return Promise.reject(error);
    },
  );
};

/*
Call `setupInterceptors(...)` once from your app entry file or root provider,
before any API request runs.

Call setupInterceptors(...) once in your app bootstrap, like App.tsx, main.tsx, or a root provider. That is the real integration step.

Example:
import { setupInterceptors } from "./templates/axios/interceptors";

setupInterceptors({
  getAccessToken: () => localStorage.getItem("token") ?? "",
  onUnauthorized: () => {
    // logout / redirect here
  },
});
*/
