import { Outlet, useRouteError } from "react-router-dom";

export function ErrorLayout() {
  const error = useRouteError();
  return (
    <div>
      <h1>Something went wrong!</h1>
      <p>
        {error instanceof Error
          ? error.message
          : "An unexpected error occurred"}
      </p>
    </div>
  );
}
