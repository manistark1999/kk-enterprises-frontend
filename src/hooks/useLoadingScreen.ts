import { useState, useCallback } from 'react';

/**
 * Custom hook for managing loading states in components
 * 
 * @returns Object with loading state and control functions
 * 
 * @example
 * ```tsx
 * const { isLoading, showLoading, hideLoading, withLoading } = useLoadingScreen();
 * 
 * // Manual control
 * showLoading();
 * // ... do something
 * hideLoading();
 * 
 * // With async function
 * await withLoading(async () => {
 *   const data = await fetchData();
 *   return data;
 * });
 * ```
 */
export function useLoadingScreen() {
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

  /**
   * Wraps an async function with loading state management
   * @param fn Async function to execute
   * @param message Optional loading message
   * @returns Promise with the result of the async function
   */
  const withLoading = useCallback(async <T,>(
    fn: () => Promise<T>,
    message: string = 'Loading...'
  ): Promise<T> => {
    showLoading(message);
    try {
      const result = await fn();
      return result;
    } catch (error) {
      throw error;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    withLoading,
  };
}
