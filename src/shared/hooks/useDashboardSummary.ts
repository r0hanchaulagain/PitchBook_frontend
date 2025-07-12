import { useState, useEffect, useCallback } from "react";
import { socketService } from "@/shared/lib/socket";
import { apiQuery } from "@lib/apiWrapper";

// Type for the API response
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
    value: number;
    label: string;
    subtext: string;
    icon: string;
    showEmptyState: boolean;
  };
  todayStats: {
    bookings: number;
    revenue: number;
    occupancy: string;
    rating: string;
    reviewCount: number;
  };
  schedule: Array<{
    id: string;
    customerName: string;
    timeSlot: string;
    status: "confirmed" | "pending" | "cancelled";
  }>;
  notifications: Array<any>;
}

const fetchDashboardSummary = async (
  futsalId: string,
): Promise<DashboardSummary> => {
  const response = await apiQuery<DashboardSummary>(
    `/futsals/dashboard-summary?futsalId=${futsalId}`,
  );
  // Ensure schedule is always an array
  return {
    ...response,
    schedule: Array.isArray(response.schedule) ? response.schedule : [],
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

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up WebSocket listeners for real-time updates
  useEffect(() => {
    if (!futsalId) return;

    const handleDashboardUpdate = (updatedData: DashboardSummary) => {
      console.log("Received dashboard update:", updatedData);
      setData((prev) => ({
        ...(prev || ({} as DashboardSummary)),
        ...updatedData,
        schedule: Array.isArray(updatedData.schedule)
          ? updatedData.schedule
          : prev?.schedule || [],
      }));
    };

    // Subscribe to dashboard updates
    socketService.socket?.on("dashboard:update", handleDashboardUpdate);
    socketService.socket?.emit("subscribe:dashboard", futsalId);

    // Cleanup
    return () => {
      socketService.socket?.off("dashboard:update", handleDashboardUpdate);
      socketService.socket?.emit("unsubscribe:dashboard", futsalId);
    };
  }, [futsalId]);

  // Map the API response to the component's expected format with null checks
  const mappedData = data
    ? {
        ...data,
        statsToday: data.todayStats || {
          bookings: 0,
          revenue: 0,
          occupancy: "0",
          rating: "0",
          reviewCount: 0,
        },
        totalBookingsToday: data.slotsBooked?.value || 0,
        totalCollected: data.allTimeCollection?.value || 0,
        schedule: data.schedule || [],
      }
    : null;

  return {
    data: mappedData,
    isLoading,
    error,
    refetch: fetchData,
    isFetching: isLoading,
  };
}
