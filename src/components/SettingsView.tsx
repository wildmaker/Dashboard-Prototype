import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, Settings, Gauge, Cpu, Database, Target, AlertTriangle, CheckCircle, Move3D, RotateCcw, ZoomIn, ZoomOut, Upload, Download, Undo2, Save } from 'lucide-react';
import { useUncertainty, DEFAULT_PARAMS } from './UncertaintyContext';
import { useRouter } from './Router';
import { useWizard, useWizardSettingsTab } from './WizardContext';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface ConfigItemProps {
  label: string;
  value: string;
  unit?: string;
  isValid: boolean;
  onChange: (value: string) => void;
  error?: string;
}

function ConfigItem({ label, value, unit, isValid, onChange, error }: ConfigItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 ${!isValid ? 'border-red-300' : ''}`}
        />
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function SettingsView() {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState('analysis');
  const wizardTab = useWizardSettingsTab();
  const { isActive: isWizardActive } = useWizard();
  const {
    defaults,
    updateDefaults,
    saveDefaults,
    resetDefaults,
    exportDefaults,
    importDefaults,
  } = useUncertainty();
  useEffect(() => {
    if (wizardTab) {
      setActiveTab(wizardTab);
    }
  }, [wizardTab]);
  
  // Analysis parameters
  const [samplingFreq, setSamplingFreq] = useState('1024');
  const [measurementTime, setMeasurementTime] = useState('10');
  const [filterCutoff, setFilterCutoff] = useState('500');
  
  // Standard device settings
  const [standardType, setStandardType] = useState('laser');
  const [standardResolution, setStandardResolution] = useState('0.1');
  const [standardRange, setStandardRange] = useState('100');
  
  // Encoder settings
  const [encoderPPR, setEncoderPPR] = useState('1024');
  const [encoderType, setEncoderType] = useState('incremental');
  
  // Capacitive sensor settings
  const [sensorRange, setSensorRange] = useState('10');
  const [sensorSensitivity, setSensorSensitivity] = useState('1');
  const [sensorCount, setSensorCount] = useState('4');

  // Scenario settings for capacitive sensor installation
  type ScenarioId = 'scene1' | 'scene2' | 'scene3' | 'scene4';
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const scenarios: Array<{
    id: ScenarioId;
    name: string;
    description: string;
    mapping: { [channel: string]: { hole: string; axis: 'X' | 'Y' | 'Z' | '-'} };
    highlightChannels: string[];
    methods: Array<'单点' | '双点垂直' | '三点' | '唐纳森' | '倾角' | '轴向'>;
  }> = [
    {
      id: 'scene1',
      name: '场景1',
      description: '适用于标准垂直安装。示例映射：CH1→X, CH2→Y, CH5→Z。',
      mapping: {
        CH1: { hole: '孔位A', axis: 'X' },
        CH2: { hole: '孔位B', axis: 'Y' },
        CH3: { hole: '孔位C', axis: '-' },
        CH4: { hole: '孔位D', axis: '-' },
        CH5: { hole: '孔位E', axis: 'Z' },
        CH6: { hole: '孔位F', axis: '-' },
      },
      highlightChannels: ['CH1', 'CH2', 'CH5'],
      methods: ['单点', '双点垂直', '三点']
    },
    {
      id: 'scene2',
      name: '场景2',
      description: '对刀基准面偏置安装。示例映射：CH1→X, CH3→Y, CH4→Z。',
      mapping: {
        CH1: { hole: '孔位A', axis: 'X' },
        CH2: { hole: '孔位B', axis: '-' },
        CH3: { hole: '孔位C', axis: 'Y' },
        CH4: { hole: '孔位D', axis: 'Z' },
        CH5: { hole: '孔位E', axis: '-' },
        CH6: { hole: '孔位F', axis: '-' },
      },
      highlightChannels: ['CH1', 'CH3', 'CH4'],
      methods: ['单点', '三点', '唐纳森']
    },
    {
      id: 'scene3',
      name: '场景3',
      description: '倾角测量工况。示例映射：CH2→X, CH4→Y, CH6→Z。',
      mapping: {
        CH1: { hole: '孔位A', axis: '-' },
        CH2: { hole: '孔位B', axis: 'X' },
        CH3: { hole: '孔位C', axis: '-' },
        CH4: { hole: '孔位D', axis: 'Y' },
        CH5: { hole: '孔位E', axis: '-' },
        CH6: { hole: '孔位F', axis: 'Z' },
      },
      highlightChannels: ['CH2', 'CH4', 'CH6'],
      methods: ['倾角', '轴向']
    },
    {
      id: 'scene4',
      name: '场景4',
      description: '轴向误差重点。示例映射：CH1→Z, CH2→Z, CH3→Z。',
      mapping: {
        CH1: { hole: '孔位A', axis: 'Z' },
        CH2: { hole: '孔位B', axis: 'Z' },
        CH3: { hole: '孔位C', axis: 'Z' },
        CH4: { hole: '孔位D', axis: '-' },
        CH5: { hole: '孔位E', axis: '-' },
        CH6: { hole: '孔位F', axis: '-' },
      },
      highlightChannels: ['CH1', 'CH2', 'CH3'],
      methods: ['轴向', '单点']
    },
  ];

  // Validation functions
  const validateFrequency = (freq: string) => {
    const num = parseFloat(freq);
    return num > 0 && num <= 10000;
  };

  const validateTime = (time: string) => {
    const num = parseFloat(time);
    return num > 0 && num <= 3600;
  };

  const validateRange = (range: string) => {
    const num = parseFloat(range);
    return num > 0 && num <= 1000;
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
            <h1 className="text-lg font-medium">系统设置</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">重置默认</Button>
            <Button size="sm">保存设置</Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="analysis" className="gap-2">
                <Gauge className="w-4 h-4" />
                分析参数
              </TabsTrigger>
              <TabsTrigger value="standard" className="gap-2">
                <Target className="w-4 h-4" />
                标准器
              </TabsTrigger>
              <TabsTrigger value="encoder" className="gap-2">
                <Cpu className="w-4 h-4" />
                编码器
              </TabsTrigger>
              <TabsTrigger value="sensor" className="gap-2">
                <Database className="w-4 h-4" />
                电容传感器
              </TabsTrigger>
              <TabsTrigger value="uncertainty-defaults" className="gap-2">
                <Settings className="w-4 h-4" />
                不确定度默认值
              </TabsTrigger>
            </TabsList>

            {/* Analysis Parameters Tab */}
            <TabsContent value="analysis" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="w-5 h-5" />
                      采样参数
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ConfigItem
                      label="采样频率"
                      value={samplingFreq}
                      unit="Hz"
                      isValid={validateFrequency(samplingFreq)}
                      onChange={setSamplingFreq}
                      error={!validateFrequency(samplingFreq) ? '采样频率应在0-10000Hz之间' : undefined}
                    />
                    <ConfigItem
                      label="测量时间"
                      value={measurementTime}
                      unit="秒"
                      isValid={validateTime(measurementTime)}
                      onChange={setMeasurementTime}
                      error={!validateTime(measurementTime) ? '测量时间应在0-3600秒之间' : undefined}
                    />
                    <ConfigItem
                      label="滤波截止频率"
                      value={filterCutoff}
                      unit="Hz"
                      isValid={validateFrequency(filterCutoff)}
                      onChange={setFilterCutoff}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>分析方法</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>启用FFT分析</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>启用小波分析</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>启用包络分析</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>实时数据保存</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Standard Device Tab */}
            <TabsContent value="standard" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      标准器配置
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>标准器类型</Label>
                      <Select value={standardType} onValueChange={setStandardType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="laser">激光干涉仪</SelectItem>
                          <SelectItem value="capacitive">电容式位移传感器</SelectItem>
                          <SelectItem value="optical">光学编码器</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <ConfigItem
                      label="分辨率"
                      value={standardResolution}
                      unit="μm"
                      isValid={validateRange(standardResolution)}
                      onChange={setStandardResolution}
                    />
                    
                    <ConfigItem
                      label="测量范围"
                      value={standardRange}
                      unit="mm"
                      isValid={validateRange(standardRange)}
                      onChange={setStandardRange}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>校准设置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">标准器状态</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        上次校准: 2024-08-15<br/>
                        有效期至: 2025-08-15<br/>
                        校准状态: 正常
                      </p>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      启动标准器校准
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Encoder Tab */}
            <TabsContent value="encoder" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      编码器参数
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>编码器类型</Label>
                      <Select value={encoderType} onValueChange={setEncoderType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="incremental">增量式</SelectItem>
                          <SelectItem value="absolute">绝对式</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <ConfigItem
                      label="每转脉冲数(PPR)"
                      value={encoderPPR}
                      unit="脉冲/转"
                      isValid={parseInt(encoderPPR) > 0}
                      onChange={setEncoderPPR}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>连接状态</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>A相信号</span>
                        <Badge variant="default">正常</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>B相信号</span>
                        <Badge variant="default">正常</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Z相信号</span>
                        <Badge variant="secondary">未使用</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sensor Tab */}
            <TabsContent value="sensor" className="mt-6">
              {/* Guidance: Why/How with help link */}
              <div className="p-4 border rounded-lg bg-muted/30 text-sm text-muted-foreground mb-6">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium text-foreground">为什么需要</div>
                    <div>确保传感器与工装映射正确，软件才能选择正确的误差分析方法。</div>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <div className="font-medium text-foreground">如何操作</div>
                    <div>选择一个场景 → 根据 3D 提示检查传感器位置。</div>
                  </div>
                  <Button variant="link" size="sm" className="mt-3 md:mt-0" onClick={() => navigate('3d-guide')}>查看安装帮助</Button>
                </div>
              </div>

              {/* Scenario selection + 3D + sidebar mapping */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Main area (spans 2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">场景设置与 3D 示意</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Scenario cards (single RadioGroup root) */}
                      <RadioGroup
                        value={selectedScenario ?? ''}
                        onValueChange={(v) => setSelectedScenario(v as ScenarioId)}
                        className="grid grid-cols-1 md:grid-cols-4 gap-3"
                      >
                        {scenarios.map((sc) => (
                          <div
                            key={sc.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedScenario === sc.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                            onClick={() => setSelectedScenario(sc.id)}
                            role="button"
                            aria-pressed={selectedScenario === sc.id}
                          >
                            <div className="flex items-start gap-2">
                              <RadioGroupItem value={sc.id} />
                              <div className="space-y-1">
                                <div className="font-medium">{sc.name}</div>
                                <div className="text-xs text-muted-foreground leading-relaxed">{sc.description}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>

                      {/* 3D illustration area */}
                      <div className="h-72 border rounded-lg">
                        <div className="flex items-center justify-between px-3 py-2 border-b">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Move3D className="w-4 h-4" />3D 模型/示意图</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-1"><RotateCcw className="w-4 h-4" />重置</Button>
                            <Button variant="outline" size="sm" className="gap-1"><ZoomOut className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" className="gap-1"><ZoomIn className="w-4 h-4" /></Button>
                            <Button variant="secondary" size="sm" className="gap-1" onClick={() => setIsAnimating((v) => !v)}>{isAnimating ? '停止动画' : '播放安装动画'}</Button>
                          </div>
                        </div>
                        <div className="relative h-[calc(18rem-41px)] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                          {/* Mock 3D geometry */}
                          <div className="text-center space-y-2">
                            <div className={`w-28 h-28 rounded-2xl mx-auto shadow-2xl bg-gradient-to-br from-blue-400 to-blue-600 ${isAnimating ? 'animate-pulse' : ''}`}></div>
                            <div className="text-xs text-muted-foreground">{selectedScenario ? '拖动旋转，滚轮缩放' : '请选择一个场景以显示示意'}</div>
                          </div>

                          {/* Highlight points depend on scenario */}
                          {selectedScenario && (
                            <>
                              {scenarios.find(s => s.id === selectedScenario)!.highlightChannels.map((ch, idx) => (
                                <div
                                  key={ch}
                                  className={`absolute w-3 h-3 rounded-full ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-green-400' : 'bg-red-400'} ${isAnimating ? 'animate-ping' : ''}`}
                                  style={{
                                    top: `${25 + idx * 20}%`,
                                    left: `${30 + (idx % 2) * 35}%`
                                  }}
                                  title={`${ch} 高亮`}
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar mapping and methods */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">传感器 ↔ 工装通道映射表</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {!selectedScenario && (
                        <div className="text-sm text-muted-foreground">未选择场景。请先在左侧选择“场景1/2/3/4”。</div>
                      )}
                      {selectedScenario && (
                        <div className="space-y-2">
                          {['CH1','CH2','CH3','CH4','CH5','CH6'].map((ch) => {
                            const map = scenarios.find(s => s.id === selectedScenario)!.mapping[ch];
                            const isHighlight = scenarios.find(s => s.id === selectedScenario)!.highlightChannels.includes(ch);
                            return (
                              <div key={ch} className={`flex items-center justify-between p-2 border rounded-md ${isHighlight ? 'border-primary/60 bg-primary/5' : ''}`}>
                                <div className="font-medium text-sm">{ch}</div>
                                <div className="text-xs text-muted-foreground">{map ? `${map.hole} · 轴向 ${map.axis}` : '未配置'}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">可用误差分析方法</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!selectedScenario ? (
                        <div className="text-sm text-muted-foreground">选择场景后显示对应方法。</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {scenarios.find(s => s.id === selectedScenario)!.methods.map((m) => (
                            <Badge key={m} variant="secondary">{m}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Original sensor configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      传感器配置
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ConfigItem
                      label="传感器数量"
                      value={sensorCount}
                      unit="个"
                      isValid={parseInt(sensorCount) > 0 && parseInt(sensorCount) <= 8}
                      onChange={setSensorCount}
                    />
                    
                    <ConfigItem
                      label="测量范围"
                      value={sensorRange}
                      unit="mm"
                      isValid={validateRange(sensorRange)}
                      onChange={setSensorRange}
                    />
                    
                    <ConfigItem
                      label="灵敏度"
                      value={sensorSensitivity}
                      unit="V/mm"
                      isValid={parseFloat(sensorSensitivity) > 0}
                      onChange={setSensorSensitivity}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>通道配置</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((channel) => (
                        <div key={channel} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">CH{channel}</span>
                            <span className="text-sm text-muted-foreground">CAP-00{channel}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <Badge variant="default">已配置</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Uncertainty Defaults Tab */}
            <TabsContent value="uncertainty-defaults" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    不确定度默认值
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-3 rounded-md bg-muted/30 text-sm text-muted-foreground">
                    此处设置仅作为新建分析的默认值，不影响历史快照。
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="font-medium">传感器误差</div>
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">数值</div>
                        <div className="col-span-8 flex items-center gap-2">
                          <Input
                            value={defaults.params.sensorError.value ?? ''}
                            onChange={(e) => updateDefaults(prev => ({
                              ...prev,
                              sensorError: { ...prev.sensorError, value: e.target.value === '' ? null : Number(e.target.value) }
                            }))}
                          />
                          <span className="text-xs text-muted-foreground">μm</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">分布类型</div>
                        <div className="col-span-8">
                          <Select value={defaults.params.sensorError.distribution} onValueChange={(v) => updateDefaults(prev => ({
                            ...prev,
                            sensorError: { ...prev.sensorError, distribution: v as any }
                          }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uniform">均匀分布</SelectItem>
                              <SelectItem value="normal">正态分布</SelectItem>
                              <SelectItem value="triangular">三角分布</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="font-medium">标准器误差</div>
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">数值</div>
                        <div className="col-span-8 flex items-center gap-2">
                          <Input
                            value={defaults.params.standardError.value ?? ''}
                            onChange={(e) => updateDefaults(prev => ({
                              ...prev,
                              standardError: { ...prev.standardError, value: e.target.value === '' ? null : Number(e.target.value) }
                            }))}
                          />
                          <span className="text-xs text-muted-foreground">μm</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">分布类型</div>
                        <div className="col-span-8">
                          <Select value={defaults.params.standardError.distribution} onValueChange={(v) => updateDefaults(prev => ({
                            ...prev,
                            standardError: { ...prev.standardError, distribution: v as any }
                          }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uniform">均匀分布</SelectItem>
                              <SelectItem value="normal">正态分布</SelectItem>
                              <SelectItem value="triangular">三角分布</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="font-medium">环境误差</div>
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">数值</div>
                        <div className="col-span-8 flex items-center gap-2">
                          <Input
                            value={defaults.params.environmentError.value ?? ''}
                            onChange={(e) => updateDefaults(prev => ({
                              ...prev,
                              environmentError: { ...prev.environmentError, value: e.target.value === '' ? null : Number(e.target.value) }
                            }))}
                          />
                          <span className="text-xs text-muted-foreground">μm</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">分布类型</div>
                        <div className="col-span-8">
                          <Select value={defaults.params.environmentError.distribution} onValueChange={(v) => updateDefaults(prev => ({
                            ...prev,
                            environmentError: { ...prev.environmentError, distribution: v as any }
                          }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uniform">均匀分布</SelectItem>
                              <SelectItem value="normal">正态分布</SelectItem>
                              <SelectItem value="triangular">三角分布</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="font-medium">径向/轴向不对中</div>
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">径向数值</div>
                        <div className="col-span-8 flex items-center gap-2">
                          <Input
                            value={defaults.params.sensorMisalignmentRadial.value ?? ''}
                            onChange={(e) => updateDefaults(prev => ({
                              ...prev,
                              sensorMisalignmentRadial: { ...prev.sensorMisalignmentRadial, value: e.target.value === '' ? null : Number(e.target.value) }
                            }))}
                          />
                          <span className="text-xs text-muted-foreground">μm</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">轴向数值</div>
                        <div className="col-span-8 flex items-center gap-2">
                          <Input
                            value={defaults.params.sensorMisalignmentAxial.value ?? ''}
                            onChange={(e) => updateDefaults(prev => ({
                              ...prev,
                              sensorMisalignmentAxial: { ...prev.sensorMisalignmentAxial, value: e.target.value === '' ? null : Number(e.target.value) }
                            }))}
                          />
                          <span className="text-xs text-muted-foreground">μm</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">径向分布</div>
                        <div className="col-span-8">
                          <Select value={defaults.params.sensorMisalignmentRadial.distribution} onValueChange={(v) => updateDefaults(prev => ({
                            ...prev,
                            sensorMisalignmentRadial: { ...prev.sensorMisalignmentRadial, distribution: v as any }
                          }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uniform">均匀分布</SelectItem>
                              <SelectItem value="normal">正态分布</SelectItem>
                              <SelectItem value="triangular">三角分布</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">轴向分布</div>
                        <div className="col-span-8">
                          <Select value={defaults.params.sensorMisalignmentAxial.distribution} onValueChange={(v) => updateDefaults(prev => ({
                            ...prev,
                            sensorMisalignmentAxial: { ...prev.sensorMisalignmentAxial, distribution: v as any }
                          }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uniform">均匀分布</SelectItem>
                              <SelectItem value="normal">正态分布</SelectItem>
                              <SelectItem value="triangular">三角分布</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      最后修改时间：{defaults.lastModified ? new Date(defaults.lastModified).toLocaleString('zh-CN', { hour12: false }) : '—'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2" onClick={resetDefaults}><Undo2 className="w-4 h-4" /> 恢复默认</Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                        const data = exportDefaults();
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'uncertainty-defaults.json'; a.click();
                        URL.revokeObjectURL(url);
                      }}><Download className="w-4 h-4" /> 导出 JSON</Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'application/json';
                        input.onchange = async (e: any) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const text = await file.text();
                          importDefaults(text);
                        };
                        input.click();
                      }}><Upload className="w-4 h-4" /> 导入 JSON</Button>
                      <Button size="sm" className="gap-2" onClick={saveDefaults}><Save className="w-4 h-4" /> 保存为默认</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}