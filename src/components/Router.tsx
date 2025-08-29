import React, { createContext, useContext, useState, ReactNode } from 'react';

type Route = 'dashboard' | 'instrument-debug' | '3d-guide' | 'realtime' | 'offline-chart' | 'report' | 'settings';

interface RouterContextType {
  currentRoute: Route;
  navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children?: ReactNode }) {
  // Default to workbench as core page
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');

  const navigate = (route: Route) => {
    setCurrentRoute(route);
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
}