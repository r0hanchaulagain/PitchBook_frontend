import { Heart } from "lucide-react";
import { Button } from "@ui/button";
import { useNavigate } from "react-router-dom";
import { useFavoritesStore } from "@/shared/store/favoritesStore";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

interface FutsalCardProps {
  futsal: {
    _id: string;
    name: string;
    images: string[];
    location: {
      address?: string;
      city?: string;
    };
    side?: number;
    amenities: string[];
    pricing: {
      dynamicPrice?: number;
      basePrice?: number;
    };
  };
}

export const FutsalCard = ({ futsal }: FutsalCardProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorited } =
    useFavoritesStore();

  // Local state to handle immediate UI feedback
  const [isFavorite, setIsFavorite] = useState(() =>
    isFavorited(futsal._id, user?.favoritesFutsal),
  );
  const [isLoading, setIsLoading] = useState(false);

  const isUser = user?.role === "user";

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    setIsLoading(true);
    const wasFavorite = isFavorite;

    try {
      // Optimistically update the UI
      setIsFavorite(!wasFavorite);

      if (wasFavorite) {
        await removeFromFavorites(futsal._id, user, setUser);
      } else {
        await addToFavorites(futsal._id, user, setUser);
      }
    } catch (error) {
      // Revert on error
      setIsFavorite(wasFavorite);
      console.error("Failed to update favorite status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync with store when it changes
  useEffect(() => {
    setIsFavorite(isFavorited(futsal._id, user?.favoritesFutsal));
  }, [isFavorited, futsal._id, user?.favoritesFutsal]);

  return (
    <div
      key={futsal._id}
      className="group mb-6 flex overflow-hidden rounded-md bg-primary-foreground shadow-md transition-shadow hover:cursor-pointer hover:shadow-lg"
      onClick={() => navigate(`/futsals/${futsal._id}`)}
    >
      <img
        src={
          Array.isArray(futsal.images) && futsal.images.length > 0
            ? futsal.images[0]
            : "/images/futsals_page/search_img.jpg"
        }
        alt="Futsal Court"
        className="h-40 w-52 object-cover"
      />
      <div className="flex-1 p-4">
        <h4 className="text-lg font-semibold transition-transform duration-200 group-hover:scale-105 group-hover:origin-left">
          {futsal.name}
        </h4>
        <p className="text-sm text-accent">
          {futsal.location?.address ||
            futsal.location?.city ||
            "Location not available"}
        </p>
        <p className="text-sm text-accent">
          {futsal.side ? `${futsal.side}-a-side` : ""}
        </p>
        <p className="text-sm text-accent">
          {(futsal.amenities || [])
            .filter((a: string) => a !== "basic futsal facilities")
            .slice(0, 3)
            .join(" • ")}
        </p>
      </div>
      <div className="flex flex-col items-end justify-between p-4">
        <div className="flex items-center">
          {isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleFavoriteClick}
              disabled={isLoading}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={`h-5 w-5 transition-colors ${isLoading ? "opacity-50" : ""} ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`}
                fill={isFavorite ? "currentColor" : "none"}
              />
            </Button>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-bold text-muted-foreground transition-transform duration-200 group-hover:scale-105">
            Rs.{" "}
            {futsal.pricing?.dynamicPrice || futsal.pricing?.basePrice || "-"}{" "}
            <span className="text-sm font-normal">per hour</span>
          </span>
          <Button
            variant="default"
            className="mt-3 rounded px-4 py-2"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/futsals/${futsal._id}`);
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};
