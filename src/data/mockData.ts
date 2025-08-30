// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type {
    LivestreamRecord,
    RevenueDistribution,
    ChatMessage,
    ChatSession,
} from '../types/chatbot.js';

/**
 * 模拟直播记录数据
 * 用于开发和测试环境
 */
export const mockLivestreamRecords: LivestreamRecord[] = [
    {
        id: 'stream-002',
        title: 'Tech Frontiers: AI and Future Life',
        date: '2025-07-28T19:30:00.000Z',
        duration: '2h 45m',
        totalRevenue: 89420.75,
        status: 'completed',
        thumbnail: 'assets/thumbnails/stream-002.jpg',
        viewerCount: 6780,
        peakViewers: 9240,
    },
    {
        id: 'stream-003',
        title: 'Summer Food Festival: Cool & Spicy Collide',
        date: '2025-06-25T18:00:00.000Z',
        duration: '4h 20m',
        totalRevenue: 156890.25,
        status: 'completed',
        thumbnail: 'assets/thumbnails/stream-003.jpg',
        viewerCount: 11200,
        peakViewers: 15680,
    },
    {
        id: 'stream-005',
        title: 'Spring Music Special',
        date: '2025-03-20T16:30:00.000Z',
        duration: '2h 30m',
        totalRevenue: 67320.40,
        status: 'completed',
        thumbnail: 'assets/thumbnails/stream-005.jpg',
        viewerCount: 4890,
        peakViewers: 6750,
    },
];

/**
 * 模拟收益分配数据
 * 对应上述直播记录的收益分配详情
 */
export const mockRevenueDistributions: RevenueDistribution[] = [
    {
        recordId: 'stream-001',
        totalAmount: 125680.50,
        currency: 'CNY',
        calculationBasis: '基于观看时长、互动频率和打赏金额的综合算法',
        calculatedAt: '2024-12-31T23:30:00.000Z',
        distributions: [
            {
                party: '主播',
                percentage: 60,
                amount: 75408.30,
                reason: '作为内容创作者，获得最大份额的收益分配',
                category: 'streamer',
            },
            {
                party: '平台',
                percentage: 25,
                amount: 31420.13,
                reason: '提供直播技术支持、流量推广和平台维护服务',
                category: 'platform',
            },
            {
                party: '技术合作方',
                percentage: 10,
                amount: 12568.05,
                reason: '提供高清视频编码和CDN加速服务',
                category: 'partner',
            },
            {
                party: '运营团队',
                percentage: 5,
                amount: 6284.02,
                reason: '负责活动策划、宣传推广和用户运营',
                category: 'other',
            },
        ],
    },
    {
        recordId: 'stream-002',
        totalAmount: 89420.75,
        currency: 'CNY',
        calculationBasis: '基于内容质量评分和用户参与度的分配模型',
        calculatedAt: '2024-12-28T22:45:00.000Z',
        distributions: [
            {
                party: '主播',
                percentage: 65,
                amount: 58123.49,
                reason: '高质量科技内容创作，用户满意度极高',
                category: 'streamer',
            },
            {
                party: '平台',
                percentage: 20,
                amount: 17884.15,
                reason: '平台基础服务费用和技术支持',
                category: 'platform',
            },
            {
                party: '专家顾问',
                percentage: 10,
                amount: 8942.08,
                reason: '邀请行业专家参与讨论，提升内容专业性',
                category: 'partner',
            },
            {
                party: '内容审核',
                percentage: 5,
                amount: 4471.04,
                reason: '确保内容合规性和质量标准',
                category: 'other',
            },
        ],
    },
    {
        recordId: 'stream-003',
        totalAmount: 156890.25,
        currency: 'CNY',
        calculationBasis: '节日特别活动分配方案，增加互动奖励权重',
        calculatedAt: '2024-12-25T22:30:00.000Z',
        distributions: [
            {
                party: '主播',
                percentage: 55,
                amount: 86289.64,
                reason: '节日特别内容创作和长时间直播',
                category: 'streamer',
            },
            {
                party: '平台',
                percentage: 25,
                amount: 39222.56,
                reason: '节日期间额外的服务器资源和推广支持',
                category: 'platform',
            },
            {
                party: '活动策划',
                percentage: 15,
                amount: 23533.54,
                reason: '圣诞节特别活动的策划和执行',
                category: 'partner',
            },
            {
                party: '礼品赞助商',
                percentage: 5,
                amount: 7844.51,
                reason: '提供节日礼品和抽奖奖品',
                category: 'other',
            },
        ],
    },
    {
        recordId: 'stream-004',
        totalAmount: 203450.80,
        currency: 'CNY',
        calculationBasis: '游戏直播专项分配，包含游戏厂商合作分成',
        calculatedAt: '2024-12-22T02:30:00.000Z',
        distributions: [
            {
                party: '主播',
                percentage: 50,
                amount: 101725.40,
                reason: '游戏内容创作和长时间高质量直播',
                category: 'streamer',
            },
            {
                party: '平台',
                percentage: 25,
                amount: 50862.70,
                reason: '游戏直播专区运营和技术支持',
                category: 'platform',
            },
            {
                party: '游戏厂商',
                percentage: 20,
                amount: 40690.16,
                reason: '游戏推广合作和独家内容授权',
                category: 'partner',
            },
            {
                party: '电竞团队',
                percentage: 5,
                amount: 10172.54,
                reason: '提供专业游戏解说和技术指导',
                category: 'other',
            },
        ],
    },
    {
        recordId: 'stream-005',
        totalAmount: 67320.40,
        currency: 'CNY',
        calculationBasis: '美食内容标准分配模式',
        calculatedAt: '2024-12-20T19:15:00.000Z',
        distributions: [
            {
                party: '主播',
                percentage: 70,
                amount: 47124.28,
                reason: '美食制作和文化讲解的专业内容创作',
                category: 'streamer',
            },
            {
                party: '平台',
                percentage: 20,
                amount: 13464.08,
                reason: '美食频道运营和推广服务',
                category: 'platform',
            },
            {
                party: '食材供应商',
                percentage: 7,
                amount: 4712.43,
                reason: '提供优质食材和品牌合作',
                category: 'partner',
            },
            {
                party: '摄影团队',
                percentage: 3,
                amount: 2019.61,
                reason: '专业美食摄影和视觉效果制作',
                category: 'other',
            },
        ],
    },
];

/**
 * 模拟聊天消息数据
 * 用于测试聊天界面功能
 */
export const mockChatMessages: ChatMessage[] = [
    {
        id: 'msg-001',
        type: 'user',
        content: '你好！我想了解一下最近的直播收益情况。',
        timestamp: new Date('2024-12-31T10:00:00.000Z'),
    },
    {
        id: 'msg-002',
        type: 'bot',
        content: '您好！我很乐意为您介绍最近的直播收益情况。根据数据显示，最近5场直播的总收益为642,762.70元，其中收益最高的是12月22日的游戏直播，达到了203,450.80元。您想了解哪场直播的具体分配详情呢？',
        timestamp: new Date('2024-12-31T10:00:15.000Z'),
        metadata: {
            confidence: 0.95,
            sources: ['stream-001', 'stream-002', 'stream-003', 'stream-004', 'stream-005'],
        },
    },
    {
        id: 'msg-003',
        type: 'user',
        content: '游戏直播的收益是怎么分配的？',
        timestamp: new Date('2024-12-31T10:01:00.000Z'),
        relatedRecordId: 'stream-004',
    },
    {
        id: 'msg-004',
        type: 'bot',
        content: '游戏直播的收益分配如下：\n\n• 主播获得50%（101,725.40元）- 负责游戏内容创作和长时间高质量直播\n• 平台获得25%（50,862.70元）- 提供游戏直播专区运营和技术支持\n• 游戏厂商获得20%（40,690.16元）- 游戏推广合作和独家内容授权\n• 电竞团队获得5%（10,172.54元）- 提供专业游戏解说和技术指导\n\n这种分配方式考虑了游戏厂商的合作关系，确保各方都能获得合理的收益。',
        timestamp: new Date('2024-12-31T10:01:20.000Z'),
        relatedRecordId: 'stream-004',
        metadata: {
            confidence: 0.98,
            sources: ['stream-004'],
        },
    },
];

/**
 * 模拟聊天会话数据
 */
export const mockChatSession: ChatSession = {
    id: 'session-001',
    messages: mockChatMessages,
    createdAt: new Date('2024-12-31T10:00:00.000Z'),
    lastActiveAt: new Date('2024-12-31T10:01:20.000Z'),
};

/**
 * 获取指定直播记录的收益分配数据
 */
export function getRevenueDistributionByRecordId(recordId: string): RevenueDistribution | undefined {
    return mockRevenueDistributions.find(distribution => distribution.recordId === recordId);
}

/**
 * 获取最近的直播记录（按日期倒序）
 */
export function getRecentLivestreamRecords(limit: number = 5): LivestreamRecord[] {
    return mockLivestreamRecords
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
}

/**
 * 计算总收益
 */
export function calculateTotalRevenue(records: LivestreamRecord[]): number {
    return records.reduce((total, record) => total + record.totalRevenue, 0);
}

/**
 * 获取收益最高的直播记录
 */
export function getHighestRevenueRecord(records: LivestreamRecord[]): LivestreamRecord | undefined {
    return records.reduce((highest, current) =>
        current.totalRevenue > (highest?.totalRevenue || 0) ? current : highest,
        undefined as LivestreamRecord | undefined
    );
}

/**
 * 格式化金额显示
 */
export function formatCurrency(amount: number, currency: string = 'CNY'): string {
    // Fallback for environments without Intl support
    if (typeof Intl === 'undefined' || !Intl.NumberFormat) {
        const symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : currency;
        return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * 格式化日期显示
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    // Fallback for environments without Intl support
    if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    }
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}