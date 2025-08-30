// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { UserMessageProps } from "../types/components.ts";

/**
 * 用户消息气泡组件
 *
 * 功能特性:
 * - 展示用户发送的消息
 * - 右对齐布局
 * - 显示发送时间
 * - 支持多行文本显示
 */
export function UserMessage({ message }: UserMessageProps) {
  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <view className="user-message">
      <view className="message-content-wrapper">
        <view className="user-message-bubble">
          <text className="user-message-content">{message.content}</text>
        </view>
        <text className="user-message-time">
          {formatTime(message.timestamp)}
        </text>
      </view>
    </view>
  );
}
