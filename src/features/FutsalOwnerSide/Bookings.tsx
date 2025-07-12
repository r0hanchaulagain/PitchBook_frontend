import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

// UI Components
import { Button } from "@ui/button";
import { Plus } from "lucide-react";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Badge } from "@ui/badge";
import { useFutsalBookings } from "@hooks/useFutsalBookings";
import type { Booking, FutsalBookingsResponse } from "@hooks/useFutsalBookings";
import { toast } from "sonner";
import { Calendar22 } from "@ui/date-picker";

const futsalId = import.meta.env.VITE_FUTSAL_ID;

function formatCurrency(amount: number) {
  return `Rs. ${amount?.toLocaleString()}`;
}

export default function Bookings() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useFutsalBookings({
    futsalId,
    date: selectedDate,
    page,
    limit: 10,
  });
  const bookingsData = data as FutsalBookingsResponse | undefined;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const bookingSchema = z.object({
    futsalId: z.string().min(1, "Futsal ID is required"),
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    bookingType: z.enum(["full", "partial"], {
      required_error: "Please select a booking type",
    }),
  });

  type BookingFormData = z.infer<typeof bookingSchema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      futsalId,
      date: selectedDate,
      bookingType: "full",
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      const requestBody = {
        ...data,
        price: 0,
        paymentStatus: "cash",
        // For full booking, set both teams to true
        ...(data.bookingType === "full" && {
          teamA: true,
          teamB: true,
        }),
      };

      const response = await fetch(
        `${import.meta.env.VITE_FRONT_PORT}/api/v1/bookings/cash`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      let responseData;
      const contentType = response.headers.get("content-type");

      // Only try to parse as JSON if the content-type is application/json
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      }

      if (!response.ok) {
        console.warn("Rohan");
        // Try to get error message from response
        let errorMessage = "Failed to create booking";

        try {
          // First try to get the message from responseData
          if (responseData) {
            errorMessage =
              responseData.message ||
              responseData.error?.message ||
              responseData.error ||
              JSON.stringify(responseData);
          } else {
            // If no responseData, try to get text from response
            const text = await response.text();
            try {
              // Try to parse as JSON
              const json = JSON.parse(text);
              errorMessage =
                json.message || json.error?.message || json.error || text;
            } catch {
              errorMessage =
                text || response.statusText || "Failed to create booking";
            }
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
          errorMessage = response.statusText || "Failed to create booking";
        }

        // Create error with the extracted message
        const error = new Error(errorMessage);
        // Attach the response data for better debugging
        (error as any).response = responseData;
        throw error;
      }

      // Invalidate the bookings query to refetch the data
      await queryClient.invalidateQueries({
        queryKey: [
          "futsalBookings",
          { futsalId, date: selectedDate, page, limit: 10 },
        ],
      });

      toast.success("Booking created successfully");
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      console.error("Booking error:", error);
      let errorMessage = "Failed to create booking";

      if (error instanceof Error) {
        // Use the error message directly since we've already processed it in the response handler
        errorMessage = error.message || "Failed to create booking";

        // If we have response data attached to the error, use that
        if ((error as any).response?.message) {
          errorMessage = (error as any).response.message;
        } else if ((error as any).response?.error) {
          errorMessage = (error as any).response.error;
        }
      }

      // Clean up the error message
      errorMessage = errorMessage.replace("Error: ", "").trim();

      // Show more specific error messages for common cases
      // Handle specific error messages from the API
      if (errorMessage.toLowerCase().includes("cannot book for past time")) {
        errorMessage =
          "Cannot book for past time. Please select a future time slot.";
      } else if (
        errorMessage.toLowerCase().includes("already booked") ||
        errorMessage.toLowerCase().includes("not available")
      ) {
        errorMessage =
          "This time slot is already booked. Please choose a different time.";
      } else if (errorMessage.toLowerCase().includes("validation")) {
        errorMessage = "Please check your input and try again.";
      } else if (
        errorMessage.toLowerCase().includes("token") ||
        errorMessage.toLowerCase().includes("auth") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        errorMessage = "Session expired. Please log in again.";
      } else if (errorMessage.toLowerCase().includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          Bookings for
          <div className="ml-2">
            <Calendar22
              date={new Date(selectedDate)}
              onDateChange={(date: Date) => {
                setSelectedDate(date.toISOString().split("T")[0]);
                setPage(1);
              }}
            />
          </div>
        </h2>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add a booking
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              setSelectedDate(today.toISOString().slice(0, 10));
              setPage(1);
            }}
            className="flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>Today</span>
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Booking</DialogTitle>
              <DialogDescription>
                Create a new cash booking. The payment will be marked as
                pending.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <div className="col-span-3">
                    <div
                      className={
                        errors.date ? "border border-red-500 rounded-md" : ""
                      }
                    >
                      <Calendar22
                        date={
                          watch("date") ? new Date(watch("date")) : undefined
                        }
                        onDateChange={(date: Date) => {
                          setValue("date", date.toISOString().split("T")[0], {
                            shouldValidate: true,
                          });
                        }}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.date.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">
                    Start Time
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="startTime"
                      type="time"
                      className={`${errors.startTime ? "border-red-500" : ""}`}
                      {...register("startTime")}
                    />
                    {errors.startTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.startTime.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">
                    End Time
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="endTime"
                      type="time"
                      className={`${errors.endTime ? "border-red-500" : ""}`}
                      {...register("endTime")}
                    />
                    {errors.endTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.endTime.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bookingType" className="text-right">
                    Booking Type
                  </Label>
                  <div className="col-span-3">
                    <Select
                      defaultValue="full"
                      onValueChange={(value: "full" | "partial") => {
                        // Update form value when select changes
                        register("bookingType").onChange({
                          target: { name: "bookingType", value },
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select booking type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Court</SelectItem>
                        <SelectItem value="partial">Partial Court</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.bookingType && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.bookingType.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Booking"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Slot Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error loading bookings.</div>
          ) : !bookingsData || bookingsData.bookings.length === 0 ? (
            <div>No bookings found for this date.</div>
          ) : (
            <div className="overflow-x-auto min-h-[450px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">S.N</th>
                    <th className="text-left py-3 px-4">Time Slot</th>
                    <th className="text-left py-3 px-4">Booked By</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsData.bookings.map(
                    (booking: Booking, index: number) => (
                      <tr
                        key={booking._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          {(bookingsData.page - 1) * bookingsData.limit +
                            index +
                            1}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {booking.startTime} - {booking.endTime}
                        </td>
                        <td className="py-3 px-4">{booking.user.fullName}</td>
                        <td className="py-3 px-4">
                          {formatCurrency(booking.price)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {new Date(booking.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Pagination Controls */}
      {bookingsData && bookingsData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <span>
            Page {bookingsData.page} of {bookingsData.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setPage((p) => Math.min(bookingsData.totalPages, p + 1))
            }
            disabled={page === bookingsData.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
