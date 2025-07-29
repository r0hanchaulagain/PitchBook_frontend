import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { socketService } from "@lib/socket";
import { apiQuery, apiMutation } from "@lib/apiWrapper";
import { useAuth } from "./AuthContext";
export interface Notification {
  _id: string;
  user: string;
  message: string;
  type:
    | "booking_created"
    | "new_booking"
    | "booking_updated"
    | "booking_cancelled"
    | "general";
  isRead: boolean;
  time?: string;
  meta: {
    booking?: string;
    futsal?: string;
    customer?: string;
  };
  createdAt: string;
  updatedAt: string;
}
interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}
const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);
export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const fetchInitialNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiQuery<{ notifications: Notification[] }>(
        "notifications",
      );
      const notificationsData =
        response?.notifications || (Array.isArray(response) ? response : []);
      setNotifications(notificationsData);
    } catch (err) {
      console.error("Failed to fetch initial notifications:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch notifications"),
      );
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const updateNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n._id === notification._id);
      if (exists) {
        return prev.map((n) => (n._id === notification._id ? notification : n));
      }
      return [notification, ...prev];
    });
  }, []);
  const markAsRead = useCallback(
    async (notificationIds: string[]) => {
      if (!notificationIds.length || !isAuthenticated) return;
      try {
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n._id) ? { ...n, isRead: true } : n,
          ),
        );
        await apiMutation({
          method: "POST",
          endpoint: "notifications/mark-read",
          body: { notificationIds },
        });
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n._id) ? { ...n, isRead: false } : n,
          ),
        );
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to mark notification as read"),
        );
      }
    },
    [isAuthenticated],
  );
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const unreadIds = notifications
        .filter((n) => !n.isRead)
        .map((n) => n._id);
      if (unreadIds.length > 0) {
        await markAsRead(unreadIds);
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to mark all notifications as read"),
      );
    }
  }, [markAsRead, notifications, isAuthenticated]);
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setError(null);
      return;
    }
    fetchInitialNotifications();
    const handleNewNotification = (notification: Notification) => {
      updateNotification(notification);
      console.log("New notification:", notification);
    };
    const handleNotificationRead = (data: { notificationIds: string[] }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          data.notificationIds.includes(n._id) ? { ...n, isRead: true } : n,
        ),
      );
    };
    const handleNotificationReadError = (error: { message: string }) => {
      console.error("Error marking notification as read:", error.message);
      setError(new Error(error.message));
    };
    socketService.on("notification", handleNewNotification);
    socketService.on("notification:read", handleNotificationRead);
    socketService.on("notification:read:error", handleNotificationReadError);
    return () => {
      socketService.off("notification", handleNewNotification);
      socketService.off("notification:read", handleNotificationRead);
      socketService.off("notification:read:error", handleNotificationReadError);
    };
  }, [fetchInitialNotifications, isAuthenticated]);
  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isLoading,
        error,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
};
export default NotificationsContext;
