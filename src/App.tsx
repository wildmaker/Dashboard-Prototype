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

function MainApp() {
  const { currentRoute } = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {currentRoute === 'dashboard' ? (
        <>
          <HomeHeader />
          <TopStatusBar />
          <div className="max-w-6xl mx-auto px-6">
            <MainFunctionArea />
          </div>
        </>
      ) : (
        <>
          <TopNavigation />
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
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <SystemProvider>
      <RouterProvider>
        <MainApp />
      </RouterProvider>
    </SystemProvider>
  );
}