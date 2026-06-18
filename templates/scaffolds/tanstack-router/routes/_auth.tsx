import { createFileRoute, Outlet } from "@tanstack/react-router";
import AuthLayout from "../layout/auth.layout";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});
