import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiQuery } from '@/shared/lib/apiWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          setError('No authorization code received');
          setStatus('error');
          return;
        }

        // Call the backend to exchange the code for tokens
        // The backend callback route only accepts GET requests
        const response = await apiQuery<{
          success: boolean;
          message: string;
          data: {
            user: any;
            token: string;
            refreshToken?: string;
          };
        }>(`users/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`);

        if (response.success) {
          // Use AuthContext to set the user state
          const success = await login(response.data.user);
          if (success) {
            setStatus('success');
            toast.success('Google authentication successful! Redirecting...');
            
            // Add a small delay to allow the auth state to update
            setTimeout(() => {
              // Role-based navigation
              if (response.data.user.role === "admin") {
                navigate("/admin/dashboard", { replace: true });
              } else if (response.data.user.role === "futsalOwner") {
                navigate("/futsal-owner/dashboard", { replace: true });
              } else if (response.data.user.role === "user") {
                navigate("/dashboard", { replace: true });
              } else {
                navigate("/", { replace: true });
              }
            }, 1000);
          } else {
            setError('Failed to authenticate user');
            setStatus('error');
          }
        } else {
          setError(response.message || 'Authentication failed');
          setStatus('error');
        }
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
        setStatus('error');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, login]);

  const handleRetry = () => {
    setStatus('loading');
    setError('');
    // Redirect back to login page
    navigate('/login', { replace: true });
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="bg-background/80 animate-fade-in-up flex w-full max-w-md flex-col items-stretch gap-0 overflow-hidden rounded-md shadow-lg">
        <Card className="w-full border-none bg-transparent p-10 shadow-none">
          <CardHeader>
            <CardTitle className="w-full text-center text-2xl">
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Authentication Successful'}
              {status === 'error' && 'Authentication Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-center text-muted-foreground">
                    Processing your Google authentication...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <p className="text-center text-muted-foreground">
                    Successfully authenticated with Google!
                  </p>
                  <p className="text-center text-sm text-muted-foreground">
                    Redirecting to your dashboard...
                  </p>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="h-12 w-12 text-red-500" />
                  <p className="text-center text-muted-foreground">
                    {error}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleRetry} variant="outline">
                      Try Again
                    </Button>
                    <Button onClick={handleGoHome}>
                      Go Home
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 