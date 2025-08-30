// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type {
  ChatMessage,
  LivestreamRecord,
  RevenueDistribution,
} from './chatbot.js';

/**
 * 直播收益分配聊天机器人主页面组件Props
 */
export interface LivestreamChatbotPageProps {
  onBack?: () => void;
  onNavigateToReports?: () => void;
}

/**
 * 直播记录展示组件Props
 */
export interface LivestreamRecordsProps {
  records: LivestreamRecord[];
  expandedRecordId: string | null;
  onRecordClick: (recordId: string) => void;
  onRecordCollapse: () => void;
}

/**
 * 单条直播记录卡片组件Props
 */
export interface RecordCardProps {
  record: LivestreamRecord;
  isExpanded: boolean;
  onClick: (recordId: string) => void;
}

/**
 * 收益分配详情组件Props
 */
export interface RevenueDetailsProps {
  distribution: RevenueDistribution;
  isVisible: boolean;
  onClose: () => void;
}

/**
 * 聊天交互组件Props
 */
export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isThinking: boolean;
  onRecordSelect?: (record: LivestreamRecord) => void;
  onContentUpdate?: () => void;
}

/**
 * 消息列表组件Props
 */
export interface MessageListProps {
  messages: ChatMessage[];
  isThinking: boolean;
  onRecordSelect?: (record: LivestreamRecord) => void;
  onContentUpdate?: () => void;
}

/**
 * 用户消息气泡组件Props
 */
export interface UserMessageProps {
  message: ChatMessage;
}

/**
 * 机器人消息气泡组件Props
 */
export interface BotMessageProps {
  message: ChatMessage;
}

/**
 * 思考状态指示器组件Props
 */
export interface ThinkingIndicatorProps {
  isVisible: boolean;
}

/**
 * 消息输入组件Props
 */
export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
  onFocus?: () => void;
}

/**
 * 聊天机器人头部组件Props
 */
export interface ChatbotHeaderProps {
  title?: string;
  onBack?: () => void;
}

/**
 * 聊天机器人内容区域组件Props
 */
export interface ChatbotContentProps {
  records: LivestreamRecord[];
  messages: ChatMessage[];
  expandedRecordId: string | null;
  isThinking: boolean;
  onRecordClick: (recordId: string) => void;
  onRecordCollapse: () => void;
  onSendMessage: (content: string) => void;
}
