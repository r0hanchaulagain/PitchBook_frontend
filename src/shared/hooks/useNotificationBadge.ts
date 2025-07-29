import { useNotifications } from "@/contexts/NotificationsContext";
import { useEffect, useState } from "react";
export function useNotificationBadge() {
  const { unreadCount } = useNotifications();
  const [showBadge, setShowBadge] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  useEffect(() => {
    if (unreadCount > prevCount) {
      setShowBadge(true);
    }
    setPrevCount(unreadCount);
  }, [unreadCount, prevCount]);
  const clearBadge = () => {
    setShowBadge(false);
  };
  return {
    showBadge,
    unreadCount,
    clearBadge,
  };
}
