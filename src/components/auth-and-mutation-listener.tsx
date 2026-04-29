import { useEffect } from "react";
import { useNotification } from "@refinedev/core";
import { useGlobalLoader } from "@/context/global-loader-context";

/**
 * Component to listen to global auth and mutation events
 * and trigger the global loader accordingly
 */
export const AuthAndMutationListener = () => {
  const { setIsLoading } = useGlobalLoader();
  const { open } = useNotification();

  // Monitor create mutations
  useEffect(() => {
    // Listen for mutation start/end events
    const handleMutationStart = () => {
      setIsLoading(true);
    };

    const handleMutationEnd = () => {
      setIsLoading(false);
    };

    // Note: Refine doesn't have built-in events for this
    // We'll handle this through individual mutation hooks instead
    // See components/mutation-wrapper.tsx for implementation

    return () => {
      // Cleanup
    };
  }, [setIsLoading, open]);

  return null;
};
