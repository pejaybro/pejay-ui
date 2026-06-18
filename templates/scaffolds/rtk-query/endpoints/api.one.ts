import { baseApi } from "../baseApi";
import { invalidateTagIdOnSuccess } from "../queryTags";

export const apiOne = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // very basic fetch function
    fetchData: builder.query({
      query: () => "/data",
      providesTags: [],
    }),
    // with params method 1
    fetchData2: builder.query({
      query: ({ id }) => `/data/${id}`,
      providesTags: (_result, error, { id }) =>
        error ? [] : [{ type: "Data", id }],
    }),
    // with params method 2
    fetchData3: builder.query({
      query: ({ id, name }) => ({
        url: `/data`,
        method: "GET",
        params: { id, name },
      }),
      // manipulate response before it is sent to the component
      transformResponse: (response) => {
        /*  manipulate here */
        return response.data;
      },
      providesTags: [],
    }),

    /* =================================== */

    postData: builder.mutation({
      query: (body) => ({
        url: "/data",
        method: "POST",
        body,
      }),
      invalidatesTags: invalidateTagIdOnSuccess("Data"),
    }),
  }),
});

export const {
  useFetchDataQuery,
  useFetchData2Query,
  useFetchData3Query,
  usePostDataMutation,
} = apiOne;

/*

    ? Query Calls
    
    *call in components
    const { data, isLoading, isFetching, isError, error } = useFetchDataQuery();

    *refetch every 5 seconds
    const { data } = useFetchDataQuery({},{
    pollingInterval: 5000, 
    });

    *get specific data from array of objects
    const { user } = useFetchDataQuery({},{  
    selectFromResult: ({ data }) => ({
        user: data?.find((u) => u.id === 2),
    }),
    });


    // ==================================== //

    ? MUTATIONS

    * call in components
    const [postData] = usePostDataMutation();
    await postData({ name: "John",});



  */
