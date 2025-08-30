// AI 服务配置和接口
// 使用原生 fetch API 直接调用 OpenAI（完全兼容 Lynx 运行时）

import { LOCAL_CONFIG } from '../config/local.js';
import { validateAISearchResult } from '../utils/validation.js';

export interface AISearchRequest {
    query: string;
    context?: string;
}

export interface AISearchResponse {
    searchTerm?: string | null;
    dateRange?: {
        start: string;
        end: string;
    } | null;
    status?: 'completed' | 'pending' | 'failed' | null;
    type?: 'sales' | 'analytics' | 'user' | null;
    confidence?: number;
}

// AI 服务配置
export const AI_CONFIG = {
    apiKey: LOCAL_CONFIG.AI_API_KEY,
    endpoint: LOCAL_CONFIG.AI_ENDPOINT,
    model: LOCAL_CONFIG.AI_MODEL,
};

// AI 搜索服务类
export class AISearchService {
    // 测试网络连接的辅助函数
    private async testNetworkConnection(): Promise<boolean> {
        try {
            console.log('测试网络连接...');
            const json = await fetch(
                "https://jsonplaceholder.typicode.com/posts",
            ).then((res) => res.json());
            console.log('网络连接测试成功:', json);
            return true;
        } catch (error) {
            console.error('网络连接测试失败:', error);
            return false;
        }
    }

    // 将自然语言查询转换为结构化搜索参数
    async searchToFilters(request: AISearchRequest): Promise<AISearchResponse> {
        try {
            console.log('AI 搜索请求:', request);

            // 检查是否配置了 API Key
            if (!AI_CONFIG.apiKey || AI_CONFIG.apiKey === 'your-api-key-here' || AI_CONFIG.apiKey === 'your-openai-api-key-here') {
                console.log('使用模拟 AI 响应（未配置真实 API Key）');
                console.log('当前配置:', {
                    apiKey: AI_CONFIG.apiKey ? '已配置' : '未配置',
                    endpoint: AI_CONFIG.endpoint,
                    model: AI_CONFIG.model
                });
                return this.simulateAIResponse(request.query);
            }

            // 测试网络连接
            // const networkOk = await this.testNetworkConnection();
            // if (!networkOk) {
            //     console.log('网络连接测试失败，使用模拟响应');
            //     return this.simulateAIResponse(request.query);
            // }

            // 使用 lynx.fetch API 调用 OpenAI
            console.log('开始调用 OpenAI API:', {
                endpoint: AI_CONFIG.endpoint,
                model: AI_CONFIG.model,
                hasApiKey: AI_CONFIG.apiKey
            });

            const response = await fetch(`${AI_CONFIG.endpoint}`, {
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
                            content: `你是一个智能筛选助手。用户会用自然语言表达筛选意图，你必须把它转化为标准的 JSON 筛选对象。

当前时间信息：
- 当前日期：${new Date().toISOString().split('T')[0]} (${new Date().toLocaleDateString('zh-CN', { weekday: 'long' })})

JSON 格式：
{
  "searchTerm": string | null,
  "dateRange": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" } | null,
  "status": "completed" | "pending" | "failed" | null,
  "type": "sales" | "analytics" | "user" | null
}

语义理解规则：
**状态 (status)**：
- 任何表示"完成、成功、已完成、完结、done、success、succeed"的词汇 → "completed"
- 任何表示"进行中、处理中、等待、pending、processing"的词汇 → "pending"  
- 任何表示"失败、错误、异常、failed、error"的词汇 → "failed"

**类型 (type)**：
- 任何表示"销售、售卖、营收、sales"的词汇 → "sales"
- 任何表示"用户、客户、user"的词汇 → "user"
- 任何表示"分析、统计、数据、analytics"的词汇 → "analytics"

**日期范围 (dateRange)**：
- "本月"/"这个月" → 根据上面的当前时间信息计算当月1号到月末
- "本周"/"这周" → 根据当前时间计算本周一到当日
- 其他时间表达请根据当前时间合理推断为具体日期范围

**搜索词 (searchTerm)**：
- 提取用户输入中的关键词，去除状态、类型、时间相关的词汇
- 如果没有剩余关键词则设为 null

要求：
- 只返回有效的 JSON，不要多余文字
- 如果用户没提及某个字段，就设为 null（不是 undefined）
- 使用你的语义理解能力，不要死板匹配关键词
- 日期格式严格为 YYYY-MM-DD
- 绝对不要使用 undefined，必须使用 null 或省略字段

正确示例：
用户："找一下成功的销售报表" 
→ {"searchTerm": null, "dateRange": null, "status": "completed", "type": "sales"}

用户："8月份失败的用户数据"
→ {"searchTerm": "数据", "dateRange": {"start": "2025-08-01", "end": "2025-08-31"}, "status": "failed", "type": "user"}

用户："succeed"
→ {"searchTerm": "succeed", "dateRange": null, "status": "completed", "type": null}

错误示例（绝对不要这样）：
❌ {"dateRange": undefined, "status": "completed"}
✅ {"dateRange": null, "status": "completed"}`
                        },
                        {
                            role: 'user',
                            content: request.query
                        }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.1, // 低温度确保输出一致性
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                console.error('API 响应错误:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });
                throw new Error(`OpenAI API 调用失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API 响应数据:', data);
            const aiResponse = data.choices[0]?.message?.content;

            if (!aiResponse) {
                throw new Error('AI 响应为空');
            }

            console.log('AI 生成的文本结果:', aiResponse);

            // 尝试解析 JSON 结果
            try {
                // 先清理可能的 undefined 值（防止 AI 返回无效 JSON）
                const cleanedResponse = aiResponse
                    .replace(/:\s*undefined/g, ': null')
                    .replace(/,\s*undefined/g, ', null');

                console.log('清理后的 AI 响应:', cleanedResponse);

                const jsonResult = JSON.parse(cleanedResponse);
                // 使用手动验证函数验证结果
                const validatedResult = validateAISearchResult(jsonResult);
                console.log('验证成功的 AI 结果:', validatedResult);
                return validatedResult;
            } catch (parseError) {
                console.error('JSON 解析失败:', parseError);
                console.error('原始 AI 响应:', aiResponse);
                console.log('回退到模拟 AI 响应');
                return this.simulateAIResponse(request.query);
            }

        } catch (error) {
            console.error('AI 搜索失败:', error);
            // 如果 AI 调用失败，回退到模拟响应
            console.log('回退到模拟 AI 响应');
            return this.simulateAIResponse(request.query);
        }
    }

    // 模拟 AI 响应的函数（作为回退方案）
    private simulateAIResponse(query: string): AISearchResponse {
        const lowerQuery = query.toLowerCase();

        const result: AISearchResponse = {};

        // 使用更智能的语义匹配（模拟 AI 的语义理解）
        // 状态检测
        if (/完成|成功|已完成|完结|done|success|succeed/i.test(query)) {
            result.status = 'completed';
        } else if (/进行中|处理中|等待|pending|processing/i.test(query)) {
            result.status = 'pending';
        } else if (/失败|错误|异常|failed|error/i.test(query)) {
            result.status = 'failed';
        }

        // 类型检测
        if (/销售|售卖|营收|sales/i.test(query)) {
            result.type = 'sales';
        } else if (/用户|客户|user/i.test(query)) {
            result.type = 'user';
        } else if (/分析|统计|数据|analytics/i.test(query)) {
            result.type = 'analytics';
        }

        // 日期范围检测
        if (/8月|八月|august/i.test(query)) {
            const currentYear = new Date().getFullYear();
            result.dateRange = {
                start: `${currentYear}-08-01`,
                end: `${currentYear}-08-31`,
            };
        } else if (/本月|这个月|this month/i.test(query)) {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const lastDay = new Date(year, month, 0).getDate();

            result.dateRange = {
                start: `${year}-${month.toString().padStart(2, '0')}-01`,
                end: `${year}-${month.toString().padStart(2, '0')}-${lastDay}`,
            };
        } else if (/上月|上个月|last month/i.test(query)) {
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const year = lastMonth.getFullYear();
            const month = lastMonth.getMonth() + 1;
            const lastDay = new Date(year, month, 0).getDate();

            result.dateRange = {
                start: `${year}-${month.toString().padStart(2, '0')}-01`,
                end: `${year}-${month.toString().padStart(2, '0')}-${lastDay}`,
            };
        } else if (/本周|这周|this week/i.test(query)) {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            result.dateRange = {
                start: monday.toISOString().split('T')[0],
                end: sunday.toISOString().split('T')[0],
            };
        }

        // 提取搜索词（去除状态、类型、时间相关词汇）
        const cleanedQuery = query
            .replace(/(完成|成功|已完成|完结|进行中|处理中|等待|失败|错误|异常)/g, '')
            .replace(/(销售|售卖|营收|用户|客户|分析|统计|数据)/g, '')
            .replace(/(8月|八月|本月|这个月|上月|上个月|本周|这周)/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (cleanedQuery) {
            result.searchTerm = cleanedQuery;
        }

        return result;
    }
}

// 导出默认实例
export const aiSearchService = new AISearchService();
