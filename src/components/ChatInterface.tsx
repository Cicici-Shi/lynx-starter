// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { useEffect, useRef } from "@lynx-js/react";

// 声明全局 lynx 对象类型
interface LynxSelectorQuery {
  select(selector: string): {
    invoke(options: {
      method: string;
      params: any;
      success?: (res: any) => void;
      fail?: (res: any) => void;
    }): {
      exec(): void;
    };
  };
}

interface LynxGlobal {
  createSelectorQuery(): LynxSelectorQuery;
}

declare const lynx: LynxGlobal;
import type { ChatInterfaceProps } from "../types/components.ts";
import { MessageList } from "./MessageList.tsx";
import { ChatInput } from "./ChatInput.tsx";

/**
 * 聊天交互组件
 *
 * 功能特性:
 * - 管理聊天消息的展示和输入
 * - 自动滚动到最新消息
 * - 处理用户输入和消息发送
 * - 支持直播记录选择
 * - 显示AI思考状态
 */
export function ChatInterface({
  messages,
  onSendMessage,
  isThinking,
  onRecordSelect,
  onContentUpdate,
}: ChatInterfaceProps) {
  const scrollViewRef = useRef<any>(null);

  // 滚动到底部的函数
  const scrollToBottom = () => {
    try {
      // 使用 Lynx 官方的 SelectorQuery API
      if (typeof lynx !== "undefined" && lynx.createSelectorQuery) {
        lynx
          .createSelectorQuery()
          .select("#chat-messages-scroll")
          .invoke({
            method: "scrollTo",
            params: {
              offset: 999999,
              smooth: true,
            },
          })
          .exec();
      } else {
        // 备用方案：使用 ref 方法
        if (scrollViewRef.current?.scrollToBottom) {
          scrollViewRef.current.scrollToBottom();
        }
      }
    } catch (error) {
      console.warn("自动滚动失败:", error);
    }
  };

  // 监听内容更新，立即滚动
  useEffect(() => {
    if (onContentUpdate) {
      const originalUpdate = onContentUpdate;
      // 如果有内容更新回调，包装它以包含滚动逻辑
    }
  }, [onContentUpdate]);

  // 自动滚动到最新消息
  useEffect(() => {
    // 使用延迟确保DOM更新完成
    const scrollDelay = isThinking ? 150 : 200;

    // 直接使用之前定义的scrollToBottom函数
    const performScroll = scrollToBottom;

    const timeoutId = setTimeout(scrollToBottom, scrollDelay);

    // 清理函数
    return () => {
      clearTimeout(timeoutId);
    };
  }, [messages, isThinking]);

  /**
   * 处理消息发送
   */
  const handleSendMessage = (content: string) => {
    if (!content.trim() || isThinking) {
      return;
    }
    onSendMessage(content.trim());
  };

  /**
   * 处理输入框获得焦点时的滚动
   */
  const handleInputFocus = () => {
    // 延迟滚动，等待软键盘弹起
    setTimeout(() => {
      scrollToBottom();
    }, 350);
  };

  return (
    <view className="chat-interface">
      {/* 消息列表区域 */}
      <scroll-view
        id="chat-messages-scroll"
        ref={scrollViewRef}
        className="chat-messages-scroll"
        scroll-orientation="vertical"
        scroll-bar-enable={true}
        scroll-to-bottom={true}
      >
        <MessageList
          messages={messages}
          isThinking={isThinking}
          onRecordSelect={onRecordSelect}
          onContentUpdate={scrollToBottom}
        />
      </scroll-view>

      {/* 消息输入区域 */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isThinking}
        placeholder={isThinking ? "Thinking..." : "Check revenue distribution…"}
        onFocus={handleInputFocus}
      />
    </view>
  );
}
