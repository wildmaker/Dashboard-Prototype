import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, FolderOpen, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { useRouter } from './Router';

// Simple chart components to avoid Recharts issues
interface SimpleLineChartProps {
  data: Array<{ time: number; original: number; filtered: number; trend: number }>;
  width?: number;
  height?: number;
}

function SimpleLineChart({ data, width = 800, height = 400 }: SimpleLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">暂无数据</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.original, d.filtered, d.trend)));
  const minValue = Math.min(...data.map(d => Math.min(d.original, d.filtered, d.trend)));
  const valueRange = maxValue - minValue;
  
  const pathData = (dataKey: keyof typeof data[0], color: string) => {
    const path = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 60) + 30;
      const y = height - 30 - ((d[dataKey] as number - minValue) / valueRange) * (height - 60);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return (
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width={width} height={height} className="border rounded">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Chart lines */}
        {pathData('original', '#ef4444')}
        {pathData('filtered', '#3b82f6')}
        {pathData('trend', '#10b981')}
        
        {/* Axes */}
        <line x1="30" y1={height-30} x2={width-30} y2={height-30} stroke="#374151" strokeWidth="2"/>
        <line x1="30" y1="30" x2="30" y2={height-30} stroke="#374151" strokeWidth="2"/>
        
        {/* Labels */}
        <text x="15" y="20" fontSize="12" fill="#6b7280">最大值</text>
        <text x="15" y={height-10} fontSize="12" fill="#6b7280">最小值</text>
        <text x={width-60} y={height-10} fontSize="12" fill="#6b7280">时间</text>
      </svg>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-2 border rounded shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-0.5 bg-red-500"></div>
          <span>原始数据</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span>滤波后</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span>趋势线</span>
        </div>
      </div>
    </div>
  );
}

interface SimplePolarChartProps {
  data: Array<{ angle: string; synchronous: number; asynchronous: number }>;
  width?: number;
  height?: number;
}

function SimplePolarChart({ data, width = 400, height = 400 }: SimplePolarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">暂无数据</div>
      </div>
    );
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 40;
  const maxValue = Math.max(...data.map(d => Math.max(d.synchronous, d.asynchronous)));

  const polarToCartesian = (angle: number, value: number) => {
    const angleRad = (angle - 90) * (Math.PI / 180);
    const r = (value / maxValue) * radius;
    return {
      x: centerX + r * Math.cos(angleRad),
      y: centerY + r * Math.sin(angleRad)
    };
  };

  const createPath = (dataKey: 'synchronous' | 'asynchronous') => {
    const points = data.map((d, i) => {
      const angle = (360 / data.length) * i;
      return polarToCartesian(angle, d[dataKey]);
    });
    
    const pathString = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ') + ' Z';
    
    return pathString;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width={width} height={height}>
        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1].map((fraction, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={radius * fraction}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Grid lines */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (360 / 8) * i;
          const end = polarToCartesian(angle, maxValue);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={end.x}
              y2={end.y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Data paths */}
        <path
          d={createPath('synchronous')}
          fill="rgba(239, 68, 68, 0.3)"
          stroke="#ef4444"
          strokeWidth="2"
        />
        <path
          d={createPath('asynchronous')}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        
        {/* Angle labels */}
        {data.map((d, i) => {
          const angle = (360 / data.length) * i;
          const labelPoint = polarToCartesian(angle, maxValue * 1.1);
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fill="#6b7280"
            >
              {d.angle}
            </text>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-2 border rounded shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-red-500 bg-opacity-30 border border-red-500"></div>
          <span>同步误差</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-blue-500 bg-opacity-30 border border-blue-500"></div>
          <span>非同步误差</span>
        </div>
      </div>
    </div>
  );
}

interface SimpleBarChartProps {
  data: Array<{ frequency: number; amplitude: number }>;
  width?: number;
  height?: number;
}

function SimpleBarChart({ data, width = 800, height = 400 }: SimpleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">暂无数据</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.amplitude));
  const barWidth = (width - 60) / data.length - 2;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width={width} height={height} className="border rounded">
        {/* Grid lines */}
        <defs>
          <pattern id="bargrid" width="50" height="40" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bargrid)" />
        
        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.amplitude / maxValue) * (height - 60);
          const x = 30 + i * (barWidth + 2);
          const y = height - 30 - barHeight;
          
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Axes */}
        <line x1="30" y1={height-30} x2={width-30} y2={height-30} stroke="#374151" strokeWidth="2"/>
        <line x1="30" y1="30" x2="30" y2={height-30} stroke="#374151" strokeWidth="2"/>
        
        {/* Labels */}
        <text x="15" y="20" fontSize="12" fill="#6b7280">幅值</text>
        <text x={width-60} y={height-10} fontSize="12" fill="#6b7280">频率(Hz)</text>
      </svg>
    </div>
  );
}

// Mock data with proper validation
const generateAnalysisData = () => {
  return Array.from({ length: 100 }, (_, i) => ({
    time: i,
    original: Number((Math.sin(i * 0.1) * 30 + Math.random() * 10 + 50).toFixed(2)),
    filtered: Number((Math.sin(i * 0.1) * 30 + 50).toFixed(2)),
    trend: Number((i * 0.3 + 40).toFixed(2))
  }));
};

const generatePolarAnalysis = () => {
  return Array.from({ length: 16 }, (_, i) => ({
    angle: `${(i * 22.5).toFixed(1)}°`,
    synchronous: Number((Math.random() * 80 + 20).toFixed(2)),
    asynchronous: Number((Math.random() * 60 + 10).toFixed(2))
  }));
};

const generateSpectrumData = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    frequency: i * 10,
    amplitude: Number((Math.exp(-i * 0.1) * (Math.random() * 20 + 5)).toFixed(2))
  }));
};

export function OfflineChartView() {
  const { navigate } = useRouter();
  const [analysisMethod, setAnalysisMethod] = useState('fourier');
  const [chartType, setChartType] = useState('line');
  const [dataFile, setDataFile] = useState('');
  
  // Initialize data with proper error handling
  const analysisData = useMemo(() => generateAnalysisData(), []);
  const polarData = useMemo(() => generatePolarAnalysis(), []);
  const spectrumData = useMemo(() => generateSpectrumData(), []);

  const analysisResults = useMemo(() => ({
    maxValue: 89.5,
    minValue: 12.3,
    synchronousError: 45.2,
    asynchronousError: 23.8,
    rmsValue: 35.6,
    peakToPeak: 77.2
  }), []);

  const getChartTitle = () => {
    const methodMap = {
      fourier: 'FFT分析',
      wavelet: '小波分析',
      envelope: '包络分析',
      correlation: '相关分析'
    };
    return `分析结果 - ${methodMap[analysisMethod as keyof typeof methodMap]}`;
  };

  const renderChart = () => {
    try {
      switch (chartType) {
        case 'line':
          return <SimpleLineChart data={analysisData} />;
        case 'polar':
          return <SimplePolarChart data={polarData} />;
        case 'spectrum':
          return <SimpleBarChart data={spectrumData} />;
        case 'waterfall':
          return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                <div>瀑布图功能开发中</div>
              </div>
            </div>
          );
        default:
          return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div>请选择图表类型</div>
            </div>
          );
      }
    } catch (error) {
      console.error('Chart rendering error:', error);
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <div>图表渲染错误</div>
          </div>
        </div>
      );
    }
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
            <h1 className="text-lg font-medium">离线画图</h1>
            {dataFile && <Badge variant="secondary">{dataFile}</Badge>}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              打开数据文件
            </Button>
            <Select value={analysisMethod} onValueChange={setAnalysisMethod}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="分析方法" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fourier">FFT分析</SelectItem>
                <SelectItem value="wavelet">小波分析</SelectItem>
                <SelectItem value="envelope">包络分析</SelectItem>
                <SelectItem value="correlation">相关分析</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="图表类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">折线图</SelectItem>
                <SelectItem value="polar">极坐标图</SelectItem>
                <SelectItem value="spectrum">频谱图</SelectItem>
                <SelectItem value="waterfall">瀑布图</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Chart Area */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {chartType === 'line' && <TrendingUp className="w-5 h-5" />}
                  {chartType === 'polar' && <Activity className="w-5 h-5" />}
                  {chartType === 'spectrum' && <BarChart3 className="w-5 h-5" />}
                  {getChartTitle()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">数据点: {analysisData.length}</Badge>
                  <Badge variant="outline">
                    {chartType === 'line' ? '时域' : chartType === 'polar' ? '极坐标' : '频域'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[600px] relative">
              {renderChart()}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Results */}
        <div className="w-80 border-l border-border p-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">分析参数</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground block">最大值</span>
                  <span className="font-mono">{analysisResults.maxValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">最小值</span>
                  <span className="font-mono">{analysisResults.minValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">RMS值</span>
                  <span className="font-mono">{analysisResults.rmsValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">峰-峰值</span>
                  <span className="font-mono">{analysisResults.peakToPeak}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">误差分析</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">同步误差</div>
                  <div className="text-lg font-mono text-blue-900">{analysisResults.synchronousError} μm</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-sm font-medium text-amber-800">非同步误差</div>
                  <div className="text-lg font-mono text-amber-900">{analysisResults.asynchronousError} μm</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">数据信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">文件大小</span>
                <span>2.4 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">采样频率</span>
                <span>1024 Hz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">时长</span>
                <span>10.5 s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">转速</span>
                <span>1500 RPM</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button className="w-full gap-2">
              <FolderOpen className="w-4 h-4" />
              导出分析结果
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Activity className="w-4 h-4" />
              保存图表
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}