import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@ui/alert";
import { apiMutation } from "@/shared/lib/apiWrapper";
import { toast } from "sonner";
import { Shield, ArrowLeft } from "lucide-react";

interface MFAVerificationProps {
  onVerificationSuccess: (user: any) => void;
  onBack: () => void;
  email: string;
}

export default function MFAVerification({
  onVerificationSuccess,
  onBack,
  email,
}: MFAVerificationProps) {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const verifyMFA = async () => {
    if (!token || token.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiMutation<{ user: any }>({
        method: "POST",
        endpoint: "users/mfa/verify",
        body: {
          token,
        },
      });

      toast.success("MFA verification successful!");
      onVerificationSuccess(response.user);
    } catch (error) {
      console.error("MFA verification error:", error);
      setAttempts((prev) => prev + 1);

      if (attempts >= 2) {
        toast.error("Too many failed attempts. Please try logging in again.");
        onBack();
        return;
      }

      toast.error("Invalid code. Please try again.");
      setToken("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      verifyMFA();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                We've sent a verification code to your authenticator app. Please
                enter it below to complete your login.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="mfa-token">Authentication Code</Label>
              <Input
                id="mfa-token"
                type="text"
                placeholder="123456"
                value={token}
                onChange={(e) =>
                  setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                onKeyPress={handleKeyPress}
                maxLength={6}
                className="text-center text-lg font-mono"
                autoFocus
              />
            </div>

            <Button
              onClick={verifyMFA}
              disabled={token.length !== 6 || isLoading}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>

            {attempts > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Failed attempts: {attempts}/3
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
