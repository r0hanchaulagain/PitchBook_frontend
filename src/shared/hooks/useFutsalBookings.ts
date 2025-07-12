import { useQuery } from "@tanstack/react-query";
import { apiQuery } from "@lib/apiWrapper";

export interface Booking {
  _id: string;
  user: { _id: string; fullName: string };
  futsal: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  teamA: boolean;
  teamB: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface FutsalBookingsResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useFutsalBookings({
  futsalId,
  date,
  limit = 15,
  page = 1,
}: {
  futsalId: string;
  date?: string;
  limit?: number;
  page?: number;
}) {
  return useQuery<FutsalBookingsResponse>({
    queryKey: ["futsal-bookings", futsalId, date, limit, page],
    queryFn: () =>
      apiQuery(
        `bookings/futsal?futsalId=${futsalId}` +
          (date ? `&date=${date}` : "") +
          `&limit=${limit}&page=${page}`,
      ),
    keepPreviousData: true,
  });
}
