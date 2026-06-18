import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { queryTags } from "./queryTags";
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQuery,
  tagTypes: queryTags,
  /* 
  keepUnusedDataFor: Infinity   //data will never be garbage collected
  refetchOnReconnect: true,   //refetch on network reconnect
  refetchOnMountOrArgChange: false,  //refetch on mount or when args change
  refetchOnFocus: false,      //refetch on focus to tab
   */
  endpoints: () => ({}),
});

/* 

* in reducers.ts of redux store
const apiReducers = {
  [baseApi.reducerPath]: baseApi.reducer,
};

*/