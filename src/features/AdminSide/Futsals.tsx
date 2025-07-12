import { Card, CardContent, CardHeader } from "@ui/card";
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
import { Badge } from "@ui/badge";
import {
  Search,
  MapPin,
  Star,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { useState } from "react";

// Types
interface Futsal {
  id: number;
  name: string;
  location: string;
  rating: number;
  pricePerHour: number;
  status: "active" | "pending" | "rejected" | "suspended";
  owner: string;
  contact: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data - Will be replaced with API calls
const mockFutsals: Futsal[] = [
  {
    id: 1,
    name: "Champions Arena",
    location: "Lalitpur",
    rating: 4.8,
    pricePerHour: 2000,
    status: "active",
    owner: "Sita Patel",
    contact: "9841122334",
    createdAt: "2023-01-15",
    updatedAt: "2023-06-10",
  },
  {
    id: 2,
    name: "Victory Ground",
    location: "Kathmandu",
    rating: 4.7,
    pricePerHour: 1800,
    status: "active",
    owner: "Raj Shrestha",
    contact: "9851122334",
    createdAt: "2023-02-20",
    updatedAt: "2023-06-12",
  },
  {
    id: 3,
    name: "Star Sports Complex",
    location: "Bhaktapur",
    rating: 4.6,
    pricePerHour: 2200,
    status: "pending",
    owner: "Hari Gurung",
    contact: "9861122334",
    createdAt: "2023-03-10",
    updatedAt: "2023-06-14",
  },
  {
    id: 4,
    name: "Elite Futsal",
    location: "Kathmandu",
    rating: 4.5,
    pricePerHour: 2500,
    status: "suspended",
    owner: "Gita Thapa",
    contact: "9871122334",
    createdAt: "2023-04-05",
    updatedAt: "2023-06-05",
  },
  {
    id: 5,
    name: "Prime Sports",
    location: "Lalitpur",
    rating: 4.4,
    pricePerHour: 1900,
    status: "active",
    owner: "Ram Sharma",
    contact: "9881122334",
    createdAt: "2023-05-22",
    updatedAt: "2023-06-15",
  },
];

const statusVariantMap = {
  active: "default",
  pending: "secondary",
  rejected: "destructive",
  suspended: "outline",
} as const;

const Futsals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const locations = Array.from(new Set(mockFutsals.map((f) => f.location)));

  const filteredFutsals = mockFutsals.filter((futsal) => {
    const matchesSearch =
      futsal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      futsal.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || futsal.status === selectedStatus;
    const matchesLocation =
      selectedLocation === "all" || futsal.location === selectedLocation;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Futsal Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Futsal
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search futsals..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <select
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
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
                <TableHead>Location</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Price/Hour</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFutsals.map((futsal) => (
                <TableRow key={futsal.id}>
                  <TableCell className="font-medium">{futsal.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {futsal.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{futsal.owner}</span>
                      <span className="text-xs text-muted-foreground">
                        {futsal.contact}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    Rs. {futsal.pricePerHour.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {futsal.rating}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariantMap[futsal.status]}
                      className="capitalize"
                    >
                      {futsal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {new Date(futsal.createdAt).toLocaleDateString()}
                    </div>
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

export default Futsals;
