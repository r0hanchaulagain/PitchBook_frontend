import { useState } from "react";

interface OAuthHook {
  isLoading: boolean;
  error: string | null;
  initiateGoogleOAuth: () => void;
}

export const useOAuth = (): OAuthHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateGoogleOAuth = () => {
    // Redirect to the backend OAuth initiation endpoint
    // The backend will redirect to Google and then back to our callback
    window.location.href = "/api/v1/users/google";
  };

  return {
    isLoading,
    error,
    initiateGoogleOAuth,
  };
};
