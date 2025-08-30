// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { ChatMessage } from "../types/chatbot.ts";
import type { MessageSegment, ToolCall } from "../types/chatbot.ts";

/**
 * 流式机器人消息组件属性
 */
export interface StreamingBotMessageProps {
  message: ChatMessage;
}

/**
 * 工具调用显示组件
 */
function ToolCallDisplay({ toolCall }: { toolCall: ToolCall }) {
  const getStatusIcon = (status: ToolCall["status"]) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "running":
        return "🔄";
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "⚪";
    }
  };

  const getStatusColor = (status: ToolCall["status"]) => {
    switch (status) {
      case "pending":
        return "#fbbf24";
      case "running":
        return "#3b82f6";
      case "completed":
        return "#10b981";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <view className="tool-call-display">
      <view className="tool-call-header">
        <text
          className="tool-status-icon"
          style={{ color: getStatusColor(toolCall.status) }}
        >
          {getStatusIcon(toolCall.status)}
        </text>
        <text className="tool-name">{toolCall.name}</text>
      </view>
      <text className="tool-description">{toolCall.description}</text>
      {toolCall.params && (
        <view className="tool-params">
          <text className="tool-params-label">参数：</text>
          <text className="tool-params-content">
            {JSON.stringify(toolCall.params, null, 2)}
          </text>
        </view>
      )}
      {toolCall.result && (
        <view className="tool-result">
          <text className="tool-result-label">结果：</text>
          <text className="tool-result-content">
            {typeof toolCall.result === "string"
              ? toolCall.result
              : JSON.stringify(toolCall.result, null, 2)}
          </text>
        </view>
      )}
    </view>
  );
}

/**
 * 消息段落显示组件
 */
function MessageSegmentDisplay({ segment }: { segment: MessageSegment }) {
  const getSegmentTypeIcon = (type: MessageSegment["type"]) => {
    switch (type) {
      case "text":
        return "💭";
      case "tool":
        return "🔧";
      case "analysis":
        return "🔍";
      case "result":
        return "📝";
      default:
        return "💬";
    }
  };

  const getSegmentTypeLabel = (type: MessageSegment["type"]) => {
    switch (type) {
      case "text":
        return "思考";
      case "tool":
        return "工具调用";
      case "analysis":
        return "分析";
      case "result":
        return "回答";
      default:
        return "消息";
    }
  };

  return (
    <view
      className={`message-segment segment-${segment.type} ${segment.completed ? "completed" : "pending"}`}
    >
      <view className="segment-header">
        <text className="segment-icon">{getSegmentTypeIcon(segment.type)}</text>
        <text className="segment-label">
          {getSegmentTypeLabel(segment.type)}
        </text>
        {!segment.completed && (
          <view className="segment-loading">
            <view className="loading-dots">
              <view className="loading-dot dot-1"></view>
              <view className="loading-dot dot-2"></view>
              <view className="loading-dot dot-3"></view>
            </view>
          </view>
        )}
      </view>

      <view className="segment-content">
        {segment.type === "tool" && segment.toolCall ? (
          <ToolCallDisplay toolCall={segment.toolCall} />
        ) : (
          <text className="segment-text">{segment.content}</text>
        )}
      </view>
    </view>
  );
}

/**
 * 流式机器人消息组件
 *
 * 功能特性:
 * - 分段显示AI回复过程
 * - 支持工具调用的可视化
 * - 实时更新流式内容
 * - 区分不同类型的消息段落
 */
export function StreamingBotMessage({ message }: StreamingBotMessageProps) {
  // 获取当前应该显示的段落
  const visibleSegments =
    message.segments?.slice(0, (message.currentSegmentIndex || 0) + 1) || [];

  return (
    <view className="streaming-bot-message">
      <view className="message-content-wrapper">
        <view className="streaming-bot-message-bubble">
          {/* 流式段落显示 */}
          <view className="streaming-segments">
            {visibleSegments.map((segment) => (
              <MessageSegmentDisplay key={segment.id} segment={segment} />
            ))}
          </view>

          {/* 流式进度指示器 */}
          {message.isStreaming && (
            <view className="streaming-progress">
              <text className="streaming-progress-text">
                正在思考中... ({(message.currentSegmentIndex || 0) + 1}/
                {message.metadata?.totalSegments ||
                  message.segments?.length ||
                  0}
                )
              </text>
            </view>
          )}
        </view>

        {/* 消息元数据 */}
        {message.metadata && !message.isStreaming && (
          <view className="message-metadata">
            {message.metadata.confidence && (
              <text className="confidence-text">
                置信度: {(message.metadata.confidence * 100).toFixed(1)}%
              </text>
            )}
            {message.metadata.sources &&
              message.metadata.sources.length > 0 && (
                <text className="sources-text">
                  数据源: {message.metadata.sources.join(", ")}
                </text>
              )}
            {message.metadata.streamStartTime &&
              message.metadata.streamEndTime && (
                <text className="duration-text">
                  处理时长:{" "}
                  {(
                    (message.metadata.streamEndTime.getTime() -
                      message.metadata.streamStartTime.getTime()) /
                    1000
                  ).toFixed(1)}
                  秒
                </text>
              )}
          </view>
        )}

        {/* 时间戳 */}
        <text className="bot-message-time">
          {message.timestamp.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </text>
      </view>
    </view>
  );
}
