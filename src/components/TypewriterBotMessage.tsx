// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { useEffect, useState } from "@lynx-js/react";
import type { ChatMessage } from "../types/chatbot.ts";

/**
 * 简单的markdown转换为富文本显示
 * @param text 包含markdown的文本
 * @returns 转换后的显示用文本
 */
function convertMarkdownToDisplayText(text: string): string {
  return (
    text
      // 转换粗体 **text** 为 【text】
      .replace(/\*\*(.*?)\*\*/g, "【$1】")
      // 处理列表项目中的粗体
      .replace(/^-\s*【([^】]+)】:/gm, "◆ $1:")
      // 处理普通列表项
      .replace(/^-\s*/gm, "◆ ")
      // 处理数字列表
      .replace(/^(\d+)\.\s*【([^】]+)】:/gm, "$1. $2:")
      // 清理多余的空行，但保留段落间的空行
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      // 确保每个段落开始有适当的间距
      .replace(/\n【([^】]+)】:/g, "\n\n【$1】:")
  );
}

/**
 * 打字机效果机器人消息组件属性
 */
export interface TypewriterBotMessageProps {
  message: ChatMessage;
  onContentUpdate?: () => void; // 内容更新时的回调
}

/**
 * 打字机效果机器人消息组件
 *
 * 功能特性:
 * - 逐字符显示文本内容
 * - 可调节打字速度
 * - 支持富文本格式
 * - 自动滚动跟随
 */
export function TypewriterBotMessage({
  message,
  onContentUpdate,
}: TypewriterBotMessageProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // 打字机效果的配置
  const TYPING_SPEED = 30; // 每个字符的间隔时间（毫秒）
  const PAUSE_AFTER_PUNCTUATION = 150; // 标点符号后的额外停顿时间

  useEffect(() => {
    const fullText = convertMarkdownToDisplayText(message.content);
    let currentIndex = 0;

    const typeNextCharacter = () => {
      if (currentIndex < fullText.length) {
        const currentChar = fullText[currentIndex];
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        currentIndex++;

        // 每隔一段时间触发滚动更新
        if (currentIndex % 20 === 0 && onContentUpdate) {
          setTimeout(() => {
            onContentUpdate();
          }, 50);
        }

        // 如果是标点符号，稍微停顿久一点
        const isPunctuation = /[。！？，；：\.\!\?,:;]/.test(currentChar);
        const delay = isPunctuation
          ? TYPING_SPEED + PAUSE_AFTER_PUNCTUATION
          : TYPING_SPEED;

        setTimeout(typeNextCharacter, delay);
      } else {
        setIsTyping(false);
        // 打字完成后最后一次滚动
        if (onContentUpdate) {
          setTimeout(() => {
            onContentUpdate();
          }, 100);
        }
      }
    };

    // 重置状态并开始打字
    setDisplayedText("");
    setIsTyping(true);
    currentIndex = 0;

    // 稍微延迟开始，让用户看到空白状态
    setTimeout(typeNextCharacter, 500);

    // 清理函数
    return () => {
      setIsTyping(false);
    };
  }, [message.content]);

  return (
    <view className="typewriter-bot-message">
      <view className="message-content-wrapper">
        <view className="typewriter-bot-message-bubble">
          <view className="typewriter-content">
            <text className="typewriter-text">{displayedText}</text>
            {isTyping && <text className="typewriter-cursor">|</text>}
          </view>
        </view>
      </view>
    </view>
  );
}
