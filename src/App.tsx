import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@components/ui/sonner";
import { Suspense } from "react";

import Loader from "@/shared/components/layoutComponents/Loader";
import AppRoutes from "@/config/appRoutes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@lib/queryClient";

const App = () => {
	return (
		<>
			<QueryClientProvider client={queryClient}>
			<Toaster richColors position="bottom-right" />
			<BrowserRouter>
				<Suspense fallback={<Loader />}>
					<AppRoutes />
				</Suspense>
			</BrowserRouter>
			</QueryClientProvider>
		</>
	);
};

export default App;
