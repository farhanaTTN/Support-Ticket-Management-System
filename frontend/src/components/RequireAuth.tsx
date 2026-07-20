import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../authContext";

// Guards routes: redirects to /login when there is no signed-in user.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { currentUser, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="container">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
