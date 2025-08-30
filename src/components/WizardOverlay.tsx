import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { Button } from './ui/button';
import { useWizard } from './WizardContext';
import { useRouter } from './Router';

const stepLabels: Record<number, string> = {
  1: '场景配置',
  2: '仪表调试',
  3: '参数配置',
};

const stepGuides: Record<number, string> = {
  1: '请完成场景配置：进入“设置 → 传感器配置”，检查通道编号、测量范围与灵敏度是否正确。',
  2: '请在“仪表调试”中检查各通道信号与编码器角度，必要时进行校准并确认运行状态正常。',
  3: '请在“设置 → 分析参数”中设置采样频率、测量时间与滤波参数，并保存设置。',
};

export function WizardOverlay() {
  const { isActive, currentStep, totalSteps, endWizard, goPrev, goNext, goToStep } = useWizard();
  const { currentRoute } = useRouter();

  // Do not show the wizard bar on the homepage (dashboard)
  if (!isActive || currentRoute === 'dashboard') return null;

  // Ensure the wizard bar is visible by scrolling to top when activated or step changes
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (_) {
      // fallback
      // @ts-ignore
      document.documentElement.scrollTop = 0;
    }
  }, [isActive, currentStep]);

  return (
    <div className="w-full bg-black">
      {/* 顶部进度条（与导航顶部对齐） */}
      {/* <div className="relative h-1 w-fullbg-black/100">
        <div
          className="absolute left-0 top-0 h-1 bg-white transition-all"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div> */}
      <div 
        style={{ backgroundColor: 'black' }} 
        className="relative max-w-7xl mx-auto px-4 py-2 border-b border-white/20 shadow-md text-white"
      >
        <div className="flex items-center gap-4">
          {/* 左侧标题 */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-base font-semibold tracking-wide">安装向导</div>
            </div>
          </div>

          {/* 中间 Stepper */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[1, 2, 3].map((step) => {
                const active = currentStep === step;
                const completed = step < currentStep;
                return (
                  <button
                    key={step}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      active
                        ? 'bg-white text-black border-white/80 ring-1 ring-white/60 shadow-sm'
                        : completed
                        ? 'bg-white/20 border-white/50 text-white'
                        : 'bg-white/10 border-white/30 text-white'
                    }`}
                    onClick={() => goToStep(step as 1 | 2 | 3)}
                    aria-current={active ? 'step' : undefined}
                    style={active ? { color: '#000' } : undefined}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-medium ${
                        active
                          ? 'bg-white text-black border border-black/50'
                          : 'bg-transparent text-white'
                      }`}
                      style={active ? { color: '#000' } : undefined}
                    >
                      {step}
                    </span>
                    <span className={`whitespace-nowrap ${active ? 'text-black' : 'text-white'}`} style={active ? { color: '#000' } : undefined}>{stepLabels[step]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 右侧关闭按钮 */}
          <div className="flex items-center shrink-0">
            <Button variant="ghost" size="icon" onClick={endWizard} aria-label="关闭安装向导" className="text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 引导文案（单行，100% 宽度） */}
      <div className="w-full !bg-black" style={{ backgroundColor: '#000000' }}>
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div 
            className="text-[14px] whitespace-normal overflow-hidden text-ellipsis text-center leading-6"
            style={{ 
              color: 'rgba(255, 255, 255, 1)',
              textShadow: 'none'
            }}
          >
            {stepGuides[currentStep]}
          </div>
        </div>
      </div>

      {/* 浮动控制区（页面下方居中） */}
      <div className="fixed left-1/2 -translate-x-1/2 z-[9992]" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="relative overflow-hidden flex items-center gap-4 rounded-full border border-white/30 px-4 py-2 shadow-lg" style={{ backgroundColor: '#000000' }}>
          <div className="absolute inset-0" style={{ backgroundColor: '#000000' }} aria-hidden="true" />
          <Button variant="ghost" size="sm" onClick={goPrev} className="hover:bg-white/10" style={{ color: '#ffffff' }}>
            <ChevronLeft className="w-4 h-4 mr-1" style={{ color: '#ffffff' }} /> 上一步
          </Button>
          <Button variant="ghost" size="sm" onClick={goNext} className="hover:bg-white/10" style={{ color: '#ffffff' }}>
            跳过
          </Button>
          <Button variant="ghost" size="sm" onClick={goNext} className="hover:bg-white/10" style={{ color: '#ffffff' }}>
            下一步 <ChevronRight className="w-4 h-4 ml-1" style={{ color: '#ffffff' }} />
          </Button>
        </div>
      </div>
    </div>
  );
}


