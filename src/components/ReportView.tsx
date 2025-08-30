import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, FileText, Download, Save, Eye, Layout, Grid, Columns, CheckCircle2, AlertTriangle, Circle } from 'lucide-react';
import { useRouter } from './Router';
import { useUncertainty } from './UncertaintyContext';

export function ReportView() {
  const { navigate } = useRouter();
  const { state: uncertaintyState, openDialog: openUncertainty } = useUncertainty();
  const [reportTemplate, setReportTemplate] = useState('standard');
  const [chartLayout, setChartLayout] = useState('2x2');
  const [reportTitle, setReportTitle] = useState('主轴回转精度检测报告');
  const [headerText, setHeaderText] = useState('主轴误差分析仪系统');
  const [footerText, setFooterText] = useState('© 2024 主轴误差分析仪系统 - 自动生成报告');
  const viewMethod: 'single' | 'double' | 'triple' | 'donaldson' = 'single';

  const templates = [
    { value: 'simple', label: '简洁模板', description: '主轴径向轴向误差和基本参数' },
    { value: 'standard', label: '标准模板', description: '完整的主轴误差分析和极坐标图表' },
    { value: 'technical', label: '技术模板', description: '详细测量参数和不确定度评定' }
  ];

  const layouts = [
    { value: '2x2', label: '2×2网格', icon: <Grid className="w-4 h-4" /> },
    { value: 'single', label: '单列布局', icon: <Columns className="w-4 h-4" /> },
    { value: 'mixed', label: '混合布局', icon: <Layout className="w-4 h-4" /> }
  ];

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
            <h1 className="text-lg font-medium">报告生成</h1>
            <Badge variant="secondary">{templates.find(t => t.value === reportTemplate)?.label}</Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              预览
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Save className="w-4 h-4" />
              保存模板
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              导出PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Settings Panel */}
        <div className="w-80 border-r border-border p-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">报告模板</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={reportTemplate} onValueChange={setReportTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      <div>
                        <div className="font-medium">{template.label}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">页面设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">报告标题</label>
                <Input 
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="输入报告标题"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">页眉内容</label>
                <Input 
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="页眉文字"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">页脚内容</label>
                <Textarea 
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="页脚文字"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">图表布局</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                {layouts.map((layout) => (
                  <div
                    key={layout.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      chartLayout === layout.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setChartLayout(layout.value)}
                  >
                    <div className="flex items-center gap-2">
                      {layout.icon}
                      <span className="font-medium text-sm">{layout.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">不确定度评估</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                {uncertaintyState.status === 'filled' ? (
                  <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 className="w-4 h-4" /> 已填写</span>
                ) : uncertaintyState.status === 'stale' ? (
                  <span className="inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="w-4 h-4" /> 需更新</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground"><Circle className="w-4 h-4" /> 未填写</span>
                )}
              </div>
              {uncertaintyState.lastUpdated && (
                <div className="text-xs text-muted-foreground">上次更新：{new Date(uncertaintyState.lastUpdated).toLocaleString('zh-CN', { hour12: false })}</div>
              )}
              <Button variant="outline" size="sm" onClick={openUncertainty}>去填写/查看</Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 p-6 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-0">
                {/* Report Preview */}
                <div className="bg-white p-8 min-h-[800px]">
                  {/* Header */}
                  <div className="border-b pb-4 mb-6">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-2">{headerText}</div>
                      <h1 className="text-2xl font-medium mb-2">{reportTitle}</h1>
                      <div className="text-sm text-muted-foreground">生成时间: {new Date().toLocaleDateString('zh-CN')}</div>
                    </div>
                  </div>

                  {/* Content based on template */}
                  <div className="space-y-8">
                    {/* Executive Summary */}
                    <section>
                      <h2 className="text-lg font-medium mb-3 text-primary">执行摘要</h2>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm leading-relaxed">
                          本次主轴回转精度检测采用{viewMethod === 'single' ? '单点法' : viewMethod === 'double' ? '双点垂直法' : viewMethod === 'triple' ? '三点法' : '唐纳森反转法'}测量，
                          测试条件为标准环境温度20°C，湿度45%RH，主轴转速1500 RPM。
                          检测结果显示，径向回转误差为±2.5μm，轴向窜动为±1.8μm，倾角误差为±0.003°，
                          满足GB/T 17421.1-2020标准要求。
                        </p>
                      </div>
                    </section>

                    {/* Uncertainty Assessment Results */}
                    <section>
                      <h2 className="text-lg font-medium mb-3 text-primary">测量不确定度评估</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">结果</h4>
                          <div className="text-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">径向不确定度</span>
                              <span className="font-mono">{uncertaintyState.results.radial !== null ? `${uncertaintyState.results.radial} μm` : '--'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">轴向不确定度</span>
                              <span className="font-mono">{uncertaintyState.results.axial !== null ? `${uncertaintyState.results.axial} μm` : '--'}</span>
                            </div>
                            {uncertaintyState.lastUpdated && (
                              <div className="text-xs text-muted-foreground">更新时间：{new Date(uncertaintyState.lastUpdated).toLocaleString('zh-CN', { hour12: false })}</div>
                            )}
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">参数摘要</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center justify-between"><span>传感器误差</span><span className="font-mono">{uncertaintyState.state.params.sensorError.value ?? '--'} {uncertaintyState.state.params.sensorError.unit}</span></div>
                            <div className="flex items-center justify-between"><span>标准器误差</span><span className="font-mono">{uncertaintyState.state.params.standardError.value ?? '--'} {uncertaintyState.state.params.standardError.unit}</span></div>
                            <div className="flex items-center justify-between"><span>环境误差</span><span className="font-mono">{uncertaintyState.state.params.environmentError.value ?? '--'} {uncertaintyState.state.params.environmentError.unit}</span></div>
                            <div className="flex items-center justify-between"><span>径向不对中</span><span className="font-mono">{uncertaintyState.state.params.radialMisalignment.value ?? '--'} {uncertaintyState.state.params.radialMisalignment.unit}</span></div>
                            <div className="flex items-center justify-between"><span>轴向不对中</span><span className="font-mono">{uncertaintyState.state.params.axialMisalignment.value ?? '--'} {uncertaintyState.state.params.axialMisalignment.unit}</span></div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Test Results */}
                    <section>
                      <h2 className="text-lg font-medium mb-3 text-primary">主轴误差检测结果</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">径向回转误差</h4>
                          <div className="text-sm space-y-1">
                            <div>最大值: +2.5μm</div>
                            <div>最小值: -2.3μm</div>
                            <div>径向误差范围: 4.8μm</div>
                            <div>评定结果: <span className="text-green-600">合格</span></div>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">轴向窜动</h4>
                          <div className="text-sm space-y-1">
                            <div>最大值: +1.8μm</div>
                            <div>最小值: -1.6μm</div>
                            <div>轴向窜动量: 3.4μm</div>
                            <div>评定结果: <span className="text-green-600">合格</span></div>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">倾角误差</h4>
                          <div className="text-sm space-y-1">
                            <div>X方向: ±0.002°</div>
                            <div>Y方向: ±0.003°</div>
                            <div>合成倾角: 0.0036°</div>
                            <div>评定结果: <span className="text-green-600">合格</span></div>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">测量参数</h4>
                          <div className="text-sm space-y-1">
                            <div>测量方法: {viewMethod === 'single' ? '单点法' : viewMethod === 'double' ? '双点垂直法' : viewMethod === 'triple' ? '三点法' : '唐纳森反转法'}</div>
                            <div>转速: 1500 RPM</div>
                            <div>采样频率: 1024 Hz</div>
                            <div>测量圈数: 10圈</div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Charts Section */}
                    <section>
                      <h2 className="text-lg font-medium mb-3 text-primary">数据图表</h2>
                      <div className={`grid gap-4 ${
                        chartLayout === '2x2' ? 'grid-cols-2' : 
                        chartLayout === 'single' ? 'grid-cols-1' : 
                        'grid-cols-1'
                      }`}>
                        <Card>
                          <CardContent className="p-4">
                            <div className="mx-auto w-full max-w-[720px]">
                              <div className="border border-dashed border-muted-foreground/30 rounded-lg h-48 flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                  <FileText className="w-8 h-8 mx-auto mb-2" />
                                  <div className="text-sm">径向误差极坐标图</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        {chartLayout !== 'single' && (
                          <>
                            <Card>
                              <CardContent className="p-4">
                                <div className="mx-auto w-full max-w-[720px]">
                                  <div className="border border-dashed border-muted-foreground/30 rounded-lg h-48 flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                      <FileText className="w-8 h-8 mx-auto mb-2" />
                                      <div className="text-sm">轴向窜动时域图</div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            {chartLayout === '2x2' && (
                              <>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="mx-auto w-full max-w-[720px]">
                                      <div className="border border-dashed border-muted-foreground/30 rounded-lg h-48 flex items-center justify-center">
                                        <div className="text-center text-muted-foreground">
                                          <FileText className="w-8 h-8 mx-auto mb-2" />
                                          <div className="text-sm">倾角误差图</div>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="mx-auto w-full max-w-[720px]">
                                      <div className="border border-dashed border-muted-foreground/30 rounded-lg h-48 flex items-center justify-center">
                                        <div className="text-center text-muted-foreground">
                                          <FileText className="w-8 h-8 mx-auto mb-2" />
                                          <div className="text-sm">频谱分析图</div>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </section>

                    {reportTemplate === 'technical' && (
                      <>
                        <section>
                          <h2 className="text-lg font-medium mb-3 text-primary">技术参数与环境条件</h2>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse border border-gray-300">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="border border-gray-300 p-2 text-left">参数</th>
                                  <th className="border border-gray-300 p-2 text-left">设定值</th>
                                  <th className="border border-gray-300 p-2 text-left">实测值</th>
                                  <th className="border border-gray-300 p-2 text-left">允许偏差</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-300 p-2">主轴转速</td>
                                  <td className="border border-gray-300 p-2">1500 RPM</td>
                                  <td className="border border-gray-300 p-2">1500.2 RPM</td>
                                  <td className="border border-gray-300 p-2">±10 RPM</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">采样频率</td>
                                  <td className="border border-gray-300 p-2">1024 Hz</td>
                                  <td className="border border-gray-300 p-2">1024 Hz</td>
                                  <td className="border border-gray-300 p-2">±0.1%</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">环境温度</td>
                                  <td className="border border-gray-300 p-2">20±2°C</td>
                                  <td className="border border-gray-300 p-2">20.1°C</td>
                                  <td className="border border-gray-300 p-2">20±5°C</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-300 p-2">相对湿度</td>
                                  <td className="border border-gray-300 p-2">45±5%RH</td>
                                  <td className="border border-gray-300 p-2">44.8%RH</td>
                                  <td className="border border-gray-300 p-2">30-70%RH</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </section>
                        
                        <section>
                          <h2 className="text-lg font-medium mb-3 text-primary">测量不确定度评定</h2>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4">
                              <h4 className="font-medium mb-2">A类不确定度</h4>
                              <div className="text-sm space-y-1">
                                <div>重复性测量次数: 10次</div>
                                <div>标准偏差: 0.15μm</div>
                                <div>A类标准不确定度: 0.05μm</div>
                              </div>
                            </div>
                            <div className="border rounded-lg p-4">
                              <h4 className="font-medium mb-2">B类不确定度</h4>
                              <div className="text-sm space-y-1">
                                <div>标准器不确定度: 0.1μm</div>
                                <div>环境影响: 0.05μm</div>
                                <div>B类标准不确定度: 0.11μm</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium mb-2">合成标准不确定度</h4>
                            <div className="text-sm space-y-1">
                              <div>合成标准不确定度: u_c = √(u_A² + u_B²) = 0.12μm</div>
                              <div>扩展不确定度: U = k × u_c = 2 × 0.12 = 0.24μm (k=2, 置信水平95%)</div>
                              <div>测量结果: 径向误差 = 2.5 ± 0.24μm</div>
                            </div>
                          </div>
                        </section>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-12 pt-4 border-t text-center text-xs text-muted-foreground">
                    {footerText}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Export Panel */}
        <div className="w-64 border-l border-border p-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">导出选项</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full gap-2">
                <Download className="w-4 h-4" />
                导出PDF
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                导出Word
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Save className="w-4 h-4" />
                保存模板
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">报告信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">页数</span>
                <span>3页</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">图表数量</span>
                <span>{chartLayout === '2x2' ? '4个' : chartLayout === 'single' ? '1个' : '6个'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">模板类型</span>
                <span>{templates.find(t => t.value === reportTemplate)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">文件大小</span>
                <span>~2.5MB</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}