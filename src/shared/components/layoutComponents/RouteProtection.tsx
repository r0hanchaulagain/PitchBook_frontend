import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
interface RouteProtectionProps {
  allowedRoles?: string[];
  requireAuth?: boolean;
}
export default function RouteProtection({
  allowedRoles,
  requireAuth = true,
}: RouteProtectionProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return null;
  }
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (
    isAuthenticated &&
    allowedRoles &&
    !allowedRoles.includes(user?.role || "")
  ) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
