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

  // Show loading state while auth is being checked
  if (isLoading) {
    return null; // or return a loading spinner
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have required role
  if (
    isAuthenticated &&
    allowedRoles &&
    !allowedRoles.includes(user?.role || "")
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user is authenticated and has required role (if any)
  return <Outlet />;
}
