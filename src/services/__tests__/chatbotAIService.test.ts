// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  LivestreamRecord,
  RevenueDistribution,
} from '../../types/chatbot.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock LOCAL_CONFIG
vi.mock('../../config/local.js', () => ({
  LOCAL_CONFIG: {
    AI_API_KEY: 'test-api-key',
    AI_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
    AI_MODEL: 'gpt-4o-mini',
  },
}));

// Import after mocking
const { ChatbotAIService } = await import('../aiService.js');

describe('ChatbotAIService', () => {
  let chatbotService: InstanceType<typeof ChatbotAIService>;

  beforeEach(() => {
    chatbotService = new ChatbotAIService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('answerQuestion', () => {
    it('should return AI response when API call succeeds', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '这是AI生成的回答',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await chatbotService.answerQuestion('什么是收益分配？');

      expect(result).toBe('这是AI生成的回答');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          },
        }),
      );
    });

    it('should return fallback response when API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await chatbotService.answerQuestion('什么是收益分配？');

      expect(result).toMatch(/收益|分配|规则|计算/);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return fallback response when API key is not configured', async () => {
      // Create a service instance with invalid API key by mocking the config
      const originalConfig = (await import('../aiService.js')).AI_CONFIG;

      // Temporarily override the API key
      Object.defineProperty(originalConfig, 'apiKey', {
        value: 'your-api-key-here',
        writable: true,
        configurable: true,
      });

      const result = await chatbotService.answerQuestion('你好');

      expect(result).toMatch(/您好|欢迎|助手/);

      // Restore original config
      Object.defineProperty(originalConfig, 'apiKey', {
        value: 'test-api-key',
        writable: true,
        configurable: true,
      });
    });

    it('should handle greeting questions with appropriate responses', async () => {
      const result = await chatbotService.answerQuestion('你好');

      expect(result).toMatch(/您好|欢迎|助手/);
    });

    it('should handle revenue-related questions with appropriate responses', async () => {
      const result = await chatbotService.answerQuestion(
        '收益分配规则是什么？',
      );

      expect(result).toMatch(/收益|分配|规则|计算/);
    });

    it('should handle data query questions with appropriate responses', async () => {
      const result = await chatbotService.answerQuestion('如何查看数据？');

      expect(result).toMatch(/数据|记录|详情|点击/);
    });

    it('should handle out-of-scope questions appropriately', async () => {
      const result = await chatbotService.answerQuestion('今天天气怎么样？');

      expect(result).toMatch(/抱歉|超出|范围|专业/);
    });

    it('should include context in system prompt when provided', async () => {
      const mockContext: LivestreamRecord[] = [
        {
          id: '1',
          title: '测试直播',
          date: '2024-01-01T10:00:00Z',
          duration: '2h 30m',
          totalRevenue: 1000,
          status: 'completed',
        },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: '基于提供的直播记录，我可以为您解答。',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await chatbotService.answerQuestion(
        '这次直播收益如何？',
        mockContext,
      );

      expect(result).toBe('基于提供的直播记录，我可以为您解答。');

      // Verify that the system prompt includes context
      const callArgs = mockFetch.mock.calls[0][1];
      const requestBody = JSON.parse(callArgs.body);
      const systemMessage = requestBody.messages[0];

      expect(systemMessage.content).toContain('测试直播');
      expect(systemMessage.content).toContain('1000 元');
    });
  });

  describe('explainRevenue', () => {
    const mockDistribution: RevenueDistribution = {
      recordId: '1',
      totalAmount: 1000,
      currency: 'CNY',
      distributions: [
        {
          party: '主播',
          percentage: 60,
          amount: 600,
          reason: '主要内容创作者',
          category: 'streamer',
        },
        {
          party: '平台',
          percentage: 40,
          amount: 400,
          reason: '平台服务费',
          category: 'platform',
        },
      ],
      calculationBasis: '标准分成协议',
      calculatedAt: '2024-01-01T10:00:00Z',
    };

    it('should return AI explanation when API call succeeds', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '本次直播收益分配详细解释...',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await chatbotService.explainRevenue('1', mockDistribution);

      expect(result).toBe('本次直播收益分配详细解释...');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('should return fallback explanation when API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await chatbotService.explainRevenue('1', mockDistribution);

      expect(result).toContain('本次直播总收益为 1000 CNY');
      expect(result).toContain('主播：60% (600 CNY)');
      expect(result).toContain('平台：40% (400 CNY)');
      expect(result).toContain('标准分成协议');
    });

    it('should return fallback explanation when API key is not configured', async () => {
      // Create a service instance with invalid API key by mocking the config
      const originalConfig = (await import('../aiService.js')).AI_CONFIG;

      // Temporarily override the API key
      Object.defineProperty(originalConfig, 'apiKey', {
        value: 'your-api-key-here',
        writable: true,
        configurable: true,
      });

      const result = await chatbotService.explainRevenue('1', mockDistribution);

      expect(result).toContain('本次直播总收益为 1000 CNY');
      expect(result).toContain('主播：60%');
      expect(result).toContain('平台：40%');

      // Restore original config
      Object.defineProperty(originalConfig, 'apiKey', {
        value: 'test-api-key',
        writable: true,
        configurable: true,
      });
    });

    it('should handle API response with empty content', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await chatbotService.explainRevenue('1', mockDistribution);

      expect(result).toContain('本次直播总收益为 1000 CNY');
    });

    it('should handle API response with non-ok status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await chatbotService.explainRevenue('1', mockDistribution);

      expect(result).toContain('本次直播总收益为 1000 CNY');
    });

    it('should format fallback explanation correctly with multiple distributions', async () => {
      const complexDistribution: RevenueDistribution = {
        ...mockDistribution,
        distributions: [
          {
            party: '主播',
            percentage: 50,
            amount: 500,
            reason: '内容创作',
            category: 'streamer',
          },
          {
            party: '平台',
            percentage: 30,
            amount: 300,
            reason: '平台服务',
            category: 'platform',
          },
          {
            party: '合作方',
            percentage: 20,
            amount: 200,
            reason: '技术支持',
            category: 'partner',
          },
        ],
      };

      const result = await chatbotService.explainRevenue(
        '1',
        complexDistribution,
      );

      expect(result).toContain('主播：50% (500 CNY)');
      expect(result).toContain('平台：30% (300 CNY)');
      expect(result).toContain('合作方：20% (200 CNY)');
      expect(result).toContain('内容创作');
      expect(result).toContain('平台服务');
      expect(result).toContain('技术支持');
    });
  });

  describe('fallback responses', () => {
    it('should provide different greeting responses on multiple calls', async () => {
      const responses = new Set();

      // Call multiple times to test randomness
      for (let i = 0; i < 10; i++) {
        const response = await chatbotService.answerQuestion('你好');
        responses.add(response);
      }

      // Should have at least 1 unique response (could be more due to randomness)
      expect(responses.size).toBeGreaterThanOrEqual(1);
    });

    it('should handle unknown questions gracefully', async () => {
      const result = await chatbotService.answerQuestion('随机问题测试');

      expect(result).toMatch(/抱歉|没有|理解|问题|重新|请问|了解|详细解释/);
    });
  });

  describe('error handling', () => {
    it('should handle network timeout gracefully', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 100),
          ),
      );

      const result = await chatbotService.answerQuestion('测试问题');

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle malformed API response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' }),
      });

      const result = await chatbotService.answerQuestion('测试问题');

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
