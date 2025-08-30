// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { ThinkingIndicatorProps } from "../types/components.ts";
import { Icon } from "./Icon.tsx";

/**
 * 思考状态指示器组件
 *
 * 功能特性:
 * - 显示AI正在思考的状态
 * - 动画效果的思考指示器
 * - 可控制显示/隐藏
 * - 与机器人消息样式保持一致
 */
export function ThinkingIndicator({ isVisible }: ThinkingIndicatorProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <view className="thinking-indicator-wrapper">
      <view className="bot-message thinking-message">
        <view className="message-content-wrapper">
          <view className="bot-message-bubble thinking-bubble">
            <view className="thinking-animation">
              <view className="thinking-dot dot-1"></view>
              <view className="thinking-dot dot-2"></view>
              <view className="thinking-dot dot-3"></view>
            </view>
            <text className="thinking-text">Thinking...</text>
          </view>
        </view>
      </view>
    </view>
  );
}
