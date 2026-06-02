import { API_CONFIG } from "./api-base";

//NOTE: apiRequest:  This is the core function that all other methods use.
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
) {
  // # NOTE: Retrieve your authentication token dynamically (e.g., from localStorage or cookies)
  // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const token = null;

  const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error(`Error Code ${response.status}`);
  return (await response.json()) as T;
}

function withJsonBody(method: string, body: any, options?: RequestInit) {
  return {
    ...options,
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    /* 
    # NOTE : fetch expects JSON bodies as strings
    line this 
    body: '{"name":"John"}'
    and not 
    body: data
    in case of undefined - does a Undefined Body Check
    body: "undefined"
     */
  } satisfies RequestInit;
}

/* 

Contains all api type calls
Usage: 
const data = await apiClient.get<User>("/users/1");
const data = await apiClient.post<User>("/users", { name: "John" });
const data = await apiClient.put<User>("/users/1", { name: "John" });
const data = await apiClient.patch<User>("/users/1", { name: "John" });
const data = await apiClient.delete<User>("/users/1");

 */
export const apiClient = {
  get: apiRequest,
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, withJsonBody("POST", body, options)),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, withJsonBody("PUT", body, options)),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, withJsonBody("PATCH", body, options)),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
} as const;
