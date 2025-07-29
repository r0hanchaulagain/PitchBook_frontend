import { useState, useEffect, useCallback } from "react";
import { socketService } from "@/shared/lib/socket";
import { apiQuery } from "@lib/apiWrapper";
export interface DashboardSummary {
  currentPricing: {
    value: number;
    label: string;
    subtext: string;
    icon: string;
    currency: string;
  };
  slotsBooked: {
    value: number;
    label: string;
    subtext: string;
    icon: string;
  };
  allTimeCollection: {
    value: number;
    label: string;
    subtext: string;
    icon: string;
    currency: string;
  };
  totalReviews: {
    value: number | string;
    label: string;
    subtext: string;
    icon: string;
    showEmptyState: boolean;
  };
  todayStats: {
    bookings: {
      value: number;
      label: string;
      icon: string;
    };
    revenue: {
      value: number;
      label: string;
      icon: string;
      currency: string;
    };
    occupancy: {
      value: string;
      label: string;
      icon: string;
    };
  };
  todaysSchedule: {
    bookings: Array<{
      id: string;
      startTime: string;
      endTime: string;
      customerName: string;
      status: "confirmed" | "pending" | "cancelled";
      price: number;
      bookingType: string;
      teamA: boolean;
      teamB: boolean;
    }>;
    total: number;
    hasBookings: boolean;
  };
  recentNotifications: {
    notifications: Array<any>;
    total: number;
    hasNotifications: boolean;
  };
  futsalId: string;
  lastUpdated: string;
}
const fetchDashboardSummary = async (
  futsalId: string,
): Promise<DashboardSummary> => {
  const response = await apiQuery<DashboardSummary>(
    `futsals/dashboard-summary?futsalId=${futsalId}`,
  );
  return {
    ...response,
    todaysSchedule: {
      ...response.todaysSchedule,
      bookings: Array.isArray(response.todaysSchedule?.bookings)
        ? response.todaysSchedule.bookings
        : [],
    },
  };
};
export function useDashboardSummary(futsalId: string) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchData = useCallback(async () => {
    if (!futsalId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardSummary(futsalId);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch dashboard summary:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load dashboard data"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [futsalId]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (!futsalId) return;
    const handleDashboardUpdate = (updatedData: DashboardSummary) => {
      console.log("Received dashboard update:", updatedData);
      setData((prev) => ({
        ...(prev || ({} as DashboardSummary)),
        ...updatedData,
        todaysSchedule: {
          ...updatedData.todaysSchedule,
          bookings: Array.isArray(updatedData.todaysSchedule?.bookings)
            ? updatedData.todaysSchedule.bookings
            : prev?.todaysSchedule?.bookings || [],
        },
      }));
    };
    socketService.socket?.on("dashboard:update", handleDashboardUpdate);
    socketService.socket?.emit("subscribe:dashboard", futsalId);
    return () => {
      socketService.socket?.off("dashboard:update", handleDashboardUpdate);
      socketService.socket?.emit("unsubscribe:dashboard", futsalId);
    };
  }, [futsalId]);
  const mappedData = data;
  return {
    data: mappedData,
    isLoading,
    error,
    refetch: fetchData,
    isFetching: isLoading,
  };
}
