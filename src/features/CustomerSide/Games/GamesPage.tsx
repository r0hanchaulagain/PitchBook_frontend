import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Slider } from "@/shared/components/ui/slider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { apiQuery, apiMutation } from "@/shared/lib/apiWrapper";
import { toast } from "sonner";
import { format } from "date-fns";
import { MapPin, MapPinOff, Search } from "lucide-react";

interface FutsalLocation {
  coordinates: [number, number];
  address: string;
  city: string;
}

interface Futsal {
  _id: string;
  name: string;
  location: FutsalLocation;
}

export interface PartialBooking {
  _id: string;
  futsal: Futsal | string; // Can be string if populated or just ID
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  teamA: boolean;
  teamB: boolean;
  bookingType: "partial" | "full";
  status: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export default function GamesPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<PartialBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);
  const [radius, setRadius] = useState(5); // Default 5km radius
  const [isLocating, setIsLocating] = useState(false);
  const [sliderValue, setSliderValue] = useState(5);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPartialBookings = useCallback(
    async (location?: { lat: number; lng: number }, searchRadius = radius) => {
      try {
        setLoading(true);
        console.log("Fetching partial bookings...");

        let endpoint = "bookings/partial";
        const params = new URLSearchParams();

        if (location) {
          params.append("lat", location.lat.toString());
          params.append("lng", location.lng.toString());
          params.append("radius", searchRadius.toString());
          endpoint += `?${params.toString()}`;
        }

        const response = await apiQuery<PartialBooking[]>(endpoint);
        console.log("API Response:", response);
        setBookings(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching partial bookings:", error);
        toast.error("Failed to load game sessions");
      } finally {
        setLoading(false);
      }
    },
    [radius],
  );

  useEffect(() => {
    fetchPartialBookings();
  }, [fetchPartialBookings]);

  const handleLocationClick = async () => {
    if (userLocation) {
      setShowRadiusSlider(!showRadiusSlider);
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        },
      );

      const { latitude: lat, longitude: lng } = position.coords;
      setUserLocation({ lat, lng });
      setShowRadiusSlider(true);
      await fetchPartialBookings({ lat, lng });
      toast.success("Location found! Adjust the radius to filter results.");
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error(
        "Unable to retrieve your location. Please check your browser permissions.",
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleRadiusChange = useCallback(
    (value: number[]) => {
      const newRadius = value[0];
      setSliderValue(newRadius);

      // Clear any existing timeout
      if (debounceTimeoutRef.current !== null) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set a new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        setRadius(newRadius);
        if (userLocation) {
          fetchPartialBookings(userLocation, newRadius);
        }
      }, 300); // 300ms debounce delay
    },
    [userLocation, fetchPartialBookings],
  );

  // Clean up the timeout on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current !== null) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, []);

  // Update slider value when radius changes from other sources
  useEffect(() => {
    setSliderValue(radius);
  }, [radius]);

  const handleHostGame = () => {
    navigate("/futsals/select");
  };

  const handleJoinGame = async (bookingId: string) => {
    try {
      await apiMutation({
        method: "POST",
        endpoint: `bookings/${bookingId}/join`,
        body: {},
      });

      toast.success("Successfully joined the game!");

      // Update the UI by removing the joined game from the list
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId),
      );
    } catch (error) {
      console.error("Error joining game:", error);
      toast.error("Failed to join the game. Please try again.");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    // Handle case where futsal might be just an ID
    if (typeof booking.futsal === "string") return true; // Show all if we can't filter

    const searchLower = searchQuery.toLowerCase();
    return (
      booking.futsal?.name?.toLowerCase().includes(searchLower) ||
      booking.futsal?.location?.address?.toLowerCase().includes(searchLower) ||
      booking.futsal?.location?.city?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Find or Host a Game</h1>
        <Button onClick={handleHostGame}>Host a Game</Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search games by type or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={userLocation ? "default" : "outline"}
            onClick={handleLocationClick}
            disabled={isLocating}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {isLocating ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : userLocation ? (
              <MapPin className="h-4 w-4" />
            ) : (
              <MapPinOff className="h-4 w-4" />
            )}
            {userLocation ? "Nearby" : "Find Nearby"}
          </Button>

          {showRadiusSlider && userLocation && (
            <div className="flex items-center gap-3 ml-2 w-48">
              <span className="text-sm whitespace-nowrap">
                {sliderValue} km
              </span>
              <Slider
                value={[sliderValue]}
                max={50}
                min={1}
                step={1}
                onValueChange={handleRadiusChange}
                className="flex-1"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Loading game sessions...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card key={booking._id}>
              <CardHeader>
                <CardTitle className="capitalize">
                  {typeof booking.futsal === "string"
                    ? "Futsal Court"
                    : booking.futsal.name}
                </CardTitle>
                <CardDescription>
                  {format(new Date(booking.date), "PPP")} • {booking.startTime}{" "}
                  - {booking.endTime}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {typeof booking.futsal === "string" ? (
                    <p className="text-sm">
                      <span className="font-medium">Futsal ID:</span>{" "}
                      {booking.futsal}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-medium">Location:</span>{" "}
                        {booking.futsal.location?.address || "N/A"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">City:</span>{" "}
                        {booking.futsal.location?.city || "N/A"}
                      </p>
                    </>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Price:</span> Rs.{" "}
                    {booking.price || "N/A"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Type:</span>{" "}
                    {booking.bookingType === "partial"
                      ? "Looking for players"
                      : "Full booking"}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleJoinGame(booking._id)}
                  disabled={booking.status !== "pending"}
                >
                  {booking.status === "pending"
                    ? "Join Game"
                    : "Already Joined"}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No game sessions found. Be the first to host one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
