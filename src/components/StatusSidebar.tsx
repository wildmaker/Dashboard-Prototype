import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Wifi, Cpu, Database, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface StatusItemProps {
  name: string;
  status: 'normal' | 'abnormal' | 'unconfigured';
  icon: React.ReactNode;
  details?: string;
}

function StatusItem({ name, status, icon, details }: StatusItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'abnormal': return 'bg-red-500';
      case 'unconfigured': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return '正常';
      case 'abnormal': return '异常';
      case 'unconfigured': return '未配置';
      default: return '未知';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'abnormal': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'unconfigured': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">
          {icon}
        </div>
        <div>
          <div className="font-medium text-sm">{name}</div>
          {details && <div className="text-xs text-muted-foreground">{details}</div>}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {getStatusIcon(status)}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} ${status === 'normal' ? 'animate-pulse' : ''}`}></div>
          <span className="text-xs font-medium">{getStatusText(status)}</span>
        </div>
      </div>
    </div>
  );
}

export function StatusSidebar() {
  const deviceStatuses = [
    {
      name: '压力传感器',
      status: 'normal' as const,
      icon: <Cpu className="w-4 h-4" />,
      details: 'PSI-001'
    },
    {
      name: '温度传感器',
      status: 'normal' as const,
      icon: <Cpu className="w-4 h-4" />,
      details: 'TMP-002'
    },
    {
      name: '位移编码器',
      status: 'abnormal' as const,
      icon: <Cpu className="w-4 h-4" />,
      details: 'ENC-003'
    },
    {
      name: '数据采集卡',
      status: 'unconfigured' as const,
      icon: <Database className="w-4 h-4" />,
      details: 'DAQ-001'
    }
  ];

  const connectionStatus = 'connected'; // connected, disconnected, connecting

  return (
    <div className="w-80 bg-muted/20 border-l border-border p-6 space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi className="w-5 h-5" />
            连接状态
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">设备连接</span>
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'} className="gap-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              {connectionStatus === 'connected' ? '已连接' : '未连接'}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <div>IP: 192.168.1.100</div>
            <div>端口: 8080</div>
            <div>延迟: 12ms</div>
          </div>
        </CardContent>
      </Card>

      {/* Hardware Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-5 h-5" />
            硬件状态
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {deviceStatuses.map((device, index) => (
            <StatusItem
              key={index}
              name={device.name}
              status={device.status}
              icon={device.icon}
              details={device.details}
            />
          ))}
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">状态说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>绿色 - 正常运行</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>红色 - 设备异常</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>黄色 - 未配置</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}