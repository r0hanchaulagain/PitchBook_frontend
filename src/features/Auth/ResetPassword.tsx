import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiMutation } from "@lib/apiWrapper";

const passwordCriteria = [
  { label: "At least 10 characters", test: (pw: string) => pw.length >= 10 },
  {
    label: "At least one uppercase letter",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: "At least one lowercase letter",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  { label: "At least one number", test: (pw: string) => /[0-9]/.test(pw) },
  {
    label: "At least one special character",
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
];

function useQueryParams() {
  const { search } = useLocation();
  return Object.fromEntries(new URLSearchParams(search));
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { token, email } = useQueryParams();

  const mutation = useMutation({
    mutationFn: async (body: {
      token: string;
      email: string;
      password: string;
    }) =>
      apiMutation({
        method: "POST",
        endpoint: "/users/reset-password",
        body,
      }),
    onSuccess: () => {
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to reset password.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validate criteria
    const failed = passwordCriteria.filter((c) => !c.test(password));
    if (failed.length > 0) {
      toast.error(
        <div>
          <strong>Password requirements not met:</strong>
          <ul className="mt-1 list-inside list-disc">
            {failed.map((c) => (
              <li key={c.label}>{c.label}</li>
            ))}
          </ul>
        </div>,
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!token || !email) {
      toast.error("Invalid or expired reset link.");
      return;
    }
    setSubmitting(true);
    mutation.mutate({ token, email, password });
  }

  // Only allow if both token and email are present
  if (!token || !email) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="bg-background animate-fade-in-up mx-auto w-full max-w-md border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Invalid Reset Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-foreground/90 mt-2 text-center text-base">
              This password reset link is invalid or expired.
            </div>
            <Button className="mt-6 w-full" onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const meterFulfilled = passwordCriteria.every((c) => c.test(password));

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Card className="bg-background animate-fade-in-up mx-auto w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="mb-2 text-center text-3xl font-bold">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mb-4 text-center text-base">
            Resetting password for{" "}
            <span className="text-primary font-semibold">{email}</span>
          </div>
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div>
              <Label htmlFor="password" className="text-lg font-bold">
                New Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-primary rounded-md px-4 py-2 text-lg focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="text-muted-foreground hover:text-primary absolute top-1/2 right-2 -translate-y-1/2"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-lg font-bold">
                Confirm Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus:ring-primary rounded-md px-4 py-2 text-lg focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="text-muted-foreground hover:text-primary absolute top-1/2 right-2 -translate-y-1/2"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="mt-6">
              <Card
                className={`mb-1 w-full p-4 ${meterFulfilled ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"} transition-colors`}
              >
                <div className="mb-2 text-center text-xl font-bold">
                  Password Requirement
                </div>
                <ul className="text-base">
                  {passwordCriteria.map((c) => (
                    <li key={c.label} className="mb-1 flex items-center gap-2">
                      {c.test(password) ? (
                        <CheckCircle2 className="text-green-600" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                      <span
                        className={
                          c.test(password) ? "text-green-700" : "text-red-600"
                        }
                      >
                        {c.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            <Button
              type="submit"
              className="mt-4 w-full text-lg font-bold"
              disabled={submitting || mutation.isPending}
            >
              {submitting || mutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
