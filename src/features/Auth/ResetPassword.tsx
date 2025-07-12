import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { useLocation, useNavigate } from "react-router-dom";

export default function ForgotStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  // Status and image can be passed via location.state
  const { status = "Email sent" } = location.state || {};

  return (
    <div className="bg-muted flex min-h-screen items-center justify-center">
      <Card className="bg-background animate-fade-in-up mx-auto w-full max-w-sm border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Check Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <img
            src="/images/auth_pages/email_sent.png"
            alt="Email sent"
            className="h-32 w-32 object-contain select-none"
            draggable={false}
          />
          <div className="text-foreground/90 mt-2 text-center text-base">
            {status}
          </div>
          <Button
            className="bg-primary hover:bg-primary/75 mt-6 w-full rounded py-2 font-semibold transition"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
