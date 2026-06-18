import { Outlet } from "@tanstack/react-router";

export default function AuthLayout() {
  return (
    <>
      <div>Auth Section Static</div>
      <Outlet />
    </>
  );
}
