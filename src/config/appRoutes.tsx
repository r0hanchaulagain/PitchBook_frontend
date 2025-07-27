import { useRoutes, Navigate } from "react-router-dom";
import { lazy } from "react";
import ContactUsPage from "@/features/CustomerSide/ContactUsPage";
import { futsalOwnerSidebarItems, adminSidebarItems } from "./sidebar";
import Logo from "@assets/logos/Logo.png";

//Error pages
const Unauthorized = lazy(() => import("@features/UnauthorizedPage"));
const RouteProtection = lazy(() => import("@layoutComponents/RouteProtection"));

//Layout components
const MainLayout = lazy(() => import("@layouts/MainLayout"));
const SidebarLayout = lazy(() => import("@/shared/layouts/SidebarLayout"));

//Payment verification page
const PaymentVerificationPage = lazy(
  () => import("@features/PaymentVerificationPage"),
);

// Auth routes
const Login = lazy(() => import("@features/Auth/Login"));
const Register = lazy(() => import("@features/Auth/Register"));
const ForgotStatus = lazy(() => import("@features/Auth/ForgotStatus"));
const ResetPassword = lazy(() => import("@features/Auth/ResetPassword"));

// const AdminPage = lazy(() => import("@/pages/AdminPage"));
// const UserPage = lazy(() => import("@/pages/UserPage"));
// const FutsalOwnerPage = lazy(() => import("@/pages/FutsalOwnerPage"));

// Customer side routes
const LandingPage = lazy(() => import("@/features/CustomerSide/LandingPage"));
const GamesPage = lazy(() => import("@/features/CustomerSide/Games/GamesPage"));

// Futsals routes
const ExploreFutsalsPage = lazy(
  () => import("@/features/CustomerSide/Futsals/ExploreFutsalsPage"),
);
const FutsalDetailsPage = lazy(
  () => import("@/features/CustomerSide/Futsals/FutsalDetailsPage"),
);
const FutsalSelectionPage = lazy(
  () => import("@/features/CustomerSide/Games/FutsalSelectionPage"),
);

// Test routes
const TestPage = lazy(() => import("@/TestPage"));

// Admin routes
const AdminDashboard = lazy(() => import("@/features/AdminSide/Dashboard"));
const AdminUsers = lazy(() => import("@/features/AdminSide/Users"));
const AdminFutsals = lazy(() => import("@/features/AdminSide/Futsals"));
const AdminBookings = lazy(() => import("@/features/AdminSide/Bookings"));
const AdminTransactions = lazy(
  () => import("@/features/AdminSide/Transactions"),
);
const AdminReports = lazy(() => import("@/features/AdminSide/Reports"));
const AdminSettings = lazy(() => import("@/features/AdminSide/Settings"));
const FutsalOwnerDashboardHome = lazy(
  () => import("@features/FutsalOwnerSide/Dashboard"),
);
const FutsalOwnerDashboardBookings = lazy(
  () => import("@features/FutsalOwnerSide/Bookings"),
);
const FutsalOwnerDashboardFutsal = lazy(
  () => import("@features/FutsalOwnerSide/Futsal"),
);
const FutsalOwnerDashboardTransactions = lazy(
  () => import("@/features/FutsalOwnerSide/Transactions"),
);
// const BookingVerify = lazy(() => import("@/pages/bookings/verify"));

export default function AppRoutes() {
  return useRoutes([
    // Public routes
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/auth/forgot-status", element: <ForgotStatus /> },
    { path: "/reset-password", element: <ResetPassword /> },

    // Main layout with general authenticated routes
    {
      element: <MainLayout />,
      children: [
        { path: "/", element: <LandingPage /> },
        { path: "/futsals", element: <ExploreFutsalsPage /> },
        { path: "/futsals/select", element: <FutsalSelectionPage /> },
        { path: "/futsals/:id", element: <FutsalDetailsPage /> },
        { path: "/games", element: <GamesPage /> },
        { path: "/contact", element: <ContactUsPage /> },
        { path: "/bookings/verify", element: <PaymentVerificationPage /> },
        // {
        // 	element: <RequireAuth />,
        // 	children: [
        // 		{ path: "/bookings", element: <BookingsList /> },
        // 		{ path: "/bookings/create", element: <CreateBooking /> },
        // 		{ path: "/futsals", element: <FutsalList /> },
        // 		{ path: "/notifications", element: <NotificationsList /> },
        // 		{ path: "/user", element: <UserPage /> },
        // 	],
        // },
      ],
    },

    // Admin layout
    {
      element: <RouteProtection allowedRoles={["admin"]} />,
      children: [
        {
          element: (
            <SidebarLayout
              title="Admin Dashboard"
              sidebarItems={adminSidebarItems}
            />
          ),
          children: [
            { path: "/admin/dashboard", element: <AdminDashboard /> },
            { path: "/admin/users", element: <AdminUsers /> },
            { path: "/admin/futsals", element: <AdminFutsals /> },
            { path: "/admin/bookings", element: <AdminBookings /> },
            { path: "/admin/transactions", element: <AdminTransactions /> },
            { path: "/admin/reports", element: <AdminReports /> },
            { path: "/admin/settings", element: <AdminSettings /> },
          ],
        },
      ],
    },
    // // Futsal Owner layout
    {
      element: <RouteProtection allowedRoles={["futsalOwner"]} />,
      children: [
        {
          element: (
            <SidebarLayout
              title="Futsal Dashboard"
              logo={Logo}
              sidebarItems={futsalOwnerSidebarItems}
            />
          ),
          children: [
            {
              path: "/futsal-owner/dashboard",
              element: <FutsalOwnerDashboardHome />,
            },
            {
              path: "/futsal-owner/bookings",
              element: <FutsalOwnerDashboardBookings />,
            },
            {
              path: "/futsal-owner/futsal",
              element: <FutsalOwnerDashboardFutsal />,
            },
            {
              path: "/futsal-owner/transactions",
              element: <FutsalOwnerDashboardTransactions />,
            },
          ],
        },
      ],
    },
    { path: "/unauthorized", element: <Unauthorized /> },
    { path: "*", element: <Navigate to="/" replace /> },
    { path: "test", element: <TestPage /> },
  ]);
}
