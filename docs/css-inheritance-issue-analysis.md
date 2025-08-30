# WizardOverlay CSS 样式不生效问题分析

## 问题描述
在 `WizardOverlay.tsx` 组件的第 110-111 行，使用 Tailwind CSS 的 `bg-black` 类设置背景色无效，只能通过 inline CSS 临时解决。

## 根本原因分析

### 1. 父容器背景色冲突
在 `App.tsx` 第 25 行，当 wizard 激活时，整个应用容器已经设置了黑色背景：
```tsx
<div className={`min-h-screen ${isActive ? 'bg-black' : 'bg-background'}`}>
```

### 2. CSS 特异性和继承问题
- WizardOverlay 组件在多个地方重复设置了黑色背景
- 可能存在其他全局样式或父元素样式的覆盖
- Tailwind CSS 类的优先级可能不够高

### 3. 背景色透明度问题
在 `globals.css` 中定义的 CSS 变量可能影响背景色的渲染：
- `--background` 变量在不同主题下有不同的值
- 可能存在背景色的 alpha 通道或透明度设置

### 4. 层级关系影响
WizardOverlay 组件使用了多个 fixed 定位的元素，可能导致背景色的视觉效果不明显：
- 第 38 行：固定定位的容器
- 第 40 行：全局遮罩层
- 第 110 行：引导文案区域

## 解决方案

### 方案 1：使用更高特异性的选择器
```css
/* 在组件样式中添加 */
.wizard-guide-section {
  background-color: black !important;
}
```

### 方案 2：使用 CSS 变量确保一致性
```tsx
<div className="w-full" style={{ backgroundColor: 'rgb(0, 0, 0)' }}>
  {/* 或使用 CSS 变量 */}
  <div style={{ backgroundColor: 'var(--wizard-bg, #000000)' }}>
```

### 方案 3：检查并移除冲突的样式
1. 移除 App.tsx 中的冗余背景色设置
2. 统一使用一个地方设置背景色
3. 确保没有其他组件或全局样式影响

### 方案 4：使用 Tailwind 的重要性修饰符
```tsx
<div className="w-full !bg-black">
  {/* 使用 ! 前缀强制应用样式 */}
</div>
```

## 最佳实践建议

1. **避免重复设置相同样式**
   - 在组件层级中只在一个地方设置背景色
   - 子元素可以继承父元素的背景色

2. **使用语义化的 CSS 变量**
   ```css
   :root {
     --wizard-overlay-bg: #000000;
     --wizard-text-color: #ffffff;
   }
   ```

3. **检查 Tailwind 配置**
   - 确保 Tailwind 的 purge/content 配置正确
   - 检查是否有自定义的 Tailwind 插件影响

4. **使用开发者工具调试**
   - 检查元素的计算样式
   - 查看样式的来源和优先级
   - 使用 CSS 覆盖检查器

## 推荐的修复代码

### 最终解决方案：使用内联样式覆盖继承

问题根源：
- `globals.css` 中 body 设置了 `@apply text-foreground`，所有子元素继承此颜色
- `text-white/80` Tailwind 类的特异性不足以覆盖继承的 CSS 变量
- CSS 变量在不同主题下有不同值，导致文本颜色不符合预期

解决方案：

```tsx
// WizardOverlay.tsx 第 110-122 行 - 最终版本
{/* 引导文案（单行，100% 宽度） */}
<div className="w-full !bg-black" style={{ backgroundColor: '#000000' }}>
  <div className="max-w-7xl mx-auto px-4 py-2">
    <div 
      className="text-[14px] whitespace-normal overflow-hidden text-ellipsis text-center leading-6"
      style={{ 
        color: 'rgba(255, 255, 255, 0.8)',
        textShadow: 'none'
      }}
    >
      {stepGuides[currentStep]}
    </div>
  </div>
</div>
```

### 为什么这个方案有效：

1. **内联样式优先级最高**：`style` 属性的特异性为 1000，高于任何 CSS 类
2. **显式颜色值**：使用 `rgba(255, 255, 255, 0.8)` 而不是 CSS 变量，避免主题切换影响
3. **重置文本阴影**：`textShadow: 'none'` 确保没有其他视觉干扰
4. **保持 Tailwind 类**：继续使用 Tailwind 处理布局和其他样式

### 其他可选方案：

#### 方案 A：使用 CSS 自定义属性
```tsx
const wizardStyles = {
  textColor: {
    color: 'rgba(255, 255, 255, 0.8)',
    textShadow: 'none'
  }
};

<div style={wizardStyles.textColor}>
  {stepGuides[currentStep]}
</div>
```

#### 方案 B：使用 !important（不推荐）
```css
.wizard-text-white {
  color: rgba(255, 255, 255, 0.8) !important;
}
```
