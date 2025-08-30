// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { BotMessageProps } from "../types/components.ts";
import { Icon } from "./Icon.tsx";

/**
 * AI回复消息组件
 *
 * 功能特性:
 * - 高审美的AI回复展示
 * - 简洁优雅的设计风格
 * - 支持多行文本和格式化内容
 * - 显示置信度和时间戳
 */
export function BotMessage({ message }: BotMessageProps) {
  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * 格式化消息内容，支持简单的文本格式
   * 将换行符转换为实际换行，支持基本的文本样式
   */
  const formatContent = (content: string): string => {
    return content
      .replace(/\n/g, "\n") // 保持换行
      .replace(/\*\*(.*?)\*\*/g, "$1") // 移除粗体标记，保留内容
      .replace(/\*(.*?)\*/g, "$1"); // 移除斜体标记，保留内容
  };

  return (
    <view className="bot-message">
      {/* AI标识 */}

      {/* 消息内容 */}
      <view className="bot-content">
        <text className="bot-text">{formatContent(message.content)}</text>

        {/* 元数据信息 */}
      </view>
    </view>
  );
}
