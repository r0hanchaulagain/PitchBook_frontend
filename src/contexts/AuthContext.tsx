import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import { apiQuery, resetRefreshAttempts } from "@lib/apiWrapper";
import { socketService } from "@lib/socket";
import { setAuthStatus } from "@/shared/store/favoritesStore";
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profileImage?: string;
  favoritesFutsal?: string[];
  createdAt?: string;
  lastActive?: string;
  isOAuthUser?: boolean;
  oauthProvider?: string;
  authProvider?: string;
  isMfaEnabled?: boolean;
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userState, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await apiQuery<{ user: User }>("users/me");
      return response.user;
    } catch (error) {
      return null;
    }
  }, []);
  const login = async (userData: User): Promise<boolean> => {
    try {
      setUserState(userData);
      resetRefreshAttempts();
      const token = localStorage.getItem("token");
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
  const logout = async () => {
    try {
      socketService.disconnect();
      const response = await apiQuery<{
        message: string;
        isOAuthUser: boolean;
        googleLogoutUrl?: string;
      }>("users/logout");
      setUserState(null);
      resetRefreshAttempts();
      if (response.isOAuthUser && response.googleLogoutUrl) {
        window.location.href = response.googleLogoutUrl;
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      setUserState(null);
      resetRefreshAttempts();
      window.location.href = "/login";
    }
  };
  const refreshUser = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const userData = await fetchUser();
      setUserState(userData);
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
  useEffect(() => {
    setAuthStatus(!!userState);
  }, [userState]);
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
  if (isLoading) {
    return null;
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
