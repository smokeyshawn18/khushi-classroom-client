"use client";

import { Loader2 } from "lucide-react";
import { useGlobalLoader } from "@/context/global-loader-context";

export const GlobalLoader = () => {
  const { isLoading, message } = useGlobalLoader();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        {message && (
          <p className="text-white text-center text-sm font-medium max-w-xs">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
