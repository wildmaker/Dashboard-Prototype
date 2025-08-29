import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { HelpCircle, Settings, LogOut, FileText, Cpu, LayoutDashboard } from 'lucide-react';
import { useRouter } from './Router';
import { useSystem } from './SystemContext';

export function TopNavigation() {
  const { currentRoute, navigate } = useRouter();
  const { hardwareConnected, isChecking, workbenchSourceType } = useSystem();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const connectionText = isChecking ? '检测中' : hardwareConnected ? '已连接' : '未连接';
  const connectionDotClass = isChecking ? 'bg-amber-500' : hardwareConnected ? 'bg-green-500' : 'bg-red-500';

  return (
    <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Left: Logo + Primary Actions */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-4 cursor-pointer hover:opacity-85 transition-opacity focus:outline-none"
          aria-label="返回首页"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-lg font-medium text-foreground">主轴误差分析仪</h1>
            <p className="text-sm text-muted-foreground">Spindle Error Analyzer System</p>
          </div>
        </button>

        {/* Connection Status moved near title */}
        <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
          <div className={`w-2 h-2 rounded-full ${connectionDotClass} ${isChecking ? 'animate-pulse' : ''}`}></div>
          <span className="text-sm text-muted-foreground">{connectionText}</span>
        </div>

        {/* Module Navigation - left aligned */}
        <nav className="flex items-center gap-1 ml-2">
          <Button
            variant={currentRoute === 'realtime' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => navigate('realtime')}
            aria-current={currentRoute === 'realtime' ? 'page' : undefined}
          >
            <LayoutDashboard className="w-4 h-4" />
            工作台
          </Button>
          <Button
            variant={currentRoute === 'instrument-debug' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => navigate('instrument-debug')}
            aria-current={currentRoute === 'instrument-debug' ? 'page' : undefined}
          >
            <Cpu className="w-4 h-4" />
            调试
          </Button>
          <Button
            variant={currentRoute === 'report' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => navigate('report')}
            aria-current={currentRoute === 'report' ? 'page' : undefined}
          >
            <FileText className="w-4 h-4" />
            报告
          </Button>
          <Button
            variant={currentRoute === 'settings' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => navigate('settings')}
            aria-current={currentRoute === 'settings' ? 'page' : undefined}
          >
            <Settings className="w-4 h-4" />
            设置
          </Button>
        </nav>
      </div>


      {/* Right: Time + Auxiliary Navigation */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md mr-1">
          <span className="text-xs font-mono">{formatTime(currentTime)}</span>
        </div>

        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          帮助
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <LogOut className="w-4 h-4" />
          退出
        </Button>
      </div>
    </header>
  );
}