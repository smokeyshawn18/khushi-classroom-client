import React, { createContext, useContext, useState, useCallback } from "react";

interface GlobalLoaderContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
  message?: string;
  setMessage: (message?: string) => void;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextType | undefined>(
  undefined
);

export const GlobalLoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setMessage(undefined);
  }, []);

  return (
    <GlobalLoaderContext.Provider
      value={{
        isLoading,
        setIsLoading,
        startLoading,
        stopLoading,
        message,
        setMessage,
      }}
    >
      {children}
    </GlobalLoaderContext.Provider>
  );
};

export const useGlobalLoader = () => {
  const context = useContext(GlobalLoaderContext);
  if (!context) {
    throw new Error(
      "useGlobalLoader must be used within GlobalLoaderProvider"
    );
  }
  return context;
};
