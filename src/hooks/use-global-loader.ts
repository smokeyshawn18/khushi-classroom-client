import { useEffect } from "react";
import { useGlobalLoader } from "@/context/global-loader-context";

/**
 * Hook to integrate global loader with refine mutations
 * Monitors mutation loading state and shows/hides the loader
 */
export const useGlobalLoaderWithMutation = (
  isLoading: boolean,
  message?: string
) => {
  const { setIsLoading, setMessage } = useGlobalLoader();

  useEffect(() => {
    setIsLoading(isLoading);
    if (isLoading && message) {
      setMessage(message);
    }
  }, [isLoading, message, setIsLoading, setMessage]);
};

/**
 * Hook to manually control global loader
 * Useful for custom async operations
 */
export const useManualGlobalLoader = () => {
  const { startLoading, stopLoading, setMessage } = useGlobalLoader();

  return {
    show: (message?: string) => {
      if (message) setMessage(message);
      startLoading();
    },
    hide: () => {
      stopLoading();
    },
  };
};
