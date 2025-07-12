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
import { Search, Calendar, Eye } from "lucide-react";
import { useState } from "react";

// Types
interface Booking {
  id: number;
  futsalName: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: "confirmed" | "completed" | "cancelled" | "pending";
  paymentStatus: "paid" | "pending" | "refunded" | "failed";
  bookingDate: string;
}

// Mock data - Will be replaced with API calls
const mockBookings: Booking[] = [
  {
    id: 1,
    futsalName: "Champions Arena",
    userName: "Ram Sharma",
    date: "2023-06-20",
    startTime: "14:00",
    endTime: "15:30",
    duration: 1.5,
    totalAmount: 3000,
    status: "confirmed",
    paymentStatus: "paid",
    bookingDate: "2023-06-18T10:30:00Z",
  },
  {
    id: 2,
    futsalName: "Victory Ground",
    userName: "Sita Patel",
    date: "2023-06-21",
    startTime: "16:00",
    endTime: "18:00",
    duration: 2,
    totalAmount: 3600,
    status: "pending",
    paymentStatus: "pending",
    bookingDate: "2023-06-19T11:15:00Z",
  },
  {
    id: 3,
    futsalName: "Star Sports Complex",
    userName: "Hari Gurung",
    date: "2023-06-19",
    startTime: "09:00",
    endTime: "10:00",
    duration: 1,
    totalAmount: 2200,
    status: "completed",
    paymentStatus: "paid",
    bookingDate: "2023-06-17T14:20:00Z",
  },
  {
    id: 4,
    futsalName: "Elite Futsal",
    userName: "Gita Thapa",
    date: "2023-06-20",
    startTime: "19:00",
    endTime: "21:00",
    duration: 2,
    totalAmount: 5000,
    status: "cancelled",
    paymentStatus: "refunded",
    bookingDate: "2023-06-16T16:45:00Z",
  },
  {
    id: 5,
    futsalName: "Prime Sports",
    userName: "Raj Shrestha",
    date: "2023-06-22",
    startTime: "11:00",
    endTime: "12:30",
    duration: 1.5,
    totalAmount: 2850,
    status: "confirmed",
    paymentStatus: "paid",
    bookingDate: "2023-06-19T09:10:00Z",
  },
];

const statusVariantMap = {
  confirmed: "default",
  completed: "secondary",
  cancelled: "destructive",
  pending: "outline",
} as const;

const paymentStatusVariantMap = {
  paid: "default",
  pending: "outline",
  refunded: "secondary",
  failed: "destructive",
} as const;

const Bookings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.futsalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || booking.status === selectedStatus;
    const matchesDate = !selectedDate || booking.date === selectedDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentItems = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Booking Management
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Filter by Date
          </Button>
          <Button>Export Report</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search bookings..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDate("");
                    setCurrentPage(1);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Futsal</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>#{booking.id}</TableCell>
                    <TableCell className="font-medium">
                      {booking.futsalName}
                    </TableCell>
                    <TableCell>{booking.userName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(booking.date)}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(booking.startTime)} -{" "}
                          {formatTime(booking.endTime)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.duration} hr{booking.duration > 1 ? "s" : ""}
                    </TableCell>
                    <TableCell>
                      Rs. {booking.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariantMap[booking.status]}
                        className="capitalize"
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={paymentStatusVariantMap[booking.paymentStatus]}
                        className="capitalize"
                      >
                        {booking.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredBookings.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredBookings.length}</span>{" "}
                bookings
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Bookings;
