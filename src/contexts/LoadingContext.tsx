import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(
    promise: Promise<T>, 
    message?: string
  ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showLoading = useCallback((message: string = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('Loading...');
  }, []);

  // Wrapper function to show loading during async operations
  const withLoading = useCallback(async <T,>(
    promise: Promise<T>,
    message: string = 'Loading...'
  ): Promise<T> => {
    showLoading(message);
    try {
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        showLoading,
        hideLoading,
        withLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
