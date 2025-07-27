import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Badge } from "@ui/badge";
import {
  Activity,
  Calendar,
  DollarSign,
  Star,
  Bell,
  Clock,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import React from "react";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useDashboardSummary } from "@/shared/hooks/useDashboardSummary";

const futsalId = import.meta.env.VITE_FUTSAL_ID;

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  subtitle?: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value: valueProp,
  icon: Icon,
  subtitle,
  trend,
}) => {
  // Safely extract the display value
  const getDisplayValue = () => {
    if (valueProp === null || valueProp === undefined) return "";
    if (typeof valueProp === "object" && valueProp !== null) {
      // Handle case where value might be an object with a value property
      return (valueProp as any).value ?? "";
    }
    return valueProp;
  };

  const displayValue = getDisplayValue();
  const isEmpty =
    displayValue === 0 ||
    displayValue === "0" ||
    displayValue === "" ||
    displayValue === null ||
    displayValue === undefined;

  // Define color schemes based on card type
  const getCardStyles = () => {
    switch (title) {
      case "Current Pricing":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          iconColor: "text-blue-600 dark:text-blue-400",
          borderColor: "border-blue-200 dark:border-blue-800/50",
        };
      case "Slots Booked":
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          iconBg: "bg-green-100 dark:bg-green-900/30",
          iconColor: "text-green-600 dark:text-green-400",
          borderColor: "border-green-200 dark:border-green-800/50",
        };
      case "All-time collection":
        return {
          bg: "bg-purple-50 dark:bg-purple-900/20",
          iconBg: "bg-purple-100 dark:bg-purple-900/30",
          iconColor: "text-purple-600 dark:text-purple-400",
          borderColor: "border-purple-200 dark:border-purple-800/50",
        };
      case "Total Reviews":
        return {
          bg: "bg-amber-50 dark:bg-amber-900/20",
          iconBg: "bg-amber-100 dark:bg-amber-900/30",
          iconColor: "text-amber-600 dark:text-amber-400",
          borderColor: "border-amber-200 dark:border-amber-800/50",
        };
      default:
        return {
          bg: "bg-muted/20",
          iconBg: "bg-muted/30",
          iconColor: "text-foreground",
          borderColor: "border-border",
        };
    }
  };

  const { iconBg, iconColor, borderColor } = getCardStyles();

  return (
    <Card
      className={`h-full flex flex-col justify-between transition-all duration-200 ${isEmpty ? "opacity-80 hover:opacity-100" : ""} border ${borderColor} hover:shadow-md`}
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground/80 dark:text-muted-foreground/70 uppercase tracking-wider mb-1">
              {title}
            </p>
            <p
              className={`text-2xl font-bold ${isEmpty ? "text-muted-foreground" : "text-foreground"}`}
            >
              {isEmpty ? "—" : displayValue}
            </p>
          </div>
          <div
            className={`p-2.5 rounded-lg ${iconBg} ${iconColor} transition-colors`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {subtitle && (
          <div className="mt-auto pt-2">
            {isEmpty ? (
              <p className="text-xs text-muted-foreground/80 dark:text-muted-foreground/70 italic">
                No {title.toLowerCase()} recorded yet
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/80 dark:text-muted-foreground/70">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {!isEmpty && trend !== undefined && (
          <div
            className={`mt-2 flex items-center text-xs font-medium ${trend >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend)}% {trend >= 0 ? "increase" : "decrease"} from
            yesterday
          </div>
        )}

        {isEmpty && (
          <div className="mt-2 flex items-center text-xs text-muted-foreground/80 dark:text-muted-foreground/70">
            <Info className="h-3 w-3 mr-1 opacity-70" />
            {title === "Slots Booked"
              ? "No bookings yet today"
              : "Check back later"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function formatCurrency(amount: number) {
  return `Rs. ${amount?.toLocaleString()}`;
}

export default function FutsalOwnerDashboardHome() {
  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useDashboardSummary(futsalId);
  const { data: notificationsData } = useNotifications(futsalId);
  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : [];

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        Loading dashboard data...
      </div>
    );
  if (error || !summary)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
            Error loading dashboard
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {error?.message || "Failed to load dashboard data"}
          </p>
          <button
            onClick={refetch}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col px-4 py-2 gap-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">
          Dashboard Overview
        </h1>
      </div>
      {/* Top Row - Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-h-[20vh]">
        <StatCard
          title="Current Pricing"
          value={
            typeof summary.currentPricing === "object"
              ? formatCurrency((summary.currentPricing as any)?.value || 0)
              : formatCurrency(0)
          }
          icon={DollarSign}
          subtitle={
            typeof summary.currentPricing === "object"
              ? (summary.currentPricing as any)?.subtext || "Per hour"
              : "Per hour"
          }
        />
        <StatCard
          title={
            typeof summary.slotsBooked === "object"
              ? (summary.slotsBooked as any)?.label || "Slots Booked"
              : "Slots Booked"
          }
          value={
            typeof summary.slotsBooked === "object"
              ? (summary.slotsBooked as any)?.value || 0
              : 0
          }
          icon={Calendar}
          subtitle={
            typeof summary.slotsBooked === "object"
              ? (summary.slotsBooked as any)?.subtext || "Today"
              : "Today"
          }
        />
        <StatCard
          title={
            typeof summary.allTimeCollection === "object"
              ? (summary.allTimeCollection as any)?.label ||
                "All-time Collection"
              : "All-time Collection"
          }
          value={
            typeof summary.allTimeCollection === "object"
              ? formatCurrency((summary.allTimeCollection as any)?.value || 0)
              : "Rs. 0"
          }
          icon={DollarSign}
          subtitle={
            typeof summary.allTimeCollection === "object"
              ? (summary.allTimeCollection as any)?.subtext || "Total revenue"
              : "Total revenue"
          }
        />
        <StatCard
          title={
            typeof summary.totalReviews === "object"
              ? (summary.totalReviews as any)?.label || "Total Reviews"
              : "Total Reviews"
          }
          value={
            typeof summary.totalReviews === "object"
              ? (summary.totalReviews as any)?.value || 0
              : 0
          }
          icon={Star}
          subtitle={
            typeof summary.totalReviews === "object"
              ? (summary.totalReviews as any)?.subtext || "0.0 ★ rating"
              : "0.0 ★ rating"
          }
        />
      </div>

      {/* Bottom Row - Three Main Sections */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-[50vh]">
        {/* Overall Stats Today */}
        <Card className="h-full flex flex-col border border-blue-200 dark:border-blue-800/50">
          <CardHeader className="p-4 pb-2 border-b border-blue-100 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-900/10">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-blue-800 dark:text-blue-200">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Today's Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 grid grid-cols-2 gap-2">
            {(
              Object.entries({
                bookings: {
                  bg: "bg-green-50 dark:bg-green-900/10",
                  border: "border-green-100 dark:border-green-800/30",
                  hover: "hover:bg-green-100/50 dark:hover:bg-green-900/20",
                  text: "text-green-800/80 dark:text-green-200/80",
                  textBold: "text-green-700 dark:text-green-300",
                  icon: (
                    <Calendar className="h-4 w-4 mt-1 text-green-600 dark:text-green-400" />
                  ),
                  format: (v: any) => v ?? 0,
                  key: "bookings",
                },
                revenue: {
                  bg: "bg-purple-50 dark:bg-purple-900/10",
                  border: "border-purple-100 dark:border-purple-800/30",
                  hover: "hover:bg-purple-100/50 dark:hover:bg-purple-900/20",
                  text: "text-purple-800/80 dark:text-purple-200/80",
                  textBold: "text-purple-700 dark:text-purple-300",
                  icon: (
                    <DollarSign className="h-4 w-4 mt-1 text-purple-600 dark:text-purple-400" />
                  ),
                  format: (v: any) => formatCurrency(v || 0),
                  key: "revenue",
                },
                occupancy: {
                  bg: "bg-blue-50 dark:bg-blue-900/10",
                  border: "border-blue-100 dark:border-blue-800/30",
                  hover: "hover:bg-blue-100/50 dark:hover:bg-blue-900/20",
                  text: "text-blue-800/80 dark:text-blue-200/80",
                  textBold: "text-blue-700 dark:text-blue-300",
                  icon: (
                    <div className="h-4 w-4 mt-1 flex items-center justify-center">
                      <svg
                        className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                      </svg>
                    </div>
                  ),
                  format: (v: any) => `${v || "0"}`,
                  key: "occupancy",
                },
              }) as [string, any][]
            ).map(([key, config]) => {
              const stat =
                summary.todayStats[key as keyof typeof summary.todayStats];
              const value =
                typeof stat === "object" ? (stat as any)?.value : stat;
              const label =
                typeof stat === "object"
                  ? (stat as any)?.label
                  : key.charAt(0).toUpperCase() + key.slice(1);

              return (
                <div
                  key={key}
                  className={`${config.bg} p-3 rounded-lg flex flex-col items-center justify-center text-center h-24 ${config.border} ${config.hover} transition-colors`}
                >
                  <p className={`text-sm ${config.text} mb-1`}>{label}</p>
                  <p className={`text-2xl font-bold ${config.textBold}`}>
                    {config.format(value)}
                  </p>
                  {config.icon}
                </div>
              );
            })}

            <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg flex flex-col items-center justify-center text-center h-24 border border-amber-100 dark:border-amber-800/30 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors">
              <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mb-1">
                Rating
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {summary.totalReviews.value === "-"
                    ? "—"
                    : String(summary.totalReviews.value)}
                </span>
              </div>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                {summary.totalReviews.subtext}
              </p>
            </div>
            <div className="flex justify-between">
              <span
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Reviews
              </span>
              <span
                className="font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {summary.totalReviews.value === "-"
                  ? "0"
                  : String(summary.totalReviews.value)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="h-full flex flex-col border border-orange-200 dark:border-orange-800/50">
          <CardHeader className="p-4 pb-2 border-b border-orange-100 dark:border-orange-800/30 bg-orange-50/50 dark:bg-orange-900/10">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-orange-800 dark:text-orange-200">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span>Today's schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-3 pt-0 overflow-auto">
            <div className="space-y-3">
              {summary.todaysSchedule.bookings.length > 0 ? (
                summary.todaysSchedule.bookings
                  .slice(0, 4)
                  .map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 space-y-2">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No bookings scheduled for today
                  </p>
                </div>
              )}
              {summary.todaysSchedule.bookings.length > 4 && (
                <div className="text-center pt-2">
                  <button className="text-sm text-blue-500 hover:underline">
                    View all ({summary.todaysSchedule.bookings.length - 4} more)
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="h-full flex flex-col border border-red-200 dark:border-red-800/50">
          <CardHeader className="p-4 pb-2 border-b border-red-100 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-red-800 dark:text-red-200">
              <Bell className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>Recent Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-3 pt-0 overflow-auto">
            <div className="space-y-3">
              {summary.recentNotifications.notifications.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No notifications.
                </div>
              ) : (
                summary.recentNotifications.notifications
                  .slice(0, 3)
                  .map((notification: any) => (
                    <div
                      key={notification._id}
                      className={`p-2 rounded text-sm`}
                      style={{
                        background: notification.isRead
                          ? "var(--card)"
                          : "var(--sidebar-accent)",
                        borderLeft: notification.isRead
                          ? undefined
                          : "4px solid var(--sidebar-accent)",
                        color: "var(--foreground)",
                      }}
                    >
                      <p className="font-medium">{notification.message}</p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
