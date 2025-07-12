import { useQuery } from "@tanstack/react-query";
import { apiQuery } from "@lib/apiWrapper";

export function useFutsalDetails(futsalId: string) {
  return useQuery({
    queryKey: ["futsal-details", futsalId],
    queryFn: () => apiQuery(`futsals/${futsalId}`),
  });
}
