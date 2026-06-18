import { AxiosRequestConfig, AxiosResponse } from "axios";

import { axiosInstance } from ".";

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipErrorToast?: boolean;
}

export const request = async ({
  url,
  method = "GET",
  data,
  params,
  headers,
  signal,
  skipErrorToast,
  ...config
}: CustomAxiosRequestConfig): Promise<AxiosResponse> => {
  const axiosConfig: CustomAxiosRequestConfig = {
    ...config,
    url,
    method,
    data,
    params,
    headers,
    signal,
    skipErrorToast,
  };

  const response = await axiosInstance(axiosConfig as AxiosRequestConfig);
  return response;
};
