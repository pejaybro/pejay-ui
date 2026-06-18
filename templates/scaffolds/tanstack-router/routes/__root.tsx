import { createFileRoute, Outlet } from "@tanstack/react-router";
import ErrorLayout from "../layout/error.layout";
import PageNotFound from "../layout/404.layout";

export const Route = createFileRoute("__root")({
  component: Outlet,
  errorComponent: ErrorLayout,
  notFoundComponent: PageNotFound,
});
