import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "../store/hooks";

export default function ProtectedRoute() {
  const { accessToken, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  // Wait until authentication restoration finishes.
  if (!isInitialized) {
    return <div>Checking authentication...</div>;
  }

  // Redirect unauthenticated users to login.
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Allow authenticated users to access the requested page.
  return <Outlet />;
}