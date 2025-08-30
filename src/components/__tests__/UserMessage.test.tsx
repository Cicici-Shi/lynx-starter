// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render } from "@lynx-js/react/testing-library";
import { UserMessage } from "../UserMessage.tsx";
import type { ChatMessage } from "../../types/chatbot.ts";

describe("UserMessage", () => {
  const mockMessage: ChatMessage = {
    id: "1",
    type: "user",
    content: "Hello, this is a test message",
    timestamp: new Date("2024-01-01T10:30:00Z"),
  };

  it("renders user message with correct structure", () => {
    render(<UserMessage message={mockMessage} />);

    const userMessage = elementTree.root?.querySelector(".user-message");
    expect(userMessage).toBeTruthy();

    const messageWrapper = elementTree.root?.querySelector(
      ".message-content-wrapper",
    );
    expect(messageWrapper).toBeTruthy();

    const messageBubble = elementTree.root?.querySelector(
      ".user-message-bubble",
    );
    expect(messageBubble).toBeTruthy();
  });

  it("displays message content", () => {
    render(<UserMessage message={mockMessage} />);

    // Check if content is rendered (we can't easily check text content in Lynx tests)
    const messageContent = elementTree.root?.querySelector(
      ".user-message-content",
    );
    expect(messageContent).toBeTruthy();
  });

  it("displays timestamp", () => {
    render(<UserMessage message={mockMessage} />);

    const messageTime = elementTree.root?.querySelector(".user-message-time");
    expect(messageTime).toBeTruthy();
  });

  it("handles multiline content", () => {
    const multilineMessage: ChatMessage = {
      ...mockMessage,
      content: "Line 1\nLine 2\nLine 3",
    };

    render(<UserMessage message={multilineMessage} />);

    const messageContent = elementTree.root?.querySelector(
      ".user-message-content",
    );
    expect(messageContent).toBeTruthy();
  });

  it("handles empty content", () => {
    const emptyMessage: ChatMessage = {
      ...mockMessage,
      content: "",
    };

    render(<UserMessage message={emptyMessage} />);

    const messageContent = elementTree.root?.querySelector(
      ".user-message-content",
    );
    expect(messageContent).toBeTruthy();
  });

  it("handles long content", () => {
    const longMessage: ChatMessage = {
      ...mockMessage,
      content:
        "This is a very long message that should wrap properly and display correctly in the user message bubble component without breaking the layout or causing any visual issues.",
    };

    render(<UserMessage message={longMessage} />);

    const messageContent = elementTree.root?.querySelector(
      ".user-message-content",
    );
    expect(messageContent).toBeTruthy();
  });

  it("applies correct CSS classes", () => {
    render(<UserMessage message={mockMessage} />);

    expect(elementTree.root?.querySelector(".user-message")).toBeTruthy();
    expect(
      elementTree.root?.querySelector(".user-message-bubble"),
    ).toBeTruthy();
    expect(
      elementTree.root?.querySelector(".user-message-content"),
    ).toBeTruthy();
    expect(elementTree.root?.querySelector(".user-message-time")).toBeTruthy();
  });
});
