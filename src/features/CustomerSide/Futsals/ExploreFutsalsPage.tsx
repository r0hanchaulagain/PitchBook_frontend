import { useState, useRef, useEffect } from "react";
import { Input } from "@ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { ChevronDown, MapPin } from "lucide-react";
import { Button } from "@ui/button";
import { apiQuery } from "@lib/apiWrapper";
import { useNavigate } from "react-router-dom";

const AMENITIES = [
  'private locker',
  'free wifi',
  'parking',
  'cafeteria',
  'free water bottles',
  'changing room',
];

const SIDES = [5, 6, 7];

const FutsalsPage = () => {
  const navigate = useNavigate();
  // Filter/search/sort UI state
  const [sortOption, setSortOption] = useState("price_asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(500);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedSides, setSelectedSides] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showNearby, setShowNearby] = useState(false);
  const [radius, setRadius] = useState(5); // in km
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [futsals, setFutsals] = useState<any[]>([]);

  // Debounce search
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

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
      // If filters/search are used, always reset to first page
      if (page !== 1) setPage(1);
      delete params.page;
    }
    // Build query string
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "NaN")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
      .join("&");
    try {
      const data = await apiQuery<any>(`futsals?${query}`);
      setFutsals(data?.futsals || []);
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
    // eslint-disable-next-line
  }, [searchTerm]);

  // Fetch on filter/sort change
  useEffect(() => {
    fetchFutsals();
    // eslint-disable-next-line
  }, [sortOption, minPrice, maxPrice, selectedAmenities, selectedSides, page, limit, showNearby, lat, lng, radius, filtersApplied]);

  // Handle amenities
  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Handle side
  const handleSideChange = (side: number) => {
    setSelectedSides((prev) =>
      prev.includes(side)
        ? prev.filter((s) => s !== side)
        : [...prev, side]
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
      }
    );
  };

  const handleFilterApply = () => {
    setFiltersApplied((v) => !v); // trigger fetch
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
  };

  const getHeadingText = () => {
    if (searchTerm) {
      return `Search Results for ${searchTerm}: ${futsals.length} futsals found`;
    }
    return "Explore Futsals";
  };

  return (
    <main>
      <div className="relative isolate h-[50vh] max-h-[50vh] overflow-hidden bg-primary w-full">
        <img
          className="z-0 h-auto w-full"
          src="/images/futsals_page/search_img.jpg"
          alt="SoccerSlot"
        />
        <div className="absolute top-0 min-h-full w-full bg-primary/50"></div>
        <Input
          className="absolute top-[calc(14vw+1rem)] left-[13%] h-fit w-[70%] !bg-background py-[.45em] text-[calc(1vw+.5rem)] text-primary placeholder:font-bold sm:top-[53%] sm:left-[25%] sm:w-[50%] sm:py-[.75em]"
          type="text"
          placeholder="Search Futsals"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <h1 className="absolute top-[calc(8vw+1rem)] left-[25%] text-center w-[50%] text-3xl text-primary-foreground font-bold">
          Discover the Best Futsal Courts Near You!
        </h1>
      </div>
      <div className="flex w-full pr-20 gap-12">
        <div className="w-[28vw] h-screen bg-background py-12 px-9 shadow-md sticky top-0">
          <h3 className="mb-4 text-lg font-semibold">Filters</h3>
          <div className="flex items-center gap-2 mb-4">
            <Button type="button" variant={showNearby ? "default" : "outline"} onClick={handleNearby}>
              <MapPin className="h-4 w-4 mr-1" /> Nearby
            </Button>
            {showNearby && (
              <div className="flex flex-col ml-2">
                <label className="text-xs mb-1">Radius: {radius} km</label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </div>
            )}
          </div>
          <label className="mb-2 block text-sm">Price Range</label>
          <input type="range" min="500" max="5000" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full" />
          <div className="mt-1 flex justify-between text-sm text-accent">
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
          <Button className="mt-6 w-full" onClick={handleFilterApply}>Apply Filters</Button>
          <Button variant={"ghost"} className="mt-2 w-full" onClick={handleReset}>Reset</Button>
        </div>
        <div className="w-full">
          <div className="my-8 flex items-center justify-between">
            <span className="text-primary text-xl font-semibold">{getHeadingText()}</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-primary border p-2 rounded-md">
                Sort by: {sortOption === "price_asc" ? "Price: Low to High" : "Price: High to Low"} <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOption("price_asc")}>Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("price_desc")}>Price: High to Low</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {loading && <div className="text-center py-8">Loading...</div>}
          {!loading && futsals.map((futsal) => (
            <div
              key={futsal._id}
              className="mb-6 flex overflow-hidden rounded-md bg-primary-foreground shadow-md hover:shadow-lg transition-shadow group"
            >
              <img
                src={Array.isArray(futsal.images) && futsal.images.length > 0 ? futsal.images[0] : "/images/futsals_page/search_img.jpg"}
                alt="Futsal Court"
                className="h-40 w-52 object-cover"
              />
              <div className="flex-1 p-4">
                <h4 className="text-lg font-semibold transition-transform duration-200 group-hover:scale-105 group-hover:origin-left">
                  {futsal.name}
                </h4>
                <p className="text-sm text-accent">
                  {futsal.location?.address || futsal.location?.city || "Location not available"}
                </p>
                <p className="text-sm text-accent">
                  {futsal.side ? `${futsal.side}-a-side` : ''}
                </p>
                <p className="text-sm text-accent">
                  {(futsal.amenities || []).filter((a: string) => a !== "basic futsal facilities").join(" • ")}
                </p>
              </div>
              <div className="flex flex-col items-end justify-center p-4">
                <span className="text-lg font-bold text-muted-foreground transition-transform duration-200 group-hover:scale-105">
                  Rs. {futsal.pricing?.dynamicPrice || futsal.pricing?.basePrice || "-"} <span className="text-sm font-normal">per hour</span>
                </span>
                <Button
                  variant="default"
                  className="mt-3 rounded px-4 py-2"
                  onClick={() => navigate(`/futsals/${futsal._id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
          {/* Pagination Controls */}
          <div className="flex justify-center gap-4 my-8">
            <Button
              variant="default"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <span className="self-center">Page {page}</span>
            <Button
              variant="default"
              disabled={futsals.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FutsalsPage;