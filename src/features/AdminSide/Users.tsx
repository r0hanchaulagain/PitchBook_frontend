import { Card, CardContent, CardHeader } from "@ui/card";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Search, UserPlus, Edit, Trash2, Eye } from "lucide-react";
import { useState, type ChangeEvent } from "react";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  lastActive: string;
}

// Mock data - Will be replaced with API calls
const mockUsers: User[] = [
  {
    id: 1,
    name: "Ram Sharma",
    email: "ram.sharma@example.com",
    role: "user",
    status: "active",
    joinDate: "2023-01-15",
    lastActive: "2023-06-15T14:30:00Z",
  },
  {
    id: 2,
    name: "Sita Patel",
    email: "sita.patel@example.com",
    role: "futsal_owner",
    status: "active",
    joinDate: "2023-02-20",
    lastActive: "2023-06-14T09:15:00Z",
  },
  {
    id: 3,
    name: "Hari Gurung",
    email: "hari.gurung@example.com",
    role: "user",
    status: "inactive",
    joinDate: "2023-03-10",
    lastActive: "2023-05-28T16:45:00Z",
  },
  {
    id: 4,
    name: "Gita Thapa",
    email: "gita.thapa@example.com",
    role: "admin",
    status: "active",
    joinDate: "2023-01-05",
    lastActive: "2023-06-15T10:20:00Z",
  },
  {
    id: 5,
    name: "Raj Shrestha",
    email: "raj.shrestha@example.com",
    role: "futsal_owner",
    status: "suspended",
    joinDate: "2023-04-22",
    lastActive: "2023-06-10T11:30:00Z",
  },
];

const statusVariantMap = {
  active: "default",
  inactive: "secondary",
  suspended: "destructive",
} as const;

const roleVariantMap = {
  admin: "default",
  futsal_owner: "outline",
  user: "secondary",
} as const;

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>
            <div className="flex gap-2">
              <select
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                value={selectedRole}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSelectedRole(e.target.value)
                }
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="futsal_owner">Futsal Owner</option>
                <option value="user">User</option>
              </select>
              <select
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                value={selectedStatus}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSelectedStatus(e.target.value)
                }
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        roleVariantMap[user.role as keyof typeof roleVariantMap]
                      }
                      className="capitalize"
                    >
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariantMap[user.status]}
                      className="capitalize"
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.joinDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(user.lastActive).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
