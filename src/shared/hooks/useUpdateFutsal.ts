import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiMutation } from "@lib/apiWrapper";

export function useUpdateFutsal(futsalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiMutation({
        method: "PUT",
        endpoint: `futsals/${futsalId}`,
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["futsal-details", futsalId]);
    },
  });
}
