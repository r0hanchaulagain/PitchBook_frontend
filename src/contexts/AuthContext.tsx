import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import { apiQuery } from "@lib/apiWrapper";
import { socketService } from "@lib/socket";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profileImage?: string;
  favoritesFutsal?: string[];
  createdAt?: string;
  lastActive?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  // refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userState, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch and update user data
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await apiQuery<{ user: User }>("users/me");
      return response.user;
    } catch (error) {
      // If the API call fails, the session is invalid
      return null;
    }
  }, []);

  const login = async (userData: User): Promise<boolean> => {
    try {
      setUserState(userData);
      // Initialize WebSocket connection after successful login
      const token = localStorage.getItem("token"); // Assuming you store JWT in localStorage
      if (token) {
        socketService.connect(token);
      }
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setUserState(null);
      return false;
    }
  };

  /**
   * Logs the user out by disconnecting the WebSocket,
   * making an API call to the logout endpoint, and
   * clearing the user state and local storage token.
   */
  const logout = async () => {
    try {
      // Disconnect WebSocket
      socketService.disconnect();
      // Call the logout API if you have one
      await apiQuery("/users/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUserState(null);
      localStorage.removeItem("token");
    }
  };

  // Function to manually refresh user data
  // Note: Currently not used, but keeping for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refreshUser = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const userData = await fetchUser();
      setUserState(userData);

      // Initialize WebSocket connection if user is authenticated
      if (userData) {
        const token = localStorage.getItem("token");
        if (token) {
          socketService.connect(token);
        }
      }
      return userData;
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchUser, isRefreshing]);

  const updateUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
  }, []);

  const contextValue = useMemo(
    () => ({
      user: userState,
      isAuthenticated: !!userState,
      isLoading: isRefreshing || isLoading,
      login,
      logout,
      setUser: updateUser,
    }),
    [userState, isLoading, isRefreshing, login, logout, updateUser],
  );

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await fetchUser();
        setUserState(userData);
      } catch (error) {
        setUserState(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [fetchUser]);

  // Only render children once we've checked auth state
  // This prevents flash of unauthorized content
  if (isLoading) {
    return null; // or return a loading spinner
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
