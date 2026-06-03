import { Outlet } from "react-router-dom";

export function PrivateRoute() {
  return <Outlet />;
}

/* 
# NOTE : use this when you want to redirect user to login page if he is already logged out.
#        Includes the premium "Redirect Back" pattern to preserve user navigation state.

import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute() {
  const token = getLocalAuthToken();
  const location = useLocation();

  if (!token) {
    // Passes the requested path inside search params so you can redirect back after successful login
    return (
      <Navigate 
        to={`/page_auth?redirectTo=${encodeURIComponent(location.pathname + location.search)}`} 
        replace 
      />
    );
  }
  return <Outlet />;
}

# NOTE: HOW THE LOGIN COMPONENT CONSUMES THE "redirectTo" PARAMETER

### The Bookmarking Lifecycle Flow:
1. **Bookmarked Access:** A logged-out user tries to access a bookmarked private route directly:
   `https://your-app.com/page_two`
2. **Redirect to Auth:** The `PrivateRoute` guard intercepts the request, captures the target pathname (`/page_two`), and redirects them to the login screen with the target appended:
   `https://your-app.com/page_auth?redirectTo=%2Fpage_two`
3. **Login:** The user submits their login credentials.
4. **Target Restoration:** Upon successful authentication, the Login page checks the URL for `redirectTo` and navigates the user straight to `/page_two` instead of the generic homepage `/`.

### Code Implementation Example:
```typescript
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLoginSuccess = () => {
    // 1. Read the redirectTo value (e.g., "/page_two") or default to "/"
    const destination = searchParams.get("redirectTo") || "/";

    // 2. Redirect the user back to their bookmarked page instead of the root page!
    navigate(destination, { replace: true });
  };
}
```
*/
