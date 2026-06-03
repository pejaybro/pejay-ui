import {
  queryOptions,
  infiniteQueryOptions,
  keepPreviousData,
} from "@tanstack/react-query";

import { ModuleKeys } from "./keys";
import { ModuleMappers } from "./mappers";
import { ModuleService } from "./services";

export const ModuleQueries = {
  fetch_query_name_example: () =>
    queryOptions({
      queryKey: ModuleKeys.fetch_query_name_example(),
      queryFn: () => {
        /* 
        # NOTE:  ModuleService.get_query_name_example() -> hits the api of query fetch or GET
        Return the Promise directly to TanStack Query so it can natively handle retries and error states.
        */
        return ModuleService.get_query_name_example();
      },
      select: raw => {
        /* 
        # NOTE: ModuleMappers.fetch_query_name_example() -> manipulates the data from api into desird format before returning to ui or page
        Using the 'select' property memoizes this transformation (only runs when cached data changes).
        */
        return ModuleMappers.fetch_query_name_example(raw as any);
      },
      /* 
      # NOTE: keeps the last successfully fetched data visible on screen 
      while fetching new data or if a subsequent fetch fails (preventing layout flickers/empty states).
      */
      placeholderData: keepPreviousData,
    }),

  fetch_infinite_query_example: () =>
    infiniteQueryOptions({
      queryKey: ModuleKeys.fetch_infinite_query_name_example(),
      queryFn: ({ pageParam = 1 }) => {
        /* 
        # NOTE:  ModuleService.get_infinite_query_example(pageParam) -> hits the api of query fetch or GET
        Return the Promise directly to TanStack Query so it can natively handle retries and error states.
        */
        return ModuleService.get_infinite_query_example(pageParam as number);
      },
      getNextPageParam: (raw: any) => {
        // --- Option A: Cursor-based Pagination ---
        // return raw.nextCursor ?? undefined;

        // --- Option B: Page-number Metadata Pagination (last_page, current_page) ---
        // Access metadata from the 'meta' object returned in your API response
        const { current_page, last_page } = raw?.meta || {};
        const hasMore = current_page < last_page;
        return hasMore ? current_page + 1 : undefined;
      },
      initialPageParam: 1,
      select: raw => {
        /* 
        # NOTE: ModuleMappers.fetch_infinite_query_example() -> manipulates the data from api into desird format before returning to ui or page
        Using the 'select' property memoizes this transformation (only runs when cached data changes).
        */
        return {
          pages: raw.pages.map((pageData: any) => ({
            ...pageData,
            data: ModuleMappers.fetch_infinite_query_example(pageData.data),
          })),
          pageParams: raw.pageParams,
        };
      },
      placeholderData: keepPreviousData,
    }),

  fetch_query_with_params_example: (params: Record<string, any>) =>
    queryOptions({
      queryKey: ModuleKeys.fetch_query_with_params_example(params),
      queryFn: ({ signal }) => {
        /* 
        # NOTE: Pass the native 'signal' from the TanStack queryFn context down to the service call.
        This enables automatic cancellation if query parameters change or the component unmounts.
        */
        return ModuleService.get_query_with_params_example(params, signal);
      },
      select: raw => {
        // Reusing the same mapper example for consistency
        return ModuleMappers.fetch_query_name_example(raw as any);
      },
      placeholderData: keepPreviousData,
    }),

  fetch_query_by_id_example: (id?: string | null) =>
    queryOptions({
      queryKey: ModuleKeys.fetch_query_by_id_example(id || ""),
      queryFn: ({ signal }) => {
        return ModuleService.get_query_by_id_example(id!, signal);
      },
      select: raw => {
        return ModuleMappers.fetch_query_name_example(raw as any);
      },
      placeholderData: keepPreviousData,
      /* 
      # NOTE: Conditional/Dependent Queries
      Setting 'enabled: !!id' stops the query from executing automatically if the ID is missing (undefined, null, or empty).
      */
      enabled: !!id,
    }),

  fetch_query_combo_example: (
    id: string | null | undefined,
    params: Record<string, any>,
  ) =>
    queryOptions({
      queryKey: ModuleKeys.fetch_query_combo_example(id || "", params),
      queryFn: ({ signal }) => {
        return ModuleService.get_query_combo_example(id!, params, signal);
      },
      select: raw => {
        return ModuleMappers.fetch_query_name_example(raw as any);
      },
      placeholderData: keepPreviousData,
      enabled: !!id, // Automatically stops API call if ID is null/undefined
    }),
};

/*
# NOTE: RAW DATA VS. MAPPED DATA & MEMOIZATION

1. **Where Raw Data Lives:**
   - The raw response returned by the API (`queryFn`) is stored unmodified inside the **TanStack Query Cache**. 
   - This represents the exact payload from your backend database/server.

2. **Where Mapped Data Lives:**
   - The mapped data is delivered directly to the **UI / React Component** consuming the hook.
   - It is calculated on-the-fly by executing the `select` function on the cached raw data.

3. **How Memoization Works (Performance Optimization):**
   - The `select` function is **automatically memoized** by TanStack Query.
   - It will ONLY re-run when the cached raw data changes. 
   - If the component re-renders for other reasons (e.g., local UI states, parent re-renders, or window focus checks), TanStack Query skips the mapper execution completely and returns the already memoized mapped data instantly.











use this inside queries if you want to show error boundary at component level for perticular query when not using useSuspenseQuery or hook which provides suspense by default. by default it just catches the errror and shows the error in useMutation or useQuery hooks but in case of useSuspenseQuery it throws the error and bubbels up to the nearest error boundary.

    throwOnError: (error) => {
      // Throw to boundary for severe errors (like 404 Not Found or 500 Server Crashes)
      return error.status === 404 || error.status >= 500;
    }
*/
