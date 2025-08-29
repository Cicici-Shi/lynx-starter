# AI 搜索功能设置指南

## 概述

智能搜索框已经实现，目前使用模拟 AI 响应。要启用真实的 AI 功能，请按照以下步骤配置。

## 当前功能

✅ **已实现的功能：**

- 智能搜索框 UI（带星星图标的 AI 选项）
- 搜索类型切换（普通搜索、标题搜索、内容搜索、AI 智能搜索）
- AI 思考状态显示（转圈圈动画）
- 模拟 AI 响应（基于关键词匹配）
- 自定义数据验证（替代 Zod，兼容 Lynx 运行时）
- 结构化搜索结果应用到筛选器

## 配置真实 AI API

### 方案 1：使用 OpenAI API

1. **安装依赖**

   ```bash
   pnpm add ai @ai-sdk/openai
   ```

2. **获取 API Key**
   - 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
   - 创建新的 API Key

3. **配置 API Key**

   **重要：由于 Lynx 运行时不支持 `process.env`，我们使用本地配置文件：**

   编辑 `src/config/local.ts` 文件，填入你的 API Key：

   ```typescript
   export const LOCAL_CONFIG = {
     AI_API_KEY: "your_openai_api_key_here",
     AI_ENDPOINT: "https://api.openai.com/v1/chat/completions",
     AI_MODEL: "gpt-4o-mini",
   };
   ```

   **注意：** `src/config/local.ts` 文件已添加到 `.gitignore`，不会上传到 GitHub。

4. **更新 aiService.ts**
   取消注释 `src/services/aiService.ts` 中的真实 AI 调用代码：

   ```typescript
   // 在文件顶部添加导入
   import { generateText } from "ai";
   import { openai } from "@ai-sdk/openai";
   import { validateAISearchResult } from "../utils/validation";

   // 使用自定义验证替代 Zod Schema
   // 验证函数在 src/utils/validation.ts 中定义

   // 在 searchToFilters 方法中替换模拟调用
   const result = await generateObject({
     model: openai("gpt-4o-mini"),
     schema: AISearchResponseSchema,
     prompt: `你是一个智能搜索助手...`, // 使用现有的 prompt
   });

   return result.object;
   ```

### 方案 2：使用其他 AI 服务

如果你想使用其他 AI 服务（如 Claude、Gemini 等），可以：

1. 修改 `callAIAPI` 方法中的 endpoint 和认证方式
2. 调整请求格式以匹配目标 AI 服务的 API

### 方案 3：自定义 AI 后端

如果你有自己的 AI 后端服务：

1. 更新 `AI_CONFIG` 中的 `endpoint`
2. 修改 `callAIAPI` 方法以匹配你的 API 格式

## 测试 AI 功能

配置完成后，你可以测试以下查询：

- "找一下8月的销售报表"
- "查看已完成的用户分析"
- "显示进行中的分析报告"
- "本月的失败报表"

## 当前模拟响应规则

在没有配置真实 AI 的情况下，系统会根据以下关键词进行匹配：

**类型识别：**

- "销售" / "sales" → type: "sales"
- "用户" / "user" → type: "user"
- "分析" / "analytics" → type: "analytics"

**状态识别：**

- "完成" / "completed" → status: "completed"
- "进行中" / "pending" → status: "pending"
- "失败" / "failed" → status: "failed"

**日期识别：**

- "8月" / "august" → 2025年8月范围
- "本月" / "this month" → 当前月份范围

## 文件结构

```
src/
├── services/
│   └── aiService.ts          # AI 服务实现
├── pages/
│   └── ReportsPage.tsx       # 包含智能搜索框的主页面
└── components/
    └── SmartSearchBox        # 智能搜索框组件（在 ReportsPage.tsx 中）
```

## 注意事项

1. **API 费用**：使用真实 AI API 会产生费用，请注意用量控制
2. **错误处理**：AI API 调用失败时会自动回退到模拟响应
3. **性能**：AI 调用有网络延迟，已添加加载状态指示
4. **安全**：不要在前端代码中硬编码 API Key，使用环境变量
5. **Lynx 兼容性**：Lynx 运行时环境不支持 Node.js 的 `process.env`，因此使用 `src/config/local.ts` 文件进行配置管理
6. **依赖兼容性**：Lynx 运行时环境不支持 BigInt，避免使用依赖 BigInt 的库（如 Zod）

## 扩展功能

未来可以考虑添加：

- 更复杂的自然语言理解
- 多语言支持
- 搜索历史记录
- 智能建议
- 语音输入支持
