// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render } from "@lynx-js/react/testing-library";
import { BotMessage } from "../BotMessage.tsx";
import type { ChatMessage } from "../../types/chatbot.ts";

// Mock the Icon component
vi.mock("../Icon.tsx", () => ({
  Icon: ({
    name,
    size,
    className,
  }: {
    name: string;
    size: number;
    className?: string;
  }) => (
    <view className={`icon ${className}`} data-name={name} data-size={size}>
      {name}
    </view>
  ),
}));

describe("BotMessage", () => {
  const mockMessage: ChatMessage = {
    id: "1",
    type: "bot",
    content: "Hello, I am a bot response",
    timestamp: new Date("2024-01-01T10:30:00Z"),
  };

  it("renders bot message with correct structure", () => {
    render(<BotMessage message={mockMessage} />);

    const botMessage = elementTree.root?.querySelector(".bot-message");
    expect(botMessage).toBeTruthy();

    // Bot avatar removed as per design requirements

    const messageWrapper = elementTree.root?.querySelector(
      ".message-content-wrapper"
    );
    expect(messageWrapper).toBeTruthy();

    const messageBubble = elementTree.root?.querySelector(
      ".bot-message-bubble"
    );
    expect(messageBubble).toBeTruthy();
  });

  it("displays bot avatar icon", () => {
    render(<BotMessage message={mockMessage} />);

    const botIcon = elementTree.root?.querySelector('.icon[data-name="bot"]');
    expect(botIcon).toBeTruthy();
    expect(botIcon?.getAttribute("data-size")).toBe("24");
    expect(botIcon?.classList.contains("bot-icon")).toBe(true);
  });

  it("displays message content", () => {
    render(<BotMessage message={mockMessage} />);

    const messageContent = elementTree.root?.querySelector(
      ".bot-message-content"
    );
    expect(messageContent).toBeTruthy();
  });

  it("displays timestamp", () => {
    render(<BotMessage message={mockMessage} />);

    const messageTime = elementTree.root?.querySelector(".bot-message-time");
    expect(messageTime).toBeTruthy();
  });

  it("displays confidence metadata when available", () => {
    const messageWithMetadata: ChatMessage = {
      ...mockMessage,
      metadata: {
        confidence: 0.85,
        sources: ["source1", "source2"],
      },
    };

    render(<BotMessage message={messageWithMetadata} />);

    const messageMetadata =
      elementTree.root?.querySelector(".message-metadata");
    expect(messageMetadata).toBeTruthy();

    const confidenceText = elementTree.root?.querySelector(".confidence-text");
    expect(confidenceText).toBeTruthy();
  });

  it("does not display metadata when not available", () => {
    render(<BotMessage message={mockMessage} />);

    const messageMetadata =
      elementTree.root?.querySelector(".message-metadata");
    expect(messageMetadata).toBeFalsy();
  });

  it("handles zero confidence correctly", () => {
    const messageWithZeroConfidence: ChatMessage = {
      ...mockMessage,
      metadata: {
        confidence: 0,
      },
    };

    render(<BotMessage message={messageWithZeroConfidence} />);

    const messageMetadata =
      elementTree.root?.querySelector(".message-metadata");
    expect(messageMetadata).toBeTruthy();
  });

  it("handles high confidence correctly", () => {
    const messageWithHighConfidence: ChatMessage = {
      ...mockMessage,
      metadata: {
        confidence: 0.999,
      },
    };

    render(<BotMessage message={messageWithHighConfidence} />);

    const messageMetadata =
      elementTree.root?.querySelector(".message-metadata");
    expect(messageMetadata).toBeTruthy();
  });

  it("applies correct CSS classes", () => {
    render(<BotMessage message={mockMessage} />);

    expect(elementTree.root?.querySelector(".bot-message")).toBeTruthy();
    // Bot avatar test removed as per design requirements
    expect(elementTree.root?.querySelector(".bot-message-bubble")).toBeTruthy();
    expect(
      elementTree.root?.querySelector(".bot-message-content")
    ).toBeTruthy();
    expect(elementTree.root?.querySelector(".bot-message-time")).toBeTruthy();
  });

  it("handles empty content gracefully", () => {
    const emptyMessage: ChatMessage = {
      ...mockMessage,
      content: "",
    };

    render(<BotMessage message={emptyMessage} />);

    const messageContent = elementTree.root?.querySelector(
      ".bot-message-content"
    );
    expect(messageContent).toBeTruthy();
  });
});
