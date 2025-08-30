// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render } from "@lynx-js/react/testing-library";
import { ThinkingIndicator } from "../ThinkingIndicator.tsx";

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

describe("ThinkingIndicator", () => {
  it("renders when visible", () => {
    render(<ThinkingIndicator isVisible={true} />);

    const wrapper = elementTree.root?.querySelector(
      ".thinking-indicator-wrapper"
    );
    expect(wrapper).toBeTruthy();

    const thinkingMessage =
      elementTree.root?.querySelector(".thinking-message");
    expect(thinkingMessage).toBeTruthy();

    const thinkingText = elementTree.root?.querySelector(".thinking-text");
    expect(thinkingText).toBeTruthy();
  });

  it("does not render when not visible", () => {
    render(<ThinkingIndicator isVisible={false} />);

    const wrapper = elementTree.root?.querySelector(
      ".thinking-indicator-wrapper"
    );
    expect(wrapper).toBeFalsy();
  });

  it("displays bot avatar icon when visible", () => {
    render(<ThinkingIndicator isVisible={true} />);

    const botIcon = elementTree.root?.querySelector('.icon[data-name="bot"]');
    expect(botIcon).toBeTruthy();
    expect(botIcon?.getAttribute("data-size")).toBe("24");
    expect(botIcon?.classList.contains("bot-icon")).toBe(true);
  });

  it("displays thinking animation dots when visible", () => {
    render(<ThinkingIndicator isVisible={true} />);

    const thinkingAnimation = elementTree.root?.querySelector(
      ".thinking-animation"
    );
    expect(thinkingAnimation).toBeTruthy();

    const thinkingDots = elementTree.root?.querySelectorAll(".thinking-dot");
    expect(thinkingDots).toHaveLength(3);

    // Check that dots have correct classes for animation timing
    expect(elementTree.root?.querySelector(".thinking-dot.dot-1")).toBeTruthy();
    expect(elementTree.root?.querySelector(".thinking-dot.dot-2")).toBeTruthy();
    expect(elementTree.root?.querySelector(".thinking-dot.dot-3")).toBeTruthy();
  });

  it("applies correct CSS classes when visible", () => {
    render(<ThinkingIndicator isVisible={true} />);

    expect(
      elementTree.root?.querySelector(".thinking-indicator-wrapper")
    ).toBeTruthy();
    expect(elementTree.root?.querySelector(".thinking-message")).toBeTruthy();
    expect(elementTree.root?.querySelector(".thinking-bubble")).toBeTruthy();
    expect(elementTree.root?.querySelector(".thinking-animation")).toBeTruthy();
    expect(elementTree.root?.querySelector(".thinking-text")).toBeTruthy();
  });

  it("has consistent styling with bot messages", () => {
    render(<ThinkingIndicator isVisible={true} />);

    // Should have similar structure to bot messages
    expect(elementTree.root?.querySelector(".bot-message")).toBeTruthy();
    // Bot avatar test removed as per design requirements
    expect(
      elementTree.root?.querySelector(".message-content-wrapper")
    ).toBeTruthy();
  });

  it("returns null when not visible", () => {
    const { container } = render(<ThinkingIndicator isVisible={false} />);

    // In Lynx testing, we check if the root element has no children
    const hasContent = elementTree.root?.querySelector("*");
    expect(hasContent).toBeFalsy();
  });
});
