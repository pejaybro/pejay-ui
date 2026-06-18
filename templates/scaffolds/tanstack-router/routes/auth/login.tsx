import { createFileRoute } from "@tanstack/react-router";
import Login from "../../page/auth/login";

export const Route = createFileRoute("/_auth/login")({
  component: Login,
});
