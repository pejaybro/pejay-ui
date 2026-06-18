import { Outlet } from "@tanstack/react-router";

export default function AppLayout() {
  return (
    <>
      <div>App Section Static</div>
      <Outlet />
    </>
  );
}
