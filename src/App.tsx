import React from 'react';
import { RouterProvider, useRouter } from './components/Router';
import { SystemProvider } from './components/SystemContext';
import { TopNavigation } from './components/TopNavigation';
import { MainFunctionArea } from './components/MainFunctionArea';
// Removed sidebar on homepage; using top status bar instead
import { HomeHeader } from './components/HomeHeader';
import { TopStatusBar } from './components/TopStatusBar';
import { InstrumentDebugView } from './components/InstrumentDebugView';
import { ThreeDGuideView } from './components/ThreeDGuideView';
import { RealtimeView } from './components/RealtimeView';
import { OfflineChartView } from './components/OfflineChartView';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';
import { Toaster } from 'sonner';
import { WizardProvider } from './components/WizardContext';
import { WizardOverlay } from './components/WizardOverlay';
import { useWizard } from './components/WizardContext';
import { HardwareToggleFab } from './components/HardwareToggleFab';

function MainApp() {
  const { currentRoute } = useRouter();
  const { isActive } = useWizard();

  return (
    <div className={`min-h-screen ${isActive ? 'bg-black' : 'bg-background'}`}>
      {currentRoute === 'dashboard' ? (
        <>
          <HomeHeader />
          <TopStatusBar />
          <div className="max-w-7xl mx-auto px-4">
            <MainFunctionArea />
          </div>
        </>
      ) : (
        <>
          {/* Non-dashboard layout stack: Wizard bar on top, then TopNavigation */}
          <div className="flex flex-col">
            {isActive && <WizardOverlay />}
            <TopNavigation />
          </div>
          {/* route views remain below */}
          {currentRoute === 'instrument-debug' ? (
            <InstrumentDebugView />
          ) : currentRoute === '3d-guide' ? (
            <ThreeDGuideView />
          ) : currentRoute === 'realtime' ? (
            <RealtimeView />
          ) : currentRoute === 'offline-chart' ? (
            <OfflineChartView />
          ) : currentRoute === 'report' ? (
            <ReportView />
          ) : currentRoute === 'settings' ? (
            <SettingsView />
          ) : (
            <div />
          )}
        </>
      )}
      <HardwareToggleFab />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <SystemProvider>
      <RouterProvider>
        <WizardProvider>
          <MainApp />
        </WizardProvider>
      </RouterProvider>
    </SystemProvider>
  );
}