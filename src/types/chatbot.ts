// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

/**
 * 直播记录数据模型
 * 用于展示过往直播记录信息
 */
export interface LivestreamRecord {
  id: string;
  title: string;
  date: string; // ISO 8601格式
  duration: string; // 格式: "2h 30m"
  totalRevenue: number;
  status: 'completed' | 'live' | 'scheduled';
  thumbnail?: string;
  viewerCount?: number;
  peakViewers?: number;
}

/**
 * 收益分配项目
 * 定义单个参与方的分配详情
 */
export interface DistributionItem {
  party: string; // 参与方名称 (如: "主播", "平台", "合作方")
  percentage: number; // 0-100
  amount: number;
  reason: string;
  category: 'streamer' | 'platform' | 'partner' | 'other';
}

/**
 * 收益分配数据模型
 * 包含完整的收益分配信息
 */
export interface RevenueDistribution {
  recordId: string;
  totalAmount: number;
  currency: string; // 默认 "CNY"
  distributions: DistributionItem[];
  calculationBasis: string;
  calculatedAt: string; // ISO 8601格式
}

/**
 * 工具调用信息
 * 用于展示AI的工具使用过程
 */
export interface ToolCall {
  id: string;
  name: string;
  description: string;
  params?: Record<string, any>;
  result?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: Date;
}

/**
 * 流式消息段落
 * 用于分段渲染AI回复
 */
export interface MessageSegment {
  id: string;
  type: 'text' | 'tool' | 'analysis' | 'result';
  content: string;
  toolCall?: ToolCall;
  completed: boolean;
}

/**
 * 聊天消息数据模型
 * 用于聊天界面的消息展示
 */
export interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'livestream-selection' | 'streaming-bot' | 'typewriter-bot';
  content: string;
  timestamp: Date;
  relatedRecordId?: string; // 关联的直播记录ID
  livestreamRecords?: LivestreamRecord[]; // 用于直播记录选择消息

  // 流式渲染相关字段
  isStreaming?: boolean; // 是否正在流式渲染
  segments?: MessageSegment[]; // 消息段落（用于流式显示）
  currentSegmentIndex?: number; // 当前渲染到的段落索引

  metadata?: {
    confidence?: number; // AI回答的置信度
    sources?: string[]; // 引用的数据源
    totalSegments?: number; // 总段落数
    streamStartTime?: Date; // 流式开始时间
    streamEndTime?: Date; // 流式结束时间
    llmResponse?: any; // LLM响应数据
  };
}

/**
 * 聊天会话数据模型
 * 管理整个聊天会话的状态
 */
export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActiveAt: Date;
}

/**
 * 错误状态数据模型
 * 用于统一的错误处理
 */
export interface ErrorState {
  type: 'network' | 'data' | 'ai' | 'unknown';
  message: string;
  retryable: boolean;
}
