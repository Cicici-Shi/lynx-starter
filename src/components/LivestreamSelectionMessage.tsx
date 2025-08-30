// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { ChatMessage, LivestreamRecord } from "../types/chatbot.ts";
import { Icon } from "./Icon.tsx";

interface LivestreamSelectionMessageProps {
  message: ChatMessage;
  onRecordSelect: (record: LivestreamRecord) => void;
}

/**
 * 直播记录选择消息组件
 *
 * 功能特性:
 * - 在聊天界面中显示可选择的直播记录
 * - 每条记录显示为可点击的卡片
 * - 支持点击选择进行分析
 */
export function LivestreamSelectionMessage({
  message,
  onRecordSelect,
}: LivestreamSelectionMessageProps) {
  const formatTime = (timestamp: Date): string => {
    // Fallback for environments without Intl support
    if (typeof Intl === "undefined" || !Intl.DateTimeFormat) {
      const hours = timestamp.getHours().toString().padStart(2, "0");
      const minutes = timestamp.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return timestamp.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    // Fallback for environments without Intl support
    if (typeof Intl === "undefined" || !Intl.DateTimeFormat) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    }
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  };

  const handleRecordClick = (record: LivestreamRecord) => {
    onRecordSelect(record);
  };

  return (
    <view className="bot-message">
      <view className="message-content-wrapper livestream-selection-container">
        <text className="bot-message-content">{message.content}</text>

        {/* 直播记录选择区域 */}
        <view className="livestream-selection">
          {message.livestreamRecords?.map((record) => (
            <view
              key={record.id}
              className="livestream-record-card"
              bindtap={() => handleRecordClick(record)}
            >
              <view className="record-main">
                <view className="record-content">
                  <view className="record-header">
                    <text className="record-title">{record.title}</text>
                  </view>

                  <view className="record-details">
                    <view className="record-info">
                      <Icon name="calendar" size={14} className="info-icon" />
                      <text className="info-text">
                        {formatDate(record.date)}
                      </text>
                    </view>
                    <view className="record-info">
                      <Icon name="clock" size={14} className="info-icon" />
                      <text className="info-text">{record.duration}</text>
                    </view>
                    {record.viewerCount && (
                      <view className="record-info">
                        <Icon name="users" size={14} className="info-icon" />
                        <text className="info-text">
                          {record.viewerCount.toLocaleString()}人
                        </text>
                      </view>
                    )}
                  </view>
                </view>

                <view className="record-action">
                  <Icon name="arrow-right" size={14} className="action-icon" />
                </view>
              </view>
            </view>
          ))}
        </view>
      </view>
    </view>
  );
}
