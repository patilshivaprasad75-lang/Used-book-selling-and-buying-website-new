import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { isAdmin, loading, isAuthenticated, dashboardPath } = useAuth();
  if (loading) return <Loader label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to={dashboardPath} replace />;
  return <Outlet />;
}

// Buyer-only dashboard. Sellers and admins are sent to their own dashboards
// so each role only ever sees the options meant for it.
export function BuyerRoute() {
  const { isBuyer, loading, isAuthenticated, dashboardPath } = useAuth();
  if (loading) return <Loader label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isBuyer) return <Navigate to={dashboardPath} replace />;
  return <Outlet />;
}

// Seller-only dashboard (admins may also access it to manage/inspect seller tools).
export function SellerRoute() {
  const { isSeller, loading, isAuthenticated, dashboardPath } = useAuth();
  if (loading) return <Loader label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSeller) return <Navigate to={dashboardPath} replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, loading, dashboardPath } = useAuth();
  if (loading) return <Loader label="Loading..." />;
  if (isAuthenticated) return <Navigate to={dashboardPath} replace />;
  return <Outlet />;
}
