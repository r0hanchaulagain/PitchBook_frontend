import { apiQuery, apiMutation } from "@/shared/lib/apiWrapper";

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
      const response = await apiQuery("users/favorites");
      return response.favorites.some((f: any) => f._id === futsalId);
    } catch (error) {
      console.error("Error checking if futsal is favorited:", error);
      return false;
    }
  },
};
