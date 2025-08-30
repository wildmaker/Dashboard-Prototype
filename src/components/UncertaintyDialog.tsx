import React from 'react';
import { useUncertainty } from './UncertaintyContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function UncertaintyDialog() {
  const { isDialogOpen, closeDialog, state, setParams, save, loadDefaultsIntoParams } = useUncertainty();

  const p = state.params;

  const ParamRow: React.FC<{ label: string; value: number | null; unit: string; distribution: string; onChange: (n: number | null) => void; onDist: (d: 'uniform' | 'normal' | 'triangular') => void; }>
    = ({ label, value, unit, distribution, onChange, onDist }) => {
    return (
      <div className="grid grid-cols-2 items-center gap-3">
        <div className="text-sm">{label}</div>
        <div className="flex items-center gap-2 min-w-0">
          <Input
            className="min-w-0 flex-1"
            value={value ?? ''}
            onChange={(e) => {
              const v = e.target.value.trim();
              onChange(v === '' ? null : Number(v));
            }}
            placeholder="数值"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{unit}</span>
          <Select value={distribution} onValueChange={(v) => onDist(v as any)}>
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
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>不确定度评估 – 参数输入与计算</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <ParamRow
              label="传感器误差"
              value={p.sensorError.value}
              unit={p.sensorError.unit}
              distribution={p.sensorError.distribution}
              onChange={(n) => setParams(prev => ({ ...prev, sensorError: { ...prev.sensorError, value: n } }))}
              onDist={(d) => setParams(prev => ({ ...prev, sensorError: { ...prev.sensorError, distribution: d } }))}
            />
            <ParamRow
              label="标准器误差"
              value={p.standardError.value}
              unit={p.standardError.unit}
              distribution={p.standardError.distribution}
              onChange={(n) => setParams(prev => ({ ...prev, standardError: { ...prev.standardError, value: n } }))}
              onDist={(d) => setParams(prev => ({ ...prev, standardError: { ...prev.standardError, distribution: d } }))}
            />
            <ParamRow
              label="环境误差"
              value={p.environmentError.value}
              unit={p.environmentError.unit}
              distribution={p.environmentError.distribution}
              onChange={(n) => setParams(prev => ({ ...prev, environmentError: { ...prev.environmentError, value: n } }))}
              onDist={(d) => setParams(prev => ({ ...prev, environmentError: { ...prev.environmentError, distribution: d } }))}
            />
            <ParamRow
              label="径向不对中/侧向"
              value={p.radialMisalignment.value}
              unit={p.radialMisalignment.unit}
              distribution={p.radialMisalignment.distribution}
              onChange={(n) => setParams(prev => ({ ...prev, radialMisalignment: { ...prev.radialMisalignment, value: n } }))}
              onDist={(d) => setParams(prev => ({ ...prev, radialMisalignment: { ...prev.radialMisalignment, distribution: d } }))}
            />
            <ParamRow
              label="轴向不对中/侧向"
              value={p.axialMisalignment.value}
              unit={p.axialMisalignment.unit}
              distribution={p.axialMisalignment.distribution}
              onChange={(n) => setParams(prev => ({ ...prev, axialMisalignment: { ...prev.axialMisalignment, value: n } }))}
              onDist={(d) => setParams(prev => ({ ...prev, axialMisalignment: { ...prev.axialMisalignment, distribution: d } }))}
            />
          </div>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="text-sm mb-1">径向不确定度</div>
              <div className="text-xl font-semibold">{state.results.radial ?? '--'} μm</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm mb-1">轴向不确定度</div>
              <div className="text-xl font-semibold">{state.results.axial ?? '--'} μm</div>
            </div>
            <div className="text-sm text-muted-foreground">
              {state.status === 'filled' && state.lastUpdated ? `上次更新：${new Date(state.lastUpdated).toLocaleString('zh-CN')}` : '未填写'}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={loadDefaultsIntoParams}>使用默认值</Button>
          <Button variant="ghost" onClick={closeDialog}>取消</Button>
          <Button onClick={() => { save(); closeDialog(); }}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

