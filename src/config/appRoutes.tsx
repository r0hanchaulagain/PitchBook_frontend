import { useRoutes, Navigate } from "react-router-dom";
import { lazy } from "react";
// // Lazy load RequireAuth
// const RequireAuth = lazy(() => import("@/pages/Auth/RequireAuth"));
const Unauthorized = lazy(() => import("@features/UnauthorizedPage"));
const MainLayout = lazy(() => import("@layouts/MainLayout"));
// const AdminLayout = lazy(() => import("@/layouts/AdminLayout")); 
// const FutsalOwnerLayout = lazy(() => import("@/layouts/FutsalOwnerLayout"));

// // Lazy load all pages

// Auth routes
const Login = lazy(() => import("@features/Auth/Login"));
const Register = lazy(() => import("@features/Auth/Register"));
const ForgotStatus = lazy(() => import("@features/Auth/ForgotStatus"));
const ResetPassword = lazy(() => import("@features/Auth/ResetPassword"));

// const BookingsList = lazy(() => import("@/pages/Bookings/BookingsList"));
// const CreateBooking = lazy(() => import("@/pages/Bookings/CreateBooking"));
// const FutsalList = lazy(() => import("@/pages/Futsals/FutsalList"));
// const NotificationsList = lazy(() => import("@/pages/Notifications/NotificationsList"));
// const AdminPage = lazy(() => import("@/pages/AdminPage"));
// const UserPage = lazy(() => import("@/pages/UserPage"));
// const FutsalOwnerPage = lazy(() => import("@/pages/FutsalOwnerPage"));

// Customer side routes
const LandingPage = lazy(() => import("@/features/CustomerSide/LandingPage"));

	// Futsals routes
const ExploreFutsalsPage = lazy(() => import("@/features/CustomerSide/Futsals/ExploreFutsalsPage"));
const FutsalDetailsPage = lazy(() => import("@/features/CustomerSide/Futsals/FutsalDetailsPage"));

// Test routes
const TestPage = lazy(() => import("@/TestPage"));

// Admin routes
// const AdminDashboard=lazy(()=> import("@/pages/AdminDashboard"));
// const FutsalOwnerDashboardHome = lazy(() => import("@/pages/FutsalOwnerDashboard/Home"));
// const FutsalOwnerDashboardBookings = lazy(() => import("@/pages/FutsalOwnerDashboard/Bookings"));
// const FutsalOwnerDashboardFutsal = lazy(() => import("@/pages/FutsalOwnerDashboard/Futsal"));
// const FutsalOwnerDashboardTransactions = lazy(() => import("@/pages/FutsalOwnerDashboard/Transactions"));
// const BookingVerify = lazy(() => import("@/pages/booking/verify"));

export default function AppRoutes() {
	return useRoutes([
		// Public routes
		{ path: "/login", element: <Login /> },
		{ path: "/register", element: <Register /> },
		{ path: "/auth/forgot-status", element: <ForgotStatus /> },
		{ path: "/reset-password", element: <ResetPassword /> },
		// { path: "/admin/dashboard", element: <AdminDashboard /> },
		// { path: "/futsal/dashboard", element: <FutsalOwnerPage /> },

		// Main layout with general authenticated routes
		{
			element: <MainLayout />,
			children: [
				{ path: "/", element: <LandingPage /> },
				{ path: "/futsals", element: <ExploreFutsalsPage /> },
				{ path: "/futsals/:id", element: <FutsalDetailsPage /> },
				// { path: "/booking/verify", element: <BookingVerify /> },
				// {
				// 	element: <RequireAuth />,
				// 	children: [
				// 		{ path: "/home", element: <Test /> },
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
		// {
		// 	element: <RequireAuth allowedRoles={["admin"]} />,
		// 	children: [
		// 		{
		// 			element: <AdminLayout />,
		// 			children: [{ path: "/admin", element: <AdminPage /> }],
		// 		},
		// 	],
		// },
		// // Futsal Owner layout
		// {
		// 	element: <RequireAuth allowedRoles={["futsalOwner"]} />,
		// 	children: [
		// 		{
		// 			element: <FutsalOwnerLayout />,
		// 			children: [
		// 				{ path: "/futsal-owner", element: <FutsalOwnerDashboardHome /> },
		// 				{ path: "/futsal-owner/bookings", element: <FutsalOwnerDashboardBookings /> },
		// 				{ path: "/futsal-owner/futsal", element: <FutsalOwnerDashboardFutsal /> },
		// 				{ path: "/futsal-owner/transactions", element: <FutsalOwnerDashboardTransactions /> },
		// 			],
		// 		},
		// 	],
		// },
		{ path: "/unauthorized", element: <Unauthorized /> },
		{ path: "*", element: <Navigate to="/" replace /> },
		{ path: "test", element: <TestPage /> },
	]);
}
