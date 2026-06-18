import { createFileRoute } from "@tanstack/react-router";
import OneId from "../../page/one/one-id";

export const Route = createFileRoute("/_app/one/$id")({
  loader: async ({ params }:{params:any}) => {
    console.log("Fetching id");
    return { id: params.id };
  },
  validateSearch: (search) => ({
    search: typeof search.search === "string" ? search.search : "",
    type: typeof search.type === "string" ? search.type : "",
  }),
  pendingComponent: () => <div>Loading...</div>,
  component: OneId,
});

/* 

pendingComponent: () => <div>Loading...</div>,
  component: OneId,
  show keleton here for useSuspense

when using with tanstack Q

  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      apiQueries.module.fetch_query_by_id_example({id:params.id})
    );
  },

  why ?

  Route Match
    ↓
params.id = "123"
    ↓
loader
    ↓
ensureQueryData(query)
    ↓
API Call
    ↓
Query Cache Filled
    ↓
Component Mounts
    ↓
useQuery(query)
    ↓
Gets data from cache




---------------------------------------------------------------------------

code splitting vs auto code splitting 


this code below is manual splitting 

import { lazy, Suspense } from "react";

const HistoryDrawer = lazy(
  () => import("./HistoryDrawer")
);

export default function OnePage() {
  return (
    <Suspense fallback={<DrawerSkeleton />}>
      <HistoryDrawer />
    </Suspense>
  );
}



in router file i can do same by using laxy in mu component key 
like i have done in react router 
thats called manual code splitting 
in react router we have to do it that way because no auto code splitting in react router (but comp level code splitting is same for both)

now in tanstack router we have auto code splitting so we can do like this 

 in file vite.config.ts
import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true, // Enable automatic code splitting
    }),
  ],
})

just do this and all the existing file route defined in routes folder will be auto code split 
and for component level we need manual 

iy works with any component

what the benifit of code splitting 
when i hits the end point it will not download all the code and comp 
it will download only the code and comp for that route 
so it will be fast 

in build process it create diff files for each route 

like chunk-0a1b2c.js
chunk-3d4e5f.js
chunk-6g7h8i.js
chunk-9j0k1l.js


Without code splitting, the bundler (Vite/Webpack/Rollup) might produce something like:

dist/
├── main.js (2 MB)
├── styles.css
└── index.html

Download main.js
      ↓
Contains:
- Dashboard
- Users
- Patients
- Reports
- Settings
- Modals
- Drawers
- Charts
- Editors

With code splitting:

dist/
├── main.js
├── dashboard.chunk.js
├── patients.chunk.js
├── reports.chunk.js
├── settings.chunk.js
├── history-drawer.chunk.js
└── editor.chunk.js

Open App
    ↓
Download main.js

Navigate to /users/123
      ↓
Download users.chunk.js
    ↓
Download dashboard.chunk.js


Navigate to /patients/456
      ↓
Download patients.chunk.js


Without Splitting

1 Big Truck
┌──────────────────┐
│ Everything       │
│ Dashboard        │
│ Patients         │
│ Reports          │
│ Modals           │
│ Drawers          │
│ Charts           │
└──────────────────┘

Truck 1 -> Core App
Truck 2 -> Patients
Truck 3 -> Reports
Truck 4 -> Drawer
Truck 5 -> Editor

what improves
Initial load speed
Time to interactive
Mobile performance
Bundle size

*/





