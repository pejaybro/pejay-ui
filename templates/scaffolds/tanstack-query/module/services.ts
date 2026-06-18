import { apiClient } from "../client";

export const ModuleService = {
  get_query_name_example: () => apiClient.get("/api_name/get"),
  get_infinite_query_example: (page: number) =>
    apiClient.get(`/api_name/list?page=${page}`),
  get_query_with_params_example: (params: Record<string, any>, signal?: AbortSignal) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      /*
      # NOTE: Arrays become repeated keys, e.g. brands=samsung&brands=apple.
      Empty values are skipped so default UI state does not create noisy URLs.
      */
      if (Array.isArray(value)) {
        value.forEach((val) => {
          if (val !== undefined && val !== null && val !== "") {
            queryParams.append(key, String(val));
          }
        });
      } else if (value !== undefined && value !== null && value !== "") {
        queryParams.set(key, String(value));
      }
    });
    return apiClient.get(`/api_name/get-with-params?${queryParams.toString()}`, { signal });
  },
  get_query_by_id_example: (id: string, signal?: AbortSignal) =>
    apiClient.get(`/api_name/get-by-id/${id}`, { signal }),
  get_query_combo_example: (id: string, params: Record<string, any>, signal?: AbortSignal) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      /*
      # NOTE: Reuse the same serialization rules for route-specific filtered requests.
      Keeping this logic centralized avoids components building query strings by hand.
      */
      if (Array.isArray(value)) {
        value.forEach((val) => {
          if (val !== undefined && val !== null && val !== "") {
            queryParams.append(key, String(val));
          }
        });
      } else if (value !== undefined && value !== null && value !== "") {
        queryParams.set(key, String(value));
      }
    });
    return apiClient.get(`/api_name/get-combo/${id}?${queryParams.toString()}`, { signal });
  },
  post_query_name_example: (input: any) =>
    apiClient.post("/api_name/post", input),
  patch_query_name_example: (input: any) =>
    apiClient.patch("/api_name/patch", input),
  delete_query_name_example: (id: string) =>
    apiClient.delete(`/api_name/${id}`),
};

/* 
# NOTE: you can change *_name_example to your own query name
# NOTE: you can change /api_name to your own api name
# NOTE: you can change input to your own data type
# NOTE: you can change id to your own data type

-------------------------------------------------------------------------

# NOTE: WHY WE USE URLSearchParams & THE ROLE OF THE SERVICE LAYER

1. **Why we use `URLSearchParams`:**
   - **Automatic URL-Encoding:** It automatically sanitizes special characters (like spaces, commas, or quotes) into browser-safe formats (e.g., space becomes `%20`), preventing broken URLs.
   - **Dynamic Query String Building:** It generates the final string from a raw object dynamically (calling `.toString()` results in `key1=val1&key2=val2`).

2. **Role of this Service Layer (`get_query_with_params_example`):**
   - **Decoupled Contracts:** It keeps components "dumb" about network specifics. The component only needs to pass a clean JavaScript object containing the filters.
   - **Centralization:** If endpoints change or parameter serialization logic needs to adjust in the future, it is managed in this single file rather than modifying multiple UI files.
*/


