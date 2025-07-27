import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Search, MapPin, ChevronDown, Filter, Heart } from "lucide-react";
import { apiQuery } from "@/shared/lib/apiWrapper";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useFavoritesStore } from "@/shared/store/favoritesStore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";

const AMENITIES = [
  "private locker",
  "free wifi",
  "parking",
  "cafeteria",
  "free water bottles",
  "changing room",
];

const SIDES = [5, 6, 7];


export default function FutsalSelectionPage() {
  const navigate = useNavigate();
  const [futsals, setFutsals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  // Filter/search/sort UI state
  const [sortOption, setSortOption] = useState("price_asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(500);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedSides, setSelectedSides] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showNearby, setShowNearby] = useState(false);
  const [radius, setRadius] = useState(5); // in km
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const { addToFavorites, removeFromFavorites, isFavorited, fetchFavorites } =
    useFavoritesStore();

  // Fetch favorites when user changes or when component mounts
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, fetchFavorites]);

  // Refresh futsals list when favorites change
  useEffect(() => {
    fetchFutsals();
  }, [user?.favoritesFutsal]);

  // Toggle favorite status with optimistic UI updates
  const toggleFavorite = async (e: React.MouseEvent, futsal: any) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add to favorites");
      return;
    }

    const wasFavorite = isFavorited(futsal._id, user.favoritesFutsal);
    const toastId = toast.loading(
      wasFavorite ? "Removing from favorites..." : "Adding to favorites...",
    );

    try {
      let success = false;
      
      // Optimistically update the UI
      const updatedFutsals = futsals.map((f) => ({
        ...f,
        isFavorite: f._id === futsal._id ? !wasFavorite : f.isFavorite,
      }));
      setFutsals(updatedFutsals);

      if (wasFavorite) {
        success = await removeFromFavorites(futsal._id, user, setUser);
      } else {
        success = await addToFavorites(futsal._id, user, setUser);
      }

      if (success) {
        toast.success(
          wasFavorite ? "Removed from favorites" : "Added to favorites",
          {
            id: toastId,
            description: wasFavorite
              ? `${futsal.name} has been removed from your favorites.`
              : `${futsal.name} has been added to your favorites.`,
          },
        );
      } else {
        // Revert optimistic update on failure
        const revertedFutsals = futsals.map((f) => ({
          ...f,
          isFavorite: f._id === futsal._id ? wasFavorite : f.isFavorite,
        }));
        setFutsals(revertedFutsals);

        toast.error("Failed to update favorites", {
          id: toastId,
          description: "Please try again.",
        });
      }
    } catch (error: any) {
      // Revert optimistic update on error
      const revertedFutsals = futsals.map((f) => ({
        ...f,
        isFavorite: f._id === futsal._id ? wasFavorite : f.isFavorite,
      }));
      setFutsals(revertedFutsals);

      const errorMessage =
        error.response?.data?.message ||
        "Failed to update favorites. Please try again.";
      toast.error("Error updating favorites", {
        id: toastId,
        description: errorMessage,
      });
    }
  };

  // Fetch futsals from API
    const fetchFutsals = async (paramsOverride?: any) => {
      setLoading(true);
      const hasFilters =
        searchTerm.trim() !== "" ||
        selectedAmenities.length > 0 ||
        selectedSides.length > 0 ||
        minPrice !== 500 ||
        maxPrice !== 5000 ||
        (showNearby && lat && lng);
  
      const params: Record<string, any> = {
        minPrice,
        maxPrice,
        amenities: selectedAmenities.join(","),
        side: selectedSides.join(","),
        sort: sortOption,
        limit,
        search: searchTerm,
        ...(showNearby && lat && lng ? { lat, lng, radius } : {}),
        ...paramsOverride,
      };
      if (!hasFilters) {
        params.page = page;
      } else {
        if (page !== 1) setPage(1);
        delete params.page;
      }
      const query = Object.entries(params)
        .filter(
          ([, v]) => v !== undefined && v !== null && v !== "" && v !== "NaN",
        )
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`,
        )
        .join("&");
      try {
        const response = await apiQuery<any>(`futsals?${query}`);
        setFutsals(response?.data || []);
      } catch (e) {
        setFutsals([]);
      } finally {
        setLoading(false);
      }
    };
  
    // Debounced search effect
    useEffect(() => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        fetchFutsals();
      }, 400);
    }, [searchTerm]);
  
    // Fetch on filter/sort change
    useEffect(() => {
      fetchFutsals();
    }, [
      sortOption,
      minPrice,
      maxPrice,
      selectedAmenities,
      selectedSides,
      page,
      limit,
      showNearby,
      lat,
      lng,
      radius,
      filtersApplied,
    ]);
  
    // Handle amenities
    const handleAmenityChange = (amenity: string) => {
      setSelectedAmenities((prev) =>
        prev.includes(amenity)
          ? prev.filter((a) => a !== amenity)
          : [...prev, amenity],
      );
    };
  
    // Handle side
    const handleSideChange = (side: number) => {
      setSelectedSides((prev) =>
        prev.includes(side) ? prev.filter((s) => s !== side) : [...prev, side],
      );
    };
  
    // Handle Nearby
    const handleNearby = () => {
      if (!navigator.geolocation) return alert("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setShowNearby(true);
        },
        () => {
          alert("Location access denied");
          setShowNearby(false);
        },
      );
    };
  
    const handleFilterApply = () => {
      setFiltersApplied((v) => !v);
      setShowFilters(false);
    };
  
    const handleReset = () => {
      setMinPrice(500);
      setMaxPrice(5000);
      setSelectedAmenities([]);
      setSelectedSides([]);
      setShowNearby(false);
      setLat(null);
      setLng(null);
      setRadius(5);
      setFiltersApplied((v) => !v);
      setSearchTerm("");
      setShowFilters(false);
    };

  // Update futsals with favorite status from store
  const futsalsWithFavorites = futsals.map((futsal) => {
    const isFavorite = isFavorited(futsal._id, user?.favoritesFutsal);
    return {
      ...futsal,
      isFavorite,
    };
  });

  const handleViewDetails = (futsalId: string) => {
    navigate(`/futsals/${futsalId}?partial=true`);
  };


  const getHeadingText = () => {
    if (searchTerm) {
      return `Search Results for ${searchTerm}: ${futsals.length} futsals found`;
    }
    return "Explore Futsals";
  };



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Find a Futsal for Your Game</h1>
          <div className="relative max-w-2xl">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 lg:w-80 space-y-6">
            <Skeleton className="h-6 w-24 mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-full mt-4" />
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-40" />
            </div>
            
            {/* Listings */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                  <Skeleton className="w-full sm:w-40 h-32 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Map Placeholder */}
            <div className="mt-8 border rounded-lg overflow-hidden">
              <Skeleton className="w-full h-64" />
            </div>
            
            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-6">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Find a Futsal for Your Game</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search futsals..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

      </div>

      {futsalsWithFavorites.length > 0 ? (
      <div className="flex flex-col md:flex-row w-full px-3 sm:px-6 md:px-0">
      <Button
        className="md:hidden my-4 w-fit"
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="h-4 w-4 mr-2" /> Filters
      </Button>
      <div
        className={`${
          showFilters ? "block" : "hidden"
        } md:block w-full md:w-60 lg:w-70 bg-background py-6 px-4 sm:px-6 md:px-8 shadow-md md:sticky md:top-0 md:border-r md:border-border mb-4 md:mb-0`}
      >
        <h3 className="mb-4 text-lg font-semibold">Filters</h3>
        < DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-primary border p-2 rounded-md mb-4">
            <MapPin className="h-4 w-4" /> Nearby
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleNearby}>
              Use Current Location
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {showNearby && (
          <div className="flex flex-col mb-4">
            <label className="text-xs mb-1">Radius: {radius} km</label>
            <input
              type="range"
              min={1}
              max={20}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
        <label className="mb-2 block text-sm">Price Range</label>
        <input
          type="range"
          min="500"
          max="5000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-1 flex justify-between text-sm text-muted-foreground">
          <span>Rs. {minPrice}</span>
          <span>Rs. {maxPrice}</span>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm">Amenities</label>
          {AMENITIES.map((amenity) => (
            <label key={amenity} className="my-2 block text-sm">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
              />
              {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm">Players per Side</label>
          {SIDES.map((side) => (
            <label key={side} className="my-2 block text-sm">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedSides.includes(side)}
                onChange={() => handleSideChange(side)}
              />
              {side}-a-side
            </label>
          ))}
        </div>
        <Button className="mt-6 w-full" onClick={handleFilterApply}>
          Apply Filters
        </Button>
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
      <div className="flex-1 md:px-5">
        <div className="my-6 sm:my-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-primary text-lg sm:text-xl font-semibold">
            {getHeadingText()}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-primary border p-2 rounded-md">
              Sort by:{" "}
              {sortOption === "price_asc"
                ? "Price: Low to High"
                : "Price: High to Low"}{" "}
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOption("price_asc")}>
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("price_desc")}>
                Price: High to Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-muted h-32 sm:h-40 rounded-lg"
                ></div>
              ))}
            </div>
          ) : (
            futsalsWithFavorites.map((futsal) => (
              <div
                key={futsal._id}
                className="w-full flex flex-col sm:flex-row sm:justify-between bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="w-full sm:w-[25%] h-40 sm:h-auto bg-muted flex-shrink-0">
                  <img
                    src={
                      Array.isArray(futsal.images) && futsal.images.length > 0
                        ? futsal.images[0]
                        : "/images/futsals_page/search_img.jpg"
                    }
                    alt={futsal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row justify-between p-4 gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      {futsal.name}
                    </h3>
                    <div className="flex gap-1 items-center mb-2">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground/70" />
                      <span className="text-sm">
                        {futsal.location?.address ||
                          futsal.location?.city ||
                          "Location not available"}
                      </span>
                    </div>
                    {futsal.side && <Badge>{futsal.side}-a-side</Badge>}
                  </div>
                  <div className="flex flex-col items-start sm:items-end justify-between gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-lg sm:text-xl font-bold text-foreground">
                        Rs.{" "}
                        {futsal.pricing?.finalPrice ||
                          futsal.pricing?.basePrice ||
                          "-"}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        per hour
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {user && user.role === "user" && (
                        <Button
                          variant="outline"
                          size="icon"
                          className={`h-8 sm:h-10 w-8 sm:w-10 ${futsal.isFavorite ? "bg-foreground/10" : ""}`}
                          onClick={(e) => toggleFavorite(e, futsal)}
                        >
                          <Heart
                            className={`h-4 sm:h-5 w-4 sm:w-5 ${futsal.isFavorite ? "fill-foreground" : ""}`}
                            strokeWidth={futsal.isFavorite ? 2 : 1.5}
                          />
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        className="px-4 h-8 sm:h-10 hover:bg-foreground/90"
                        onClick={() => handleViewDetails(futsal._id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-center gap-4 my-6 sm:my-8">
          <Button
            variant="default"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 h-8 sm:h-10"
          >
            Prev
          </Button>
          <span className="self-center text-sm sm:text-base">Page {page}</span>
          <Button
            variant="default"
            disabled={futsals.length < limit}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 h-8 sm:h-10"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No futsals found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
