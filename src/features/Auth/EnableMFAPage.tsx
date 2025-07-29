import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { apiQuery, apiMutation } from "@/shared/lib/apiWrapper";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MFASetupData {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}

interface BackupCodes {
  backupCodes: string[];
}

export default function EnableMFAPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"check" | "setup" | "verify" | "complete">(
    "check",
  );
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiQuery<{
        isMfaEnabled: boolean;
        backupCodesRemaining: number;
      }>("users/mfa/status");

      if (response.isMfaEnabled) {
        toast.success("MFA is already enabled for your account");
        navigate("/");
        return;
      }

      setStep("setup");
      await initializeMFASetup();
    } catch (error) {
      console.error("Error checking MFA status:", error);
      toast.error("Failed to check MFA status");
    } finally {
      setIsLoading(false);
    }
  };

  const initializeMFASetup = async () => {
    try {
      setIsLoading(true);
      const response = await apiQuery<MFASetupData>("users/mfa/setup");
      setSetupData(response);
    } catch (error) {
      console.error("Error initializing MFA setup:", error);
      toast.error("Failed to initialize MFA setup");
    } finally {
      setIsLoading(false);
    }
  };

  const enableMFA = async () => {
    if (!token || token.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    if (!setupData) {
      toast.error("Setup data not available");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiMutation<BackupCodes>({
        method: "POST",
        endpoint: "users/mfa/enable",
        body: {
          secret: setupData.secret,
          token: token,
        },
      });

      setBackupCodes(response.backupCodes);
      setStep("complete");
      toast.success("MFA enabled successfully!");
    } catch (error) {
      console.error("Error enabling MFA:", error);
      toast.error(
        "Failed to enable MFA. Please check your code and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopiedCodes(true);
      toast.success("Backup codes copied to clipboard");
      setTimeout(() => setCopiedCodes(false), 2000);
    } catch (error) {
      toast.error("Failed to copy backup codes");
    }
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded");
  };

  if (isLoading && step === "check") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking MFA status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Enable Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "setup" && setupData && (
              <>
                <Alert>
                  <AlertDescription>
                    Scan the QR code with your authenticator app (Google
                    Authenticator, Authy, etc.)
                  </AlertDescription>
                </Alert>

                <div className="text-center">
                  <img
                    src={setupData.qrCodeUrl}
                    alt="QR Code"
                    className="mx-auto border rounded-lg"
                    style={{ width: "200px", height: "200px" }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-key">Manual Entry Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="manual-key"
                      value={setupData.manualEntryKey}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(setupData.manualEntryKey);
                        toast.success("Key copied to clipboard");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token">
                    Enter 6-digit code from your authenticator app
                  </Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="123456"
                    value={token}
                    onChange={(e) =>
                      setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    className="text-center text-lg font-mono"
                  />
                </div>

                <Button
                  onClick={enableMFA}
                  disabled={token.length !== 6 || isLoading}
                  className="w-full"
                >
                  {isLoading ? "Enabling..." : "Enable MFA"}
                </Button>
              </>
            )}

            {step === "complete" && (
              <>
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    MFA Enabled Successfully!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Your account is now protected with two-factor
                    authentication.
                  </p>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Important:</strong> Save these backup codes in a
                    secure location. You'll need them if you lose access to your
                    authenticator app.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Backup Codes</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBackupCodes(!showBackupCodes)}
                      >
                        {showBackupCodes ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyBackupCodes}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadBackupCodes}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {showBackupCodes && (
                    <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="font-mono text-sm text-center p-2 bg-background rounded"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={() => navigate("/")} className="w-full">
                    Continue to Dashboard
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
