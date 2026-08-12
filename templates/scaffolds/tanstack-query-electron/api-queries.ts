import { ElectronSystemQueries, ElectronDbQueries } from "./module";

export const electronApiQueries = {
  system: ElectronSystemQueries,
  db: ElectronDbQueries,
};

export * from "./module";

/*
# NOTE: HOW TO USE IN REACT COMPONENTS

```tsx
import { useQuery } from "@tanstack/react-query";
import { electronApiQueries } from "./tanstack-query-electron/api-queries";

export const SystemStatus = () => {
  const { data, isLoading } = useQuery(electronApiQueries.system.getSystemInfo());

  if (isLoading) return <div>Loading Electron IPC status...</div>;
  return <div>Electron Ping: {data?.ping}</div>;
};

export const DemoRecordList = () => {
  const { data: records, isLoading } = useQuery(electronApiQueries.db.getAllDemo());

  if (isLoading) return <div>Querying SQLite DB...</div>;
  return (
    <ul>
      {records?.map(item => (
        <li key={item.id}>{item.demo}</li>
      ))}
    </ul>
  );
};
```
*/
