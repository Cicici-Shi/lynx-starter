// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@lynx-js/react/testing-library";
import { ChatInterface } from "../ChatInterface.tsx";
import type { ChatMessage } from "../../types/chatbot.ts";

// Mock the child components
vi.mock("../MessageList.tsx", () => ({
  MessageList: () => <view className="message-list">MessageList</view>,
}));

vi.mock("../ChatInput.tsx", () => ({
  ChatInput: () => <view className="chat-input">ChatInput</view>,
}));

describe("ChatInterface", () => {
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
  ];

  const defaultProps = {
    messages: mockMessages,
    onSendMessage: vi.fn(),
    isThinking: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders chat interface with correct structure", () => {
    render(<ChatInterface {...defaultProps} />);

    // Check if main container exists
    const chatInterface = elementTree.root?.querySelector(".chat-interface");
    expect(chatInterface).toBeTruthy();
  });

  it("renders MessageList component", () => {
    render(<ChatInterface {...defaultProps} />);

    const messageList = elementTree.root?.querySelector(".message-list");
    expect(messageList).toBeTruthy();
  });

  it("renders ChatInput component", () => {
    render(<ChatInterface {...defaultProps} />);

    const chatInput = elementTree.root?.querySelector(".chat-input");
    expect(chatInput).toBeTruthy();
  });

  it("renders scroll view for messages", () => {
    render(<ChatInterface {...defaultProps} />);

    const scrollView = elementTree.root?.querySelector("scroll-view");
    expect(scrollView).toBeTruthy();
  });

  it("applies correct CSS classes", () => {
    render(<ChatInterface {...defaultProps} />);

    expect(elementTree.root?.querySelector(".chat-interface")).toBeTruthy();
    expect(elementTree.root?.querySelector("scroll-view")).toBeTruthy();
  });

  it("should match snapshot", () => {
    render(<ChatInterface {...defaultProps} />);
    expect(elementTree.root).toMatchSnapshot();
  });
});
