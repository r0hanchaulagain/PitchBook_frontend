import {
  ChartBar,
  Calendar,
  DollarSign,
  GoalIcon,
  Users,
  BarChart2,
  Settings,
} from "lucide-react";

export const futsalOwnerSidebarItems = [
  { icon: ChartBar, label: "Analytics", to: "/futsal-owner/dashboard" },
  { icon: Calendar, label: "Bookings", to: "/futsal-owner/bookings" },
  { icon: GoalIcon, label: "Futsal", to: "/futsal-owner/futsal" },
  { icon: DollarSign, label: "Transactions", to: "/futsal-owner/transactions" },
];

export const adminSidebarItems = [
  { icon: ChartBar, label: "Dashboard", to: "/admin/dashboard" },
  { icon: Users, label: "Users", to: "/admin/users" },
  { icon: GoalIcon, label: "Futsals", to: "/admin/futsals" },
  { icon: Calendar, label: "Bookings", to: "/admin/bookings" },
  { icon: DollarSign, label: "Transactions", to: "/admin/transactions" },
  { icon: BarChart2, label: "Reports", to: "/admin/reports" },
  { icon: Settings, label: "Settings", to: "/admin/settings" },
];
