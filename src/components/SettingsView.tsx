import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, Settings, Gauge, Cpu, Database, Target, AlertTriangle, CheckCircle, Move3D, RotateCcw, ZoomIn, ZoomOut, Undo2, Save } from 'lucide-react';
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
  } = useUncertainty();
  useEffect(() => {
    if (wizardTab) {
      setActiveTab(wizardTab);
    }
  }, [wizardTab]);
  
  // Analysis parameters (per spec)
  const [samplingMode, setSamplingMode] = useState<'angle' | 'time'>('angle');
  const [samplingPointsPerRev, setSamplingPointsPerRev] = useState('200'); // Ss/r, 点/圈
  const [samplingRevolutions, setSamplingRevolutions] = useState('20'); // r, 圈
  const [realtimeRPM, setRealtimeRPM] = useState('1500'); // mock realtime
  const [setRPM, setSetRPM] = useState('1500'); // 手动设定
  
  // Standard device settings (per spec)
  const [standardRadiusUm, setStandardRadiusUm] = useState('100000'); // μm
  const [standardArmLengthUm, setStandardArmLengthUm] = useState('200000'); // μm
  
  // Encoder settings (per spec)
  const ENCODER_PRESETS: Array<{ id: string; label: string; lines: number; subdiv: number } | { id: 'custom'; label: string }> = [
    { id: 'omron-1024x4', label: 'Omron E6B2 1024 × 4', lines: 1024, subdiv: 4 },
    { id: 'omron-2048x4', label: 'Omron E6B2 2048 × 4', lines: 2048, subdiv: 4 },
    { id: 'heidenhain-5000x8', label: 'Heidenhain 5000 × 8', lines: 5000, subdiv: 8 },
    { id: 'custom', label: '自定义' }
  ];
  const [encoderModel, setEncoderModel] = useState<string>('omron-1024x4');
  const [encoderLines, setEncoderLines] = useState<string>('1024'); // 100–10000
  const [encoderSubdivision, setEncoderSubdivision] = useState<string>('4'); // 1–256
  
  // Capacitive sensor parameters (per spec)
  const [sensorSensitivityCoeff, setSensorSensitivityCoeff] = useState('1.0'); // μm/V, 0.1–100
  const [sensorInitialDistanceUm, setSensorInitialDistanceUm] = useState('1000'); // μm, 100–5000
  const [sensorCorrectionScale, setSensorCorrectionScale] = useState('1.0'); // 0.5–2.0
  const [sensorCorrectionOffsetV, setSensorCorrectionOffsetV] = useState('0.0'); // V, -5~+5

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
  const validatePointsPerRev = (val: string) => {
    const num = Number(val);
    return Number.isFinite(num) && num >= 50 && num <= 5000;
  };

  const validateRevolutions = (val: string) => {
    const num = Number(val);
    return Number.isFinite(num) && num >= 1 && num <= 200;
  };

  const validatePositiveUm = (val: string) => {
    const num = Number(val);
    return Number.isFinite(num) && num > 0;
  };

  const validateEncoderLines = (val: string) => {
    const num = Number(val);
    return Number.isFinite(num) && num >= 100 && num <= 10000;
  };

  const validateEncoderSubdivision = (val: string) => {
    const num = Number(val);
    return Number.isFinite(num) && num >= 1 && num <= 256;
  };

  const validateSensitivityCoeff = (val: string) => {
    const num = Number(val);
    return Number.isFinite(num) && num >= 0.1 && num <= 100;
  };

  const validateInitialDistance = (val: string) => {
    const num = Number(val);
    return Number.isFinite(num) && num >= 100 && num <= 5000;
  };

  const validateCorrectionScale = (val: string) => {
    const num = Number(val);
    return Number.isFinite(num) && num >= 0.5 && num <= 2.0;
  };

  const validateCorrectionOffset = (val: string) => {
    const num = Number(val);
    return Number.isFinite(num) && num >= -5.0 && num <= 5.0;
  };

  // Auto apply encoder preset defaults when model changes
  useEffect(() => {
    const preset = ENCODER_PRESETS.find(p => 'id' in p && p.id === encoderModel) as any;
    if (preset && preset.id !== 'custom' && typeof preset.lines === 'number' && typeof preset.subdiv === 'number') {
      setEncoderLines(String(preset.lines));
      setEncoderSubdivision(String(preset.subdiv));
    }
  }, [encoderModel]);

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
            <TabsList className="w-full">
              <TabsTrigger value="sensor-setup" className="gap-2">
                <Move3D className="w-4 h-4" />
                传感器安装
              </TabsTrigger>
              <TabsTrigger value="sensor" className="gap-2">
                <Database className="w-4 h-4" />
                传感器参数
              </TabsTrigger>
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
              <TabsTrigger value="uncertainty-defaults" className="gap-2">
                <Settings className="w-4 h-4" />
                不确定度默认值
              </TabsTrigger>
            </TabsList>

            {/* Sensor Setup Tab */}
            <TabsContent value="sensor-setup" className="mt-6">
              {/* Guidance: Help link only */}
              <div className="p-4 border rounded-lg bg-muted/30 text-sm text-muted-foreground mb-6">
                <div className="flex items-center justify-end">
                  <Button variant="link" size="sm" onClick={() => navigate('3d-guide')}>查看安装帮助</Button>
                </div>
              </div>

              {/* Scenario selection + 3D + sidebar mapping */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Column 1: Scene selection sidebar */}
                <div className="flex">
                  <Card className="flex-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">场景选择</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={selectedScenario ?? ''}
                        onValueChange={(v) => setSelectedScenario(v as ScenarioId)}
                        className="grid grid-cols-1 md:grid-cols-1 gap-3"
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
                    </CardContent>
                  </Card>
                </div>

                {/* Column 2: 3D model/illustration */}
                <div className="flex">
                  <Card className="flex-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">3D 模型/示意图</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg flex flex-col" style={{ height: '360px' }}>
                        <div className="flex items-center justify-between px-3 py-2 border-b">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Move3D className="w-4 h-4" />3D 模型/示意图</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-1"><RotateCcw className="w-4 h-4" />重置</Button>
                            <Button variant="outline" size="sm" className="gap-1"><ZoomOut className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" className="gap-1"><ZoomIn className="w-4 h-4" /></Button>
                            <Button variant="secondary" size="sm" className="gap-1" onClick={() => setIsAnimating((v) => !v)}>{isAnimating ? '停止动画' : '播放安装动画'}</Button>
                          </div>
                        </div>
                        <div className="relative bg-slate-50 overflow-hidden" style={{ height: '288px' }}>
                          {(() => {
                            const idx = selectedScenario ? scenarios.findIndex(s => s.id === selectedScenario) : 0;
                            const clamped = Math.max(0, Math.min(3, idx));
                            return (
                              <img
                                src="/3d_screeshot.png"
                                alt="3D 场景占位图"
                                className={`absolute top-0 left-0 transition-transform duration-300 ease-out ${isAnimating ? 'animate-pulse' : ''}`}
                                style={{ transform: `translateX(-${clamped * 25}%)`, height: '100%', width: 'auto', willChange: 'transform' }}
                              />
                            );
                          })()}

                          {selectedScenario && (
                            <>
                              {scenarios.find(s => s.id === selectedScenario)!.highlightChannels.map((ch, idx) => (
                                <div
                                  key={ch}
                                  className={`absolute w-3 h-3 rounded-full ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-green-400' : 'bg-red-400'} ${isAnimating ? 'animate-ping' : ''}`}
                                  style={{ top: `${25 + idx * 20}%`, left: `${30 + (idx % 2) * 35}%` }}
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

                {/* Column 3: Mapping table */}
                <div className="flex">
                  <Card className="flex-1">
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
                </div>
              </div>
            </TabsContent>

            {/* Analysis Parameters Tab */}
            <TabsContent value="analysis" className="mt-6">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="w-5 h-5" />
                      采样参数
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">采样模式</Label>
                      <RadioGroup value={samplingMode} onValueChange={(v) => setSamplingMode(v as 'angle' | 'time')} className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="angle" id="sampling-angle" />
                          <Label htmlFor="sampling-angle">角度触发</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="time" id="sampling-time" />
                          <Label htmlFor="sampling-time">时间触发</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <ConfigItem
                      label="采样频率 (Ss/r)"
                      value={samplingPointsPerRev}
                      unit="点/圈"
                      isValid={validatePointsPerRev(samplingPointsPerRev)}
                      onChange={setSamplingPointsPerRev}
                      error={!validatePointsPerRev(samplingPointsPerRev) ? '范围：50–5000 点/圈' : undefined}
                    />

                    <ConfigItem
                      label="采样圈数 (r)"
                      value={samplingRevolutions}
                      unit="圈"
                      isValid={validateRevolutions(samplingRevolutions)}
                      onChange={setSamplingRevolutions}
                      error={!validateRevolutions(samplingRevolutions) ? '范围：1–200 圈' : undefined}
                    />

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">实时转速 (RPM)</Label>
                      <div className="flex items-center gap-2">
                        <Input value={realtimeRPM} readOnly className="flex-1" />
                        <span className="text-xs text-muted-foreground">{samplingMode === 'angle' ? '角度触发 → 差分计算' : '时间触发 → 传感器波动计算'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">实时刷新</div>
                      </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">设定转速 (RPM)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={setRPM}
                          onChange={(e) => setSetRPM(e.target.value)}
                          className="flex-1"
                          disabled={samplingMode === 'angle'}
                        />
                        <Button variant="outline" disabled={samplingMode === 'angle'} onClick={() => setSetRPM(realtimeRPM)}>自动检测</Button>
                      </div>
                      {samplingMode === 'angle' && (
                        <div className="text-xs text-muted-foreground">角度触发模式下不可用</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                
              </div>
            </TabsContent>

            {/* Standard Device Tab */}
            <TabsContent value="standard" className="mt-6">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      标准器参数
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ConfigItem
                      label="标准器半径"
                      value={standardRadiusUm}
                      unit="μm"
                      isValid={validatePositiveUm(standardRadiusUm)}
                      onChange={setStandardRadiusUm}
                      error={!validatePositiveUm(standardRadiusUm) ? '范围：> 0 μm' : undefined}
                    />
                    <ConfigItem
                      label="标准器臂长"
                      value={standardArmLengthUm}
                      unit="μm"
                      isValid={validatePositiveUm(standardArmLengthUm)}
                      onChange={setStandardArmLengthUm}
                      error={!validatePositiveUm(standardArmLengthUm) ? '范围：> 0 μm' : undefined}
                    />
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
                      <Label>型号</Label>
                      <Select value={encoderModel} onValueChange={setEncoderModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ENCODER_PRESETS.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <ConfigItem
                      label="编码器线数 (lines)"
                      value={encoderLines}
                      isValid={validateEncoderLines(encoderLines)}
                      onChange={setEncoderLines}
                      error={!validateEncoderLines(encoderLines) ? '范围：100–10000' : undefined}
                    />

                    <ConfigItem
                      label="细分倍数"
                      value={encoderSubdivision}
                      isValid={validateEncoderSubdivision(encoderSubdivision)}
                      onChange={setEncoderSubdivision}
                      error={!validateEncoderSubdivision(encoderSubdivision) ? '范围：1–256' : undefined}
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
              {/* Sensor parameters per spec */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      传感器参数
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ConfigItem
                      label="灵敏度系数"
                      value={sensorSensitivityCoeff}
                      unit="μm/V"
                      isValid={validateSensitivityCoeff(sensorSensitivityCoeff)}
                      onChange={setSensorSensitivityCoeff}
                      error={!validateSensitivityCoeff(sensorSensitivityCoeff) ? '范围：0.1–100 μm/V' : undefined}
                    />
                    <ConfigItem
                      label="初始测量距离"
                      value={sensorInitialDistanceUm}
                      unit="μm"
                      isValid={validateInitialDistance(sensorInitialDistanceUm)}
                      onChange={setSensorInitialDistanceUm}
                      error={!validateInitialDistance(sensorInitialDistanceUm) ? '范围：100–5000 μm' : undefined}
                    />
                    <ConfigItem
                      label="修正比例系数"
                      value={sensorCorrectionScale}
                      isValid={validateCorrectionScale(sensorCorrectionScale)}
                      onChange={setSensorCorrectionScale}
                      error={!validateCorrectionScale(sensorCorrectionScale) ? '范围：0.5–2.0' : undefined}
                    />
                    <ConfigItem
                      label="修正偏移量"
                      value={sensorCorrectionOffsetV}
                      unit="V"
                      isValid={validateCorrectionOffset(sensorCorrectionOffsetV)}
                      onChange={setSensorCorrectionOffsetV}
                      error={!validateCorrectionOffset(sensorCorrectionOffsetV) ? '范围：-5.0 ~ +5.0 V' : undefined}
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