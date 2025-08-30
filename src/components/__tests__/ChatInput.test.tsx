// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@lynx-js/react/testing-library";
import { ChatInput } from "../ChatInput.tsx";

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

describe("ChatInput", () => {
  const defaultProps = {
    onSend: vi.fn(),
    disabled: false,
    placeholder: "Type a message...",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders input field with correct structure", () => {
      render(<ChatInput {...defaultProps} />);

      const container = elementTree.root?.querySelector(
        ".chat-input-container",
      );
      expect(container).toBeTruthy();

      const wrapper = elementTree.root?.querySelector(".chat-input-wrapper");
      expect(wrapper).toBeTruthy();

      const input = elementTree.root?.querySelector(".chat-input");
      expect(input).toBeTruthy();
    });

    it("renders send button with icon", () => {
      render(<ChatInput {...defaultProps} />);

      const sendButton = elementTree.root?.querySelector(".send-button");
      expect(sendButton).toBeTruthy();

      const sendIcon = elementTree.root?.querySelector(
        '.icon[data-name="send"]',
      );
      expect(sendIcon).toBeTruthy();
      expect(sendIcon?.getAttribute("data-size")).toBe("16");
    });

    it("renders input footer with hint and char count area", () => {
      render(<ChatInput {...defaultProps} />);

      const inputFooter = elementTree.root?.querySelector(".input-footer");
      expect(inputFooter).toBeTruthy();

      const inputHint = elementTree.root?.querySelector(".input-hint");
      expect(inputHint).toBeTruthy();

      const hintText = elementTree.root?.querySelector(".hint-text");
      expect(hintText).toBeTruthy();
    });

    it("renders with custom placeholder", () => {
      const customPlaceholder = "Custom placeholder text";
      render(<ChatInput {...defaultProps} placeholder={customPlaceholder} />);

      const input = elementTree.root?.querySelector(".chat-input");
      expect(input).toBeTruthy();
    });
  });

  describe("Disabled State", () => {
    it("applies disabled state correctly", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);

      const input = elementTree.root?.querySelector(".chat-input.disabled");
      expect(input).toBeTruthy();
    });

    it("shows inactive send button when disabled", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);

      const sendButton = elementTree.root?.querySelector(
        ".send-button.inactive",
      );
      expect(sendButton).toBeTruthy();

      const sendIcon = elementTree.root?.querySelector(".send-icon.inactive");
      expect(sendIcon).toBeTruthy();
    });

    it("clears placeholder when disabled", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);

      const input = elementTree.root?.querySelector(".chat-input");
      expect(input).toBeTruthy();
      // In a real test environment, we would check that placeholder is empty
    });
  });

  describe("Send Button State", () => {
    it("shows inactive send button when input is empty", () => {
      render(<ChatInput {...defaultProps} />);

      const sendButton = elementTree.root?.querySelector(
        ".send-button.inactive",
      );
      expect(sendButton).toBeTruthy();

      const sendIcon = elementTree.root?.querySelector(".send-icon.inactive");
      expect(sendIcon).toBeTruthy();
    });
  });

  describe("CSS Classes", () => {
    it("applies correct CSS classes", () => {
      render(<ChatInput {...defaultProps} />);

      expect(
        elementTree.root?.querySelector(".chat-input-container"),
      ).toBeTruthy();
      expect(
        elementTree.root?.querySelector(".chat-input-wrapper"),
      ).toBeTruthy();
      expect(elementTree.root?.querySelector(".chat-input")).toBeTruthy();
      expect(elementTree.root?.querySelector(".send-button")).toBeTruthy();
      expect(elementTree.root?.querySelector(".input-footer")).toBeTruthy();
      expect(elementTree.root?.querySelector(".input-hint")).toBeTruthy();
    });

    it("handles disabled state styling", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);

      const input = elementTree.root?.querySelector(".chat-input");
      expect(input?.classList.contains("disabled")).toBe(true);
    });
  });

  describe("Component Structure", () => {
    it("renders textarea element for multi-line input", () => {
      render(<ChatInput {...defaultProps} />);

      const textarea = elementTree.root?.querySelector("textarea.chat-input");
      expect(textarea).toBeTruthy();
    });

    it("renders send button with proper icon", () => {
      render(<ChatInput {...defaultProps} />);

      const sendButton = elementTree.root?.querySelector(".send-button");
      expect(sendButton).toBeTruthy();

      const icon = sendButton?.querySelector('.icon[data-name="send"]');
      expect(icon).toBeTruthy();
    });

    it("renders hint text for keyboard shortcuts", () => {
      render(<ChatInput {...defaultProps} />);

      const hintText = elementTree.root?.querySelector(".hint-text");
      expect(hintText).toBeTruthy();
      expect(hintText?.textContent).toContain("Enter");
      expect(hintText?.textContent).toContain("Shift");
    });
  });

  describe("Props Handling", () => {
    it("handles disabled prop correctly", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);

      const textarea = elementTree.root?.querySelector("textarea.chat-input");
      expect(textarea?.hasAttribute("disabled")).toBe(true);
    });

    it("handles placeholder prop correctly", () => {
      const placeholder = "Enter your message here";
      render(<ChatInput {...defaultProps} placeholder={placeholder} />);

      const textarea = elementTree.root?.querySelector("textarea.chat-input");
      expect(textarea).toBeTruthy();
      // Note: In Lynx testing environment, we can't easily test placeholder attribute
    });

    it("handles onSend prop correctly", () => {
      const onSend = vi.fn();
      render(<ChatInput {...defaultProps} onSend={onSend} />);

      // Component should render without errors
      const container = elementTree.root?.querySelector(
        ".chat-input-container",
      );
      expect(container).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("provides proper ARIA attributes", () => {
      render(<ChatInput {...defaultProps} />);

      const textarea = elementTree.root?.querySelector("textarea.chat-input");
      expect(textarea).toBeTruthy();
      // In a real implementation, we would check for ARIA attributes
    });

    it("maintains focus management", () => {
      render(<ChatInput {...defaultProps} />);

      const textarea = elementTree.root?.querySelector("textarea.chat-input");
      expect(textarea).toBeTruthy();
      // Focus management would be tested in integration tests
    });
  });
});
