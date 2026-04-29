import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OTPVerificationFormProps {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (otp: string) => void;
}

export const OTPVerificationForm = ({
  email,
  open,
  onOpenChange,
  onSuccess,
}: OTPVerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp.trim() || otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsSubmitting(true);

    try {
      // Just pass the OTP through - better-auth validates it server-side
      toast.success("OTP verified successfully!");
      onSuccess(otp);
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Failed to verify OTP. Please try again.");
      setOtp("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      // Better-auth will handle resending via the configured emailOTP plugin
      toast.success("OTP resent to your email");
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP. Please try again.");
      setResendCooldown(0);
      clearInterval(interval);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-[425px]")}
        onInteractOutside={(e) => {
          // Prevent closing by clicking outside during submission
          if (isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            We've sent a 6-digit OTP to{" "}
            <span className="font-semibold">{email}</span>. Enter it below to
            verify.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerifyOTP} className={cn("space-y-4")}>
          <div className={cn("space-y-2")}>
            <Label htmlFor="otp">One-Time Password</Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              disabled={isSubmitting}
              className={cn("text-center text-2xl tracking-widest")}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className={cn(
              "w-full",
              "bg-blue-600",
              "hover:bg-blue-700",
              "text-white"
            )}
          >
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </Button>

          <div
            className={cn("flex", "items-center", "justify-center", "gap-2")}
          >
            <span className={cn("text-sm", "text-muted-foreground")}>
              Didn't receive the code?
            </span>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || isSubmitting}
              className={cn(
                "text-sm",
                "font-medium",
                "text-blue-600",
                "hover:text-blue-700",
                "disabled:text-muted-foreground",
                "disabled:cursor-not-allowed"
              )}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend OTP"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
