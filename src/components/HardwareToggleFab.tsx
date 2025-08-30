import React from 'react';
import { Button } from './ui/button';
import { Wifi, WifiOff } from 'lucide-react';
import { useSystem } from './SystemContext';

export function HardwareToggleFab() {
  const { hardwareConnected, isChecking, setHardwareConnected } = useSystem();

  const handleToggle = () => {
    if (isChecking) return;
    setHardwareConnected(!hardwareConnected);
  };

  return (
    <div className="fixed right-4 z-[10010]" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
      <Button onClick={handleToggle} disabled={isChecking} className="shadow-lg mt-8" aria-label={hardwareConnected ? '断开硬件' : '连接硬件'}>
        {hardwareConnected ? (
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>断开硬件</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>连接硬件</span>
          </div>
        )}
      </Button>
    </div>
  );
}


