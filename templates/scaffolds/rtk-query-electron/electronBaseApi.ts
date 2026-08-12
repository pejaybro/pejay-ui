import { createApi } from "@reduxjs/toolkit/query/react";
import { electronBaseQuery } from "./electronBaseQuery";
import { electronQueryTags } from "./queryTags";

export const electronBaseApi = createApi({
  reducerPath: "electronBaseApi",
  baseQuery: electronBaseQuery(),
  tagTypes: electronQueryTags,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
