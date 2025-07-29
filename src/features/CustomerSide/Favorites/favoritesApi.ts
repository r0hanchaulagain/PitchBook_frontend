import { apiQuery, apiMutation } from "@/shared/lib/apiWrapper";
import { useAuth } from "@/contexts/AuthContext";

export const favoritesApi = {
  addToFavorites: async (futsalId: string) => {
    return apiMutation({
      method: "POST",
      endpoint: `users/favorites/${futsalId}`,
    });
  },

  removeFromFavorites: async (futsalId: string) => {
    return apiMutation({
      method: "DELETE",
      endpoint: `users/favorites/${futsalId}`,
    });
  },

  getFavoriteFutsals: async () => {
    return apiQuery("users/favorites");
  },

  isFavorited: async (futsalId: string) => {
    try {
      const response = (await apiQuery("users/favorites")) as {
        favorites: Array<{ _id: string }>;
      };
      return response.favorites.some((f) => f._id === futsalId);
    } catch (error) {
      console.error("Error checking if futsal is favorited:", error);
      return false;
    }
  },
};

// Hook to check if user is authenticated before making favorites API calls
export const useFavoritesWithAuth = () => {
  const { isAuthenticated } = useAuth();

  return {
    addToFavorites: async (futsalId: string) => {
      if (!isAuthenticated) {
        throw new Error("User must be authenticated to add favorites");
      }
      return favoritesApi.addToFavorites(futsalId);
    },

    removeFromFavorites: async (futsalId: string) => {
      if (!isAuthenticated) {
        throw new Error("User must be authenticated to remove favorites");
      }
      return favoritesApi.removeFromFavorites(futsalId);
    },

    getFavoriteFutsals: async () => {
      if (!isAuthenticated) {
        return { favorites: [] };
      }
      return favoritesApi.getFavoriteFutsals();
    },

    isFavorited: async (futsalId: string) => {
      if (!isAuthenticated) {
        return false;
      }
      return favoritesApi.isFavorited(futsalId);
    },
  };
};
