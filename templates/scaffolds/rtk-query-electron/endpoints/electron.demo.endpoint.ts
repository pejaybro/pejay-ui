import { electronBaseApi } from "../electronBaseApi";

export const electronDemoApi = (electronBaseApi as any).injectEndpoints({
  endpoints: (builder: any) => ({
    // IPC Ping query
    getPing: builder.query({
      query: () => "ping",
    }),

    // Get all demo records from SQLite via IPC
    getAllDemo: builder.query({
      query: () => "demo:get-all",
      providesTags: ["Demo"],
    }),

    // Get demo record by ID
    getDemoById: builder.query({
      query: (id: number) => ({
        channel: "demo:get-by-id",
        args: id,
      }),
      providesTags: (_result: any, _error: any, id: number) => [{ type: "Demo", id }],
    }),

    // Create new record via IPC
    createDemo: builder.mutation({
      query: (data: { demo: string }) => ({
        channel: "demo:create",
        args: data,
      }),
      invalidatesTags: ["Demo"],
    }),

    // Update existing record via IPC
    updateDemo: builder.mutation({
      query: (data: { id: number; demo: string }) => ({
        channel: "demo:update",
        args: data,
      }),
      invalidatesTags: ["Demo"],
    }),

    // Delete record via IPC
    deleteDemo: builder.mutation({
      query: (id: number) => ({
        channel: "demo:delete",
        args: id,
      }),
      invalidatesTags: ["Demo"],
    }),
  }),
});

export const {
  useGetPingQuery,
  useGetAllDemoQuery,
  useGetDemoByIdQuery,
  useCreateDemoMutation,
  useUpdateDemoMutation,
  useDeleteDemoMutation,
} = electronDemoApi as any;
