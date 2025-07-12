import { useState, useEffect, Suspense, lazy, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Copy, Share2, Check, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@ui/dialog";
import { Star, Phone } from "lucide-react";
import { Card, CardContent } from "@ui/card";
import { apiQuery, apiMutation } from "@lib/apiWrapper";
import { Badge } from "@ui/badge";
import TimePicker from "@ui/time-picker";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { Label } from "@ui/label";
import { toast } from "sonner";
import Loader from "@components/layoutComponents/Loader";
import Logo from "@assets/logos/Logo.svg";
import { useFavoritesStore } from "@/shared/store/favoritesStore";
import { useAuth } from "@/contexts/AuthContext";

const LeafletMap = lazy(() => import("@components/LeafletMap"));

const FutsalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [futsal, setFutsal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [imgTransition, setImgTransition] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    "left" | "right"
  >("right");
  const [showMapModal, setShowMapModal] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<
    { startTime: string; endTime: string }[]
  >([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState<Dayjs | null>(
    null,
  );
  const [selectedEndTime, setSelectedEndTime] = useState<Dayjs | null>(null);
  const [minTime, setMinTime] = useState<Dayjs | null>(null);
  const [maxTime, setMaxTime] = useState<Dayjs | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const bookingSectionRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorited } =
    useFavoritesStore();
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await apiQuery<any>(`futsals/${id}`);
        setFutsal(data.futsal);
      } catch (e) {
        setFutsal(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Fetch available slots when date or futsal changes
  useEffect(() => {
    if (!id || !selectedDate) return;
    setSlotLoading(true);
    apiQuery<{ bookedSlots: { startTime: string; endTime: string }[] }>(
      `bookings/available-slots?futsalId=${id}&date=${selectedDate}`,
    )
      .then((res) => setBookedSlots(res.bookedSlots))
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotLoading(false));
  }, [id, selectedDate]);

  // Set initial time values to today's opening and closing hours (new structure)
  useEffect(() => {
    if (!futsal || !selectedDate) return;
    const dateObj = new Date(selectedDate);
    const dayIdx = dateObj.getDay();
    let hours = null;
    if (futsal.operatingHours) {
      if (futsal.isHoliday && futsal.operatingHours.holidays) {
        hours = futsal.operatingHours.holidays;
      } else if (dayIdx === 0 || dayIdx === 6) {
        hours = futsal.operatingHours.weekends;
      } else {
        hours = futsal.operatingHours.weekdays;
      }
    }
    if (hours) {
      const open = dayjs(hours.open, "HH:mm");
      const close = dayjs(hours.close, "HH:mm");
      setSelectedStartTime(open);
      setSelectedEndTime(close);
      setMinTime(open);
      setMaxTime(close);
    }
  }, [futsal, selectedDate]);

  // Debug logs for min/max/selected times
  useEffect(() => {
    console.log("minTime:", minTime && minTime.format("HH:mm"));
    console.log("maxTime:", maxTime && maxTime.format("HH:mm"));
    console.log(
      "selectedStartTime:",
      selectedStartTime && selectedStartTime.format("HH:mm"),
    );
    console.log(
      "selectedEndTime:",
      selectedEndTime && selectedEndTime.format("HH:mm"),
    );
  }, [minTime, maxTime, selectedStartTime, selectedEndTime]);

  const handleBookNow = async () => {
    if (!isSlotValid()) return;
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await apiMutation({
        method: "POST",
        endpoint: "booking",
        body: {
          futsalId: futsal._id,
          date: selectedDate,
          startTime: selectedStartTime
            ? selectedStartTime.format("HH:mm")
            : undefined,
          endTime: selectedEndTime
            ? selectedEndTime.format("HH:mm")
            : undefined,
          bookingType: "full",
          teamA: true,
          teamB: true,
        },
      });
      setBooking(res.booking);
      setIsDialogOpen(true);
    } catch (e: any) {
      const errorMsg =
        e?.response?.data?.message || e.message || "Booking failed";
      setBookingError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!booking?._id) return;
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const res = await apiMutation({
        method: "POST",
        endpoint: `bookings/${booking._id}/initiate-payment`,
        body: {
          amount: booking.price ? booking.price * 100 : undefined,
          return_url: `${window.location.origin}/bookings/verify`,
        },
      });
      if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        setPaymentError("No payment URL returned");
        toast.error("No payment URL returned");
      }
    } catch (e: any) {
      const errorMsg =
        e?.response?.data?.message || e.message || "Payment initiation failed";
      setPaymentError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Helper to check overlap
  function isOverlap(start: Dayjs, end: Dayjs) {
    const result = bookedSlots.some((slot) => {
      const slotStart = dayjs(slot.startTime, "HH:mm");
      const slotEnd = dayjs(slot.endTime, "HH:mm");
      const overlap = start.isBefore(slotEnd) && end.isAfter(slotStart);
      if (overlap) {
        console.log("Overlap detected:", {
          start: start.format("HH:mm"),
          end: end.format("HH:mm"),
          slotStart: slotStart.format("HH:mm"),
          slotEnd: slotEnd.format("HH:mm"),
        });
      }
      return overlap;
    });
    console.log("isOverlap result:", result);
    return result;
  }

  // Handlers for time change
  function handleStartTimeChange(val: Dayjs | null) {
    setSelectedStartTime(val);
  }
  function handleEndTimeChange(val: Dayjs | null) {
    setSelectedEndTime(val);
  }
  function handleStartTimeAccept(val: Dayjs | null) {
    console.log(
      "handleStartTimeAccept called with:",
      val && val.format("HH:mm"),
    );
    if (!val || !selectedEndTime || !minTime || !maxTime) return;
    if (
      val.isBefore(minTime) ||
      val.isAfter(maxTime) ||
      val.isAfter(selectedEndTime)
    ) {
      console.log("Start time out of bounds:", {
        val: val.format("HH:mm"),
        minTime: minTime.format("HH:mm"),
        maxTime: maxTime.format("HH:mm"),
        selectedEndTime: selectedEndTime.format("HH:mm"),
      });
      return;
    }
    if (isOverlap(val, selectedEndTime)) {
      toast.error(
        "Selected slot overlaps with a booked slot. Please choose a different time.",
      );
      setSelectedStartTime(minTime);
      setSelectedEndTime(maxTime);
      return;
    }
  }
  function handleEndTimeAccept(val: Dayjs | null) {
    console.log("handleEndTimeAccept called with:", val && val.format("HH:mm"));
    if (!val || !selectedStartTime || !minTime || !maxTime) return;
    if (
      val.isAfter(maxTime) ||
      val.isBefore(minTime) ||
      val.isBefore(selectedStartTime)
    ) {
      console.log("End time out of bounds:", {
        val: val.format("HH:mm"),
        minTime: minTime.format("HH:mm"),
        maxTime: maxTime.format("HH:mm"),
        selectedStartTime: selectedStartTime.format("HH:mm"),
      });
      return;
    }
    const duration = Math.abs(val.diff(selectedStartTime, "minute"));
    console.log("Duration between start and end:", duration);
    if (![30, 60, 90, 120].includes(duration)) {
      toast.error("Slot duration must be 30, 60, 90, or 120 minutes.");
      setSelectedEndTime(maxTime);
      return;
    }
    if (isOverlap(selectedStartTime, val)) {
      toast.error(
        "Selected slot overlaps with a booked slot. Please choose a different time.",
      );
      setSelectedStartTime(minTime);
      setSelectedEndTime(maxTime);
      return;
    }
  }

  // Helper to check if slot is valid
  function isSlotValid() {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return false;
    const duration = Math.abs(
      selectedEndTime.diff(selectedStartTime, "minute"),
    );
    return [30, 60, 90, 120].includes(duration);
  }

  // Favorite state
  const isFutsalFavorited =
    futsal && isFavorited(futsal._id, user?.favoritesFutsal);

  // Handler for add/remove favorite
  const handleFavoriteClick = async () => {
    if (!futsal || !user) return;
    setFavLoading(true);
    if (isFutsalFavorited) {
      await removeFromFavorites(futsal._id, user, setUser);
    } else {
      await addToFavorites(futsal._id, user, setUser);
    }
    setFavLoading(false);
  };

  if (loading) {
    return <Loader />;
  }
  const handleShareClick = () => {
    setShowShareDialog(true);
    setIsCopied(false);
  };

  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL: ", err);
      toast.error("Failed to copy URL to clipboard");
    }
  };

  if (!futsal) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-muted">
        <div className="bg-card shadow-lg rounded-lg p-10 flex flex-col items-center w-full max-w-md">
          <img src={Logo} alt="PitchBook Logo" className="w-20 h-20 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-primary">
            Futsal Not Found
          </h2>
          <p className="text-muted-foreground mb-6 text-center">
            Sorry, we couldn't find the futsal you were looking for. It may have
            been removed or the link is incorrect.
          </p>
          <Button className="w-full" onClick={() => navigate("/futsals")}>
            Back to Futsals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="px-18 mx-auto p-5">
      <div className="flex flex-col">
        <div className="flex justify-between items-start my-5">
          <div>
            <h1 className="text-xl font-semibold text-primary">
              {futsal.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {futsal.location?.address ||
                futsal.location?.city ||
                "Location not available"}
              <span className="text-secondary ml-2 flex items-center">
                <Star size={16} /> {futsal.pricing?.avgRating || "-"} (
                {futsal.pricing?.reviewCount || 0} ratings)
              </span>{" "}
            </p>
          </div>
          <div className="flex gap-2">
            {user && user.role === "user" && (
              <Button
                variant={isFutsalFavorited ? "default" : "outline"}
                onClick={handleFavoriteClick}
                disabled={favLoading}
                className={
                  isFutsalFavorited ? "bg-primary text-primary-foreground" : ""
                }
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${isFutsalFavorited ? "fill-primary-foreground text-primary-foreground" : ""}`}
                />
                {favLoading
                  ? "Processing..."
                  : isFutsalFavorited
                    ? "Added to Favorites"
                    : "Add to Favorites"}
              </Button>
            )}
            <Button variant="outline" onClick={handleShareClick}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
            <Button variant="outline">Bulk / Corporate</Button>
            <Button
              className="text-primary-foreground"
              onClick={scrollToBooking}
            >
              Book Now
            </Button>
          </div>
        </div>
        <div className="flex gap-6">
          {/* Left Section */}
          <div className="flex-1">
            <div className="mb-4">
              <div className="relative w-full h-[68vh] mb-2 flex items-center justify-center">
                {/* Thumbnails on the top right */}
                {Array.isArray(futsal.images) && futsal.images.length > 1 && (
                  <div className="absolute top-4 right-4 flex gap-2 z-20 bg-background/80 rounded-md p-2 shadow">
                    {futsal.images.map((img: string, idx: number) => (
                      <img
                        key={img}
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className={`h-12 w-20 object-cover rounded cursor-pointer border-2 transition-all ${
                          idx === currentImageIdx
                            ? "border-accent shadow-lg"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => {
                          if (idx !== currentImageIdx) {
                            setTransitionDirection(
                              idx > currentImageIdx ? "right" : "left",
                            );
                            setImgTransition(true);
                            setTimeout(() => {
                              setCurrentImageIdx(idx);
                              setImgTransition(false);
                            }, 300);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
                {/* Left arrow */}
                {Array.isArray(futsal.images) && futsal.images.length > 1 && (
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 shadow hover:bg-background z-10"
                    onClick={() => {
                      setTransitionDirection("left");
                      setImgTransition(true);
                      setTimeout(() => {
                        setCurrentImageIdx((idx) =>
                          idx === 0 ? futsal.images.length - 1 : idx - 1,
                        );
                        setImgTransition(false);
                      }, 300);
                    }}
                  >
                    <span className="text-2xl">&#8592;</span>
                  </button>
                )}
                {/* Main image with slider effect */}
                <div className="relative w-full h-[68vh] overflow-hidden">
                  <img
                    src={
                      Array.isArray(futsal.images) && futsal.images.length > 0
                        ? futsal.images[currentImageIdx]
                        : "/images/futsals_page/search_img.jpg"
                    }
                    alt="Futsal Court"
                    className={`w-full h-[68vh] object-cover rounded-md absolute top-0 left-0 transition-transform duration-300 ${
                      imgTransition
                        ? transitionDirection === "right"
                          ? "translate-x-full"
                          : "-translate-x-full"
                        : "translate-x-0"
                    }`}
                    style={{ zIndex: 2 }}
                  />
                </div>
                {/* Right arrow */}
                {Array.isArray(futsal.images) && futsal.images.length > 1 && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 shadow hover:bg-background z-10"
                    onClick={() => {
                      setTransitionDirection("right");
                      setImgTransition(true);
                      setTimeout(() => {
                        setCurrentImageIdx((idx) =>
                          idx === futsal.images.length - 1 ? 0 : idx + 1,
                        );
                        setImgTransition(false);
                      }, 300);
                    }}
                  >
                    <span className="text-2xl">&#8594;</span>
                  </button>
                )}
              </div>
            </div>
            <Card className="p-4 mb-4 bg-popover">
              <h2 className="text-lg font-semibold text-primary mb-4">
                About Venue
              </h2>
              <p className="text-sm text-muted-foreground">
                {futsal.info || "No description available."}
              </p>
            </Card>
            <div
              ref={bookingSectionRef}
              className="bg-popover p-4 rounded-md shadow-md"
            >
              <h2 className="text-xl font-semibold text-primary mb-4">
                Book Your Slot
              </h2>
              {/* Date Picker and Selected Date */}
              <div className="flex items-center gap-4 mb-9 flex-wrap">
                <Label className="text-sm text-muted-foreground font-bold">
                  Select Date:
                </Label>
                <Input
                  type="date"
                  className="w-1/3"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              {/* Occupied Slots */}
              <div>
                <h3 className="font-semibold mb-4 text-md text-primary">
                  Occupied Slots
                </h3>
                {slotLoading ? (
                  <div className="text-muted-foreground text-sm">
                    Loading...
                  </div>
                ) : bookedSlots.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    No slots booked for this date.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {bookedSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-destructive/40 rounded-lg px-4 py-2 font-mono text-primary-foreground bg-destructive/40"
                      >
                        {slot.startTime} - {slot.endTime}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Select Your Slot */}
              <div className="my-4">
                <h3 className="font-bold mb-4 text-lg text-primary text-center">
                  Select Your Slot
                </h3>
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                  <div className="flex flex-col items-center">
                    <span className="mb-2 font-medium text-primary">
                      Start time:
                    </span>

                    <TimePicker
                      value={selectedStartTime}
                      onChange={handleStartTimeChange}
                      onAccept={handleStartTimeAccept}
                      minTime={minTime}
                      maxTime={maxTime}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="mb-2 font-medium text-primary">
                      End time:
                    </span>
                    <TimePicker
                      value={selectedEndTime}
                      onChange={handleEndTimeChange}
                      onAccept={handleEndTimeAccept}
                      minTime={minTime}
                      maxTime={maxTime}
                    />
                  </div>
                </div>
              </div>
              {/* Book Now Button */}
              <div className="flex justify-end mt-8">
                <Button
                  size="lg"
                  disabled={!isSlotValid()}
                  onClick={handleBookNow}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <Card className="w-1/3 h-fit p-4 border-none">
            <CardContent className="p-0">
              <div className="flex flex-col gap-4">
                <Card className="bg-popover p-4 gap-2">
                  <h2 className="text-lg font-semibold text-primary mt-4 mb-2">
                    Timing
                  </h2>
                  <div className="space-y-1 mb-4">
                    {futsal.operatingHours ? (
                      Object.entries(futsal.operatingHours).map(
                        ([day, hours]: any) => {
                          const todayIdx = new Date().getDay();
                          const days = [
                            "sunday",
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                          ];
                          const isToday = days[todayIdx] === day.toLowerCase();
                          return (
                            <div
                              key={day}
                              className={`flex gap-2 items-center rounded p-1.5 ${isToday ? "bg-accent font-bold text-accent-foreground" : ""}`}
                            >
                              <span className="font-medium w-24 capitalize">
                                {day}:
                              </span>
                              <span className="font-mono text-muted-foreground">
                                {hours.open} - {hours.close}
                              </span>
                              {isToday && (
                                <span className="ml-2 px-2 py-0.5 rounded bg-primary text-xs">
                                  Today
                                </span>
                              )}
                            </div>
                          );
                        },
                      )
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-primary mt-4 mb-2">
                    Amenities
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(futsal.amenities || [])
                      .filter((a: string) => a !== "basic futsal facilities")
                      .map((a: string) => (
                        <Badge
                          key={a}
                          className="text-sm font-medium px-3 py-1"
                        >
                          {a.charAt(0).toUpperCase() + a.slice(1)}
                        </Badge>
                      ))}
                  </div>
                </Card>
                <div className="bg-popover p-4 rounded-md shadow-md">
                  <h2 className="text-lg font-semibold text-primary mb-4">
                    Pricing
                  </h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-accent">
                        <th className="p-2 text-left">Day</th>
                        <th className="p-2 text-left">Price (NRS./hour)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {futsal.pricing?.rules?.map((rule: any) => {
                        const todayIdx = new Date().getDay();
                        const days = [
                          "sunday",
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                          "saturday",
                        ];
                        const isToday =
                          days[todayIdx] === rule.day.toLowerCase();
                        return (
                          <tr
                            key={rule._id}
                            className={
                              isToday
                                ? "bg-accent font-bold text-accent-foreground"
                                : ""
                            }
                          >
                            <td className="p-2">
                              {rule.day.charAt(0).toUpperCase() +
                                rule.day.slice(1)}
                              {isToday && (
                                <span className="ml-2 px-2 py-0.5 rounded bg-primary text-xs">
                                  Today
                                </span>
                              )}
                            </td>
                            <td className="p-2">
                              {rule.price.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <span>
                    Today's Price: Rs.{" "}
                    {futsal.pricing?.finalPrice?.toLocaleString()}
                  </span>
                </div>
                <div className="bg-popover p-4 rounded-md shadow-md">
                  <h2 className="text-lg font-semibold text-primary mb-2">
                    Location
                  </h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    {futsal.location?.address ||
                      futsal.location?.city ||
                      "Location not available"}
                  </p>
                  {/* Embed map preview with OpenStreetMap */}
                  {futsal.location?.coordinates?.coordinates &&
                    !showMapModal && (
                      <Suspense
                        fallback={
                          <div style={{ height: 200, width: "100%" }}>
                            Loading map...
                          </div>
                        }
                      >
                        <LeafletMap
                          center={[
                            futsal.location.coordinates.coordinates[1],
                            futsal.location.coordinates.coordinates[0],
                          ]}
                          zoom={16}
                          height={200}
                          width={"100%"}
                          markerLabel={futsal.name}
                        />
                      </Suspense>
                    )}
                  <button
                    className="text-success text-sm underline mt-2"
                    onClick={() => setShowMapModal(true)}
                  >
                    View larger map
                  </button>
                </div>
                <div className="bg-popover p-4 rounded-md shadow-md">
                  <h2 className="text-lg font-semibold text-primary mb-2">
                    Contact Information
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Phone size={16} className="mr-2" />{" "}
                    {futsal.contactInfo?.phone || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {futsal.location?.city || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog for Booking Confirmation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] z-50">
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              Please review your booking details and select a payment method.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Booking Details</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Futsal:</strong> {futsal.name}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Date:</strong> {selectedDate}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Time Slot:</strong>{" "}
                {selectedStartTime && selectedStartTime.format("HH:mm")} -{" "}
                {selectedEndTime && selectedEndTime.format("HH:mm")}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Price:</strong> Rs.{" "}
                {booking?.price?.toLocaleString() || booking?.price || "-"}
              </p>
            </div>
            <div className="my-5">
              <h3 className="text-lg font-semibold">Payment Options</h3>
              <Button
                className=" flex items-center justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-md p-5"
                disabled
              >
                <img
                  src="https://avatars.githubusercontent.com/u/31564639?s=280&v=4"
                  className="size-8"
                />
                Khalti
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className=" text-primary-foreground"
              onClick={handleProceedToPayment}
              disabled={paymentLoading}
            >
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="bg-card rounded-lg shadow-lg p-4 max-w-3xl w-full relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-primary text-xl font-bold"
              onClick={() => setShowMapModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Futsal Location</h2>
            {futsal.location?.coordinates?.coordinates && (
              <Suspense
                fallback={
                  <div style={{ height: 400, width: "100%" }}>
                    Loading map...
                  </div>
                }
              >
                <LeafletMap
                  center={[
                    futsal.location.coordinates.coordinates[1],
                    futsal.location.coordinates.coordinates[0],
                  ]}
                  zoom={16}
                  height={400}
                  width={"100%"}
                  markerLabel={futsal.name}
                />
              </Suspense>
            )}
          </div>
        </div>
      )}
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share this futsal</DialogTitle>
            <DialogDescription>
              Copy the link below to share this futsal with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input value={window.location.href} readOnly className="flex-1" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyToClipboard}
              className="h-10 w-10"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default FutsalDetailsPage;
