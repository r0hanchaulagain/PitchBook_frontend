import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog";
import { apiQuery, apiMutation } from "@/shared/lib/apiWrapper";
import { Button } from "@ui/button";
import { toast } from "sonner";

export function UserBookingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryLoadingId, setRetryLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    console.log("Fetching bookings...");
    apiQuery("bookings/me")
      .then((res: any) => {
        console.log("Bookings API response:", res);
        // The API returns { success, count, data } where data contains the bookings array
        const bookingsData = res?.data || [];
        console.log("Processed bookings data:", bookingsData);
        setBookings(bookingsData);
      })
      .catch((e: any) => {
        console.error("Error fetching bookings:", e);
        const errorMsg =
          e?.response?.data?.message || e.message || "Failed to fetch bookings";
        setError(errorMsg);
        toast.error(errorMsg);
      })
      .finally(() => setLoading(false));
  }, [open]);

  const handleRetryPayment = async (bookingId: string, price: number) => {
    setRetryLoadingId(bookingId);
    try {
      const res = await apiMutation({
        method: "POST",
        endpoint: `bookings/${bookingId}/initiate-payment`,
        body: {
          amount: price ? price * 100 : undefined,
          return_url: `${window.location.origin}/bookings/verify`,
        },
      });
      if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        setError("No payment URL returned");
        toast.error("No payment URL returned");
      }
    } catch (e: any) {
      const errorMsg =
        e?.response?.data?.message || e.message || "Payment initiation failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setRetryLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] min-h-[40vh] min-w-[50vw] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-foreground">My Bookings</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No bookings found.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col md:flex-row md:items-center bg-card rounded-lg shadow p-4 gap-4 w-full"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-primary text-lg truncate">
                    {booking.futsal?.name || "Futsal"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(booking.date).toLocaleDateString()} |{" "}
                    {booking.startTime} - {booking.endTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Status:{" "}
                    <span className="font-medium text-foreground">
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Payment:{" "}
                    <span className="font-medium text-foreground">
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end min-w-[100px] gap-2">
                  <div className="text-lg font-bold text-foreground">
                    Rs. {booking.price?.toLocaleString() || "-"}
                  </div>
                  {booking.status === "pending" &&
                    booking.paymentStatus === "pending" && (
                      <Button
                        variant="default"
                        size="sm"
                        disabled={retryLoadingId === booking._id}
                        onClick={() =>
                          handleRetryPayment(booking._id, booking.price)
                        }
                      >
                        {retryLoadingId === booking._id
                          ? "Processing..."
                          : "Retry Payment"}
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
