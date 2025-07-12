import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@components/ui/sonner";
import { Suspense } from "react";

import Loader from "@/shared/components/layoutComponents/Loader";
import AppRoutes from "@/config/appRoutes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";

const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="bottom-right" />
        <BrowserRouter>
          <AuthProvider>
            <NotificationsProvider>
              <Suspense fallback={<Loader />}>
                <AppRoutes />
              </Suspense>
            </NotificationsProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
};

export default App;
