import { Route } from "../../routes/one/$id";

export default function OneId() {
  const { id } = Route.useParams();

  /* 
  when using query 
  const { data } = useSuspenseQuery(
  apiQueries.module.fetch_query_by_id_example(id)
);

if you are mot using loader 
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      apiQueries.module.fetch_query_by_id_example({id:params.id})
    );
  },

  like this then use 
  useQuery insted of useSuspenseQuery

  also for small crud you should use useQuery insted of loader and useSuspenseQuery

  For important pages where you want data loaded before render (details page, edit page, dashboard, etc.), add a loader with ensureQueryData.


  --------------------------------------------------------------------------------


  const searchParams = Route.useSearch();

const { data } = useSuspenseQuery(
  apiQueries.module.fetch_query_by_id_example({
    id,
    search: searchParams.search,
    type: searchParams.type,
  })
);



Input Change
     ↓
Local State
     ↓
Click Filter
     ↓
navigate({ search })
     ↓
URL Updates
     ↓
Route.useSearch() Updates
     ↓
Query Key Changes
     ↓
Backend Call


and on final filter tn we just 
navigate({
  search: {
    search: "john",
    type: "active",
  },
});

use navigate 
-----------------------------

and this wont
❌ Browser Refresh
❌ Full Page Reload
❌ Re-download JS Bundle

but insted 

---------------------
URL changes
    ↓
Router state changes
    ↓
Affected components re-render

---------------------
What Actually Re-renders?
Suppose:
AppLayout
│
├── Header
├── Sidebar
└── Outlet
     └── OnePage
          └── DataTable

When search params change:
AppLayout      ❌ stays mounted
Header         ❌ stays mounted
Sidebar        ❌ stays mounted

OnePage        🔄 re-render
DataTable      🔄 re-render


because:
const search = Route.useSearch();

-------------------------------
TanStack Router Flow

Input Change
     ↓
Local State
     ↓
Click Filter
     ↓
navigate({ search })
     ↓
URL Updates
     ↓
Route.useSearch() Updates
     ↓
Query Key Changes
     ↓
Backend Call

*/
  return <>This is One ID page {id}</>;
}
