import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Building2,
  Clock,
  AlertTriangle,
  Star,
  PieChart,
  Eye,
  CheckCircle,
  Home,
  Bell,
  Plus,
  Edit,
  Trash2,
  Table,
} from "lucide-react";
import { DialogHeader, DialogFooter } from "@ui/dialog";
import { Input } from "@ui/input";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@radix-ui/react-select";

// Type definitions
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  subtitle?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  bookings: number;
  spent: number;
  joinDate: string;
}

interface Futsal {
  id: number;
  name: string;
  location: string;
  rating: number;
  pricePerHour: number;
  bookings: number;
  revenue: number;
}

// Mock data based on API endpoints
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
  topFutsals: [
    {
      id: 1,
      pricePerHour: 1,
      name: "Champions Arena",
      bookings: 456,
      revenue: 125400,
      rating: 4.8,
      location: "Lalitpur",
    },
    {
      id: 2,
      pricePerHour: 1,
      name: "Victory Ground",
      bookings: 423,
      revenue: 118900,
      rating: 4.7,
      location: "Kathmandu",
    },
    {
      id: 3,
      pricePerHour: 1,
      name: "Star Sports Complex",
      bookings: 389,
      revenue: 102300,
      rating: 4.6,
      location: "Bhaktapur",
    },
    {
      id: 4,
      pricePerHour: 1,
      name: "Elite Futsal",
      bookings: 365,
      revenue: 98700,
      rating: 4.5,
      location: "Kathmandu",
    },
    {
      id: 5,
      pricePerHour: 1,
      name: "Prime Sports",
      bookings: 334,
      revenue: 89200,
      rating: 4.4,
      location: "Lalitpur",
    },
  ],
  topUsers: [
    {
      id: 1,
      email: "email@example.com",
      name: "Ram Sharma",
      bookings: 45,
      spent: 23400,
      joinDate: "2023-01-15",
      role: "user",
    },
    {
      id: 2,
      email: "email@example.com",
      name: "Sita Patel",
      bookings: 42,
      spent: 21800,
      joinDate: "2023-02-20",
      role: "user",
    },
    {
      id: 3,
      email: "email@example.com",
      name: "Hari Thapa",
      bookings: 38,
      spent: 19600,
      joinDate: "2023-03-10",
      role: "owner",
    },
    {
      id: 4,
      email: "email@example.com",
      name: "Maya Gurung",
      bookings: 35,
      spent: 18200,
      joinDate: "2023-01-28",
      role: "user",
    },
    {
      id: 5,
      email: "email@example.com",
      name: "Rajesh KC",
      bookings: 33,
      spent: 17100,
      joinDate: "2023-04-05",
      role: "admin",
    },
  ],
  lowPerformingFutsals: [
    {
      id: 6,
      pricePerHour: 1,
      name: "Corner Kick",
      bookings: 23,
      revenue: 12300,
      rating: 3.2,
      location: "Bhaktapur",
      issues: ["Low rating", "Poor maintenance"],
    },
    {
      id: 7,
      pricePerHour: 1,
      name: "Goal Post",
      bookings: 18,
      revenue: 9800,
      rating: 3.0,
      location: "Kathmandu",
      issues: ["Booking cancellations", "Location"],
    },
    {
      id: 8,
      pricePerHour: 1,
      name: "Penalty Box",
      bookings: 15,
      revenue: 7500,
      rating: 2.9,
      location: "Lalitpur",
      issues: ["Poor facilities", "High price"],
    },
  ],
  locationStats: {
    futsals: [
      { location: "Kathmandu", count: 67, percentage: 43 },
      { location: "Lalitpur", count: 45, percentage: 29 },
      { location: "Bhaktapur", count: 44, percentage: 28 },
    ],
    bookings: [
      { location: "Kathmandu", count: 5234, percentage: 42 },
      { location: "Lalitpur", count: 3876, percentage: 31 },
      { location: "Bhaktapur", count: 3343, percentage: 27 },
    ],
  },
  activeInactiveFutsals: {
    active: 142,
    inactive: 14,
    activePercentage: 91,
  },
  cancellationStats: {
    thisMonth: 106,
    lastMonth: 89,
    topReasons: [
      { reason: "Weather", count: 34 },
      { reason: "Personal", count: 28 },
      { reason: "Facility issue", count: 22 },
      { reason: "Double booking", count: 15 },
      { reason: "Other", count: 7 },
    ],
  },
};

const allFutsals = [
  ...mockAdminData.topFutsals,
  ...mockAdminData.lowPerformingFutsals,
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<User[]>(mockAdminData.topUsers);
  const [futsals, setFutsals] = useState<Futsal[]>(allFutsals);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isFutsalModalOpen, setIsFutsalModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingFutsal, setEditingFutsal] = useState<Futsal | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });
  const [newFutsal, setNewFutsal] = useState({
    name: "",
    location: "",
    rating: 0,
    pricePerHour: 0,
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-NP").format(num);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    subtitle,
  }: StatCardProps) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <Icon className="h-8 w-8 text-blue-600 mb-2" />
            {trend && trendValue && (
              <div
                className={`flex items-center text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {trendValue}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleCreateUser = () => {
    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.id === editingUser.id ? { ...editingUser, ...newUser } : user,
        ),
      );
      setEditingUser(null);
    } else {
      setUsers([
        ...users,
        {
          ...newUser,
          id: users.length + 1,
          bookings: 0,
          spent: 0,
          joinDate: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    setNewUser({ name: "", email: "", role: "user", password: "" });
    setIsUserModalOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email || "",
      role: user.role,
      password: "",
    });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleCreateFutsal = () => {
    if (editingFutsal) {
      setFutsals(
        futsals.map((futsal) =>
          futsal.id === editingFutsal.id
            ? { ...editingFutsal, ...newFutsal }
            : futsal,
        ),
      );
      setEditingFutsal(null);
    } else {
      setFutsals([
        ...futsals,
        { ...newFutsal, id: futsals.length + 1, bookings: 0, revenue: 0 },
      ]);
    }
    setNewFutsal({ name: "", location: "", rating: 0, pricePerHour: 0 });
    setIsFutsalModalOpen(false);
  };

  const handleEditFutsal = (futsal: Futsal) => {
    setEditingFutsal(futsal);
    setNewFutsal({
      name: futsal.name,
      location: futsal.location,
      rating: futsal.rating,
      pricePerHour: futsal.pricePerHour || 0,
    });
    setIsFutsalModalOpen(true);
  };

  const handleDeleteFutsal = (futsalId: number) => {
    setFutsals(futsals.filter((futsal) => futsal.id !== futsalId));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={formatNumber(mockAdminData.overview.totalUsers)}
          icon={Users}
          trend="up"
          trendValue="12.5"
        />
        <StatCard
          title="Total Futsals"
          value={formatNumber(mockAdminData.overview.totalFutsals)}
          icon={Building2}
          trend="up"
          trendValue="8.3"
        />
        <StatCard
          title="Total Bookings"
          value={formatNumber(mockAdminData.overview.totalBookings)}
          icon={Calendar}
          trend="up"
          trendValue="15.2"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(mockAdminData.overview.totalRevenue)}
          icon={DollarSign}
          trend="up"
          trendValue="18.7"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title="Active Bookings"
          value={formatNumber(mockAdminData.overview.activeBookings)}
          icon={Activity}
          subtitle="Currently ongoing"
        />
        <StatCard
          title="Pending Registrations"
          value={formatNumber(mockAdminData.overview.pendingRegistrations)}
          icon={Clock}
          subtitle="Awaiting approval"
        />
        <StatCard
          title="Platform Health"
          value="Excellent"
          icon={CheckCircle}
          subtitle="99.9% uptime"
        />
      </div>
    </div>
  );

  const renderTopFutsals = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Top Performing Futsals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Futsal</th>
                <th className="text-left py-3 px-4">Location</th>
                <th className="text-left py-3 px-4">Bookings</th>
                <th className="text-left py-3 px-4">Revenue</th>
                <th className="text-left py-3 px-4">Rating</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockAdminData.topFutsals.map((futsal, index) => (
                <tr key={futsal.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Badge>#{index + 1}</Badge>
                      {futsal.name}
                    </div>
                  </td>
                  <td className="py-3 px-4">{futsal.location}</td>
                  <td className="py-3 px-4">{formatNumber(futsal.bookings)}</td>
                  <td className="py-3 px-4">
                    {formatCurrency(futsal.revenue)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {futsal.rating}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderLowPerforming = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Low Performing Futsals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAdminData.lowPerformingFutsals.map((futsal) => (
            <div key={futsal.id} className="border rounded-md p-4 bg-orange-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{futsal.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge>Low Performance</Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium">{futsal.location}</p>
                </div>
                <div>
                  <p className="text-gray-600">Bookings</p>
                  <p className="font-medium">{futsal.bookings}</p>
                </div>
                <div>
                  <p className="text-gray-600">Revenue</p>
                  <p className="font-medium">
                    {formatCurrency(futsal.revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Rating</p>
                  <p className="font-medium flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {futsal.rating}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Issues:</p>
                <div className="flex gap-2">
                  {futsal.issues.map((issue, index) => (
                    <Badge key={index}>{issue}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderLocationStats = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Futsals by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAdminData.locationStats.futsals.map((location) => (
              <div
                key={location.location}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{location.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12">
                    {location.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Bookings by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAdminData.locationStats.bookings.map((location) => (
              <div
                key={location.location}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{location.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-16">
                    {formatNumber(location.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTopUsers = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Top Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Bookings</th>
                <th className="text-left py-3 px-4">Amount Spent</th>
                <th className="text-left py-3 px-4">Join Date</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockAdminData.topUsers.map((user, index) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Badge>#{index + 1}</Badge>
                      {user.name}
                    </div>
                  </td>
                  <td className="py-3 px-4">{user.bookings}</td>
                  <td className="py-3 px-4">{formatCurrency(user.spent)}</td>
                  <td className="py-3 px-4">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Active vs Inactive Futsals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {mockAdminData.activeInactiveFutsals.activePercentage}%
            </div>
            <p className="text-gray-600 mb-4">Active Futsals</p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                Active: {mockAdminData.activeInactiveFutsals.active}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                Inactive: {mockAdminData.activeInactiveFutsals.inactive}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cancellation Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAdminData.cancellationStats.topReasons.map((reason) => (
              <div
                key={reason.reason}
                className="flex items-center justify-between"
              >
                <span className="text-sm">{reason.reason}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${(reason.count / mockAdminData.cancellationStats.thisMonth) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-6">
                    {reason.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserManagement = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Edit User" : "Create New User"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="Enter user name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="Enter user email"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="Enter password"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="owner">Futsal Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser}>
                  {editingUser ? "Update User" : "Create User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Amount Spent</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email || "N/A"}</TableCell>
                <TableCell>
                  <Badge>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{user.bookings}</TableCell>
                <TableCell>{formatCurrency(user.spent)}</TableCell>
                <TableCell>
                  {new Date(user.joinDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                          <DialogHeader>
                            This action cannot be undone. This will permanently
                            delete the user.
                          </DialogHeader>
                        </DialogHeader>
                        <DialogFooter>
                          <Button>Cancel</Button>
                          <Button onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderFutsalManagement = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Futsal Management
          </CardTitle>
          <Dialog open={isFutsalModalOpen} onOpenChange={setIsFutsalModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Futsal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFutsal ? "Edit Futsal" : "Add New Futsal"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="futsalName">Name</Label>
                  <Input
                    id="futsalName"
                    value={newFutsal.name}
                    onChange={(e) =>
                      setNewFutsal({ ...newFutsal, name: e.target.value })
                    }
                    placeholder="Enter futsal name"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={newFutsal.location}
                    onValueChange={(value) =>
                      setNewFutsal({ ...newFutsal, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kathmandu">Kathmandu</SelectItem>
                      <SelectItem value="Lalitpur">Lalitpur</SelectItem>
                      <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={newFutsal.rating}
                    onChange={(e) =>
                      setNewFutsal({
                        ...newFutsal,
                        rating: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Enter rating (0-5)"
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerHour">Price per Hour (NPR)</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    value={newFutsal.pricePerHour}
                    onChange={(e) =>
                      setNewFutsal({
                        ...newFutsal,
                        pricePerHour: parseInt(e.target.value),
                      })
                    }
                    placeholder="Enter price per hour"
                  />
                </div>
                <Button onClick={handleCreateFutsal}>
                  {editingFutsal ? "Update Futsal" : "Add Futsal"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Price/Hour</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {futsals.map((futsal) => (
              <TableRow key={futsal.id}>
                <TableCell>{futsal.name}</TableCell>
                <TableCell>{futsal.location}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {futsal.rating}
                  </div>
                </TableCell>
                <TableCell>
                  {formatCurrency(futsal.pricePerHour || 0)}
                </TableCell>
                <TableCell>{formatNumber(futsal.bookings)}</TableCell>
                <TableCell>{formatCurrency(futsal.revenue)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFutsal(futsal)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                          <DialogHeader>
                            This action cannot be undone. This will permanently
                            delete the futsal.
                          </DialogHeader>
                        </DialogHeader>
                        <DialogFooter>
                          <Button>Cancel</Button>
                          <Button onClick={() => handleDeleteFutsal(futsal.id)}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const sidebarItems = [
    { key: "overview", label: "Overview", icon: Home },
    { key: "futsals", label: "Top Futsals", icon: Star },
    { key: "users", label: "Top Users", icon: Users },
    { key: "user-management", label: "User Management", icon: Users },
    { key: "futsal-management", label: "Futsal Management", icon: Building2 },
    { key: "low-performing", label: "Low Performing", icon: AlertTriangle },
    { key: "locations", label: "Locations", icon: MapPin },
    { key: "analytics", label: "Analytics", icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">Admin Dashboard</span>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors ${
                  activeTab === key
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white shadow-sm border-b">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === "overview" && "Dashboard Overview"}
                  {activeTab === "futsals" && "Top Performing Futsals"}
                  {activeTab === "users" && "Top Users"}
                  {activeTab === "user-management" && "User Management"}
                  {activeTab === "futsal-management" && "Futsal Management"}
                  {activeTab === "low-performing" && "Low Performing Futsals"}
                  {activeTab === "locations" && "Location Statistics"}
                  {activeTab === "analytics" && "Analytics"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {activeTab === "overview" &&
                    "Welcome to the admin dashboard. Here's an overview of your platform."}
                  {activeTab === "futsals" &&
                    "View and manage top performing futsals."}
                  {activeTab === "users" && "View and manage top users."}
                  {activeTab === "user-management" &&
                    "Manage user accounts and permissions."}
                  {activeTab === "futsal-management" &&
                    "Manage futsal listings and details."}
                  {activeTab === "low-performing" &&
                    "Monitor and improve low performing futsals."}
                  {activeTab === "locations" && "View statistics by location."}
                  {activeTab === "analytics" &&
                    "View detailed analytics and reports."}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="h-6 w-6 text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  <Activity className="h-4 w-4 mr-1" />
                  System Healthy
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Existing content sections */}
          {activeTab === "overview" && renderOverview()}
          {activeTab === "futsals" && renderTopFutsals()}
          {activeTab === "users" && renderTopUsers()}
          {activeTab === "user-management" && renderUserManagement()}
          {activeTab === "futsal-management" && renderFutsalManagement()}
          {activeTab === "low-performing" && renderLowPerforming()}
          {activeTab === "locations" && renderLocationStats()}
          {activeTab === "analytics" && renderAnalytics()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
