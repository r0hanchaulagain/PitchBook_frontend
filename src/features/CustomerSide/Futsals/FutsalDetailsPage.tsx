import { useState, useEffect, Suspense, lazy, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import {
  Copy,
  Share2,
  Check,
  Heart,
  Star as StarIcon,
  StarHalf,
  Trash2,
  Edit,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
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
import { Textarea } from "@ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Skeleton } from "@ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";


const LeafletMap = lazy(() => import("@components/LeafletMap"));

interface Review {
  _id: string;
  futsal: string;
  user: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  rating: number;
  feedback: string;
  createdAt: string | null;
  updatedAt?: string;
}

const FutsalDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [futsal, setFutsal] = useState<any>(null);
  const [isPartialBooking, setIsPartialBooking] = useState(false);
  const [playersNeeded, setPlayersNeeded] = useState(1);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<{
    id: string;
    userName: string;
  } | null>(null);
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
  const [, setBookingLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const bookingSectionRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useAuth() as {
    user: { _id: string; role: string; favoritesFutsal?: string[] } | null;
    setUser: (user: any) => void;
  };
  const { addToFavorites, removeFromFavorites, isFavorited } =
    useFavoritesStore();
  const [favLoading, setFavLoading] = useState(false);

  // Bulk booking state
  const [showBulkBookingDialog, setShowBulkBookingDialog] = useState(false);
  const [bulkBookingData, setBulkBookingData] = useState({
    startDate: "",
    numberOfDays: 1,
  });
  const [bulkBookingLoading, setBulkBookingLoading] = useState(false);

  useEffect(() => {
    // Check URL for partial booking parameter
    const params = new URLSearchParams(window.location.search);
    const isPartial = params.get('partial') === 'true';
    setIsPartialBooking(isPartial);

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await apiQuery<any>(`futsals/${id}`);
        setFutsal(data.futsal);
        if (isPartial) {
          // Set default players needed for partial booking
          setPlayersNeeded(Math.ceil((data.futsal.capacity || 10) / 2));
        }
      } catch (e) {
        setFutsal(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

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

  useEffect(() => {
    if (!id) return;

    const timestamp = Date.now();
    const fetchData = async () => {
      try {
        setLoadingReviews(true);
        const response = await apiQuery<{
          reviews: Review[];
          total: number;
          page: number;
          limit: number;
        }>(`reviews/${id}?page=${page}&limit=5&_t=${timestamp}`);

        const data = {
          reviews: response.reviews,
          pagination: {
            total: response.total,
            pages: Math.ceil(response.total / response.limit),
          },
        };

        setReviews((prev) =>
          page === 1 ? data.reviews : [...prev, ...data.reviews],
        );
        setTotalPages(data.pagination.pages);
        setHasMore(page < data.pagination.pages);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchData();

    return () => {
      setReviews([]);
      setPage(1);
    };
  }, [id, page]);

  const fetchReviews = async (invalidateCache = false) => {
    if (!id) return;

    try {
      setLoadingReviews(true);
      const response = await apiQuery<{
        reviews: Review[];
        total: number;
        page: number;
        limit: number;
      }>(
        `reviews/${id}?page=${page}&limit=5${invalidateCache ? `&_t=${Date.now()}` : ""}`,
      );

      const data = {
        reviews: response.reviews,
        pagination: {
          total: response.total,
          pages: Math.ceil(response.total / response.limit),
        },
      };

      if (page === 1 || invalidateCache) {
        setReviews(data.reviews);
      } else {
        setReviews((prev) => {
          const existingIds = new Set(prev.map((r) => r._id));
          const newReviews = data.reviews.filter(
            (r) => !existingIds.has(r._id),
          );
          return [...prev, ...newReviews];
        });
      }

      setTotalPages(data.pagination.pages);
      setHasMore(page < data.pagination.pages);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reviewText.trim() || !user) return;

    try {
      setSubmittingReview(true);
      const endpoint = editingReviewId
        ? `reviews/${editingReviewId}`
        : "reviews";
      const method = editingReviewId ? "PUT" : "POST";

      const response = await apiMutation<{ review: Review }>({
        method,
        endpoint,
        body: editingReviewId
          ? { rating: reviewRating, feedback: reviewText }
          : { futsalId: id, rating: reviewRating, feedback: reviewText },
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      setPage(1);
      await fetchReviews();

      if (editingReviewId) {
        setReviews((prev) =>
          prev.map((review) =>
            review._id === editingReviewId
              ? { ...response.review, user: { ...review.user } }
              : review,
          ),
        );
      } else {
        setReviews((prev) => [response.review, ...prev]);
      }

      toast.success(
        editingReviewId
          ? "Review updated successfully"
          : "Review submitted successfully",
      );
      setReviewText("");
      setReviewRating(5);
      setEditingReviewId(null);

      await queryClient.invalidateQueries({
        queryKey: ["reviews", id],
        refetchType: "active",
      });
    } catch (error: any) {
      console.error("Error submitting review:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit review";
      toast.error(errorMessage);
      await fetchReviews();
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setReviewText(review.feedback);
    setReviewRating(review.rating);
    setEditingReviewId(review._id);
    document
      .getElementById("review-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete || !id) return;

    try {
      const reviewToDeleteId = reviewToDelete.id;
      setReviews((prev) =>
        prev.filter((review) => review._id !== reviewToDeleteId),
      );

      await apiMutation({
        method: "DELETE",
        endpoint: `reviews/${reviewToDeleteId}`,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      toast.success("Review deleted successfully");

      await fetchReviews();

      await queryClient.invalidateQueries({
        queryKey: ["reviews", id],
        refetchType: "active",
      });
    } catch (error: any) {
      console.error("Error deleting review:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete review";
      toast.error(errorMessage);
      await fetchReviews();
    } finally {
      setReviewToDelete(null);
    }
  };

  const openDeleteDialog = (reviewId: string, userName: string) => {
    setReviewToDelete({ id: reviewId, userName });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <StarIcon
            key={i}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />,
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf
            key={i}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />,
        );
      } else {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return <div className="flex">{stars}</div>;
  };

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

  const handleBooking = async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime || !futsal?._id) {
      toast.error("Please select date and time slot");
      return;
    }

    if (isPartialBooking && playersNeeded < 1) {
      toast.error("Please specify the number of players needed");
      return;
    }

    setBookingLoading(true);
    try {
      const endpoint = isPartialBooking ? "bookings/initiate" : "bookings";
      const response = await apiMutation({
        method: "POST",
        endpoint,
        body: {
          futsalId: futsal._id,
          date: selectedDate,
          startTime: selectedStartTime.format("HH:mm"),
          endTime: selectedEndTime.format("HH:mm"),
          bookingType: isPartialBooking ? "partial" : "full",
          teamA: true, // Required for both full and partial booking
          teamB: !isPartialBooking, // true for full booking, false for partial
          ...(isPartialBooking && { playersNeeded })
        },
      });

      // Log the full response for debugging
      console.log('Booking API Response:', response);
      
      // Check for success in various possible response formats
      const isSuccess = 
        response?._id || // Direct booking object
        response?.data?._id || // Nested in data property
        response?.booking?._id || // Nested in booking property
        response?.success === true; // Explicit success flag
      
      if (isSuccess) {
        // Use the response in this order of preference
        const bookingData = response.booking || response.data || response;
        setBooking(bookingData);
        
        if (isPartialBooking) {
          // For partial bookings, just show success message and don't open payment dialog
          toast.success("Your game session has been created! Others can now join your game.");
          // Reset form or navigate away if needed
          setSelectedDate("");
          setSelectedStartTime(null);
          setSelectedEndTime(null);
        } else {
          // For full bookings, open payment dialog
          setIsDialogOpen(true);
          toast.success("Booking created successfully! Please complete your payment.");
        }
      } else {
        console.error("Booking response indicates failure:", response);
        const errorMessage = response?.message || 
                           response?.error || 
                           response?.data?.message || 
                           "Failed to create booking";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create booking";
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!booking?._id) return;
    setPaymentLoading(true);
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
        toast.error("No payment URL returned");
      }
    } catch (e: any) {
      const errorMsg =
        e?.response?.data?.message ||
        e.message ||
        "Payment initiation failed";
      toast.error(errorMsg);
    } finally {
      setPaymentLoading(false);
    }
  };

  function isOverlap(start: Dayjs, end: Dayjs) {
    return bookedSlots.some((slot) => {
      const slotStart = dayjs(slot.startTime, "HH:mm");
      const slotEnd = dayjs(slot.endTime, "HH:mm");
      const overlap = start.isBefore(slotEnd) && end.isAfter(slotStart);
      return overlap;
    });
  }

  function handleStartTimeChange(val: Dayjs | null) {
    setSelectedStartTime(val);
  }
  function handleEndTimeChange(val: Dayjs | null) {
    setSelectedEndTime(val);
  }
  function handleStartTimeAccept(val: Dayjs | null) {
    if (!val || !selectedEndTime || !minTime || !maxTime) return;
    if (
      val.isBefore(minTime) ||
      val.isAfter(maxTime) ||
      val.isAfter(selectedEndTime)
    ) {
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
    if (!val || !selectedStartTime || !minTime || !maxTime) return;
    if (
      val.isAfter(maxTime) ||
      val.isBefore(minTime) ||
      val.isBefore(selectedStartTime)
    ) {
      return;
    }
    const duration = Math.abs(val.diff(selectedStartTime, "minute"));

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

  function isSlotValid() {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return false;
    const duration = Math.abs(
      selectedEndTime.diff(selectedStartTime, "minute"),
    );
    return [30, 60, 90, 120].includes(duration);
  }

  const isFutsalFavorited =
    futsal && isFavorited(futsal._id, user?.favoritesFutsal);

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

  const handleBulkBooking = async () => {
    if (!futsal?._id || !bulkBookingData.startDate || bulkBookingData.numberOfDays < 1) {
      toast.error("Please fill in all required fields");
      return;
    }

    setBulkBookingLoading(true);
    try {
      const response = await apiMutation({
        method: "POST",
        endpoint: "bookings/bulk-with-payment",
        body: {
          futsalId: futsal._id,
          startDate: bulkBookingData.startDate,
          numberOfDays: bulkBookingData.numberOfDays,
          bookingType: "full",
        },
      });

      // Check for payment URL to determine success for bulk booking
      if (response.paymentUrl) {
        toast.success("Bulk booking created successfully! Redirecting to payment...");
        setShowBulkBookingDialog(false);
        setBulkBookingData({
          startDate: "",
          numberOfDays: 1,
        });
        
        // Redirect to payment URL
        window.location.href = response.paymentUrl;
      } else {
        console.error("Unexpected bulk booking response:", response);
        toast.error("Bulk booking was created but there was an issue with the payment URL");
      }
    } catch (error: any) {
      console.error("Error creating bulk booking:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create bulk booking";
      toast.error(errorMessage);
    } finally {
      setBulkBookingLoading(false);
    }
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
        <div className="bg-card shadow-lg rounded-lg p-6 sm:p-8 md:p-10 flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md">
          <img src={Logo} alt="PitchBook Logo" className="w-16 h-16 sm:w-20 sm:h-20 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-primary">
            Futsal Not Found
          </h2>
          <p className="text-muted-foreground mb-6 text-center text-sm sm:text-base">
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
    <main className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6">
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-4 sm:my-5 gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">
              {futsal.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1">
              {futsal.location?.address ||
                futsal.location?.city ||
                "Location not available"}
              <span className="text-secondary flex items-center">
                <Star size={14} className="ml-1 mr-1" /> {futsal.pricing?.avgRating || "-"} (
                {futsal.pricing?.reviewCount || 0} ratings)
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user && user.role === "user" && (
              <Button
                variant={isFutsalFavorited ? "default" : "outline"}
                onClick={handleFavoriteClick}
                disabled={favLoading}
                className={`h-8 sm:h-10 text-xs sm:text-sm ${isFutsalFavorited ? "bg-primary text-primary-foreground" : ""}`}
              >
                <Heart
                  className={`h-4 w-4 mr-1 sm:mr-2 ${isFutsalFavorited ? "fill-primary-foreground text-primary-foreground" : ""}`}
                />
                {favLoading
                  ? "Processing..."
                  : isFutsalFavorited
                    ? "Added to Favorites"
                    : "Add to Favorites"}
              </Button>
            )}
            <Button variant="outline" onClick={handleShareClick} className="h-8 sm:h-10 text-xs sm:text-sm">
              <Share2 className="h-4 w-4 mr-1 sm:mr-2" /> Share
            </Button>
            <Button
              variant="outline" 
              onClick={() => setShowBulkBookingDialog(true)} 
              className="h-8 sm:h-10 text-xs sm:text-sm"
            >
              <Users className="h-4 w-4 mr-1 sm:mr-2" />
              Bulk / Corporate
            </Button>
            <Button
              className="text-primary-foreground h-8 sm:h-10 text-xs sm:text-sm"
              onClick={scrollToBooking}
            >
              Book Now
            </Button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Left Section */}
          <div className="flex-1">
            <div className="mb-4">
              <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[68vh] mb-2 flex items-center justify-center">
                {Array.isArray(futsal.images) && futsal.images.length > 1 && (
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2 z-20 bg-background/80 rounded-md p-1 sm:p-2 shadow">
                    {futsal.images.map((img: string, idx: number) => (
                      <img
                        key={img}
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className={`h-10 sm:h-12 w-16 sm:w-20 object-cover rounded cursor-pointer border-2 transition-all ${
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
                {Array.isArray(futsal.images) && futsal.images.length > 1 && (
                  <button
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1 sm:p-2 shadow hover:bg-background z-10"
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
                    <span className="text-xl sm:text-2xl">←</span>
                  </button>
                )}
                <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[68vh] overflow-hidden">
                  <img
                    src={
                      Array.isArray(futsal.images) && futsal.images.length > 0
                        ? futsal.images[currentImageIdx]
                        : "/images/futsals_page/search_img.jpg"
                    }
                    alt="Futsal Court"
                    className={`w-full h-full object-cover rounded-md absolute top-0 left-0 transition-transform duration-300 ${
                      imgTransition
                        ? transitionDirection === "right"
                          ? "translate-x-full"
                          : "-translate-x-full"
                        : "translate-x-0"
                    }`}
                    style={{ zIndex: 2 }}
                  />
                </div>
                {Array.isArray(futsal.images) && futsal.images.length > 1 && (
                  <button
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1 sm:p-2 shadow hover:bg-background z-10"
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
                    <span className="text-xl sm:text-2xl">→</span>
                  </button>
                )}
              </div>
            </div>
            <Card className="p-4 sm:p-6 mb-4 bg-popover">
              <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">
                About Venue
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {futsal.info || "No description available."}
              </p>
            </Card>
            <div
              ref={bookingSectionRef}
              className="bg-popover p-4 sm:p-6 rounded-md shadow-md"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">
                Book Your Slot
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-9 flex-wrap">
                <Label className="text-sm font-bold text-muted-foreground">
                  Select Date:
                </Label>
                <Input
                  type="date"
                  className="w-full sm:w-1/3"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-md sm:text-lg text-primary">
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
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {bookedSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-destructive/40 rounded-lg px-3 sm:px-4 py-1 sm:py-2 font-mono text-primary-foreground bg-destructive/40 text-xs sm:text-sm"
                      >
                        {slot.startTime} - {slot.endTime}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="my-4 sm:my-6">
                <h3 className="font-bold mb-4 text-lg sm:text-xl text-primary text-center">
                  Select Your Slot
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                  <div className="flex flex-col items-center w-full sm:w-auto">
                    <span className="mb-2 font-medium text-primary text-sm sm:text-base">
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
                  <div className="flex flex-col items-center w-full sm:w-auto">
                    <span className="mb-2 font-medium text-primary text-sm sm:text-base">
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
              <div className="flex justify-end mt-6 sm:mt-8">
                <Button
                  size="lg"
                  disabled={!isSlotValid()}
                  onClick={handleBooking}
                  className="w-full sm:w-auto"
                >
                  {isPartialBooking 
                    ? "Create Game Session" 
                    : "Book Now"}
                </Button>
              </div>
              {isPartialBooking && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="playersNeeded">Players Needed</Label>
                  <Input
                    id="playersNeeded"
                    type="number"
                    min="1"
                    max={futsal?.capacity || 10}
                    value={playersNeeded}
                    onChange={(e) => setPlayersNeeded(parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    How many more players do you need? (Max: {futsal?.capacity || 10 - 1})
                  </p>
                </div>
              )}
            </div>
            <div className="mt-8 sm:mt-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">Reviews</h2>
              {user && user.role === "user" && (
                <Card id="review-form" className="p-4 sm:p-6 mb-6 sm:mb-8 bg-popover">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">
                    {editingReviewId ? "Edit Your Review" : "Write a Review"}
                  </h3>
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <span className="mr-2 text-sm font-medium">
                          Rating:
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <StarIcon
                                className={`w-5 sm:w-6 h-5 sm:h-6 ${
                                  star <= reviewRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience at this futsal..."
                        className="min-h-[100px] sm:min-h-[120px]"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      {editingReviewId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingReviewId(null);
                            setReviewText("");
                            setReviewRating(5);
                          }}
                          disabled={submittingReview}
                          className="h-8 sm:h-10 text-xs sm:text-sm"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" disabled={submittingReview} className="h-8 sm:h-10 text-xs sm:text-sm">
                        {submittingReview
                          ? "Submitting..."
                          : editingReviewId
                            ? "Update Review"
                            : "Submit Review"}
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
              <div className="space-y-4 sm:space-y-6">
                {loadingReviews && page === 1 ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="p-4 sm:p-6">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <Skeleton className="h-8 sm:h-10 w-8 sm:w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24 sm:w-32" />
                            <Skeleton className="h-4 w-20 sm:w-24" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      </Card>
                    ))
                ) : reviews.length > 0 ? (
                  <>
                    {reviews.map((review) => (
                      <Card key={review._id} className="p-4 sm:p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3 mb-2">
                            <Avatar className="h-8 sm:h-10 w-8 sm:w-10">
                              <AvatarImage
                                src={review.user.avatar}
                                alt={review.user.fullName}
                              />
                              <AvatarFallback>
                                {review.user.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
            <div>
                              <h4 className="font-medium text-sm sm:text-base">
                                {review.user.fullName}
                              </h4>
                              <div className="flex items-center flex-wrap">
                                {renderStars(review.rating)}
                                {review.createdAt && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {new Date(
                                      review.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {user?._id === review.user._id && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="text-muted-foreground hover:text-primary"
                                title="Edit review"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteDialog(
                                    review._id,
                                    review.user.fullName,
                                  );
                                }}
                                className="text-muted-foreground hover:text-destructive"
                                title="Delete review"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">
                          {review.feedback}
                        </p>
                      </Card>
                    ))}
                    {hasMore && (
                      <div className="flex justify-center mt-4 sm:mt-6">
                        <Button
                          variant="outline"
                          onClick={handleLoadMore}
                          disabled={loadingReviews}
                          className="h-8 sm:h-10 text-xs sm:text-sm"
                        >
                          {loadingReviews ? "Loading..." : "Load More Reviews"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
                    No reviews yet. Be the first to review!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <Card className="w-full lg:w-1/3 h-fit p-4 border-none mt-4 lg:mt-0">
            <CardContent className="p-0 space-y-4">
              <Card className="bg-popover p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">
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
                            className={`flex gap-2 items-center rounded p-1 sm:p-1.5 text-sm sm:text-base ${
                              isToday ? "bg-accent font-bold text-accent-foreground" : ""
                            }`}
                            >
                            <span className="font-medium w-20 sm:w-24 capitalize">
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
                    <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </div>
                <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">
                    Amenities
                  </h2>
                <div className="flex flex-wrap gap-2">
                    {(futsal.amenities || [])
                      .filter((a: string) => a !== "basic futsal facilities")
                      .map((a: string) => (
                        <Badge
                          key={a}
                        className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1"
                        >
                          {a.charAt(0).toUpperCase() + a.slice(1)}
                        </Badge>
                      ))}
                  </div>
                </Card>
              <div className="bg-popover p-4 sm:p-6 rounded-md shadow-md">
                <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">
                    Pricing
                  </h2>
                <span className="text-sm sm:text-base">
                    Today's Price: Rs.{" "}
                    {futsal.pricing?.finalPrice?.toLocaleString()}
                  </span>
                </div>
              <div className="bg-popover p-4 sm:p-6 rounded-md shadow-md">
                <h2 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                    Location
                  </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-2">
                    {futsal.location?.address ||
                      futsal.location?.city ||
                      "Location not available"}
                  </p>
                  {futsal.location?.coordinates?.coordinates &&
                    !showMapModal && (
                      <Suspense
                        fallback={
                        <div className="h-40 sm:h-48 w-full">
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
                  className="text-success text-sm sm:text-base underline mt-2"
                    onClick={() => setShowMapModal(true)}
                  >
                    View larger map
                  </button>
                </div>
              <div className="bg-popover p-4 sm:p-6 rounded-md shadow-md">
                <h2 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                    Contact Information
                  </h2>
                <p className="text-sm sm:text-base text-muted-foreground flex items-center">
                  <Phone size={14} className="mr-2" />{" "}
                    {futsal.contactInfo?.phone || "N/A"}
                  </p>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    {futsal.location?.city || "N/A"}
                  </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog for Booking Confirmation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[425px] z-50">
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              Please review your booking details and select a payment method.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Booking Details</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <strong>Futsal:</strong> {futsal.name}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <strong>Date:</strong> {selectedDate}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <strong>Time Slot:</strong>{" "}
                {selectedStartTime && selectedStartTime.format("HH:mm")} -{" "}
                {selectedEndTime && selectedEndTime.format("HH:mm")}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <strong>Price:</strong> Rs.{" "}
                {booking?.price?.toLocaleString() || booking?.price || "-"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-8 sm:h-10 text-xs sm:text-sm">
              Cancel
            </Button>
            <Button
              className="!bg-purple-900 text-primary-foreground h-8 sm:h-10 text-xs sm:text-sm"
              onClick={handleProceedToPayment}
              disabled={paymentLoading}
            >
               <img
                  src="https://avatars.githubusercontent.com/u/31564639?s=280&v=4"
                  className="size-6 sm:size-8"
                />
              Pay with Khalti
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 max-w-[90vw] sm:max-w-3xl w-full relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-primary text-lg sm:text-xl font-bold"
              onClick={() => setShowMapModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Futsal Location</h2>
            {futsal.location?.coordinates?.coordinates && (
              <Suspense
                fallback={
                  <div className="h-64 sm:h-96 w-full">
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
                  height={300}
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
        <DialogContent className="sm:max-w-[90vw] md:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share this futsal</DialogTitle>
            <DialogDescription>
              Copy the link below to share this futsal with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input value={window.location.href} readOnly className="flex-1 text-xs sm:text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyToClipboard}
              className="h-8 sm:h-10 w-8 sm:w-10"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)} className="h-8 sm:h-10 text-xs sm:text-sm">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!reviewToDelete}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
      >
        <DialogContent className="sm:max-w-[90vw] md:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review by:{" "}
              <span className="font-medium">{reviewToDelete?.userName}</span>
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setReviewToDelete(null)}
              disabled={submittingReview}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={submittingReview}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            >
              {submittingReview ? "Deleting..." : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Booking Dialog */}
      <Dialog open={showBulkBookingDialog} onOpenChange={setShowBulkBookingDialog}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk / Corporate Booking
            </DialogTitle>
            <DialogDescription>
              Book multiple days for corporate events, tournaments, or extended bookings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={bulkBookingData.startDate}
                onChange={(e) => setBulkBookingData(prev => ({
                  ...prev,
                  startDate: e.target.value
                }))}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfDays" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Number of Days *
              </Label>
              <Input
                id="numberOfDays"
                type="number"
                min="1"
                max="30"
                value={bulkBookingData.numberOfDays}
                onChange={(e) => setBulkBookingData(prev => ({
                  ...prev,
                  numberOfDays: parseInt(e.target.value) || 1
                }))}
                className="w-full"
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum 30 days allowed
              </p>
            </div>



            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Futsal:</strong> {futsal?.name}</p>
                <p><strong>Start Date:</strong> {bulkBookingData.startDate || "Not selected"}</p>
                <p><strong>Duration:</strong> {bulkBookingData.numberOfDays} day{bulkBookingData.numberOfDays !== 1 ? 's' : ''}</p>
                <p><strong>Type:</strong> Full Day</p>
                {bulkBookingData.startDate && bulkBookingData.numberOfDays > 0 && (
                  <p><strong>End Date:</strong> {
                    new Date(
                      new Date(bulkBookingData.startDate).getTime() + 
                      (bulkBookingData.numberOfDays - 1) * 24 * 60 * 60 * 1000
                    ).toISOString().slice(0, 10)
                  }</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBulkBookingDialog(false)}
              disabled={bulkBookingLoading}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkBooking}
              disabled={bulkBookingLoading || !bulkBookingData.startDate || bulkBookingData.numberOfDays < 1}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            >
              {bulkBookingLoading ? "Creating Booking..." : "Create Bulk Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default FutsalDetailsPage;