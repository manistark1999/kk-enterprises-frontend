import React, { createContext, useContext, useCallback, useRef } from 'react';

interface DashboardRefreshContextType {
  /** Call this after any save / update / delete to re-fetch dashboard stats */
  triggerDashboardRefresh: () => void;
  /** Internal: lets DashboardPage register its refetch function */
  registerRefreshCallback: (fn: () => void) => void;
}

const DashboardRefreshContext = createContext<DashboardRefreshContextType>({
  triggerDashboardRefresh: () => {},
  registerRefreshCallback: () => {},
});

export function DashboardRefreshProvider({ children }: { children: React.ReactNode }) {
  // Store the callback registered by DashboardPage
  const callbackRef = useRef<(() => void) | null>(null);

  const registerRefreshCallback = useCallback((fn: () => void) => {
    callbackRef.current = fn;
  }, []);

  const triggerDashboardRefresh = useCallback(() => {
    // Small debounce so that rapid sequential saves don't fire multiple calls
    if ((triggerDashboardRefresh as any)._timer) {
      clearTimeout((triggerDashboardRefresh as any)._timer);
    }
    (triggerDashboardRefresh as any)._timer = setTimeout(() => {
      callbackRef.current?.();
    }, 300);
  }, []);

  return (
    <DashboardRefreshContext.Provider value={{ triggerDashboardRefresh, registerRefreshCallback }}>
      {children}
    </DashboardRefreshContext.Provider>
  );
}

export function useDashboardRefresh() {
  return useContext(DashboardRefreshContext);
}
