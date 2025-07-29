import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  Building2,
  AlertTriangle,
  TrendingDown,
  Download,
  Settings,
} from "lucide-react";
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  subtitle?: string;
}
const mockAdminData = {
  overview: {
    totalUsers: 2845,
    totalFutsals: 156,
    totalBookings: 12453,
    totalRevenue: 2845600,
    activeBookings: 89,
    pendingRegistrations: 12,
  },
  registrationStats: {
    thisMonth: 23,
    lastMonth: 18,
    growth: 27.8,
  },
  bookingStats: {
    today: 45,
    thisWeek: 312,
    thisMonth: 1289,
    cancellationRate: 8.5,
  },
  revenueStats: {
    today: 45600,
    thisWeek: 284500,
    thisMonth: 1245800,
    growth: 15.2,
  },
};
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  subtitle,
}: StatCardProps) => (
  <Card className="hover:shadow-lg transition-shadow flex-1">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${trend === "up" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
        >
          <Icon
            className={`h-6 w-6 ${trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          />
        </div>
      </div>
      {trend && trendValue && (
        <div
          className={`mt-2 text-sm flex items-center ${trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          {trendValue}
        </div>
      )}
    </CardContent>
  </Card>
);
const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            This Month
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={mockAdminData.overview.totalUsers}
          icon={Users}
          trend="up"
          trendValue={`+${mockAdminData.registrationStats.growth}% from last month`}
        />
        <StatCard
          title="Total Futsals"
          value={mockAdminData.overview.totalFutsals}
          icon={Building2}
          trend="up"
          trendValue="+5 this month"
        />
        <StatCard
          title="Total Bookings"
          value={mockAdminData.overview.totalBookings.toLocaleString()}
          icon={Calendar}
          trend="up"
          trendValue={`+${mockAdminData.bookingStats.growth}% from last month`}
        />
        <StatCard
          title="Total Revenue"
          value={`Rs. ${mockAdminData.overview.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue={`+${mockAdminData.revenueStats.growth}% from last month`}
        />
      </div>
      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button
          variant="outline"
          className="h-24 flex-col items-center justify-center gap-2"
        >
          <Users className="h-6 w-6" />
          Manage Users
        </Button>
        <Button
          variant="outline"
          className="h-24 flex-col items-center justify-center gap-2"
        >
          <Building2 className="h-6 w-6" />
          Manage Futsals
        </Button>
        <Button
          variant="outline"
          className="h-24 flex-col items-center justify-center gap-2"
        >
          <AlertTriangle className="h-6 w-6" />
          View Reports
        </Button>
        <Button
          variant="outline"
          className="h-24 flex-col items-center justify-center gap-2"
        >
          <Settings className="h-6 w-6" />
          Settings
        </Button>
      </div>
      {}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">New booking received</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminDashboard;
