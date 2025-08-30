import React from 'react';
import { Cpu, Database, Wifi } from 'lucide-react';
import { useSystem } from './SystemContext';

export function TopStatusBar() {
  const { hardwareConnected, isChecking } = useSystem();

  const connectionText = isChecking ? '检测中' : hardwareConnected ? '已连接' : '未连接';
  const connectionDotClass = isChecking ? 'bg-amber-500' : hardwareConnected ? 'bg-green-500' : 'bg-red-500';

  const deviceStatuses = [
    { name: '压力传感器', status: 'normal' as const, icon: <Cpu className="w-4 h-4" />, details: 'PSI-001' },
    { name: '温度传感器', status: 'normal' as const, icon: <Cpu className="w-4 h-4" />, details: 'TMP-002' },
    { name: '位移编码器', status: 'abnormal' as const, icon: <Cpu className="w-4 h-4" />, details: 'ENC-003' },
    { name: '数据采集卡', status: 'unconfigured' as const, icon: <Database className="w-4 h-4" />, details: 'DAQ-001' },
  ];

  const statusColor = (s: 'normal' | 'abnormal' | 'unconfigured') =>
    s === 'normal' ? 'bg-green-500' : s === 'abnormal' ? 'bg-red-500' : 'bg-yellow-500';

  return (
    <div className="bg-muted/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border">
          <Wifi className="w-4 h-4" />
          <div className={`w-2 h-2 rounded-full ${connectionDotClass} ${hardwareConnected ? 'animate-pulse' : ''}`}></div>
          <span className="text-sm text-muted-foreground">{connectionText}</span>
        </div>

        {deviceStatuses.map((d, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border">
            {d.icon}
            <span className="text-sm">{d.name}</span>
            <div className={`w-2 h-2 rounded-full ${statusColor(d.status)}`}></div>
            <span className="text-xs text-muted-foreground">{d.details}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
