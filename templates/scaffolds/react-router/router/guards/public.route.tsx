import { Outlet } from "react-router-dom";

export function PublicRoute() {
  return <Outlet />;
}

/* 

# NOTE : use this when you want to redirect user to main page if he is already logged in

import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
  const token = getLocalAuthToken();
  if (token) {
    return <Navigate to={PATH.desired_path_name} replace />;
  }
  return <Outlet />;
}

*/
