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

1. **获取 API Key**
   - 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
   - 创建新的 API Key

2. **配置 API Key**

   **重要：由于 Lynx 运行时不支持 `process.env`，我们使用本地配置文件：**

   编辑 `src/config/local.ts` 文件，填入你的 API Key：

   ```typescript
   export const LOCAL_CONFIG = {
     AI_API_KEY: "sk-your-actual-openai-api-key-here",
     AI_ENDPOINT: "https://api.openai.com/v1/chat/completions",
     AI_MODEL: "gpt-4o-mini",
   };
   ```

   **重要提示：**
   - 将 `your-openai-api-key-here` 替换为你的真实 OpenAI API Key
   - API Key 格式：`sk-` 开头的字符串
   - 确保 `AI_ENDPOINT` 使用正确的 OpenAI API 地址
   - `src/config/local.ts` 文件已添加到 `.gitignore`，不会上传到 GitHub

   **获取 API Key 步骤：**
   1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
   2. 登录或注册账号
   3. 点击 "Create new secret key"
   4. 复制生成的 API Key（以 `sk-` 开头）
   5. 粘贴到 `local.ts` 文件中

3. **技术实现**
   `src/services/aiService.ts` 已经配置为使用原生 fetch API 直接调用 OpenAI：

   ```typescript
   // 使用原生 fetch API 调用 OpenAI（完全兼容 Lynx 运行时）
   const response = await fetch('https://api.openai.com/v1/chat/completions', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
     },
     body: JSON.stringify({
       model: AI_CONFIG.model || 'gpt-4o-mini',
       messages: [
         {
           role: 'system',
           content: `你是一个智能搜索助手...` // 详细的 prompt 已在代码中定义
         },
         {
           role: 'user',
           content: request.query
         }
       ],
       temperature: 0.1,
       max_tokens: 500
     })
   });

   // 解析 JSON 结果并使用手动验证
   const aiResponse = data.choices[0]?.message?.content;
   const jsonResult = JSON.parse(aiResponse);
   const validatedResult = validateAISearchResult(jsonResult);
   return validatedResult;
   ```

   **优势：**
   - 使用原生 fetch API，无需额外依赖
   - 完全兼容 Lynx 运行时环境
   - 自动处理 API 调用和错误回退
   - 结构化输出通过详细的 prompt 和手动验证实现

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

## 技术方案说明

### 为什么选择原生 fetch API + 手动验证？

1. **完全兼容**：Lynx 运行时不支持 Web Streams API，但支持标准的 fetch API
2. **零依赖**：无需额外的 AI SDK 依赖，减少包大小和兼容性问题
3. **结构化输出**：通过详细的 prompt 指导 AI 生成 JSON 格式的结构化数据
4. **验证保障**：使用自定义验证函数确保数据格式正确

### 工作流程

1. 用户输入自然语言查询（如"本月失败的数量"）
2. 原生 fetch API 调用 OpenAI，生成 JSON 格式的结构化响应
3. 解析 JSON 结果
4. 使用 `validateAISearchResult` 验证数据格式
5. 将验证后的结果应用到筛选器

## 注意事项

1. **API 费用**：使用真实 AI API 会产生费用，请注意用量控制
2. **错误处理**：AI API 调用失败时会自动回退到模拟响应
3. **性能**：AI 调用有网络延迟，已添加加载状态指示
4. **安全**：不要在前端代码中硬编码 API Key，使用环境变量
5. **Lynx 兼容性**：Lynx 运行时环境不支持 Node.js 的 `process.env`，因此使用 `src/config/local.ts` 文件进行配置管理
6. **依赖兼容性**：Lynx 运行时环境不支持 Web Streams API，因此使用原生 fetch API 而非 Vercel AI SDK

## 故障排除

### 常见问题

**1. 404 错误**
- 检查 `AI_ENDPOINT` 是否正确设置为 `https://api.openai.com/v1/chat/completions`
- 确保 API Key 格式正确（以 `sk-` 开头）

**2. 401 未授权错误**
- 检查 API Key 是否正确
- 确保 API Key 有足够的余额和权限

**3. 使用模拟响应**
- 如果看到"使用模拟 AI 响应"的日志，说明 API Key 未正确配置
- 检查 `src/config/local.ts` 文件中的配置

**4. 网络连接问题**
- 确保网络连接正常
- 某些网络环境可能需要代理
- 系统会自动测试网络连接，失败时回退到模拟响应

### 调试信息

在浏览器控制台中，您会看到以下调试信息：
- 当前配置状态
- 网络连接测试结果
- 使用的 fetch 函数类型（lynx.fetch 或原生 fetch）
- API 调用详情
- 错误信息和回退机制

### 网络连接测试

系统会自动测试网络连接：
1. 首先测试 `https://httpbin.org/get` 确保基本网络连接正常
2. 如果网络测试失败，自动回退到模拟响应
3. 如果网络测试成功，继续调用 OpenAI API

## 扩展功能

未来可以考虑添加：

- 更复杂的自然语言理解
- 多语言支持
- 搜索历史记录
- 智能建议
- 语音输入支持
