import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiMutation } from "@lib/apiWrapper";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@ui/dropdown-menu";
import { GoogleOAuthButton } from "@/shared/components/ui/GoogleOAuthButton";
import { CaptchaDialog } from "@/shared/components/ui/CaptchaDialog";

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

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
  phone: z
    .string()
    .length(10, { message: "Invalid phone number format" })
    .regex(/^(97|98)[0-9]{8}$/, { message: "Invalid phone number format" }),
  role: z.enum(["user", "futsalOwner"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState<"user" | "futsalOwner">("user");
  const [captchaDialogOpen, setCaptchaDialogOpen] = useState(false);
  const [formData, setFormData] = useState<RegisterForm | null>(null);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    setValue,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: { role: "user" },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm & { altcha: any }) =>
      apiMutation({
        method: "POST",
        endpoint: "users/register",
        body: data,
      }),
    onSuccess: () => {
      toast.success("Registration successful! Please login.");
      setTimeout(() => navigate("/login"), 1000);
    },
    onError: (err: any) => {
      if (err?.field) {
        setError(err.field, { message: err.message });
      } else {
        toast.error(err.message || "Registration failed", {
          style: {
            background: "#fff0f1",
            color: "#d32f2f",
            border: "1px solid #f8bbbc",
          },
          icon: <EyeOff color="#d32f2f" size={20} />,
          position: "bottom-right",
        });
      }
    },
  });

  function onSubmit(data: RegisterForm) {
    setSubmitted(true);

    // Password validation feedback toast (manual, not zod)
    const password = data.password;
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
        {
          style: {
            background: "#fff0f1",
            color: "#d32f2f",
            border: "1px solid #f8bbbc",
          },
          icon: <EyeOff color="#d32f2f" size={20} />,
          position: "bottom-right",
        },
      );
      return;
    }

    // Store form data and open captcha dialog
    setFormData(data);
    setCaptchaDialogOpen(true);
  }

  function handleCaptchaComplete(altchaValue: string) {
    if (!formData) return;

    // Include ALTCHA token in the registration data
    const registrationData = {
      ...formData,
      role,
      altcha: altchaValue,
    };

    registerMutation.mutate(registrationData);
    setCaptchaDialogOpen(false);
  }

  function handleRoleChange(newRole: "user" | "futsalOwner") {
    setRole(newRole);
    setValue("role", newRole, { shouldDirty: true });
  }



  return (
    <>
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="bg-background/80 animate-fade-in-up flex w-full max-w-3xl flex-col items-stretch gap-0 overflow-hidden rounded-md shadow-lg md:flex-row md:gap-0">
          <div className="bg-background flex flex-1 items-center justify-center p-8">
            <Card className="w-full max-w-md border-none bg-transparent p-0 shadow-none">
              <CardHeader>
                <CardTitle className="w-full text-center text-2xl">
                  Register
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Google OAuth Button */}
                <div className="mb-6">
                  <GoogleOAuthButton />
                </div>

                {/* Divider */}
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
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                  autoComplete="on"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your full name"
                      aria-invalid={!!errors.fullName}
                      className={
                        "transition-all duration-200 focus:scale-[1.03]" +
                        (submitted && errors.fullName
                          ? " border-destructive ring-destructive/30 bg-red-50 ring-2"
                          : "")
                      }
                      {...register("fullName")}
                    />
                    {submitted && errors.fullName && (
                      <div className="text-destructive animate-fade-in text-xs">
                        {errors.fullName.message}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      className={
                        "transition-all duration-200 focus:scale-[1.03]" +
                        (submitted && errors.email
                          ? " border-destructive ring-destructive/30 bg-red-50 ring-2"
                          : "")
                      }
                      {...register("email")}
                    />
                    {submitted && errors.email && (
                      <div className="text-destructive animate-fade-in text-xs">
                        {errors.email.message}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98XXXXXXXX"
                      aria-invalid={!!errors.phone}
                      className={
                        "transition-all duration-200 focus:scale-[1.03]" +
                        (submitted && errors.phone
                          ? " border-destructive ring-destructive/30 bg-red-50 ring-2"
                          : "")
                      }
                      {...register("phone")}
                    />
                    {submitted && errors.phone && (
                      <div className="text-destructive animate-fade-in text-xs">
                        {errors.phone.message}
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
                          (submitted && errors?.password
                            ? " border-destructive ring-destructive/30 bg-red-50 ring-2"
                            : "")
                        }
                        {...register("password")}
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
                    {submitted && errors.password && (
                      <div className="text-destructive animate-fade-in text-xs">
                        {errors.password.message}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {role === "user" ? "User" : "Futsal Owner"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full min-w-[8rem]">
                        <DropdownMenuCheckboxItem
                          checked={role === "user"}
                          onCheckedChange={() => handleRoleChange("user")}
                        >
                          User
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={role === "futsalOwner"}
                          onCheckedChange={() =>
                            handleRoleChange("futsalOwner")
                          }
                        >
                          Futsal Owner
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {submitted && errors.role && (
                      <div className="text-destructive animate-fade-in text-xs">
                        {errors.role.message}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full transition-all duration-150 hover:scale-[1.02]"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Registering..." : "Continue to Verification"}
                  </Button>
                  <div className="pt-2 text-center">
                    <a
                      href="/login"
                      className="text-muted-foreground text-sm hover:underline"
                    >
                      Registered User?{" "}
                      <span className="text-primary font-semibold">Login</span>
                    </a>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="relative hidden min-h-[430px] flex-1 md:block">
            <img
              src="/images/auth_pages/login-side.png"
              alt="Register visual"
              className="absolute inset-0 h-full w-full object-cover object-center select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
      
      <CaptchaDialog
        open={captchaDialogOpen}
        onOpenChange={setCaptchaDialogOpen}
        onCaptchaComplete={handleCaptchaComplete}
        isPending={registerMutation.isPending}
      />
    </>
  );
}
