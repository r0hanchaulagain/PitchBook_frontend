import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiMutation } from "@/shared/lib/apiWrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, type User } from "@/contexts/AuthContext";
import { GoogleOAuthButton } from "@/shared/components/ui/GoogleOAuthButton";
import MFAVerification from "./MFAVerification";
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
});
type LoginForm = z.infer<typeof loginSchema>;
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showMFAVerification, setShowMFAVerification] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    getValues,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setLoginEmail(data.email);
      const response = await apiMutation<{
        user: User;
        token: string;
        requiresMFA?: boolean;
      }>({
        method: "POST",
        endpoint: "users/login",
        body: data,
      });
      if (response.requiresMFA) {
        setShowMFAVerification(true);
        return;
      }
      const success = await login(response.user);
      if (success) {
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          if (response.user.role === "admin") {
            navigate("/admin/dashboard", { replace: true });
          } else if (response.user.role === "futsalOwner") {
            navigate("/futsal-owner/dashboard", { replace: true });
          } else if (response.user.role === "user") {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 100);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err?.field === "email" || err?.field === "password") {
        setError(err.field, { message: err.message });
      } else {
        toast.error(err.message || "Login failed. Please try again.", {
          style: {
            background: "#fff0f1",
            color: "#d32f2f",
            border: "1px solid #f8bbbc",
          },
          icon: <EyeOff color="#d32f2f" size={20} />,
          position: "bottom-right",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleMFAVerificationSuccess = async (user: User) => {
    try {
      const success = await login(user);
      if (success) {
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          if (user.role === "admin") {
            navigate("/admin/dashboard", { replace: true });
          } else if (user.role === "futsalOwner") {
            navigate("/futsal-owner/dashboard", { replace: true });
          } else if (user.role === "user") {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error completing login after MFA:", error);
      toast.error("Failed to complete login. Please try again.");
    }
  };
  async function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    if (!getValues || !getValues("email")) {
      toast.error(
        "Please enter your email address before requesting a password reset.",
      );
      return;
    }
    setForgotLoading(true);
    try {
      await apiMutation({
        method: "POST",
        endpoint: "users/forgot-password",
        body: { email: getValues("email") },
      });
      navigate("/auth/forgot-status", {
        state: {
          status:
            "If your email is registered, a password reset link has been sent. Please check your inbox (and spam folder).",
          image: "/mail-sent.png",
        },
        replace: true,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link. Try again.");
    } finally {
      setForgotLoading(false);
    }
  }
  if (showMFAVerification) {
    return (
      <MFAVerification
        onVerificationSuccess={handleMFAVerificationSuccess}
        onBack={() => setShowMFAVerification(false)}
        email={loginEmail}
      />
    );
  }
  return (
    <>
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="bg-background/80 animate-fade-in-up flex w-full max-w-3xl flex-col items-stretch gap-0 overflow-hidden rounded-md shadow-lg md:flex-row md:gap-0">
          <div className="bg-background flex flex-1 items-center justify-center p-8">
            <Card className="w-full max-w-md border-none bg-transparent p-0 shadow-none">
              <CardHeader>
                <CardTitle className="w-full text-center text-2xl">
                  Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                {}
                <div className="mb-6">
                  <GoogleOAuthButton />
                </div>
                {}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <form
                  onSubmit={handleSubmit(handleLogin)}
                  className="space-y-5"
                  autoComplete="on"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoFocus
                      aria-invalid={!!errors.email}
                      className={
                        "transition-all duration-200 focus:scale-[1.03]" +
                        (errors.email
                          ? " border-destructive ring-destructive/30 bg-red-50 ring-2"
                          : "")
                      }
                      {...register("email")}
                    />
                    {errors.email && (
                      <div className="text-destructive animate-fade-in text-xs">
                        {errors.email.message}
                      </div>
                    )}
                  </div>
                  <div className="relative space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        aria-invalid={!!errors?.password}
                        className={
                          "pr-10 transition-all duration-200 focus:scale-[1.03]" +
                          (errors?.password
                            ? " border-destructive ring-destructive/30 bg-red-50 ring-2"
                            : "")
                        }
                        {...(register ? register("password") : {})}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 focus:outline-none"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-foreground/90 hover:text-primary text-sm font-semibold underline underline-offset-2 transition-colors disabled:opacity-60"
                        style={{ fontFamily: "inherit" }}
                        disabled={forgotLoading}
                      >
                        Forgot password?
                      </button>
                    </div>
                    {errors.password && (
                      <div className="text-destructive animate-fade-in text-xs">
                        {errors.password.message}
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full transition-all duration-150 hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                  <div className="pt-2 text-center">
                    <a
                      href="/register"
                      className="text-muted-foreground text-sm hover:underline"
                    >
                      Not registered yet?{" "}
                      <span className="text-primary font-semibold">
                        Register now!
                      </span>
                    </a>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="relative hidden min-h-[430px] flex-1 md:block">
            <img
              src="/images/auth_pages/login-side.png"
              alt="Login visual"
              className="absolute inset-0 h-full w-full object-cover object-center select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}
