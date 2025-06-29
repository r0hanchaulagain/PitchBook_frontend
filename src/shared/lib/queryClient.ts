import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Always use credentials for cookies (for all fetches)
			queryFn: async ({ queryKey, signal }) => {
				const url = `/api/v1/${queryKey[0]}`;
				const res = await fetch(url, { credentials: "include", signal });
				if (!res.ok) throw new Error("Network error");
				return res.json();
			},
			retry: 1,
			refetchOnWindowFocus: true,
		},
		mutations: {
			retry: 0,
		},
	},
});