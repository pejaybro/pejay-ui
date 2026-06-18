import { createFileRoute } from "@tanstack/react-router";
import One from "../../page/one";

export const Route = createFileRoute("/_app/one")({
  component: One,
});
