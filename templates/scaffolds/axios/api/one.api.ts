import { ENDPOINTS } from "../endpoints";
import { CustomAxiosRequestConfig, request } from "../request";

type RequestOptions = Pick<
  CustomAxiosRequestConfig,
  "signal" | "skipErrorToast"
>;

export async function onePost(
  { payload }: { payload: any },
  options?: RequestOptions,
) {
  return await request({
    url: ENDPOINTS.USER.BASE,
    method: "POST",
    data: payload,
    ...options,
  });
}

export async function onePostFile(
  { payload }: { payload: any },
  options?: RequestOptions,
) {
  return await request({
    ...options,
    url: ENDPOINTS.USER.BASE,
    method: "POST",
    data: payload,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function oneGet(options?: RequestOptions) {
  return await request({
    url: ENDPOINTS.USER.BASE,
    method: "GET",
    ...options,
  });
}

export async function oneGetId(
  { id }: { id: string },
  options?: RequestOptions,
) {
  return await request({
    url: ENDPOINTS.USER.BY_ID(id),
    method: "GET",
    ...options,
  });
}

export async function oneGetIdParams(
  {
    id,
    params,
  }: {
    id: string;
    params: any;
  },
  options?: RequestOptions,
) {
  return await request({
    url: ENDPOINTS.USER.BY_ID(id),
    method: "GET",
    params,
    ...options,
  });
}

export async function onePut(
  { id, payload }: { id: string; payload: any },
  options?: RequestOptions,
) {
  return await request({
    url: ENDPOINTS.USER.BY_ID(id),
    method: "PUT",
    data: payload,
    ...options,
  });
}

export async function oneDelete(
  { id }: { id: string },
  options?: RequestOptions,
) {
  return await request({
    url: ENDPOINTS.USER.BY_ID(id),
    method: "DELETE",
    ...options,
  });
}
