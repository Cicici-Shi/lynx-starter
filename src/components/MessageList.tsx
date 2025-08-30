// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { MessageListProps } from "../types/components.ts";
import { UserMessage } from "./UserMessage.tsx";
import { BotMessage } from "./BotMessage.tsx";
import { StreamingBotMessage } from "./StreamingBotMessage.tsx";
import { TypewriterBotMessage } from "./TypewriterBotMessage.tsx";
import { LivestreamSelectionMessage } from "./LivestreamSelectionMessage.tsx";
import { ThinkingIndicator } from "./ThinkingIndicator.tsx";

/**
 * 消息列表组件
 *
 * 功能特性:
 * - 展示所有聊天消息
 * - 区分用户消息和机器人消息
 * - 支持直播记录选择消息
 * - 显示思考状态指示器
 * - 支持消息时间戳显示
 */
export function MessageList({
  messages,
  isThinking,
  onRecordSelect,
  onContentUpdate,
}: MessageListProps) {
  return (
    <view className="message-list">
      {/* 渲染所有消息 */}
      {messages.map((message) => (
        <view key={message.id} className="message-wrapper">
          {message.type === "user" ? (
            <UserMessage message={message} />
          ) : message.type === "livestream-selection" ? (
            <LivestreamSelectionMessage
              message={message}
              onRecordSelect={onRecordSelect || (() => {})}
            />
          ) : message.type === "streaming-bot" ? (
            <StreamingBotMessage message={message} />
          ) : message.type === "typewriter-bot" ? (
            <TypewriterBotMessage
              message={message}
              onContentUpdate={onContentUpdate}
            />
          ) : (
            <BotMessage message={message} />
          )}
        </view>
      ))}

      {/* 思考状态指示器 */}
      <ThinkingIndicator isVisible={isThinking} />
    </view>
  );
}
