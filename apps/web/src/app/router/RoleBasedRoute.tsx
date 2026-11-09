import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface RoleBasedRouteProps {
  allowedRoles: string[];
}

export default function RoleBasedRoute({
  allowedRoles,
}: RoleBasedRouteProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = user.roles.some((role) =>
    allowedRoles.includes(role)
  );

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}