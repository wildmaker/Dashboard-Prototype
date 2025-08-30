import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SystemContextType {
  hardwareConnected: boolean;
  isChecking: boolean;
  setHardwareConnected: (connected: boolean) => void;
  workbenchSourceType: 'realtime' | 'history' | null;
  setWorkbenchSourceType: (type: 'realtime' | 'history' | null) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children?: ReactNode }) {
  const [hardwareConnected, setHardwareConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [workbenchSourceType, setWorkbenchSourceType] = useState<'realtime' | 'history' | null>(null);

  useEffect(() => {
    // Simulate async hardware detection. Replace with real check as needed.
    const timer = setTimeout(() => {
      // Prefer a persisted flag for demo; default to connected=true if not set
      const persisted = localStorage.getItem('hardwareConnected');
      const value = persisted !== null ? persisted === 'true' : true;
      setHardwareConnected(value);
      setIsChecking(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Persist hardware connection state for demo toggling across pages/refreshes
    localStorage.setItem('hardwareConnected', String(hardwareConnected));
  }, [hardwareConnected]);

  return (
    <SystemContext.Provider value={{ hardwareConnected, isChecking, setHardwareConnected, workbenchSourceType, setWorkbenchSourceType }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const ctx = useContext(SystemContext);
  if (!ctx) {
    throw new Error('useSystem must be used within SystemProvider');
  }
  return ctx;
}


