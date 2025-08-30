// AI 服务配置和接口
// 使用原生 fetch API 直接调用 OpenAI（完全兼容 Lynx 运行时）

import { LOCAL_CONFIG } from '../config/local.js';
import type {
    LivestreamRecord,
    RevenueDistribution,
    MessageSegment,
    ToolCall,
} from '../types/chatbot.js';
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
    weekend?: 'weekend' | 'weekday' | null;
    duration?: 'short' | 'medium' | 'long' | null;
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
                'https://jsonplaceholder.typicode.com/posts',
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
            if (
                !AI_CONFIG.apiKey ||
                AI_CONFIG.apiKey === 'your-api-key-here' ||
                AI_CONFIG.apiKey === 'your-openai-api-key-here'
            ) {
                console.log('使用模拟 AI 响应（未配置真实 API Key）');
                console.log('当前配置:', {
                    apiKey: AI_CONFIG.apiKey ? '已配置' : '未配置',
                    endpoint: AI_CONFIG.endpoint,
                    model: AI_CONFIG.model,
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
                hasApiKey: AI_CONFIG.apiKey,
            });

            const response = await fetch(`${AI_CONFIG.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${AI_CONFIG.apiKey}`,
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
  "weekend": "weekend" | "weekday" | null,
  "duration": "short" | "medium" | "long" | null
}

语义理解规则：
**周末筛选 (weekend)**：
- 任何表示"周末、周六、周日、weekend、saturday、sunday"的词汇 → "weekend"
- 任何表示"工作日、周一到周五、weekday、weekdays、monday to friday"的词汇 → "weekday"

**持续时间筛选 (duration)**：
- 任何表示"短时间、短直播、short、brief、quick"的词汇 → "short"
- 任何表示"中等、中等时长、medium、moderate"的词汇 → "medium"  
- 任何表示"长时间、长直播、long、extended、marathon"的词汇 → "long"

**日期范围 (dateRange)**：
- "本月"/"这个月" → 根据上面的当前时间信息计算当月1号到月末
- "本周"/"这周" → 根据当前时间计算本周一到当日
- 其他时间表达请根据当前时间合理推断为具体日期范围

**搜索词 (searchTerm)**：
- 提取用户输入中的关键词，去除周末、持续时间、时间相关的词汇
- 如果没有剩余关键词则设为 null

要求：
- 只返回有效的 JSON，不要多余文字
- 如果用户没提及某个字段，就设为 null（不是 undefined）
- 使用你的语义理解能力，不要死板匹配关键词
- 日期格式严格为 YYYY-MM-DD
- 绝对不要使用 undefined，必须使用 null 或省略字段

正确示例：
用户："找一下周末的直播" 
→ {"searchTerm": null, "dateRange": null, "weekend": "weekend", "duration": null}

用户："8月份短时间的直播"
→ {"searchTerm": null, "dateRange": {"start": "2025-08-01", "end": "2025-08-31"}, "weekend": null, "duration": "short"}

用户："工作日的长直播"
→ {"searchTerm": null, "dateRange": null, "weekend": "weekday", "duration": "long"}

用户："这周的中等时长直播"
→ {"searchTerm": null, "dateRange": {"start": "2025-01-13", "end": "2025-01-19"}, "weekend": null, "duration": "medium"}

错误示例（绝对不要这样）：
❌ {"dateRange": undefined, "status": "completed"}
✅ {"dateRange": null, "status": "completed"}`,
                        },
                        {
                            role: 'user',
                            content: request.query,
                        },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.1, // 低温度确保输出一致性
                    max_tokens: 500,
                }),
            });

            if (!response.ok) {
                console.error('API 响应错误:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                });
                throw new Error(
                    `OpenAI API 调用失败: ${response.status} ${response.statusText}`,
                );
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
        // 周末筛选检测
        if (/周末|周六|周日|weekend|saturday|sunday/i.test(query)) {
            result.weekend = 'weekend';
        } else if (/工作日|周一到周五|weekday|weekdays|monday to friday/i.test(query)) {
            result.weekend = 'weekday';
        }

        // 持续时间筛选检测
        if (/短时间|短直播|short|brief|quick/i.test(query)) {
            result.duration = 'short';
        } else if (/中等|中等时长|medium|moderate/i.test(query)) {
            result.duration = 'medium';
        } else if (/长时间|长直播|long|extended|marathon/i.test(query)) {
            result.duration = 'long';
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

        // 提取搜索词（去除周末、持续时间、时间相关词汇）
        const cleanedQuery = query
            .replace(/(周末|周六|周日|工作日|周一到周五)/g, '')
            .replace(/(短时间|短直播|中等|中等时长|长时间|长直播)/g, '')
            .replace(/(8月|八月|本月|这个月|上月|上个月|本周|这周)/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (cleanedQuery) {
            result.searchTerm = cleanedQuery;
        }

        return result;
    }
}

// 聊天机器人AI服务类
export class ChatbotAIService extends AISearchService {
    // 预设回答模板作为降级方案
    private readonly fallbackResponses = {
        greeting: [
            '您好！我是直播收益分配助手，可以帮您解答收益分配相关的问题。',
            '欢迎使用直播收益分配聊天机器人！有什么可以帮助您的吗？',
            '您好！我可以为您解释直播收益分配规则和数据，请随时提问。',
        ],
        revenueExplanation: [
            '收益分配通常基于平台政策、主播等级、合作协议等因素进行计算。',
            '直播收益会根据既定规则在主播、平台和合作方之间进行分配。',
            '收益分配比例会根据具体的合作条款和平台政策来确定。',
        ],
        dataQuery: [
            '您可以点击上方的直播记录查看具体的收益分配详情。',
            '每条直播记录都包含详细的收益分配信息，请点击查看。',
            '具体的数据信息可以在直播记录的详情中找到。',
        ],
        unknown: [
            '抱歉，我没有完全理解您的问题。您可以询问关于收益分配规则或具体直播数据的问题。',
            '我主要负责解答收益分配相关的问题，请尝试重新描述您的问题。',
            '请问您想了解哪方面的收益分配信息？我可以为您详细解释。',
        ],
        outOfScope: [
            '很抱歉，这个问题超出了我的专业范围。我主要负责解答直播收益分配相关的问题。',
            '我专注于直播收益分配领域，建议您咨询相关专业人员获取更准确的信息。',
            '这个问题可能需要专业人士来回答，我主要帮助解释收益分配相关内容。',
        ],
    };

    /**
     * 处理用户问题并生成回答
     * @param question 用户提出的问题
     * @param context 可选的直播记录上下文
     * @returns Promise<string> AI生成的回答
     */
    async answerQuestion(
        question: string,
        context?: LivestreamRecord[],
    ): Promise<string> {
        try {
            console.log('处理用户问题:', question);
            console.log('上下文记录数量:', context?.length || 0);

            // 检查是否配置了 API Key
            if (
                !AI_CONFIG.apiKey ||
                AI_CONFIG.apiKey === 'your-api-key-here' ||
                AI_CONFIG.apiKey === 'your-openai-api-key-here'
            ) {
                console.log('使用预设回答模板（未配置真实 API Key）');
                return this.getFallbackAnswer(question);
            }

            // 构建系统提示词
            const systemPrompt = this.buildSystemPrompt(context);

            // 调用 OpenAI API
            const response = await fetch(`${AI_CONFIG.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${AI_CONFIG.apiKey}`,
                },
                body: JSON.stringify({
                    model: AI_CONFIG.model || 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt,
                        },
                        {
                            role: 'user',
                            content: question,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 800,
                }),
            });

            if (!response || !response.ok) {
                console.error('AI API 调用失败:', response?.status || 'unknown', response?.statusText || 'unknown');
                return this.getFallbackAnswer(question);
            }

            const data = await response.json();
            const aiResponse = data?.choices?.[0]?.message?.content;

            if (!aiResponse) {
                console.error('AI 响应为空');
                return this.getFallbackAnswer(question);
            }

            console.log('AI 回答生成成功');
            return aiResponse.trim();
        } catch (error) {
            console.error('回答问题时发生错误:', error);
            return this.getFallbackAnswer(question);
        }
    }

    /**
     * 解释特定直播的收益分配
     * @param recordId 直播记录ID
     * @param distribution 收益分配数据
     * @returns Promise<string> 收益分配的详细解释
     */
    async explainRevenue(
        recordId: string,
        distribution: RevenueDistribution,
    ): Promise<string> {
        try {
            console.log('解释收益分配:', recordId);

            // 检查是否配置了 API Key
            if (
                !AI_CONFIG.apiKey ||
                AI_CONFIG.apiKey === 'your-api-key-here' ||
                AI_CONFIG.apiKey === 'your-openai-api-key-here'
            ) {
                console.log('使用预设收益解释模板（未配置真实 API Key）');
                return this.getFallbackRevenueExplanation(distribution);
            }

            // 构建收益分配解释的系统提示词
            const systemPrompt = `你是一个专业的直播收益分配解释助手。请根据提供的收益分配数据，用通俗易懂的语言解释收益是如何分配的。

要求：
1. 解释要清晰、准确、易懂
2. 包含各参与方的分配比例和原因
3. 解释计算依据
4. 语气要友好、专业
5. 回答长度控制在200-400字之间
6. 使用中文回答

请基于以下数据进行解释：
总收益：${distribution.totalAmount} ${distribution.currency}
计算依据：${distribution.calculationBasis}
分配详情：
${distribution.distributions
                    .map(
                        (item) =>
                            `- ${item.party}: ${item.percentage}% (${item.amount} ${distribution.currency}) - ${item.reason}`,
                    )
                    .join('\n')}`;

            const response = await fetch(`${AI_CONFIG.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${AI_CONFIG.apiKey}`,
                },
                body: JSON.stringify({
                    model: AI_CONFIG.model || 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt,
                        },
                        {
                            role: 'user',
                            content: '请解释这次直播的收益分配情况。',
                        },
                    ],
                    temperature: 0.5,
                    max_tokens: 600,
                }),
            });

            if (!response || !response.ok) {
                console.error('AI API 调用失败:', response?.status || 'unknown', response?.statusText || 'unknown');
                return this.getFallbackRevenueExplanation(distribution);
            }

            const data = await response.json();
            const aiResponse = data?.choices?.[0]?.message?.content;

            if (!aiResponse) {
                console.error('AI 响应为空');
                return this.getFallbackRevenueExplanation(distribution);
            }

            console.log('收益分配解释生成成功');
            return aiResponse.trim();
        } catch (error) {
            console.error('解释收益分配时发生错误:', error);
            return this.getFallbackRevenueExplanation(distribution);
        }
    }

    /**
     * 构建系统提示词
     * @param context 直播记录上下文
     * @returns 系统提示词字符串
     */
    private buildSystemPrompt(context?: LivestreamRecord[]): string {
        let prompt = `你是一个专业的直播收益分配助手。你的主要职责是：

1. 解答用户关于直播收益分配的问题
2. 解释收益分配规则和计算方法
3. 帮助用户理解直播数据和收益情况
4. 提供友好、准确、专业的回答

回答要求：
- 使用中文回答
- 语气友好、专业
- 回答要准确、清晰
- 如果不确定，诚实说明并建议查看具体数据
- 回答长度适中，通常100-300字
- 避免过于技术性的术语，用通俗易懂的语言

如果用户询问超出直播收益分配范围的问题，请礼貌地引导回到相关话题。`;

        if (context && context.length > 0) {
            prompt += `\n\n当前可用的直播记录数据：\n`;
            context.forEach((record) => {
                prompt += `- ${record.title} (${record.date}): 收益 ${record.totalRevenue} 元，时长 ${record.duration}，状态 ${record.status}\n`;
            });
            prompt += `\n你可以引用这些数据来回答用户的问题。`;
        }

        return prompt;
    }

    /**
     * 获取预设回答（降级方案）
     * @param question 用户问题
     * @returns 预设回答
     */
    private getFallbackAnswer(question: string): string {
        const lowerQuestion = question.toLowerCase();

        // 问候语检测
        if (/你好|hello|hi|您好|欢迎/.test(lowerQuestion)) {
            return this.getRandomResponse(this.fallbackResponses.greeting);
        }

        // 收益分配相关问题
        if (/收益|分配|比例|计算|规则/.test(lowerQuestion)) {
            return this.getRandomResponse(this.fallbackResponses.revenueExplanation);
        }

        // 数据查询相关问题
        if (/数据|记录|详情|信息|查看/.test(lowerQuestion)) {
            return this.getRandomResponse(this.fallbackResponses.dataQuery);
        }

        // 超出范围的问题
        if (/天气|新闻|股票|其他/.test(lowerQuestion)) {
            return this.getRandomResponse(this.fallbackResponses.outOfScope);
        }

        // 默认未知问题回答
        return this.getRandomResponse(this.fallbackResponses.unknown);
    }

    /**
     * 获取预设收益分配解释（降级方案）
     * @param distribution 收益分配数据
     * @returns 预设解释
     */
    private getFallbackRevenueExplanation(
        distribution: RevenueDistribution,
    ): string {
        const totalAmount = distribution.totalAmount;
        const currency = distribution.currency;

        let explanation = `本次直播总收益为 ${totalAmount} ${currency}，分配情况如下：\n\n`;

        distribution.distributions.forEach((item) => {
            explanation += `• ${item.party}：${item.percentage}% (${item.amount} ${currency})\n  ${item.reason}\n\n`;
        });

        explanation += `分配依据：${distribution.calculationBasis}`;

        return explanation;
    }

    /**
     * 从预设回答数组中随机选择一个
     * @param responses 回答数组
     * @returns 随机选择的回答
     */
    private getRandomResponse(responses: string[]): string {
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }

    /**
     * 生成流式响应，模拟AI的思考过程
     * @param question 用户提出的问题
     * @param context 可选的直播记录上下文
     * @param onSegmentUpdate 段落更新回调函数
     * @returns Promise<MessageSegment[]> 完整的消息段落数组
     */
    async answerQuestionStreaming(
        question: string,
        context?: LivestreamRecord[],
        onSegmentUpdate?: (segment: MessageSegment) => void,
    ): Promise<MessageSegment[]> {
        console.log('开始流式回答问题:', question);

        const segments: MessageSegment[] = [];

        try {
            // 第一段：理解问题
            const understandingSegment: MessageSegment = {
                id: `segment-${Date.now()}-understanding`,
                type: 'text',
                content: '正在分析您的问题...',
                completed: false,
            };
            segments.push(understandingSegment);
            onSegmentUpdate?.(understandingSegment);

            await this.delay(1000);

            understandingSegment.content = this.generateUnderstandingText(question);
            understandingSegment.completed = true;
            onSegmentUpdate?.(understandingSegment);

            // 第二段：工具调用 - 查询数据
            const dataQueryTool: ToolCall = {
                id: `tool-${Date.now()}-data-query`,
                name: 'queryLivestreamData',
                description: '查询相关直播记录和收益数据',
                params: { question, recordCount: context?.length || 0 },
                status: 'pending',
                timestamp: new Date(),
            };

            const dataQuerySegment: MessageSegment = {
                id: `segment-${Date.now()}-data-query`,
                type: 'tool',
                content: '正在查询相关数据...',
                toolCall: dataQueryTool,
                completed: false,
            };
            segments.push(dataQuerySegment);
            onSegmentUpdate?.(dataQuerySegment);

            await this.delay(1500);

            dataQueryTool.status = 'running';
            dataQuerySegment.content = '检索直播记录和收益分配数据...';
            onSegmentUpdate?.(dataQuerySegment);

            await this.delay(1000);

            dataQueryTool.status = 'completed';
            dataQueryTool.result = context?.slice(0, 3) || [];
            dataQuerySegment.content = `已找到 ${context?.length || 0} 条相关直播记录`;
            dataQuerySegment.completed = true;
            onSegmentUpdate?.(dataQuerySegment);

            // 第三段：分析思考
            const analysisSegment: MessageSegment = {
                id: `segment-${Date.now()}-analysis`,
                type: 'analysis',
                content: '正在分析数据并组织回答...',
                completed: false,
            };
            segments.push(analysisSegment);
            onSegmentUpdate?.(analysisSegment);

            await this.delay(2000);

            analysisSegment.content = this.generateAnalysisText(question, context);
            analysisSegment.completed = true;
            onSegmentUpdate?.(analysisSegment);

            // 第四段：工具调用 - AI回答生成
            const aiResponseTool: ToolCall = {
                id: `tool-${Date.now()}-ai-response`,
                name: 'generateAnswer',
                description: '基于分析结果生成专业回答',
                params: { analysisData: analysisSegment.content },
                status: 'pending',
                timestamp: new Date(),
            };

            const aiResponseSegment: MessageSegment = {
                id: `segment-${Date.now()}-ai-response`,
                type: 'tool',
                content: '正在生成回答...',
                toolCall: aiResponseTool,
                completed: false,
            };
            segments.push(aiResponseSegment);
            onSegmentUpdate?.(aiResponseSegment);

            await this.delay(1000);

            aiResponseTool.status = 'running';
            aiResponseSegment.content = '调用AI模型生成专业回答...';
            onSegmentUpdate?.(aiResponseSegment);

            // 尝试调用真实AI或使用预设回答
            let finalAnswer: string;
            try {
                if (AI_CONFIG.apiKey && AI_CONFIG.apiKey !== 'your-api-key-here') {
                    finalAnswer = await this.answerQuestion(question, context);
                } else {
                    finalAnswer = this.getFallbackAnswer(question);
                }
            } catch (error) {
                console.error('AI调用失败，使用预设回答:', error);
                finalAnswer = this.getFallbackAnswer(question);
            }

            await this.delay(1500);

            aiResponseTool.status = 'completed';
            aiResponseTool.result = { answer: finalAnswer };
            aiResponseSegment.content = 'AI回答生成完成';
            aiResponseSegment.completed = true;
            onSegmentUpdate?.(aiResponseSegment);

            // 第五段：最终结果
            const resultSegment: MessageSegment = {
                id: `segment-${Date.now()}-result`,
                type: 'result',
                content: finalAnswer,
                completed: true,
            };
            segments.push(resultSegment);
            onSegmentUpdate?.(resultSegment);

            console.log('流式回答完成，共生成', segments.length, '个段落');
            return segments;

        } catch (error) {
            console.error('流式回答过程中发生错误:', error);

            // 错误处理：返回一个错误段落
            const errorSegment: MessageSegment = {
                id: `segment-${Date.now()}-error`,
                type: 'result',
                content: '抱歉，回答过程中遇到了问题。' + this.getFallbackAnswer(question),
                completed: true,
            };
            segments.push(errorSegment);
            onSegmentUpdate?.(errorSegment);

            return segments;
        }
    }

    /**
     * 延迟函数，用于模拟处理时间
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 生成问题理解文本
     */
    private generateUnderstandingText(question: string): string {
        const lowerQuestion = question.toLowerCase();

        if (lowerQuestion.includes('收益') || lowerQuestion.includes('分配')) {
            return '我理解您想了解直播收益分配的相关信息。让我查询相关数据来为您详细解答。';
        } else if (lowerQuestion.includes('规则') || lowerQuestion.includes('计算')) {
            return '您询问的是关于收益分配规则和计算方法的问题。我需要获取相关的政策和数据信息。';
        } else if (lowerQuestion.includes('直播') || lowerQuestion.includes('记录')) {
            return '您想了解特定直播的情况。让我检索相关的直播记录和收益数据。';
        } else {
            return '我正在分析您的问题，并准备查找相关的收益分配信息来回答您。';
        }
    }

    /**
     * 生成分析思考文本
     */
    private generateAnalysisText(question: string, context?: LivestreamRecord[]): string {
        const recordCount = context?.length || 0;
        const lowerQuestion = question.toLowerCase();

        let analysis = `基于查询到的 ${recordCount} 条直播记录，我正在分析：\n\n`;

        if (lowerQuestion.includes('收益') || lowerQuestion.includes('分配')) {
            analysis += '• 收益分配的基本规则和比例\n';
            analysis += '• 不同参与方的分配标准\n';
            analysis += '• 具体直播的收益计算方式\n';
        }

        if (lowerQuestion.includes('规则') || lowerQuestion.includes('政策')) {
            analysis += '• 平台收益分配政策\n';
            analysis += '• 主播等级和分配比例的关系\n';
            analysis += '• 合作方分配的计算依据\n';
        }

        if (recordCount > 0) {
            analysis += `• 最近 ${Math.min(recordCount, 3)} 场直播的收益表现\n`;
            analysis += '• 收益分配的具体数据和趋势\n';
        }

        analysis += '\n正在综合这些信息为您准备详细的回答...';

        return analysis;
    }
}

// 导出默认实例
export const aiSearchService = new AISearchService();
export const chatbotAIService = new ChatbotAIService();
