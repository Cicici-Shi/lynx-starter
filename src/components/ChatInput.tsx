// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { useState, useRef, useEffect } from "@lynx-js/react";
import type { ChatInputProps } from "../types/components.ts";
import { Icon } from "./Icon.tsx";

// 声明 Lynx 全局对象类型
interface LynxSelectorQuery {
  select(selector: string): LynxSelectorQuery;
  invoke(params: {
    method: string;
    params?: any;
    success?: (res: any) => void;
    fail?: (error: any) => void;
  }): LynxSelectorQuery;
  exec(): void;
}

interface LynxGlobal {
  createSelectorQuery(): LynxSelectorQuery;
}

declare const lynx: LynxGlobal;

// 扩展 Lynx 类型定义以支持 textarea 元素
declare module "@lynx-js/react" {
  namespace JSX {
    interface IntrinsicElements {
      textarea: {
        ref?: any;
        className?: string;
        placeholder?: string;
        value?: string;
        disabled?: boolean;
        rows?: number;
        bindinput?: (e: { detail: { value: string } }) => void;
        bindkeydown?: (e: KeyboardEvent) => void;
        bindpaste?: (e: ClipboardEvent) => void;
        bindfocus?: () => void;
        bindblur?: () => void;
        bindconfirm?: () => void;
        style?: any;
        maxlength?: number;
        readonly?: boolean;
        "show-soft-input-on-focus"?: boolean;
        "confirm-type"?: "send" | "search" | "go" | "done" | "next";
        type?: "text" | "number" | "digit" | "tel" | "email";
      };
    }
  }
}

/**
 * 消息输入组件
 *
 * 功能特性:
 * - 多行文本输入支持
 * - 自动高度调整
 * - 键盘快捷键支持（Enter发送，Shift+Enter换行）
 * - 输入验证和空消息拦截
 * - 发送按钮状态管理
 */
export function ChatInput({
  onSend,
  disabled,
  placeholder = "输入消息...",
  onFocus,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * 自动调整文本域高度
   */
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea && textarea.style) {
      try {
        // 重置高度以获取正确的scrollHeight
        textarea.style.height = "auto";

        // 计算新高度，限制在最小和最大高度之间
        const minHeight = 20; // 对应CSS中的min-height
        const maxHeight = 120; // 对应CSS中的max-height
        const newHeight = Math.min(
          Math.max(textarea.scrollHeight || minHeight, minHeight),
          maxHeight
        );

        textarea.style.height = `${newHeight}px`;
      } catch (error) {
        // 在测试环境中可能会失败，静默处理
        console.debug("Height adjustment failed:", error);
      }
    }
  };

  /**
   * 处理输入变化 - 兼容Lynx.js事件格式
   */
  const handleInput = (e: any) => {
    if (!disabled) {
      let value: string;

      // 兼容不同的事件格式
      if (e.detail && typeof e.detail.value === "string") {
        // Lynx.js 格式
        value = e.detail.value;
      } else if (e.target && typeof e.target.value === "string") {
        // 标准HTML格式
        value = e.target.value;
      } else {
        return;
      }

      // 验证输入长度
      if (value.length <= 1000) {
        setInputValue(value);
      }
    }
  };

  /**
   * 处理键盘按键事件 - 兼容Lynx.js事件格式
   */
  const handleKeyDown = (e: any) => {
    if (disabled) {
      return;
    }

    const key = e.key || e.detail?.key;
    const shiftKey = e.shiftKey || e.detail?.shiftKey;

    if (key === "Enter") {
      if (shiftKey) {
        // Shift+Enter 换行，允许默认行为
        return;
      } else {
        // Enter 发送消息
        e.preventDefault && e.preventDefault();
        handleSend();
      }
    }
  };

  /**
   * 处理发送消息
   */
  const handleSend = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue || disabled) {
      return;
    }

    // 验证消息长度
    if (trimmedValue.length > 1000) {
      return;
    }

    // 发送消息
    onSend(trimmedValue);

    // 使用Lynx的SelectorQuery API来清空textarea
    try {
      if (typeof lynx !== "undefined" && lynx.createSelectorQuery) {
        lynx
          .createSelectorQuery()
          .select(".chat-input")
          .invoke({
            method: "setValue",
            params: {
              value: "",
            },
          })
          .exec();
      }
    } catch (error) {
      console.warn("Failed to clear textarea using Lynx API:", error);
    }

    // 同时清空React状态
    setInputValue("");

    // 重置高度
    setTimeout(() => {
      adjustTextareaHeight();
    }, 0);
  };

  /**
   * 处理发送按钮点击
   */
  const handleSendClick = () => {
    if (!disabled && inputValue.trim()) {
      handleSend();
    }
  };

  /**
   * 处理粘贴事件
   */
  const handlePaste = (e: any) => {
    if (disabled) {
      e.preventDefault && e.preventDefault();
      return;
    }

    const pastedText = e.clipboardData?.getData("text") || "";
    const currentLength = inputValue.length;
    const selectionLength =
      (typeof window !== "undefined" &&
        window.getSelection?.()?.toString().length) ||
      0;
    const newLength = currentLength - selectionLength + pastedText.length;

    // 如果粘贴后超过长度限制，阻止粘贴
    if (newLength > 1000) {
      e.preventDefault && e.preventDefault();
    }
  };

  /**
   * 处理输入框获得焦点
   */
  const handleFocus = () => {
    if (disabled) return;

    // 调用外部传入的焦点处理回调
    if (onFocus) {
      onFocus();
    }

    // 备用滚动逻辑，如果外部没有提供onFocus回调
    if (!onFocus) {
      setTimeout(() => {
        try {
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
          }
        } catch (error) {
          console.warn("Failed to scroll input into view:", error);
        }
      }, 300);
    }
  };

  /**
   * 处理输入框失去焦点
   */
  const handleBlur = () => {
    // 可以在这里添加失去焦点时的处理逻辑
    console.debug("Input blur");
  };

  // 监听输入值变化，自动调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // 组件挂载后调整初始高度
  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  const canSend = !disabled && inputValue.trim().length > 0;
  const isOverLimit = inputValue.length > 1000;

  return (
    <view className="chat-input-container">
      <view className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className={`chat-input ${disabled ? "disabled" : ""} ${isOverLimit ? "over-limit" : ""}`}
          placeholder={disabled ? "" : placeholder}
          value={inputValue}
          disabled={disabled}
          rows={1}
          bindinput={handleInput}
          bindkeydown={handleKeyDown}
          bindpaste={handlePaste}
          bindconfirm={handleSend}
          bindfocus={handleFocus}
          bindblur={handleBlur}
          show-soft-input-on-focus={true}
          confirm-type="send"
          type="text"
          style={{
            overflow: "hidden",
          }}
        />
        <view
          className={`send-button ${canSend ? "active" : "inactive"}`}
          bindtap={handleSendClick}
        >
          <Icon
            name="send"
            size={16}
            className={`send-icon ${canSend ? "active" : "inactive"}`}
          />
        </view>
      </view>

      {/* 字符计数和输入提示 */}
      <view className="input-footer">
        {inputValue.length > 800 && (
          <view className="char-count">
            <text
              className={`char-count-text ${isOverLimit ? "over-limit" : ""}`}
            >
              {inputValue.length}/1000
            </text>
          </view>
        )}
      </view>
    </view>
  );
}
