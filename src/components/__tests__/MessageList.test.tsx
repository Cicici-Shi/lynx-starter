// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render } from "@lynx-js/react/testing-library";
import { MessageList } from "../MessageList.tsx";
import type { ChatMessage } from "../../types/chatbot.ts";

// Mock the child components
vi.mock("../UserMessage.tsx", () => ({
  UserMessage: ({ message }: { message: ChatMessage }) => (
    <view
      className={`user-message-${message.id}`}
      data-content={message.content}
    >
      UserMessage
    </view>
  ),
}));

vi.mock("../BotMessage.tsx", () => ({
  BotMessage: ({ message }: { message: ChatMessage }) => (
    <view
      className={`bot-message-${message.id}`}
      data-content={message.content}
    >
      BotMessage
    </view>
  ),
}));

vi.mock("../ThinkingIndicator.tsx", () => ({
  ThinkingIndicator: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? (
      <view className="thinking-indicator">ThinkingIndicator</view>
    ) : null,
}));

describe("MessageList", () => {
  const mockMessages: ChatMessage[] = [
    {
      id: "1",
      type: "user",
      content: "Hello",
      timestamp: new Date("2024-01-01T10:00:00Z"),
    },
    {
      id: "2",
      type: "bot",
      content: "Hi there!",
      timestamp: new Date("2024-01-01T10:01:00Z"),
    },
    {
      id: "3",
      type: "user",
      content: "How are you?",
      timestamp: new Date("2024-01-01T10:02:00Z"),
    },
  ];

  it("renders message list with correct structure", () => {
    render(<MessageList messages={mockMessages} isThinking={false} />);

    const messageList = elementTree.root?.querySelector(".message-list");
    expect(messageList).toBeTruthy();
  });

  it("renders all messages", () => {
    render(<MessageList messages={mockMessages} isThinking={false} />);

    expect(elementTree.root?.querySelector(".user-message-1")).toBeTruthy();
    expect(elementTree.root?.querySelector(".bot-message-2")).toBeTruthy();
    expect(elementTree.root?.querySelector(".user-message-3")).toBeTruthy();
  });

  it("renders user messages with UserMessage component", () => {
    render(<MessageList messages={mockMessages} isThinking={false} />);

    const userMessage1 = elementTree.root?.querySelector(".user-message-1");
    const userMessage3 = elementTree.root?.querySelector(".user-message-3");

    expect(userMessage1?.getAttribute("data-content")).toBe("Hello");
    expect(userMessage3?.getAttribute("data-content")).toBe("How are you?");
  });

  it("renders bot messages with BotMessage component", () => {
    render(<MessageList messages={mockMessages} isThinking={false} />);

    const botMessage = elementTree.root?.querySelector(".bot-message-2");
    expect(botMessage?.getAttribute("data-content")).toBe("Hi there!");
  });

  it("shows thinking indicator when thinking", () => {
    render(<MessageList messages={mockMessages} isThinking={true} />);

    const thinkingIndicator = elementTree.root?.querySelector(
      ".thinking-indicator",
    );
    expect(thinkingIndicator).toBeTruthy();
  });

  it("hides thinking indicator when not thinking", () => {
    render(<MessageList messages={mockMessages} isThinking={false} />);

    const thinkingIndicator = elementTree.root?.querySelector(
      ".thinking-indicator",
    );
    expect(thinkingIndicator).toBeFalsy();
  });

  it("renders empty list when no messages", () => {
    render(<MessageList messages={[]} isThinking={false} />);

    const messageList = elementTree.root?.querySelector(".message-list");
    expect(messageList).toBeTruthy();

    // Should not have any user or bot message components
    expect(elementTree.root?.querySelector(".user-message-1")).toBeFalsy();
    expect(elementTree.root?.querySelector(".bot-message-1")).toBeFalsy();
  });

  it("wraps each message in message-wrapper", () => {
    render(<MessageList messages={mockMessages} isThinking={false} />);

    const messageWrappers =
      elementTree.root?.querySelectorAll(".message-wrapper");
    expect(messageWrappers).toHaveLength(3);
  });
});
