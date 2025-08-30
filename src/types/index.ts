// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

// 导出聊天机器人相关数据模型
export type {
  ChatMessage,
  ChatSession,
  DistributionItem,
  ErrorState,
  LivestreamRecord,
  RevenueDistribution,
} from './chatbot.js';

// 导出组件Props接口
export type {
  BotMessageProps,
  ChatbotContentProps,
  ChatbotHeaderProps,
  ChatInputProps,
  ChatInterfaceProps,
  LivestreamChatbotPageProps,
  LivestreamRecordsProps,
  MessageListProps,
  RecordCardProps,
  RevenueDetailsProps,
  ThinkingIndicatorProps,
  UserMessageProps,
} from './components.js';
