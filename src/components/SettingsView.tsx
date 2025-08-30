import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, Settings, Gauge, Cpu, Database, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRouter } from './Router';
import { useWizard, useWizardSettingsTab } from './WizardContext';

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
          <Tabs value={isWizardActive && wizardTab ? wizardTab : activeTab} onValueChange={setActiveTab}>
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
              <TabsTrigger value="uncertainty" className="gap-2">
                <Settings className="w-4 h-4" />
                不确定度评定
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

            {/* Uncertainty Assessment Tab */}
            <TabsContent value="uncertainty" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    不确定度评定参数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">A类不确定度</h4>
                      <ConfigItem
                        label="重复性试验次数"
                        value="10"
                        unit="次"
                        isValid={true}
                        onChange={() => {}}
                      />
                      <ConfigItem
                        label="置信水平"
                        value="95"
                        unit="%"
                        isValid={true}
                        onChange={() => {}}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">B类不确定度</h4>
                      <ConfigItem
                        label="标准器不确定度"
                        value="0.5"
                        unit="μm"
                        isValid={true}
                        onChange={() => {}}
                      />
                      <ConfigItem
                        label="环境影响"
                        value="0.2"
                        unit="μm"
                        isValid={true}
                        onChange={() => {}}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">合成不确定度</h4>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm text-green-800">
                          <div>标准不确定度: 0.8 μm</div>
                          <div>扩展不确定度: 1.6 μm</div>
                          <div>包含因子: k=2</div>
                        </div>
                      </div>
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