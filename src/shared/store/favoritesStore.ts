import { create } from "zustand";
import { favoritesApi } from "@/features/CustomerSide/Favorites/favoritesApi";

// Global flag to track authentication status
let isAuthenticated = false;

// Function to update authentication status
export const setAuthStatus = (status: boolean) => {
  isAuthenticated = status;
};

interface Futsal {
  _id: string;
  name: string;
  images: string[];
  location: {
    address?: string;
    city?: string;
    district?: string;
  };
  pricing: {
    basePrice: number;
    dynamicPrice?: number;
  };
  side?: number;
  amenities: string[];
}

interface FavoritesState {
  favorites: Futsal[];
  isLoading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  addToFavorites: (
    futsalId: string,
    user: any,
    setUser: any,
  ) => Promise<boolean>;
  removeFromFavorites: (
    futsalId: string,
    user: any,
    setUser: any,
  ) => Promise<boolean>;
  isFavorited: (futsalId: string, userFavorites?: string[]) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        // If not authenticated, set empty favorites and return
        set({ favorites: [], isLoading: false });
        return;
      }

      const response = (await favoritesApi.getFavoriteFutsals()) as {
        favorites: Futsal[];
      };
      set({ favorites: response?.favorites || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addToFavorites: async (futsalId: string, user: any, setUser: any) => {
    try {
      if (!user) return false;

      const response = await favoritesApi.addToFavorites(futsalId);
      const data = response as { favorites: string[] };

      set((state) => ({
        favorites: [...state.favorites, { _id: futsalId } as Futsal],
      }));

      if (setUser) {
        setUser({
          ...user,
          favoritesFutsal: data.favorites || [
            ...(user.favoritesFutsal || []),
            futsalId,
          ],
        });
      }

      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return false;
    }
  },

  removeFromFavorites: async (futsalId: string, user: any, setUser: any) => {
    try {
      if (!user) return false;

      await favoritesApi.removeFromFavorites(futsalId);

      set((state) => ({
        favorites: state.favorites.filter((futsal) => futsal._id !== futsalId),
      }));

      if (setUser) {
        setUser({
          ...user,
          favoritesFutsal: (user.favoritesFutsal || []).filter(
            (id: string) => id !== futsalId,
          ),
        });
      }

      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return false;
    }
  },

  isFavorited: (futsalId: string, userFavorites?: string[]) => {
    if (userFavorites) {
      return userFavorites.includes(futsalId);
    }
    return false;
  },
}));

const initializeFavorites = () => {
  // Only initialize if user is authenticated
  if (isAuthenticated) {
    useFavoritesStore.getState().fetchFavorites();
  }
};

let unsubscribe: (() => void) | null = null;

if (typeof window !== "undefined") {
  setTimeout(() => {
    initializeFavorites();
    const authCheckInterval = setInterval(() => {
      // Check authentication status periodically
      if (!isAuthenticated) {
        // Clear favorites if user is not authenticated
        useFavoritesStore.getState().favorites = [];
      }
    }, 3000);

    window.addEventListener("beforeunload", () => {
      clearInterval(authCheckInterval);
      if (unsubscribe) {
        unsubscribe();
      }
    });

    // Store cleanup function
    unsubscribe = () => {
      clearInterval(authCheckInterval);
    };
  }, 1000);
}
