import { ModuleQueries } from "./module";

export const apiQueries = {
  module: ModuleQueries,
};

export * from "./module";

/* 
# NOTE : here you export all the queries from the module folder so it will be easy to import in components

  const { data: name } = useQuery(ModuleQueries.fetch_query_name_example());
  const { data: name } = useSuspenseQuery(ModuleQueries.fetch_query_name_example());

  // Example with parameters & request cancellation:
  // const { data } = useQuery(ModuleQueries.fetch_query_with_params_example({ search: 'query', filter: 'active' }));

  ---------------------------------------------------------------------------------------------------

  | Feature             | `useQuery`                                     | `useSuspenseQuery`                                  |
| ------------------- | ---------------------------------------------- | --------------------------------------------------- |
| Loading state       | Returns `isLoading`, `isPending`, `isFetching` | Does **not** return loading state                   |
| Data type           | `data` can be `undefined`                      | `data` is guaranteed to exist when rendered         |
| Error handling      | Use `error` from hook                          | Error is caught by React Error Boundary             |
| Loading UI          | Handle manually (`if (isLoading)`)             | Handled by React `<Suspense>` fallback              |
| Component rendering | Renders immediately, then fetches              | Suspends rendering until data is ready              |
| Setup complexity    | Simpler                                        | Requires `<Suspense>` and usually an Error Boundary |
| Best for            | Most applications                              | Apps fully using React Suspense                     |

----------------------------------------------------------------------------------------------------

# NOTE : Example for useQuery
const ModuleComponent = () => {

const { data, isLoading, error } = useQuery(
  ModuleQueries.fetch_query_name_example()
);

if (isLoading) return <FallBackComponent />;
if (error) return <ErrorComponent />;

return <ModuleComponent data={data} />;

}

-----------------------------------------------------------------------------------------------------

# NOTE : Example for useSuspenseQuery

const ModuleComponent = () => {

const { data } = useSuspenseQuery(
  ModuleQueries.fetch_query_name_example()
);

return <ModuleComponent data={data} />;

}

# NOTE : Wrapping
<Suspense fallback={<FallBackComponent />}>
  <ModuleComponent />
</Suspense>

---------------------------------------------------------------------------------------------------

Use useQuery when you want to manage loading and errors inside the component.
Use useSuspenseQuery when your app already uses React Suspense and you want cleaner components with guaranteed data.

---------------------------------------------------------------------------------------------------

# NOTE : Example for useInfiniteQuery (Infinite Scrolling)

1. In queries.ts, define the option:
   export const ModuleQueries = {
     fetch_infinite_query_example: () =>
       infiniteQueryOptions({
         queryKey: [...ModuleKeys.module(), "infinite"] as const,
         queryFn: async ({ pageParam = 1 }) => {
           const raw = await ModuleService.get_infinite_query_example(pageParam as number);
           return raw as { data: any[]; meta: { current_page: number; last_page: number } };
         },
          getNextPageParam: (raw) => {
            // E.g., if page-based (extracting from 'meta' object):
            const { current_page, last_page } = raw?.meta || {};
            return current_page < last_page ? current_page + 1 : undefined;
          },
          initialPageParam: 1,
          select: (raw) => ({
            pages: raw.pages.map((pageData: any) => ({
              ...pageData,
              data: ModuleMappers.fetch_infinite_query_example(pageData.data),
            })),
            pageParams: raw.pageParams,
          }),
        })
    }

2. In your Component:
   import { useInfiniteQuery } from "@tanstack/react-query";
   import { useEffect } from "react";
   import { useInView } from "react-intersection-observer"; // optional, or use standard scroll listener
   import { ModuleQueries } from "./queries";

   const InfiniteListComponent = () => {
     const {
       data,
       fetchNextPage,
       hasNextPage,
       isFetchingNextPage,
       isLoading,
       error
     } = useInfiniteQuery(ModuleQueries.fetch_infinite_query_example());

     // Optional hook to detect if target element is visible in the viewport
     const { ref, inView } = useInView();

     useEffect(() => {
       if (inView && hasNextPage && !isFetchingNextPage) {
         fetchNextPage();
       }
     }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

     if (isLoading) return <Loading />;
     if (error) return <Error />;

     // Flatten the paginated data pages into a single flat array
     const items = data ? data.pages.flatMap((page) => page.data) : [];

     return (
       <div>
         <ul>
           {items.map((item) => (
             <li key={item.id}>{item.name}</li>
           ))}
         </ul>

         // This invisible boundary element triggers loading the next page when scrolled into view 
         <div ref={ref} style={{ height: "10px" }}>
           {isFetchingNextPage ? "Loading more..." : ""}
         </div>
       </div>
     );
   };

 ---------------------------------------------------------------------------------------------------

# HOW INFINITE SCROLLING WORKS:
1. **Initial Load:** `useInfiniteQuery` calls `queryFn` using `initialPageParam` (usually page `1`). The response is saved in `data.pages[0]`.
2. **Next Page Calculation:** `getNextPageParam` is called with the last fetched page data. It checks if there is more data (e.g., if `current_page < last_page`). If returned, `hasNextPage` becomes `true`.
3. **Scroll Trigger:** When the user scrolls down, an observer (like `react-intersection-observer` on the bottom `div` element) fires an `inView` event.
4. **Fetch Call:** If `inView`, `hasNextPage`, and not currently loading, we call `fetchNextPage()`.
5. **Caching & Appending:** TanStack Query triggers `queryFn` passing the next page number (e.g., `2`) as the new `pageParam`. The new data is fetched and appended as a new array element inside `data.pages` (e.g., `data.pages[1]`). The UI re-renders with the flattened items list.

---------------------------------------------------------------------------------------------------

# NOTE : Example for Query Parameters (Filters & Cancellation)

This example shows a component using query parameters (including an array of brands) with automatic request cancellation:

```typescript
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ModuleQueries } from "./queries";
import { useDebounce } from "@/hooks/use-debounce"; // custom debounce hook

const FilteredProductList = () => {
  const [search, setSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]); // e.g., ["samsung", "apple"]
  const [sortBy, setSortBy] = useState("price_asc"); // Single key-value parameter example

  // 1. Debounce fast inputs (like keystrokes) to prevent hammering the server
  const debouncedSearch = useDebounce(search, 300);

  // 2. Combine your states. Any change to these properties will update the queryKey
  const filters = {
    search: debouncedSearch,
    brands: selectedBrands, // Array will be serialized as "brands=samsung&brands=apple" by the service
    sort: sortBy,           // Single key-value parameter (e.g., "price_asc")
  };

  // 3. Pass the filter object directly to the query option builder
  const { data, isLoading, isFetching, error } = useQuery(
    ModuleQueries.fetch_query_with_params_example(filters)
  );

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div>
      <input 
        type="text" 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="Search mobiles..." 
      />

      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>

      <div>
        <label>
          <input 
            type="checkbox" 
            checked={selectedBrands.includes("samsung")} 
            onChange={() => toggleBrand("samsung")} 
          /> Samsung
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={selectedBrands.includes("apple")} 
            onChange={() => toggleBrand("apple")} 
          /> Apple
        </label>
      </div>

      {isFetching && <span>Updating results (Old requests cancelled automatically)...</span>}

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error loading items</p>
      ) : (
        <ul>
          {data?.map((item: any) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---------------------------------------------------------------------------------------------------

# NOTE: WHY WE DO NOT GET DUPLICATE KEY ERRORS IN FRONTEND STATE
Even though the final URL repeats the same key (e.g., `?brands=samsung&brands=apple`), 
your frontend React state or router object only has one clean unique key mapping to an array:
`const filters = { brands: ["samsung", "apple"] };`

The service layer safely iterates over the array and appends the items individually to the query parameters (`queryParams.append`). 
This keeps your frontend state easy to manage without causing duplicate key errors.






useEffect(() => {
  // 1. Get query string from URL (or SessionStorage if URL is empty)
  const searchParams = new URLSearchParams(window.location.search);
  // 2. Parse the single values
  const searchVal = searchParams.get("search") || "";
  const sortVal = searchParams.get("sort") || "price_asc";
  // 3. Parse the repeated values as an array
  const brandsVal = searchParams.getAll("brands"); // returns ["samsung", "apple"]
  // 4. Populate your component state
  setSearch(searchVal);
  setSortBy(sortVal);
  setSelectedBrands(brandsVal);
}, []);

*/



