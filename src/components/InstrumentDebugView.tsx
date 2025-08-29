import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Gauge, RotateCcw, Settings2, Play, Pause, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRouter } from './Router';

// 圆形表盘组件
interface CircularGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  title: string;
  warningThreshold?: number;
  dangerThreshold?: number;
  size?: number;
}

function CircularGauge({ 
  value, 
  min, 
  max, 
  unit, 
  title, 
  warningThreshold = 80,
  dangerThreshold = 90,
  size = 200 
}: CircularGaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 270 - 135; // -135° to +135° (270° total)
  
  const getStatusColor = () => {
    const absValue = Math.abs(value);
    if (absValue > dangerThreshold) return '#ef4444'; // red
    if (absValue > warningThreshold) return '#f59e0b'; // yellow
    return '#22c55e'; // green
  };

  const statusColor = getStatusColor();
  const center = size / 2;
  const radius = size / 2 - 30;
  
  // 计算指针端点
  const needleLength = radius - 10;
  const needleX = center + needleLength * Math.cos((angle * Math.PI) / 180);
  const needleY = center + needleLength * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="flex flex-col items-center">
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* 背景圆弧 */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 1 1 ${center + radius} ${center}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* 刻度线 */}
          {Array.from({ length: 11 }, (_, i) => {
            const tickAngle = -135 + (i * 27); // 每27度一个刻度
            const tickStartRadius = radius - 15;
            const tickEndRadius = radius - 5;
            const startX = center + tickStartRadius * Math.cos((tickAngle * Math.PI) / 180);
            const startY = center + tickStartRadius * Math.sin((tickAngle * Math.PI) / 180);
            const endX = center + tickEndRadius * Math.cos((tickAngle * Math.PI) / 180);
            const endY = center + tickEndRadius * Math.sin((tickAngle * Math.PI) / 180);
            
            return (
              <line
                key={i}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#9ca3af"
                strokeWidth="2"
              />
            );
          })}
          
          {/* 指针 */}
          <line
            x1={center}
            y1={center}
            x2={needleX}
            y2={needleY}
            stroke={statusColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* 中心圆 */}
          <circle
            cx={center}
            cy={center}
            r="6"
            fill={statusColor}
          />
        </svg>
        
        {/* 数值显示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-mono font-bold" style={{ color: statusColor }}>
            {value.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">{unit}</div>
        </div>
        
        {/* 刻度标签 */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
          {max}
        </div>
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
          {min}
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {max}
        </div>
      </div>
    </div>
  );
}

// 角度表盘组件
interface AngleGaugeProps {
  angle: number;
  size?: number;
}

function AngleGauge({ angle, size = 200 }: AngleGaugeProps) {
  const center = size / 2;
  const radius = size / 2 - 20;
  
  // 计算指针端点（角度从0°开始顺时针）
  const needleLength = radius - 10;
  const needleX = center + needleLength * Math.cos((angle * Math.PI) / 180);
  const needleY = center + needleLength * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="flex flex-col items-center">
      <h4 className="font-medium mb-2">光栅编码器角度</h4>
      <div className="relative">
        <svg width={size} height={size}>
          {/* 外圈 */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          
          {/* 刻度线和标签 */}
          {Array.from({ length: 12 }, (_, i) => {
            const tickAngle = i * 30; // 每30度一个主刻度
            const tickStartRadius = radius - 15;
            const tickEndRadius = radius - 5;
            const startX = center + tickStartRadius * Math.cos((tickAngle * Math.PI) / 180);
            const startY = center + tickStartRadius * Math.sin((tickAngle * Math.PI) / 180);
            const endX = center + tickEndRadius * Math.cos((tickAngle * Math.PI) / 180);
            const endY = center + tickEndRadius * Math.sin((tickAngle * Math.PI) / 180);
            
            // 标签位置
            const labelRadius = radius - 25;
            const labelX = center + labelRadius * Math.cos((tickAngle * Math.PI) / 180);
            const labelY = center + labelRadius * Math.sin((tickAngle * Math.PI) / 180);
            
            return (
              <g key={i}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#374151"
                  strokeWidth="2"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-current text-muted-foreground"
                >
                  {tickAngle}°
                </text>
              </g>
            );
          })}
          
          {/* 指针 */}
          <line
            x1={center}
            y1={center}
            x2={needleX}
            y2={needleY}
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* 中心圆 */}
          <circle
            cx={center}
            cy={center}
            r="8"
            fill="#2563eb"
          />
        </svg>
        
        {/* 角度值显示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-mono font-bold text-blue-600 mt-8">
            {angle.toFixed(1)}°
          </div>
        </div>
      </div>
    </div>
  );
}

export function InstrumentDebugView() {
  const { navigate } = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('all');
  
  // 模拟传感器数据
  const [sensorData, setSensorData] = useState([
    { channel: 1, value: 12.5, min: -100, max: 100, status: 'normal' },
    { channel: 2, value: -8.3, min: -100, max: 100, status: 'normal' },
    { channel: 3, value: 45.2, min: -100, max: 100, status: 'warning' },
    { channel: 4, value: -23.1, min: -100, max: 100, status: 'normal' },
    { channel: 5, value: 89.7, min: -100, max: 100, status: 'danger' },
    { channel: 6, value: 5.8, min: -100, max: 100, status: 'normal' }
  ]);
  
  // 模拟编码器角度
  const [encoderAngle, setEncoderAngle] = useState(127.3);
  
  // 模拟数据更新
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setSensorData(prev => prev.map(sensor => ({
          ...sensor,
          value: sensor.value + (Math.random() - 0.5) * 2
        })));
        setEncoderAngle(prev => (prev + 1.5) % 360);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const handleResetLimits = () => {
    // 重置上下限指示
    console.log('重置上下限');
  };

  const handleCalibrate = () => {
    console.log('开始校准');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('dashboard')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回主界面
            </Button>
            <div className="h-4 w-px bg-border"></div>
            <h1 className="text-lg font-medium">仪表调试</h1>
            <Badge variant={isRunning ? "default" : "secondary"} className="gap-1">
              {isRunning ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {isRunning ? '运行中' : '已停止'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant={isRunning ? "destructive" : "default"} 
              size="sm" 
              onClick={() => setIsRunning(!isRunning)}
              className="gap-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? '停止' : '启动'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetLimits} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              刷新上下限
            </Button>
            <Button variant="outline" size="sm" onClick={handleCalibrate} className="gap-2">
              <Settings2 className="w-4 h-4" />
              校准
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 传感器表盘区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {sensorData.map((sensor) => (
            <Card key={sensor.channel} className="p-4">
              <CardContent className="p-0">
                <CircularGauge
                  value={sensor.value}
                  min={sensor.min}
                  max={sensor.max}
                  unit="μm"
                  title={`CH${sensor.channel} 电容传感器`}
                  warningThreshold={70}
                  dangerThreshold={85}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 编码器和控制面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 编码器表盘 */}
          <Card className="p-4">
            <CardContent className="p-0 flex justify-center">
              <AngleGauge angle={encoderAngle} size={250} />
            </CardContent>
          </Card>

          {/* 控制面板 */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  通道选择
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">显示通道</label>
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部通道</SelectItem>
                      <SelectItem value="1">CH1 - 电容传感器</SelectItem>
                      <SelectItem value="2">CH2 - 电容传感器</SelectItem>
                      <SelectItem value="3">CH3 - 电容传感器</SelectItem>
                      <SelectItem value="4">CH4 - 电容传感器</SelectItem>
                      <SelectItem value="5">CH5 - 电容传感器</SelectItem>
                      <SelectItem value="6">CH6 - 电容传感器</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">传感器状态</h4>
                  {sensorData.map((sensor) => (
                    <div key={sensor.channel} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">CH{sensor.channel}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{sensor.value.toFixed(1)} μm</span>
                        {Math.abs(sensor.value) < 50 ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>系统状态</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <span className="text-sm text-green-800">数据采集</span>
                    <Badge variant="default">正常</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <span className="text-sm text-green-800">传感器连接</span>
                    <Badge variant="default">6/6 已连接</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <span className="text-sm text-green-800">编码器信号</span>
                    <Badge variant="default">A/B相正常</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部状态栏 */}
        <div className="mt-8 p-4 bg-muted/30 border rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-muted-foreground">采样频率: </span>
                <span>1024 Hz</span>
              </div>
              <div>
                <span className="text-muted-foreground">当前转速: </span>
                <span>1500 RPM</span>
              </div>
              <div>
                <span className="text-muted-foreground">编码器: </span>
                <span>{encoderAngle.toFixed(1)}°</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">
                {isRunning ? '实时监控中' : '系统就绪'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}