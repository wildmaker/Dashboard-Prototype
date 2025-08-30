import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Gauge, Box, ChevronRight, LayoutDashboard, Settings, LogOut, Rocket } from 'lucide-react';
import { useRouter } from './Router';
import { useWizard } from './WizardContext';

interface FunctionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  isNew?: boolean;
}

function FunctionCard({ icon, title, description, onClick, isNew }: FunctionCardProps) {
  return (
    <Card 
      className="relative group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20 bg-gradient-to-br from-white to-gray-50/50 h-full"
      onClick={onClick}
    >
      <CardContent className="p-8 flex flex-col items-center text-center space-y-4 h-full">
        {isNew && (
          <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs">
            新增
          </div>
        )}
        
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <div className="text-primary text-2xl">
            {icon}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
        
        <div className="mt-4 flex items-center text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <span>进入模块</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MainFunctionArea() {
  const { navigate } = useRouter();
  const { startWizard } = useWizard();
  
  const functions = [
    {
      icon: <LayoutDashboard className="w-8 h-8" />,
      title: '分析工作台',
      description: '采集、分析、报告 一体化工作流（默认入口）',
      route: 'realtime' as const
    },
    {
      icon: <Gauge className="w-8 h-8" />,
      title: '仪表调试',
      description: '六通道电容传感器监控、编码器角度显示与校验',
      route: 'instrument-debug' as const
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: '系统设置',
      description: '系统参数配置与管理',
      route: 'settings' as const
    },
    // {
    //   icon: <Box className="w-8 h-8" />,
    //   title: '三维安装指导',
    //   description: '传感器3D安装指导、工装对位与编号匹配',
    //   route: '3d-guide' as const,
    //   isNew: true
    // }
  ];

  return (
    <div className="p-8 min-h-[60vh] flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-auto w-fit">
        {functions.map((func, index) => {
          const card = (
            <FunctionCard
              icon={func.icon}
              title={func.title}
              description={func.description}
              isNew={func.isNew}
              onClick={() => navigate(func.route)}
            />
          );
          return (
            <div key={index} className="h-full w-[200px] md:w-[220px]">
              {card}
            </div>
          );
        })}
      </div>
      <div className="mt-auto pt-8 pb-6 flex items-center justify-center" style={{ marginTop: '30px' }}>
        <div className="flex gap-3">
          <Button variant="default" size="lg" className="gap-2" onClick={() => startWizard(1)}>
            <Rocket className="w-5 h-5" />
            启动安装向导
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <LogOut className="w-5 h-5" />
            退出
          </Button>
        </div>
      </div>
    </div>
  );
}