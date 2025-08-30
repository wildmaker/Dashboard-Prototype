import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './ui/select';

import { Play, Pause, Database, FileText, FolderOpen, Circle, ChevronDown, LayoutGrid, Maximize2, Save, Printer, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useRouter } from './Router';
import { useSystem } from './SystemContext';
import { useWizard } from './WizardContext';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useUncertainty } from './UncertaintyContext';

// Chart type for per-panel switching (organized per requirements)
type ChartType =
  | 'radial-single'      // 径向误差｜单点法
  | 'radial-double'      // 径向误差｜双点垂直法
  | 'radial-triple'      // 径向误差｜三点法
  | 'radial-donaldson'   // 径向误差｜唐纳森反转法
  | 'axial'              // 轴向误差
  | 'tilt'               // 倾角误差
  | 'waveform'           // 波形显示
  | 'spectrum'           // 频谱分析（FFT）
  | '3d';                // 3D模型展示

// Simple chart components to avoid Recharts issues
interface SimpleTimeSeriesProps {
  data: Array<{ time: number; value: number }>;
  title: string;
  color: string;
  width?: number;
  height?: number;
}

function SimpleTimeSeries({ data, title, color, width = 400, height = 300 }: SimpleTimeSeriesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">暂无数据</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;
  
  const pathData = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 60) + 30;
    const y = height - 30 - ((d.value - minValue) / valueRange) * (height - 60);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full">
      <svg width={width} height={height} className="border rounded">
        {/* Grid */}
        <defs>
          <pattern id={`grid-${title}`} width="40" height="30" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${title})`} />
        
        {/* Data line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Axes */}
        <line x1="30" y1={height-30} x2={width-30} y2={height-30} stroke="#374151" strokeWidth="2"/>
        <line x1="30" y1="30" x2="30" y2={height-30} stroke="#374151" strokeWidth="2"/>
        
        {/* Value labels */}
        <text x="15" y="25" fontSize="10" fill="#6b7280">{maxValue.toFixed(1)}</text>
        <text x="15" y={height-35} fontSize="10" fill="#6b7280">{minValue.toFixed(1)}</text>
        <text x={width-50} y={height-10} fontSize="10" fill="#6b7280">时间</text>
      </svg>
    </div>
  );
}

interface SimplePolarProps {
  data: Array<{ angle: string; radial: number; axial: number }>;
  width?: number;
  height?: number;
}

function SimplePolar({ data, width = 400, height = 400 }: SimplePolarProps) {
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
  const maxValue = Math.max(...data.map(d => Math.max(d.radial, d.axial)));

  const polarToCartesian = (angle: number, value: number) => {
    const angleRad = (angle - 90) * (Math.PI / 180);
    const r = (value / maxValue) * radius;
    return {
      x: centerX + r * Math.cos(angleRad),
      y: centerY + r * Math.sin(angleRad)
    };
  };

  const createPath = (dataKey: 'radial' | 'axial') => {
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
    <div className="w-full h-full">
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
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (360 / 12) * i;
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
        
        {/* Data path */}
        <path
          d={createPath('radial')}
          fill="rgba(239, 68, 68, 0.3)"
          stroke="#ef4444"
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
              fontSize="10"
              fill="#6b7280"
            >
              {d.angle}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// Mock data with proper validation
const generateTimeSeriesData = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    time: i,
    value: Number((Math.sin(i * 0.2) * 50 + Math.random() * 20 + 100).toFixed(2))
  }));
};

const generatePolarData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    angle: `${i * 30}°`,
    radial: Number((Math.random() * 100 + 20).toFixed(2)),
    axial: Number((Math.random() * 80 + 30).toFixed(2))
  }));
};

// Data source types
interface DataSource {
  id: string;
  name: string;
  type: 'realtime' | 'history';
  status?: 'active' | 'completed';
  timestamp?: string;
  duration?: string;
  isCollecting?: boolean;
}

export function RealtimeView() {
  const { navigate } = useRouter();
  const { hardwareConnected, isChecking, setWorkbenchSourceType } = useSystem();
  const { startWizard } = useWizard();
  const { state: uncertaintyState, openDialog: openUncertainty } = useUncertainty();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeDataSource, setActiveDataSource] = useState('realtime-current');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'single'>('grid');
  const [singleView, setSingleView] = useState<ChartType>('radial-single');
  const [panelTypes, setPanelTypes] = useState<Record<number, ChartType>>({
    1: 'radial-single',
    2: 'axial',
    3: 'tilt',
    4: 'spectrum',
  });
  const [fourthViewType, setFourthViewType] = useState<ChartType>('spectrum');
  const [initializedSource, setInitializedSource] = useState(false);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const hasPromptedRef = useRef(false);

  // Channels: CH1..CH6
  type Channel = 'CH1' | 'CH2' | 'CH3' | 'CH4' | 'CH5' | 'CH6';
  const channelOptions: Channel[] = ['CH1', 'CH2', 'CH3', 'CH4', 'CH5', 'CH6'];
  const [singleChannel, setSingleChannel] = useState<Channel>('CH1');
  const [panelChannels, setPanelChannels] = useState<Record<number, Channel>>({
    1: 'CH1',
    2: 'CH2',
    3: 'CH3',
    4: 'CH4',
  });

  
  
  // Mock data sources
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: 'realtime-current',
      name: '实时数据流',
      type: 'realtime',
      status: 'active',
      isCollecting: true
    },
    {
      id: 'history-001',
      name: 'Run #001 - 主轴测试',
      type: 'history',
      status: 'completed',
      timestamp: '2024-08-29 14:30:25',
      duration: '5分32秒'
    },
    {
      id: 'history-002',
      name: 'Run #002 - 精度检验',
      type: 'history',
      status: 'completed',
      timestamp: '2024-08-29 13:15:10',
      duration: '3分18秒'
    },
    {
      id: 'history-003',
      name: 'Run #003 - 温升测试',
      type: 'history',
      status: 'completed',
      timestamp: '2024-08-29 11:45:55',
      duration: '8分42秒'
    },
    {
      id: 'history-004',
      name: 'Run #004 - 负载测试',
      type: 'history',
      status: 'completed',
      timestamp: '2024-08-29 09:22:33',
      duration: '6分15秒'
    },
    {
      id: 'history-005',
      name: 'Run #005 - 振动分析',
      type: 'history',
      status: 'completed',
      timestamp: '2024-08-28 16:45:20',
      duration: '4分50秒'
    }
  ]);
  
  // Initialize data with proper error handling
  const axialData = useMemo(() => generateTimeSeriesData(), []);
  const angleData = useMemo(() => generateTimeSeriesData(), []);
  const spectrumData = useMemo(() => generateTimeSeriesData(), []);
  const polarData = useMemo(() => generatePolarData(), []);

  // Per-channel datasets (mocked by slight variations)
  const channelSeed = (ch: Channel) => ({ CH1: 0, CH2: 1, CH3: 2, CH4: 3, CH5: 4, CH6: 5 }[ch]);
  const getChannelTimeSeries = (base: Array<{ time: number; value: number }>, ch: Channel) =>
    base.map((d, i) => ({ time: d.time, value: Number((d.value + Math.sin(i * 0.1 + channelSeed(ch)) * 3 + channelSeed(ch)).toFixed(2)) }));
  const getChannelPolar = (base: Array<{ angle: string; radial: number; axial: number }>, ch: Channel) =>
    base.map((d, i) => ({ angle: d.angle, radial: Number((d.radial + Math.sin(i * 0.3 + channelSeed(ch)) * 3).toFixed(2)), axial: Number((d.axial + Math.cos(i * 0.25 + channelSeed(ch)) * 2).toFixed(2)) }));

  const analysisResults = useMemo(() => ({
    totalError: 4.8,
    synchronousError: 2.6,
    asynchronousError: 2.2,
    max: 2.5,
    min: -2.3,
    uncertaintyRadial: 0.24,
    uncertaintyAxial: 0.18
  }), []);

  // Helper to determine whether a chart is an error-analysis chart
  const isErrorAnalysis = (t: ChartType) => t.startsWith('radial') || t === 'axial';

  // Channel-based results variation (mock)
  const getChannelAnalysisResults = (ch: Channel) => {
    const s = channelSeed(ch);
    return {
      totalError: Number((analysisResults.totalError + s * 0.1).toFixed(2)),
      synchronousError: Number((analysisResults.synchronousError + (s % 2 ? 0.05 : -0.03)).toFixed(2)),
      asynchronousError: Number((analysisResults.asynchronousError + (s % 3) * 0.04).toFixed(2)),
      max: Number((analysisResults.max + s * 0.02).toFixed(2)),
      min: Number((analysisResults.min - s * 0.02).toFixed(2)),
    };
  };

  // Compact inline results for error-analysis charts
  const InlineResults: React.FC<{ channel: Channel }> = ({ channel }) => {
    const r = getChannelAnalysisResults(channel);
    return (
      <div className="mt-2 grid grid-cols-5 gap-2 text-xs">
        <div>
          <div className="text-muted-foreground">总误差</div>
          <div className="font-mono">{r.totalError} μm</div>
        </div>
        <div>
          <div className="text-muted-foreground">同步误差</div>
          <div className="font-mono">{r.synchronousError} μm</div>
        </div>
        <div>
          <div className="text-muted-foreground">非同步误差</div>
          <div className="font-mono">{r.asynchronousError} μm</div>
        </div>
        <div>
          <div className="text-muted-foreground">最大值</div>
          <div className="font-mono">{r.max} μm</div>
        </div>
        <div>
          <div className="text-muted-foreground">最小值</div>
          <div className="font-mono">{r.min} μm</div>
        </div>
      </div>
    );
  };

  // Get current data source
  const currentDataSource = dataSources.find(ds => ds.id === activeDataSource);

  // Initialize active data source based on hardware presence
  useEffect(() => {
    if (initializedSource || isChecking) return;
    if (hardwareConnected) {
      setActiveDataSource('realtime-current');
    } else {
      const firstHistory = dataSources.find(ds => ds.type === 'history');
      if (firstHistory) {
        setActiveDataSource(firstHistory.id);
      }
    }
    setInitializedSource(true);
  }, [hardwareConnected, isChecking, initializedSource]);

  // When entering realtime route and hardware is not connected, prompt to start connection wizard
  useEffect(() => {
    if (isChecking) return;
    if (!hardwareConnected && !hasPromptedRef.current) {
      hasPromptedRef.current = true;
      setShowConnectPrompt(true);
    }
  }, [hardwareConnected, isChecking]);

  // Reflect current data source type to global system context for top nav button states
  useEffect(() => {
    if (!currentDataSource) return;
    setWorkbenchSourceType(currentDataSource.type);
  }, [currentDataSource, setWorkbenchSourceType]);

  // If user switches from离线 to 实时数据源 while硬件未连接, show the same prompt
  useEffect(() => {
    if (isChecking) return;
    if (currentDataSource?.type === 'realtime' && !hardwareConnected) {
      setShowConnectPrompt(true);
    }
  }, [currentDataSource?.type, hardwareConnected, isChecking]);

  const handleDataSourceSelect = (dataSourceId: string) => {
    console.log('handleDataSourceSelect called with:', dataSourceId);
    setActiveDataSource(dataSourceId);
    // Here you would typically fetch the data for the selected source
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFile = () => {
    if (fileInputRef.current) {
      // reset to allow selecting the same file again
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const id = `history-${Date.now()}`;
    const timestamp = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const duration = `${Math.floor(Math.random() * 8) + 2}分${Math.floor(Math.random() * 59) + 1}秒`;

    const newDataSource: DataSource = {
      id,
      name: file.name,
      type: 'history',
      status: 'completed',
      timestamp,
      duration
    };

    setDataSources((prev) => [newDataSource, ...prev]);
    setActiveDataSource(id);
  };

  const handlePrintReport = () => {
    try {
      if (uncertaintyState.status !== 'filled') {
        openUncertainty();
        toast.warning('请先完成不确定度评估', { description: '完成后再尝试打印报告', duration: 2500 });
        return;
      }
      window.print();
    } catch (e) {
      console.error('打印失败', e);
    }
  };

  const handleSaveCurrentRun = () => {
    if (currentDataSource?.type !== 'realtime') return;
    const id = `history-${Date.now()}`;
    const timestamp = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const duration = `${Math.floor(Math.random() * 8) + 2}分${Math.floor(Math.random() * 59) + 1}秒`;
    const newDataSource: DataSource = {
      id,
      name: `Run ${timestamp}`,
      type: 'history',
      status: 'completed',
      timestamp,
      duration
    };
    setDataSources((prev) => [newDataSource, ...prev]);
    setActiveDataSource(id);
    toast.success('保存成功', { description: '已自动切换至离线分析', duration: 2500 });
  };

  // Persist and restore dashboard layout & per-panel selections
  useEffect(() => {
    try {
      const savedPanels = localStorage.getItem('workbench.panelTypes');
      if (savedPanels) {
        const parsed = JSON.parse(savedPanels);
        if (parsed && typeof parsed === 'object') {
          setPanelTypes((prev) => ({ ...prev, ...parsed }));
        }
      }
      const savedLayout = localStorage.getItem('workbench.layoutMode');
      if (savedLayout === 'grid' || savedLayout === 'single') {
        setLayoutMode(savedLayout);
      }
      const savedSingle = localStorage.getItem('workbench.singleView') as ChartType | null;
      if (savedSingle) {
        setSingleView(savedSingle);
      }
      const savedPanelChannels = localStorage.getItem('workbench.panelChannels');
      if (savedPanelChannels) {
        const parsed = JSON.parse(savedPanelChannels);
        if (parsed && typeof parsed === 'object') {
          setPanelChannels((prev) => ({ ...prev, ...parsed }));
        }
      }
      const savedSingleChannel = localStorage.getItem('workbench.singleChannel') as Channel | null;
      if (savedSingleChannel && (['CH1','CH2','CH3','CH4','CH5','CH6'] as Channel[]).includes(savedSingleChannel)) {
        setSingleChannel(savedSingleChannel);
      }
    } catch (e) {
      // noop on parse errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('workbench.panelTypes', JSON.stringify(panelTypes));
    } catch (e) {}
  }, [panelTypes]);

  useEffect(() => {
    try {
      localStorage.setItem('workbench.layoutMode', layoutMode);
    } catch (e) {}
  }, [layoutMode]);

  useEffect(() => {
    try {
      localStorage.setItem('workbench.singleView', singleView);
    } catch (e) {}
  }, [singleView]);

  useEffect(() => {
    try {
      localStorage.setItem('workbench.panelChannels', JSON.stringify(panelChannels));
    } catch (e) {}
  }, [panelChannels]);

  useEffect(() => {
    try {
      localStorage.setItem('workbench.singleChannel', singleChannel);
    } catch (e) {}
  }, [singleChannel]);

  const getPanelTitle = (t: ChartType) =>
    t === 'radial-single'
      ? '径向误差｜单点法'
      : t === 'radial-double'
      ? '径向误差｜双点垂直法'
      : t === 'radial-triple'
      ? '径向误差｜三点法'
      : t === 'radial-donaldson'
      ? '径向误差｜唐纳森反转法'
      : t === 'axial'
      ? '轴向误差'
      : t === 'tilt'
      ? '倾角误差'
      : t === 'waveform'
      ? '波形显示'
      : t === 'spectrum'
      ? '频谱分析（FFT）'
      : '3D模型展示';

  const getDisplayLabel = (t: ChartType) =>
    t === 'radial-single'
      ? '径向误差 - 单点法'
      : t === 'radial-double'
      ? '径向误差 - 双点垂直法'
      : t === 'radial-triple'
      ? '径向误差 - 三点法'
      : t === 'radial-donaldson'
      ? '径向误差 - 唐纳森反转法'
      : t === 'axial'
      ? '轴向误差'
      : t === 'tilt'
      ? '倾角误差'
      : t === 'waveform'
      ? '波形显示'
      : t === 'spectrum'
      ? '频谱分析（FFT）'
      : '3D模型展示';

  const renderPanelContent = (t: ChartType, w: number, h: number, ch: Channel) => {
    const chartHeight = Math.max(100, h - (isErrorAnalysis(t) ? 60 : 0));
    if (t.startsWith('radial')) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <SimplePolar data={getChannelPolar(polarData, ch)} width={w} height={chartHeight} />
          </div>
          <InlineResults channel={ch} />
        </div>
      );
    }
    if (t === 'axial') {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <SimpleTimeSeries data={getChannelTimeSeries(axialData, ch)} title="轴向误差" color="#3b82f6" width={w} height={chartHeight} />
          </div>
          <InlineResults channel={ch} />
        </div>
      );
    }
    if (t === 'tilt') {
      return (
        <div className="h-full flex items-center justify-center">
          <SimpleTimeSeries data={getChannelTimeSeries(angleData, ch)} title="倾角误差" color="#10b981" width={w} height={h} />
        </div>
      );
    }
    if (t === 'waveform') {
      return (
        <div className="h-full flex items-center justify-center">
          <SimpleTimeSeries data={getChannelTimeSeries(spectrumData, ch)} title="波形" color="#f59e0b" width={w} height={h} />
        </div>
      );
    }
    if (t === 'spectrum') {
      return (
        <div className="h-full flex items-center justify-center">
          <SimpleTimeSeries data={getChannelTimeSeries(spectrumData, ch)} title="频谱" color="#8b5cf6" width={w} height={h} />
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center relative overflow-hidden">
        <div className="text-center space-y-2">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mx-auto shadow-lg transform rotate-12"></div>
          <div className="text-sm text-muted-foreground">3D模型加载区域</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      <AlertDialog open={showConnectPrompt} onOpenChange={setShowConnectPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>未检测到硬件连接</AlertDialogTitle>
            <AlertDialogDescription>
              实时采集需要连接硬件。现在进入连接向导进行连接与检查吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>稍后再说</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConnectPrompt(false);
                startWizard(1);
              }}
            >
              进入连接向导
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Workbench Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium">分析工作台</h1>
            
            {/* Data Source Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {currentDataSource?.type === 'realtime' ? (
                    <Database className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {currentDataSource?.isCollecting && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                  <span className="max-w-40 truncate">
                    {currentDataSource?.name || '选择数据源'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Circle className="w-3 h-3" />
                  实时数据
                </DropdownMenuLabel>
                {dataSources
                  .filter(ds => ds.type === 'realtime')
                  .map((dataSource) => (
                    <DropdownMenuItem
                      key={dataSource.id}
                      onSelect={() => handleDataSourceSelect(dataSource.id)}
                      className="flex items-center gap-2 py-3 cursor-pointer"
                    >
                      <div className="relative">
                        <Database className="w-4 h-4" />
                        {dataSource.isCollecting && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{dataSource.name}</div>
                        {dataSource.isCollecting && (
                          <div className="text-xs text-muted-foreground">
                            实时数据流 · 1500 RPM
                          </div>
                        )}
                      </div>
                      {dataSource.isCollecting && (
                        <Badge variant="secondary" className="text-xs">
                          采集中
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))
                }
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    历史数据
                  </span>
                  <Button variant="ghost" size="sm" className="gap-1 px-2" onClick={handleOpenFile}>
                    <FolderOpen className="w-4 h-4" />
                    打开文件
                  </Button>
                </DropdownMenuLabel>
                {dataSources
                  .filter(ds => ds.type === 'history')
                  .map((dataSource) => (
                    <DropdownMenuItem
                      key={dataSource.id}
                      onSelect={() => handleDataSourceSelect(dataSource.id)}
                      className="flex items-center gap-2 py-3 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-medium truncate">{dataSource.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {dataSource.timestamp} · {dataSource.duration}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {dataSource.status === 'completed' ? '已完成' : '进行中'}
                      </Badge>
                    </DropdownMenuItem>
                  ))
                }
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onSelect={handleOpenFile} className="flex items-center gap-2 py-3 cursor-pointer">
                  <FolderOpen className="w-4 h-4" />
                  <span>打开文件...</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Badge variant={currentDataSource?.type === 'realtime' ? 'default' : 'secondary'} className="gap-1">
              {currentDataSource?.isCollecting && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
              {currentDataSource?.type === 'realtime' ? '实时采集模式' : '离线分析模式'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {currentDataSource?.type === 'realtime' && (
            <Button 
              variant={isPlaying ? "default" : "outline"} 
              size="sm" 
              onClick={() => setIsPlaying(!isPlaying)}
              className="gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? '暂停采集' : '继续采集'}
            </Button>
            )}
            {/* Save button only in realtime mode */}
            {currentDataSource?.type === 'realtime' && (
              <Button
                variant={!isPlaying ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                disabled={isPlaying}
                onClick={handleSaveCurrentRun}
              >
                <Save className="w-4 h-4" />
                {'保存快照'}
              </Button>
            )}
            {currentDataSource?.type !== 'realtime' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={uncertaintyState.status === 'filled' ? 'secondary' : uncertaintyState.status === 'stale' ? 'outline' : 'outline'}
                      size="sm"
                      className="gap-2"
                      onClick={openUncertainty}
                    >
                      {uncertaintyState.status === 'filled' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : uncertaintyState.status === 'stale' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      不确定度评估
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {uncertaintyState.lastUpdated
                      ? `上次更新：${new Date(uncertaintyState.lastUpdated).toLocaleString('zh-CN', { hour12: false })}`
                      : '未填写'}
                  </TooltipContent>
                </Tooltip>

                <Button variant="default" size="sm" className="gap-2" onClick={handlePrintReport}>
                  <Printer className="w-4 h-4" />
                  打印报告
                </Button>
              </>
            )}
          </div>
        </div>
        </div>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {layoutMode === 'single' && (
                <Select value={singleView} onValueChange={(v) => setSingleView(v as ChartType)}>
                  <SelectTrigger className="w-56 ml-2">
                    <SelectValue>{getDisplayLabel(singleView)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>径向误差</SelectLabel>
                      <SelectItem value="radial-single">单点法</SelectItem>
                      <SelectItem value="radial-double">双点垂直法</SelectItem>
                      <SelectItem value="radial-triple">三点法</SelectItem>
                      <SelectItem value="radial-donaldson">唐纳森反转法</SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectItem value="axial">轴向误差</SelectItem>
                    <SelectItem value="tilt">倾角误差</SelectItem>
                    <SelectItem value="waveform">波形显示</SelectItem>
                    <SelectItem value="spectrum">频谱分析（FFT）</SelectItem>
                    <SelectSeparator />
                    <SelectItem value="3d">3D模型展示</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-2" />
          </div>

          {layoutMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Panel 1 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select value={panelTypes[1]} onValueChange={(v) => setPanelTypes((p) => ({ ...p, 1: v as ChartType }))}>
                      <SelectTrigger className="w-56 h-7">
                        <SelectValue>{getDisplayLabel(panelTypes[1])}</SelectValue>
                      </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                          <SelectLabel>径向误差</SelectLabel>
                          <SelectItem value="radial-single">单点法</SelectItem>
                          <SelectItem value="radial-double">双点垂直法</SelectItem>
                          <SelectItem value="radial-triple">三点法</SelectItem>
                          <SelectItem value="radial-donaldson">唐纳森反转法</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectItem value="axial">轴向误差</SelectItem>
                        <SelectItem value="tilt">倾角误差</SelectItem>
                        <SelectItem value="waveform">波形显示</SelectItem>
                        <SelectItem value="spectrum">频谱分析（FFT）</SelectItem>
                        <SelectSeparator />
                        <SelectItem value="3d">3D模型展示</SelectItem>
                    </SelectContent>
                  </Select>
                    <span className="text-xs text-muted-foreground">通道</span>
                    <Select value={panelChannels[1]} onValueChange={(v) => setPanelChannels((p) => ({ ...p, 1: v as Channel }))}>
                      <SelectTrigger className="w-28 h-7">
                        <SelectValue placeholder="选择通道" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>选择通道</SelectLabel>
                          {channelOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setLayoutMode('single'); setSingleView(panelTypes[1]); }}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[420px] p-0">
                {renderPanelContent(panelTypes[1], 560, 360, panelChannels[1])}
              </CardContent>
            </Card>

            {/* Panel 2 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                    <Select value={panelTypes[2]} onValueChange={(v) => setPanelTypes((p) => ({ ...p, 2: v as ChartType }))}>
                      <SelectTrigger className="w-56 h-7">
                        <SelectValue>{getDisplayLabel(panelTypes[2])}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                        <SelectGroup>
                          <SelectLabel>径向误差</SelectLabel>
                          <SelectItem value="radial-single">单点法</SelectItem>
                          <SelectItem value="radial-double">双点垂直法</SelectItem>
                          <SelectItem value="radial-triple">三点法</SelectItem>
                          <SelectItem value="radial-donaldson">唐纳森反转法</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                    <SelectItem value="axial">轴向误差</SelectItem>
                    <SelectItem value="tilt">倾角误差</SelectItem>
                    <SelectItem value="waveform">波形显示</SelectItem>
                        <SelectItem value="spectrum">频谱分析（FFT）</SelectItem>
                        <SelectSeparator />
                        <SelectItem value="3d">3D模型展示</SelectItem>
                  </SelectContent>
                </Select>
                    <span className="text-xs text-muted-foreground">通道</span>
                    <Select value={panelChannels[2]} onValueChange={(v) => setPanelChannels((p) => ({ ...p, 2: v as Channel }))}>
                      <SelectTrigger className="w-28 h-7">
                        <SelectValue placeholder="选择通道" />
                </SelectTrigger>
                <SelectContent>
                        <SelectGroup>
                          <SelectLabel>选择通道</SelectLabel>
                          {channelOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectGroup>
                </SelectContent>
              </Select>
            </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setLayoutMode('single'); setSingleView(panelTypes[2]); }}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[420px] p-0">
                {renderPanelContent(panelTypes[2], 560, 360, panelChannels[2])}
              </CardContent>
            </Card>

            {/* Panel 3 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select value={panelTypes[3]} onValueChange={(v) => setPanelTypes((p) => ({ ...p, 3: v as ChartType }))}>
                      <SelectTrigger className="w-56 h-7">
                        <SelectValue>{getDisplayLabel(panelTypes[3])}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>径向误差</SelectLabel>
                          <SelectItem value="radial-single">单点法</SelectItem>
                          <SelectItem value="radial-double">双点垂直法</SelectItem>
                          <SelectItem value="radial-triple">三点法</SelectItem>
                          <SelectItem value="radial-donaldson">唐纳森反转法</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectItem value="axial">轴向误差</SelectItem>
                        <SelectItem value="tilt">倾角误差</SelectItem>
                        <SelectItem value="waveform">波形显示</SelectItem>
                        <SelectItem value="spectrum">频谱分析（FFT）</SelectItem>
                        <SelectSeparator />
                        <SelectItem value="3d">3D模型展示</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">通道</span>
                    <Select value={panelChannels[3]} onValueChange={(v) => setPanelChannels((p) => ({ ...p, 3: v as Channel }))}>
                      <SelectTrigger className="w-28 h-7">
                        <SelectValue placeholder="选择通道" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>选择通道</SelectLabel>
                          {channelOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setLayoutMode('single'); setSingleView(panelTypes[3]); }}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[420px] p-0">
                {renderPanelContent(panelTypes[3], 560, 360, panelChannels[3])}
              </CardContent>
            </Card>

            {/* Panel 4 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select value={panelTypes[4]} onValueChange={(v) => setPanelTypes((p) => ({ ...p, 4: v as ChartType }))}>
                      <SelectTrigger className="w-56 h-7">
                        <SelectValue>{getDisplayLabel(panelTypes[4])}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>径向误差</SelectLabel>
                          <SelectItem value="radial-single">单点法</SelectItem>
                          <SelectItem value="radial-double">双点垂直法</SelectItem>
                          <SelectItem value="radial-triple">三点法</SelectItem>
                          <SelectItem value="radial-donaldson">唐纳森反转法</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectItem value="axial">轴向误差</SelectItem>
                        <SelectItem value="tilt">倾角误差</SelectItem>
                        <SelectItem value="waveform">波形显示</SelectItem>
                        <SelectItem value="spectrum">频谱分析（FFT）</SelectItem>
                        <SelectSeparator />
                        <SelectItem value="3d">3D模型展示</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">通道</span>
                    <Select value={panelChannels[4]} onValueChange={(v) => setPanelChannels((p) => ({ ...p, 4: v as Channel }))}>
                      <SelectTrigger className="w-28 h-7">
                        <SelectValue placeholder="选择通道" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>选择通道</SelectLabel>
                          {channelOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setLayoutMode('single'); setSingleView(panelTypes[4]); }}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[420px] p-0">
                {renderPanelContent(panelTypes[4], 560, 360, panelChannels[4])}
              </CardContent>
            </Card>
          </div>
          ) : (
            <div className="h-full">
              {singleView.startsWith('radial') && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">通道</span>
                        <Select value={singleChannel} onValueChange={(v) => setSingleChannel(v as Channel)}>
                          <SelectTrigger className="w-28 h-7">
                            <SelectValue placeholder="选择通道" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>选择通道</SelectLabel>
                              {channelOptions.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setLayoutMode('grid')}>
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[720px] p-0 flex items-center justify-center">{renderPanelContent(singleView, 900, 680, singleChannel)}</CardContent>
                </Card>
              )}
              {singleView === 'axial' && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">通道</span>
                        <Select value={singleChannel} onValueChange={(v) => setSingleChannel(v as Channel)}>
                          <SelectTrigger className="w-28 h-7">
                            <SelectValue placeholder="选择通道" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>选择通道</SelectLabel>
                              {channelOptions.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setLayoutMode('grid')}>
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[720px] p-0 flex items-center justify-center">{renderPanelContent('axial', 900, 680, singleChannel)}</CardContent>
                </Card>
              )}
              {singleView === 'tilt' && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">通道</span>
                        <Select value={singleChannel} onValueChange={(v) => setSingleChannel(v as Channel)}>
                          <SelectTrigger className="w-28 h-7">
                            <SelectValue placeholder="选择通道" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>选择通道</SelectLabel>
                              {channelOptions.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setLayoutMode('grid')}>
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[720px] p-0 flex items-center justify-center"><SimpleTimeSeries data={getChannelTimeSeries(angleData, singleChannel)} title="倾角误差" color="#10b981" width={900} height={680} /></CardContent>
                </Card>
              )}
              {(singleView === 'waveform' || singleView === 'spectrum') && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Select value={singleChannel} onValueChange={(v) => setSingleChannel(v as Channel)}>
                          <SelectTrigger className="w-28 h-7">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {channelOptions.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setLayoutMode('grid')}>
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[720px] p-0 flex items-center justify-center"><SimpleTimeSeries data={getChannelTimeSeries(spectrumData, singleChannel)} title={singleView} color={singleView === 'waveform' ? '#f59e0b' : '#8b5cf6'} width={900} height={680} /></CardContent>
                </Card>
              )}
              {singleView === '3d' && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div />
                      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setLayoutMode('grid')}>
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[720px] p-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center relative overflow-hidden">
                      <div className="text-center space-y-2">
                        <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mx-auto shadow-lg transform rotate-12"></div>
                        <div className="text-sm text-muted-foreground">3D模型加载区域</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="border-t border-border bg-muted/30 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            {currentDataSource?.type === 'realtime' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">实时转速:</span>
                  <Badge variant="outline">1500 RPM</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">采样频率:</span>
                  <span>2048 Hz</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">当前圈数:</span>
                  <span>245</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">数据源:</span>
                  <Badge variant="outline">{currentDataSource?.name}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">记录时间:</span>
                  <span>{currentDataSource?.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">测量时长:</span>
                  <span>{currentDataSource?.duration}</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {currentDataSource?.type === 'realtime' ? (
              <>
                <span>数据保存路径:</span>
                <span>/data/realtime/2024-08-29/</span>
              </>
            ) : (
              <>
                <span>数据状态:</span>
                <Badge variant="secondary" className="text-xs">
                  {currentDataSource?.status === 'completed' ? '已完成' : '加载中'}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}