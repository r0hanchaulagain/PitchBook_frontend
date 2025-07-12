import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@ui/card";
import { Button } from "@ui/button";
import {
  Download,
  Calendar as CalendarIcon,
  BarChart2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Mock data - Will be replaced with API calls
const reportData = {
  revenue: {
    current: 1245800,
    previous: 1054300,
    change: 18.2,
    trend: "up",
  },
  bookings: {
    current: 1289,
    previous: 1087,
    change: 15.5,
    trend: "up",
  },
  users: {
    current: 2845,
    previous: 2450,
    change: 13.9,
    trend: "up",
  },
  futsals: {
    current: 156,
    previous: 142,
    change: 8.9,
    trend: "up",
  },
  charts: {
    revenueByMonth: [
      45000, 52000, 48000, 62000, 58000, 72000, 68000, 78000, 82000, 75000,
      89000, 95000,
    ],
    bookingsByMonth: [
      320, 380, 350, 410, 390, 450, 520, 580, 620, 590, 680, 720,
    ],
    userGrowth: [120, 145, 180, 210, 230, 280, 310, 350, 380, 410, 450, 500],
  },
  recentActivities: [
    {
      id: 1,
      type: "new_booking",
      message: "New booking from John Doe",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "new_user",
      message: "New user registered: Jane Smith",
      time: "15 minutes ago",
    },
    {
      id: 3,
      type: "payment_received",
      message: "Payment received from Mike Johnson",
      amount: "Rs. 3,500",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "futsal_added",
      message: "New futsal added: City Futsal",
      time: "3 hours ago",
    },
    {
      id: 5,
      type: "system_update",
      message: "System maintenance completed",
      time: "5 hours ago",
    },
  ],
};

const Reports = () => {
  const renderStatCard = (
    title: string,
    value: number,
    change: number,
    trend: "up" | "down",
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
          </div>
          <div
            className={`flex items-center ${trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {trend === "up" ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <span className="ml-1 text-sm font-medium">{change}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            View and analyze your platform's performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            This Month
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderStatCard(
          "Total Revenue",
          reportData.revenue.current,
          reportData.revenue.change,
          reportData.revenue.trend as "up" | "down",
        )}
        {renderStatCard(
          "Total Bookings",
          reportData.bookings.current,
          reportData.bookings.change,
          reportData.bookings.trend as "up" | "down",
        )}
        {renderStatCard(
          "Total Users",
          reportData.users.current,
          reportData.users.change,
          reportData.users.trend as "up" | "down",
        )}
        {renderStatCard(
          "Total Futsals",
          reportData.futsals.current,
          reportData.futsals.change,
          reportData.futsals.trend as "up" | "down",
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
              <BarChart2 className="h-12 w-12 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Revenue chart will be displayed here
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-primary mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Statistics</CardTitle>
          <CardDescription>Monthly booking trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
            <BarChart2 className="h-12 w-12 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Booking statistics chart will be displayed here
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
