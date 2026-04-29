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
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface NewPasswordFormProps {
  email: string;
  otp: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const NewPasswordForm = ({
  email,
  otp,
  open,
  onOpenChange,
  onSuccess,
}: NewPasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call better-auth to reset password with email, OTP, and new password
      const response = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password,
      });

      if (!response) {
        toast.error("Failed to reset password. Please try again.");
        return;
      }

      toast.success("Password reset successfully!");
      setPassword("");
      setConfirmPassword("");
      onSuccess();
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <DialogTitle>Reset Your Password</DialogTitle>
          <DialogDescription>
            Enter your new password below. Make sure it's at least 8 characters
            long.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleResetPassword} className={cn("space-y-4")}>
          <div className={cn("space-y-2")}>
            <Label htmlFor="password">New Password</Label>
            <div className={cn("relative")}>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className={cn("pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className={cn(
                  "absolute",
                  "right-3",
                  "top-1/2",
                  "-translate-y-1/2",
                  "text-muted-foreground",
                  "hover:text-foreground",
                  "disabled:cursor-not-allowed"
                )}
              >
                {showPassword ? (
                  <EyeOff className={cn("w-4", "h-4")} />
                ) : (
                  <Eye className={cn("w-4", "h-4")} />
                )}
              </button>
            </div>
          </div>

          <div className={cn("space-y-2")}>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className={cn("relative")}>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className={cn("pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
                className={cn(
                  "absolute",
                  "right-3",
                  "top-1/2",
                  "-translate-y-1/2",
                  "text-muted-foreground",
                  "hover:text-foreground",
                  "disabled:cursor-not-allowed"
                )}
              >
                {showConfirmPassword ? (
                  <EyeOff className={cn("w-4", "h-4")} />
                ) : (
                  <Eye className={cn("w-4", "h-4")} />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !password || !confirmPassword}
            className={cn(
              "w-full",
              "bg-blue-600",
              "hover:bg-blue-700",
              "text-white"
            )}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
