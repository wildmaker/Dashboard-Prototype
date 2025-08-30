import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import { useRouter } from './Router';

export type WizardStep = 1 | 2 | 3;

interface WizardContextType {
  isActive: boolean;
  currentStep: WizardStep;
  totalSteps: number;
  startWizard: (initialStep?: WizardStep) => void;
  endWizard: () => void;
  goToStep: (step: WizardStep) => void;
  goNext: () => void;
  goPrev: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

function useWizardNavigation() {
  const { navigate } = useRouter();

  const routeForStep = useCallback((step: WizardStep) => {
    if (step === 2) return 'instrument-debug' as const;
    return 'settings' as const;
  }, []);

  const settingsTabForStep = useCallback((step: WizardStep) => {
    switch (step) {
      case 1:
        // 场景配置 → 传感器配置页
        return 'sensor';
      case 3:
        // 参数配置
        return 'analysis';
      // no step 4
      default:
        return undefined;
    }
  }, []);

  const syncNavigation = useCallback((step: WizardStep) => {
    const targetRoute = routeForStep(step);
    navigate(targetRoute);
    // Settings tab selection is handled inside SettingsView based on wizard currentStep
  }, [navigate, routeForStep]);

  return { syncNavigation, settingsTabForStep };
}

export function WizardProvider({ children }: { children?: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const totalSteps = 3;
  const { syncNavigation } = useWizardNavigation();

  const startWizard = useCallback((initialStep?: WizardStep) => {
    const step = initialStep ?? 1;
    setCurrentStep(step);
    setIsActive(true);
    syncNavigation(step);
  }, [syncNavigation]);

  const endWizard = useCallback(() => {
    setIsActive(false);
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
    syncNavigation(step);
  }, [syncNavigation]);

  const goNext = useCallback(() => {
    setCurrentStep(prev => {
      const next = (prev + 1) as WizardStep;
      const bounded = (next > 3 ? 3 : next) as WizardStep;
      syncNavigation(bounded);
      return bounded;
    });
  }, [syncNavigation]);

  const goPrev = useCallback(() => {
    setCurrentStep(prev => {
      const next = (prev - 1) as WizardStep;
      const bounded = (next < 1 ? 1 : next) as WizardStep;
      syncNavigation(bounded);
      return bounded;
    });
  }, [syncNavigation]);

  const value = useMemo(() => ({
    isActive,
    currentStep,
    totalSteps,
    startWizard,
    endWizard,
    goToStep,
    goNext,
    goPrev,
  }), [isActive, currentStep, startWizard, endWizard, goToStep, goNext, goPrev]);

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
}

export function useWizardSettingsTab(): string | undefined {
  // Helper hook for SettingsView to decide which tab to show during wizard
  const { isActive, currentStep } = useWizard();
  const { settingsTabForStep } = useWizardNavigation();
  const [tab, setTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isActive) {
      setTab(settingsTabForStep(currentStep));
    } else {
      setTab(undefined);
    }
  }, [isActive, currentStep, settingsTabForStep]);

  // Only provide an initial suggestion; consumers should not lock to this value.
  return tab;
}


