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
    window.location.href = "/api/v1/users/google";
  };
  return {
    isLoading,
    error,
    initiateGoogleOAuth,
  };
};
