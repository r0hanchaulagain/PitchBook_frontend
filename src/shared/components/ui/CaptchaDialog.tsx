import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Button } from "@ui/button";
import { Label } from "@ui/label";
import Altcha from "@/shared/components/ui/Altcha";
import { toast } from "sonner";
import { EyeOff } from "lucide-react";

interface CaptchaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCaptchaComplete: (altchaValue: string) => void;
  isPending: boolean;
}

export function CaptchaDialog({
  open,
  onOpenChange,
  onCaptchaComplete,
  isPending,
}: CaptchaDialogProps) {
  const [altchaCompleted, setAltchaCompleted] = useState(false);
  const altchaRef = useRef<{ value: string | null }>(null);

  const handleAltchaStateChange = (ev: Event | CustomEvent) => {
    if ('detail' in ev && ev.detail.payload) {
      setAltchaCompleted(true);
    } else {
      setAltchaCompleted(false);
    }
  };

  const handleVerify = () => {
    const altchaValue = altchaRef.current?.value;
    if (!altchaValue) {
      toast.error("Please complete the CAPTCHA verification", {
        style: {
          background: "#fff0f1",
          color: "#d32f2f",
          border: "1px solid #f8bbbc",
        },
        icon: <EyeOff color="#d32f2f" size={20} />,
        position: "bottom-right",
      });
      return;
    }

    onCaptchaComplete(altchaValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete CAPTCHA Verification</DialogTitle>
          <DialogDescription>
            Please complete the CAPTCHA verification to continue with your registration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CAPTCHA Verification</Label>
            <div className="border rounded-md p-3 bg-muted/20">
              <Altcha
                ref={altchaRef}
                onStateChange={handleAltchaStateChange}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={!altchaCompleted || isPending}
            >
              {isPending ? "Verifying..." : "Register Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 