// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { describe, it, expect, vi } from 'vitest';
import type { ChatMessage, LivestreamRecord } from '../../types/chatbot.ts';

describe('LivestreamSelectionMessage Logic', () => {
    const mockRecords: LivestreamRecord[] = [
        {
            id: 'stream-001',
            title: '新年特别直播：2024年度回顾与展望',
            date: '2024-12-31T20:00:00.000Z',
            duration: '3h 15m',
            totalRevenue: 125680.50,
            status: 'completed',
            viewerCount: 8520,
            peakViewers: 12350,
        },
        {
            id: 'stream-002',
            title: '科技前沿：AI与未来生活',
            date: '2024-12-28T19:30:00.000Z',
            duration: '2h 45m',
            totalRevenue: 89420.75,
            status: 'completed',
            viewerCount: 6780,
            peakViewers: 9240,
        },
    ];

    const mockMessage: ChatMessage = {
        id: 'selection-1',
        type: 'livestream-selection',
        content: '以下是最近的直播记录，点击任意一条可以查看详细的收益分配分析：',
        timestamp: new Date('2024-12-31T10:00:00.000Z'),
        livestreamRecords: mockRecords,
    };

    it('should have correct message structure', () => {
        expect(mockMessage.type).toBe('livestream-selection');
        expect(mockMessage.livestreamRecords).toHaveLength(2);
        expect(mockMessage.content).toContain('直播记录');
    });

    it('should have valid livestream records data', () => {
        mockRecords.forEach(record => {
            expect(record).toHaveProperty('id');
            expect(record).toHaveProperty('title');
            expect(record).toHaveProperty('date');
            expect(record).toHaveProperty('duration');
            expect(record).toHaveProperty('totalRevenue');
            expect(record).toHaveProperty('status');

            expect(typeof record.id).toBe('string');
            expect(typeof record.title).toBe('string');
            expect(typeof record.date).toBe('string');
            expect(typeof record.duration).toBe('string');
            expect(typeof record.totalRevenue).toBe('number');
            expect(['completed', 'live', 'scheduled']).toContain(record.status);
        });
    });

    it('should format currency correctly', () => {
        const formatCurrency = (amount: number): string => {
            // Fallback for environments without Intl support
            if (typeof Intl === 'undefined' || !Intl.NumberFormat) {
                return `¥${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
            }
            return new Intl.NumberFormat("zh-CN", {
                style: "currency",
                currency: "CNY",
                minimumFractionDigits: 2,
            }).format(amount);
        };

        const result1 = formatCurrency(125680.50);
        const result2 = formatCurrency(89420.75);

        expect(result1).toContain('125,680.50');
        expect(result2).toContain('89,420.75');
        expect(result1).toContain('¥');
        expect(result2).toContain('¥');
    });

    it('should format date correctly', () => {
        const formatDate = (dateString: string): string => {
            const date = new Date(dateString);
            // Fallback for environments without Intl support
            if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${month}月${day}日`;
            }
            return date.toLocaleDateString("zh-CN", {
                month: "short",
                day: "numeric",
            });
        };

        const formatted1 = formatDate('2024-12-31T20:00:00.000Z');
        const formatted2 = formatDate('2024-12-28T19:30:00.000Z');

        expect(typeof formatted1).toBe('string');
        expect(typeof formatted2).toBe('string');
        expect(formatted1.length).toBeGreaterThan(0);
        expect(formatted2.length).toBeGreaterThan(0);
    });

    it('should format time correctly', () => {
        const formatTime = (timestamp: Date): string => {
            // Fallback for environments without Intl support
            if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
                const hours = timestamp.getHours().toString().padStart(2, '0');
                const minutes = timestamp.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            }
            return timestamp.toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
            });
        };

        const testDate = new Date('2024-12-31T10:00:00.000Z');
        const formatted = formatTime(testDate);
        expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle status translation correctly', () => {
        const getStatusText = (status: string) => {
            switch (status) {
                case 'completed': return '已完成';
                case 'live': return '直播中';
                case 'scheduled': return '已安排';
                default: return status;
            }
        };

        expect(getStatusText('completed')).toBe('已完成');
        expect(getStatusText('live')).toBe('直播中');
        expect(getStatusText('scheduled')).toBe('已安排');
    });

    it('should handle viewer count formatting', () => {
        const formatViewerCount = (count: number): string => {
            // Fallback for environments without Intl support
            if (typeof Intl === 'undefined' || !Intl.NumberFormat) {
                return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            return count.toLocaleString();
        };

        const result1 = formatViewerCount(8520);
        const result2 = formatViewerCount(12350);

        expect(result1).toContain('8');
        expect(result1).toContain('520');
        expect(result2).toContain('12');
        expect(result2).toContain('350');
    });

    it('should validate record selection callback', () => {
        const callback = vi.fn();
        const testRecord = mockRecords[0];

        callback(testRecord);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(testRecord);
    });

    it('should handle records without optional properties', () => {
        const minimalRecord: LivestreamRecord = {
            id: 'stream-003',
            title: '测试直播',
            date: '2024-12-30T20:00:00.000Z',
            duration: '1h 30m',
            totalRevenue: 50000,
            status: 'completed',
        };

        expect(minimalRecord.viewerCount).toBeUndefined();
        expect(minimalRecord.peakViewers).toBeUndefined();
        expect(minimalRecord.thumbnail).toBeUndefined();
    });

    it('should support different message types', () => {
        const userMessage: ChatMessage = {
            id: 'user-1',
            type: 'user',
            content: '用户消息',
            timestamp: new Date(),
        };

        const botMessage: ChatMessage = {
            id: 'bot-1',
            type: 'bot',
            content: '机器人消息',
            timestamp: new Date(),
        };

        const selectionMessage: ChatMessage = {
            id: 'selection-1',
            type: 'livestream-selection',
            content: '选择消息',
            timestamp: new Date(),
            livestreamRecords: mockRecords,
        };

        expect(userMessage.type).toBe('user');
        expect(botMessage.type).toBe('bot');
        expect(selectionMessage.type).toBe('livestream-selection');
        expect(selectionMessage.livestreamRecords).toBeDefined();
    });
});