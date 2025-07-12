import { useNotifications as useNotificationsContext } from "@/contexts/NotificationsContext";

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
  meta: {
    booking?: string;
    futsal?: string;
    customer?: string;
  };
  createdAt: string;
  updatedAt: string;
  time?: string;
  unread?: boolean;
}

export function useNotifications(futsalId?: string) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
    error,
  } = useNotificationsContext();

  // Filter notifications by futsalId if provided
  const filteredNotifications = futsalId
    ? notifications.filter((n) => n?.meta?.futsal === futsalId)
    : notifications;

  return {
    data: filteredNotifications,
    notifications: filteredNotifications, // For backward compatibility
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
    error,
    // For backward compatibility with existing code
    refetch: () => {},
    isFetching: false,
  };
}
