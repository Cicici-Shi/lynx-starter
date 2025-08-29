// AI 服务配置和接口
// 这里是 AI API 调用的占位符实现

import { LOCAL_CONFIG } from '../config/local.js';

export interface AISearchRequest {
    query: string;
    context?: string;
}

export interface AISearchResponse {
    searchTerm?: string;
    dateRange?: {
        start: string;
        end: string;
    };
    status?: 'completed' | 'pending' | 'failed';
    type?: 'sales' | 'analytics' | 'user';
    confidence?: number;
}

// 注意：这是一个占位符实现
// 实际使用时需要：
// 1. 安装 AI SDK: pnpm add ai @ai-sdk/openai
// 2. 配置环境变量 OPENAI_API_KEY
// 3. 取消注释下面的真实实现代码

// AI 服务配置
export const AI_CONFIG = {
    // 从本地配置文件读取，避免在 Lynx 环境中使用 process.env
    apiKey: LOCAL_CONFIG.AI_API_KEY,
    endpoint: LOCAL_CONFIG.AI_ENDPOINT,
    model: LOCAL_CONFIG.AI_MODEL,
};

// AI 搜索服务类
export class AISearchService {
    // 将自然语言查询转换为结构化搜索参数
    async searchToFilters(request: AISearchRequest): Promise<AISearchResponse> {
        try {
            console.log('AI 搜索请求:', request);

            // 模拟 API 延迟
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // 目前使用模拟响应
            // 实际部署时，取消注释下面的真实 API 调用代码
            return this.simulateAIResponse(request.query);

            // 真实 AI API 调用的代码（占位符）
            // const aiResponse = await this.callAIAPI(request.query);
            // return JSON.parse(aiResponse);
        } catch (error) {
            console.error('AI 搜索失败:', error);
            throw new Error('AI 搜索服务暂时不可用');
        }
    }

    // 模拟 AI 响应的函数（实际使用时会被真实的 AI API 替换）
    private simulateAIResponse(query: string): AISearchResponse {
        const lowerQuery = query.toLowerCase();

        const result: AISearchResponse = {
            confidence: 0.8,
        };

        // 简单的关键词匹配逻辑
        if (lowerQuery.includes('销售') || lowerQuery.includes('sales')) {
            result.type = 'sales';
        }
        if (lowerQuery.includes('用户') || lowerQuery.includes('user')) {
            result.type = 'user';
        }
        if (lowerQuery.includes('分析') || lowerQuery.includes('analytics')) {
            result.type = 'analytics';
        }

        if (lowerQuery.includes('完成') || lowerQuery.includes('completed')) {
            result.status = 'completed';
        }
        if (lowerQuery.includes('进行中') || lowerQuery.includes('pending')) {
            result.status = 'pending';
        }
        if (lowerQuery.includes('失败') || lowerQuery.includes('failed')) {
            result.status = 'failed';
        }

        if (lowerQuery.includes('8月') || lowerQuery.includes('august')) {
            result.dateRange = {
                start: '2025-08-01',
                end: '2025-08-31',
            };
        }

        if (lowerQuery.includes('本月') || lowerQuery.includes('this month')) {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const lastDay = new Date(year, month, 0).getDate();

            result.dateRange = {
                start: `${year}-${month.toString().padStart(2, '0')}-01`,
                end: `${year}-${month.toString().padStart(2, '0')}-${lastDay}`,
            };
        }

        // 提取可能的搜索词
        const searchTerms = query
            .replace(/(销售|用户|分析|完成|进行中|失败|8月|本月)/g, '')
            .trim();
        if (searchTerms) {
            result.searchTerm = searchTerms;
        }

        return result;
    }
}

// 导出默认实例
export const aiSearchService = new AISearchService();
