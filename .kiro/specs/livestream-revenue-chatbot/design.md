# Design Document

## Overview

直播收益分配聊天机器人主页面是一个基于Lynx.js框架的React组件，提供直观的聊天界面来展示直播记录、收益分配详情，并支持用户通过自然语言询问相关问题。设计遵循现有ReportsPage的视觉风格和交互模式，确保用户体验的一致性。

## Architecture

### 组件层次结构

```
LivestreamChatbotPage
├── ChatbotHeader (顶部导航栏)
├── ChatbotContent (主内容区域)
│   ├── LivestreamRecords (直播记录展示区)
│   │   ├── RecordCard (单条直播记录卡片)
│   │   └── RevenueDetails (收益分配详情展开面板)
│   └── ChatInterface (聊天交互区域)
│       ├── MessageList (消息列表)
│       │   ├── UserMessage (用户消息气泡)
│       │   ├── BotMessage (机器人消息气泡)
│       │   └── ThinkingIndicator (思考状态指示器)
│       └── ChatInput (消息输入框)
```

### 技术栈

- **框架**: Lynx.js React (@lynx-js/react)
- **样式**: CSS Modules (继承ReportsPage.css的设计系统)
- **状态管理**: React Hooks (useState, useEffect)
- **API服务**: 扩展现有aiService.ts
- **图标系统**: 复用现有Icon组件

## Components and Interfaces

### 1. LivestreamChatbotPage (主组件)

```typescript
interface LivestreamChatbotPageProps {
  onBack?: () => void;
}

interface LivestreamRecord {
  id: string;
  title: string;
  date: string;
  duration: string; // 格式: "2h 30m"
  totalRevenue: number;
  status: "completed" | "live" | "scheduled";
  thumbnail?: string;
}

interface RevenueDistribution {
  recordId: string;
  distributions: {
    party: string; // 参与方名称 (如: "主播", "平台", "合作方")
    percentage: number;
    amount: number;
    reason: string;
  }[];
  calculationBasis: string;
}

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  relatedRecordId?: string; // 关联的直播记录ID
}
```

### 2. LivestreamRecords (直播记录展示组件)

```typescript
interface LivestreamRecordsProps {
  records: LivestreamRecord[];
  expandedRecordId: string | null;
  onRecordClick: (recordId: string) => void;
  onRecordCollapse: () => void;
}
```

**功能特性:**

- 展示最近3-5条直播记录
- 支持点击展开/收起收益分配详情
- 响应式卡片布局
- 状态指示器(完成/直播中/已安排)

### 3. RevenueDetails (收益分配详情组件)

```typescript
interface RevenueDetailsProps {
  distribution: RevenueDistribution;
  isVisible: boolean;
  onClose: () => void;
}
```

**功能特性:**

- 饼图或条形图可视化展示
- 分配比例和金额详情
- 分配理由说明
- 计算依据展示
- 平滑的展开/收起动画

### 4. ChatInterface (聊天交互组件)

```typescript
interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isThinking: boolean;
}
```

**功能特性:**

- 消息列表自动滚动
- 用户/机器人消息气泡区分
- 思考状态指示器
- 多行输入支持
- Enter发送，Shift+Enter换行

### 5. ChatInput (消息输入组件)

```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}
```

**功能特性:**

- 自适应高度的文本域
- 发送按钮状态管理
- 键盘快捷键支持
- 输入验证

## Data Models

### 直播记录数据模型

```typescript
// 扩展现有的数据结构
interface LivestreamRecord {
  id: string;
  title: string;
  date: string; // ISO 8601格式
  duration: string;
  totalRevenue: number;
  status: "completed" | "live" | "scheduled";
  thumbnail?: string;
  viewerCount?: number;
  peakViewers?: number;
}

interface RevenueDistribution {
  recordId: string;
  totalAmount: number;
  currency: string; // 默认 "CNY"
  distributions: DistributionItem[];
  calculationBasis: string;
  calculatedAt: string; // ISO 8601格式
}

interface DistributionItem {
  party: string;
  percentage: number; // 0-100
  amount: number;
  reason: string;
  category: "streamer" | "platform" | "partner" | "other";
}
```

### 聊天消息数据模型

```typescript
interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  relatedRecordId?: string;
  metadata?: {
    confidence?: number; // AI回答的置信度
    sources?: string[]; // 引用的数据源
  };
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActiveAt: Date;
}
```

## Error Handling

### 1. 数据加载错误

```typescript
interface ErrorState {
  type: "network" | "data" | "ai" | "unknown";
  message: string;
  retryable: boolean;
}
```

**处理策略:**

- 网络错误: 显示重试按钮，支持自动重试
- 数据错误: 显示友好错误信息，提供刷新选项
- AI服务错误: 回退到预设回答，保持聊天体验
- 未知错误: 记录日志，显示通用错误信息

### 2. 用户输入验证

- 空消息拦截
- 消息长度限制(最大1000字符)
- 特殊字符过滤
- 频率限制(防止刷屏)

### 3. AI服务降级

```typescript
// 扩展现有aiService.ts
interface ChatbotAIService extends AISearchService {
  answerQuestion(
    question: string,
    context?: LivestreamRecord[],
  ): Promise<string>;
  explainRevenue(
    recordId: string,
    distribution: RevenueDistribution,
  ): Promise<string>;
}
```

**降级策略:**

- AI服务不可用时使用预设回答模板
- 关键词匹配提供基础问答
- 引导用户查看具体数据

## Testing Strategy

### 1. 单元测试

**组件测试:**

- LivestreamRecords: 记录展示和交互
- RevenueDetails: 数据可视化和动画
- ChatInterface: 消息发送和接收
- ChatInput: 输入验证和键盘事件

**服务测试:**

- ChatbotAIService: API调用和错误处理
- 数据验证函数: 输入输出验证
- 工具函数: 日期格式化、金额计算等

### 2. 集成测试

**用户流程测试:**

- 页面加载 → 直播记录展示
- 点击记录 → 收益详情展开
- 发送消息 → AI回答流程
- 错误场景 → 降级处理

**API集成测试:**

- 模拟AI服务响应
- 网络错误处理
- 数据格式验证

### 3. 视觉回归测试

**界面一致性:**

- 与ReportsPage的视觉对比
- 响应式布局测试
- 动画效果验证
- 主题色彩一致性

### 4. 性能测试

**渲染性能:**

- 大量消息列表滚动性能
- 图表渲染性能
- 内存使用监控

**用户体验:**

- 首屏加载时间
- 交互响应时间
- AI回答延迟

## Visual Design Specifications

### 1. 色彩系统 (继承ReportsPage.css)

```css
/* 主要颜色变量 */
--chatbot-bg: var(--rp-bg); /* #f9fafb */
--chatbot-panel: var(--rp-panel); /* #ffffff */
--chatbot-border: var(--rp-border); /* #e5e7eb */
--chatbot-text: var(--rp-text); /* #0f172a */
--chatbot-brand: var(--rp-brand); /* #10a37f */

/* 聊天特定颜色 */
--user-message-bg: var(--rp-brand);
--user-message-text: #ffffff;
--bot-message-bg: var(--rp-panel);
--bot-message-text: var(--rp-text);
--thinking-color: var(--rp-brand);
```

### 2. 布局规范

**页面布局:**

- 顶部导航: 高度64px，固定定位
- 直播记录区: 最大高度300px，可滚动
- 聊天区域: 剩余空间，最小高度400px
- 输入框: 高度自适应，最大120px

**间距系统:**

- 页面边距: 24px
- 组件间距: 20px
- 卡片内边距: 16px
- 消息气泡边距: 12px

### 3. 动画效果

**过渡动画:**

- 收益详情展开/收起: 300ms ease-in-out
- 消息出现: 200ms ease-out
- 思考指示器: 1.5s infinite ease-in-out
- 悬停效果: 150ms ease

**微交互:**

- 按钮点击反馈
- 输入框焦点状态
- 滚动指示器
- 加载状态动画

## Implementation Notes

### 1. 性能优化

- 使用React.memo优化组件重渲染
- 虚拟滚动处理大量消息
- 图片懒加载
- 防抖处理用户输入

### 2. 可访问性

- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度模式
- 焦点管理

### 3. 国际化准备

- 文本内容外部化
- 日期/时间本地化
- 数字格式化
- RTL布局支持预留

### 4. 移动端适配

- 触摸友好的交互区域
- 响应式布局
- 移动端键盘适配
- 手势支持
