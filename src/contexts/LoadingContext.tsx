import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(
    promise: Promise<T>, 
    message?: string
  ) => Promise<T>;
  withMinimumLoading: <T>(
    promise: Promise<T>,
    message?: string,
    minDelay?: number
  ) => Promise<T>;
  withActionLoading: (
    action: () => void,
    message?: string,
    delay?: number
  ) => Promise<void>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const isLoadingRef = useRef(false);

  const showLoading = useCallback((message: string = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
    isLoadingRef.current = true;
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    isLoadingRef.current = false;
    setLoadingMessage('Loading...');
  }, []);

  // Wrapper function to show loading during async operations
  const withLoading = useCallback(async <T,>(
    promise: Promise<T>,
    message: string = 'Loading...'
  ): Promise<T> => {
    if (isLoadingRef.current) return promise; // Prevent double trigger
    
    showLoading(message);
    try {
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  // Ensure a minimum visual loading time for smooth UX
  const withMinimumLoading = useCallback(async <T,>(
    promise: Promise<T>,
    message: string = 'Loading...',
    minDelay: number = 1200
  ): Promise<T> => {
    if (isLoadingRef.current) return promise;

    const startTime = Date.now();
    showLoading(message);
    
    try {
      const result = await promise;
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
      }
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  // For synchronous actions like opening modals/drawers or navigation state changes
  const withActionLoading = useCallback(async (
    action: () => void,
    message: string = 'Preparing...',
    delay: number = 1000
  ): Promise<void> => {
    if (isLoadingRef.current) return;

    showLoading(message);
    
    // Artificial delay to show loader
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      action();
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
        withMinimumLoading,
        withActionLoading,
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
