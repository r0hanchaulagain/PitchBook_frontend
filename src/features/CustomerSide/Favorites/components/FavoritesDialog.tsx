import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog";
import { useFavoritesStore } from "@/shared/store/favoritesStore";
import { Button } from "@ui/button";
import { Heart, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function mapFutsalToCard(futsal: any) {
  return {
    _id: futsal._id,
    name: futsal.name,
    images: futsal.images || (futsal.image ? [futsal.image] : []),
    location: {
      address: futsal.address || "",
      city: futsal.city || "",
    },
    side: futsal.side,
    amenities: futsal.amenities || [],
    pricing: {
      dynamicPrice: futsal.dynamicPrice,
      basePrice: futsal.price || futsal.basePrice,
    },
  };
}

export const FavoritesDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { favorites, isLoading, removeFromFavorites } = useFavoritesStore();
  const { user, setUser } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col justify-start items-start max-h-[80vh] min-h-fit min-w-[60vw] overflow-y-auto overflow-x-hidden bg-background">
        <DialogHeader>
          <DialogTitle className="flex justify-start items-start gap-2 text-foreground">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            Your Favorite Futsals
          </DialogTitle>
        </DialogHeader>

        <div className="pt-1 pb-2 px-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="h-12 w-12 text-muted mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                No favorites yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your favorite futsals will appear here
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  onOpenChange(false);
                  navigate("/futsals");
                }}
              >
                Explore Futsals
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              {favorites.map((futsal) => {
                const card = mapFutsalToCard(futsal);
                return (
                  <div
                    key={card._id}
                    className="flex w-full bg-card rounded-xl shadow-md border hover:shadow-lg transition-shadow p-4 items-center gap-4"
                  >
                    {/* Image */}
                    <img
                      src={
                        card.images[0] || "/images/futsals_page/search_img.jpg"
                      }
                      alt={card.name}
                      className="w-28 h-20 object-cover rounded-lg border flex-shrink-0 bg-muted"
                    />
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-foreground truncate">
                          {card.name}
                        </span>
                        {card.side && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                            {card.side}-a-side
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm mb-1 min-w-0">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="truncate">
                          {card.location.address ||
                            card.location.city ||
                            "Location not available"}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {card.amenities.slice(0, 3).join(" • ")}
                      </div>
                    </div>
                    {/* Price & Actions */}
                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-foreground">
                          Rs.{" "}
                          {card.pricing.dynamicPrice ||
                            card.pricing.basePrice ||
                            "-"}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          per hour
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                          aria-label="Remove from favorites"
                          onClick={async () => {
                            await removeFromFavorites(card._id, user, setUser);
                          }}
                        >
                          <Heart className="h-5 w-5 text-primary fill-primary hover:scale-110 transition-transform" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="px-4 h-8"
                          onClick={() => {
                            onOpenChange(false);
                            navigate(`/futsals/${card._id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
