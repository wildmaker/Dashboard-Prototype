import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, RotateCcw, ZoomIn, ZoomOut, Move3D, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { useRouter } from './Router';

interface StepProps {
  stepNumber: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

function Step({ stepNumber, title, description, isActive, isCompleted, onClick }: StepProps) {
  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      } ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isCompleted ? 'bg-green-500 text-white' :
          isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
        }`}>
          {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNumber}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
      </div>
    </div>
  );
}

export function ThreeDGuideView() {
  const { navigate } = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      title: '选择安装场景',
      description: '从4种预设场景中选择适合的工装配置'
    },
    {
      title: '显示工装孔位',
      description: '高亮显示传感器安装位置和孔位标记'
    },
    {
      title: '插入电容传感器',
      description: '跟随动画演示正确的传感器安装步骤'
    },
    {
      title: '确认编号匹配',
      description: '验证传感器编号与数据采集通道对应关系'
    }
  ];

  const sensorData = [
    { id: 'CAP-001', position: '工位A', channel: 'CH1', status: 'correct' },
    { id: 'CAP-002', position: '工位B', channel: 'CH2', status: 'error' },
    { id: 'CAP-003', position: '工位C', channel: 'CH3', status: 'correct' },
    { id: 'CAP-004', position: '工位D', channel: 'CH4', status: 'unconfigured' }
  ];

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('dashboard')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回主界面
          </Button>
          <div className="h-4 w-px bg-border"></div>
          <h1 className="text-lg font-medium">三维安装指导</h1>
          <Badge variant="secondary">场景 1/4</Badge>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Steps */}
        <div className="w-80 border-r border-border p-6 space-y-4">
          <div>
            <h2 className="font-medium mb-4">安装步骤</h2>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <Step
                  key={index}
                  stepNumber={index + 1}
                  title={step.title}
                  description={step.description}
                  isActive={currentStep === index + 1}
                  isCompleted={completedSteps.includes(index + 1)}
                  onClick={() => setCurrentStep(index + 1)}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={handleStepComplete}
              className="w-full"
              disabled={completedSteps.includes(currentStep)}
            >
              {completedSteps.includes(currentStep) ? '步骤已完成' : '完成当前步骤'}
            </Button>
          </div>
        </div>

        {/* Center Panel - 3D Model */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Move3D className="w-5 h-5" />
                  3D 安装模型
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <RotateCcw className="w-4 h-4" />
                    重置
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full">
              <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center relative overflow-hidden">
                {/* Mock 3D Scene */}
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mx-auto shadow-2xl transform rotate-12 animate-pulse"></div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-muted-foreground">3D模型加载区域</h3>
                    <p className="text-sm text-muted-foreground/70">支持旋转、缩放、拖动操作</p>
                  </div>
                </div>

                {/* Mock highlight points */}
                <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Parameters */}
        <div className="w-80 border-l border-border p-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">传感器配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sensorData.map((sensor) => (
                <div key={sensor.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{sensor.id}</span>
                    {sensor.status === 'correct' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {sensor.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {sensor.status === 'unconfigured' && <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>位置: {sensor.position}</div>
                    <div>通道: {sensor.channel}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">安装提示</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-800">传感器对齐正确</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-800">CAP-002 通道配置错误</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}