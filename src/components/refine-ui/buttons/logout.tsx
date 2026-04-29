import React from "react";
import { useLogout } from "@refinedev/core";
import { useGlobalLoaderWithMutation } from "@/hooks/use-global-loader";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ButtonProps } from "react-day-picker";

export const LogoutButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  const { mutate: logout, isPending } = useLogout();

  // Show loader during logout
  useGlobalLoaderWithMutation(isPending, "Logging out...");

  const handleLogout = () => {
    logout();
  };

  return (
    <Button onClick={handleLogout} disabled={isPending} {...props}>
      <LogOut className="w-4 h-4 mr-2" />
      {children || "Logout"}
    </Button>
  );
};

export default LogoutButton;
