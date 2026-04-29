import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLink, useRefineOptions } from "@refinedev/core";
import { authClient } from "@/lib/auth-client";
import { OTPVerificationForm } from "./otp-verification-form";
import { NewPasswordForm } from "./new-password-form";

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOTPForm, setShowOTPForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [verifiedOTP, setVerifiedOTP] = useState("");

  const Link = useLink();
  const { title } = useRefineOptions();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });

      toast.success("Password reset email sent! Check your inbox.");

      setShowOTPForm(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerified = (otp: string) => {
    if (!otp) {
      toast.error("Invalid OTP");
      return;
    }

    setVerifiedOTP(otp);
    setShowOTPForm(false);
    setShowPasswordForm(true);
  };

  const handlePasswordReset = () => {
    setShowPasswordForm(false);
    setEmail("");
    setVerifiedOTP("");

    toast.success("Password reset successfully! Redirecting...");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  const resetFlow = () => {
    setShowOTPForm(false);
    setShowPasswordForm(false);
    setVerifiedOTP("");
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-8 min-h-svh"
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {title?.icon && (
          <div className="text-foreground [&>svg]:w-12 [&>svg]:h-12">
            {title.icon}
          </div>
        )}
      </div>

      <Card className="sm:w-[456px] p-12 mt-6">
        <CardHeader className="px-0">
          <CardTitle className="text-blue-600 dark:text-blue-400 text-3xl font-semibold">
            Forgot password
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Enter your email to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>

              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1"
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={resetFlow}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </CardContent>
      </Card>

      <OTPVerificationForm
        email={email}
        open={showOTPForm}
        onOpenChange={setShowOTPForm}
        onSuccess={handleOTPVerified}
      />

      <NewPasswordForm
        email={email}
        otp={verifiedOTP}
        open={showPasswordForm}
        onOpenChange={setShowPasswordForm}
        onSuccess={handlePasswordReset}
      />
    </div>
  );
};

ForgotPasswordForm.displayName = "ForgotPasswordForm";
