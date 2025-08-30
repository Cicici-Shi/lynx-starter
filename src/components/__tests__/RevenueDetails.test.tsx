// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, getQueriesForElement } from "@lynx-js/react/testing-library";
import { RevenueDetails } from "../RevenueDetails.tsx";
import type { RevenueDistribution } from "../../types/chatbot.ts";

// Mock the Icon component
vi.mock("../Icon.tsx", () => ({
  Icon: ({ name, size, className }: any) => (
    <view data-testid={`icon-${name}`} className={className}>
      {name}
    </view>
  ),
}));

describe("RevenueDetails Component", () => {
  const mockDistribution: RevenueDistribution = {
    recordId: "test-record-1",
    totalAmount: 10000,
    currency: "CNY",
    calculationBasis: "基于观看时长和互动数据的智能分配算法",
    calculatedAt: "2024-01-15T10:30:00Z",
    distributions: [
      {
        party: "主播",
        percentage: 60,
        amount: 6000,
        reason: "主要内容创作者，获得最大份额",
        category: "streamer",
      },
      {
        party: "平台",
        percentage: 25,
        amount: 2500,
        reason: "提供技术支持和流量推广",
        category: "platform",
      },
      {
        party: "合作方",
        percentage: 15,
        amount: 1500,
        reason: "品牌合作和推广支持",
        category: "partner",
      },
    ],
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Visibility and Basic Rendering", () => {
    it("should not render when isVisible is false", () => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={false}
          onClose={mockOnClose}
        />,
      );

      // When component returns null, there should be no revenue-details element
      const revenueDetails =
        elementTree.root?.querySelector(".revenue-details");
      expect(revenueDetails).toBeNull();
    });

    it("should render when isVisible is true", () => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );

      const revenueDetails =
        elementTree.root?.querySelector(".revenue-details");
      expect(revenueDetails).toBeTruthy();
    });

    it("should have correct CSS classes when visible", () => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );

      const revenueDetails = elementTree.root?.querySelector(
        ".revenue-details.visible",
      );
      expect(revenueDetails).toBeTruthy();
    });

    it("should render main structure components", () => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );

      expect(elementTree.root?.querySelector(".details-overlay")).toBeTruthy();
      expect(elementTree.root?.querySelector(".details-panel")).toBeTruthy();
      expect(elementTree.root?.querySelector(".details-header")).toBeTruthy();
      expect(elementTree.root?.querySelector(".details-content")).toBeTruthy();
    });
  });

  describe("Header Section", () => {
    beforeEach(() => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );
    });

    it("should render header with title", () => {
      const header = elementTree.root?.querySelector(".details-header");
      expect(header).toBeTruthy();

      const title = elementTree.root?.querySelector(".details-title");
      expect(title).toBeTruthy();
    });

    it("should render close button", () => {
      const closeButton = elementTree.root?.querySelector(".close-button");
      expect(closeButton).toBeTruthy();
    });
  });

  describe("Basic Information Display", () => {
    beforeEach(() => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );
    });

    it("should display basic information structure", () => {
      const basicInfo = elementTree.root?.querySelector(".basic-info");
      expect(basicInfo).toBeTruthy();

      const infoItems = elementTree.root?.querySelectorAll(".info-item");
      expect(infoItems?.length).toBeGreaterThan(0);
    });

    it("should display total amount with correct styling", () => {
      const totalAmount = elementTree.root?.querySelector(".total-amount");
      expect(totalAmount).toBeTruthy();
    });

    it("should display calculation basis", () => {
      const calculationBasis =
        elementTree.root?.querySelector(".calculation-basis");
      expect(calculationBasis).toBeTruthy();
    });
  });

  describe("Distribution Details", () => {
    beforeEach(() => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );
    });

    it("should display distribution section", () => {
      const distributionSection = elementTree.root?.querySelector(
        ".distribution-section",
      );
      expect(distributionSection).toBeTruthy();
    });

    it("should display correct number of distribution items", () => {
      const distributionItems =
        elementTree.root?.querySelectorAll(".distribution-item");
      expect(distributionItems?.length).toBe(3);
    });

    it("should display party information for each item", () => {
      const partyInfos = elementTree.root?.querySelectorAll(".party-info");
      expect(partyInfos?.length).toBe(3);

      const partyNames = elementTree.root?.querySelectorAll(".party-name");
      expect(partyNames?.length).toBe(3);

      const partyCategories =
        elementTree.root?.querySelectorAll(".party-category");
      expect(partyCategories?.length).toBe(3);
    });

    it("should display category indicators", () => {
      const categoryIndicators = elementTree.root?.querySelectorAll(
        ".category-indicator",
      );
      expect(categoryIndicators?.length).toBe(3);
    });

    it("should display percentage bars", () => {
      const percentageBars =
        elementTree.root?.querySelectorAll(".percentage-bar");
      expect(percentageBars?.length).toBe(3);

      const percentageFills =
        elementTree.root?.querySelectorAll(".percentage-fill");
      expect(percentageFills?.length).toBe(3);
    });

    it("should display distribution reasons", () => {
      const distributionReasons = elementTree.root?.querySelectorAll(
        ".distribution-reason",
      );
      expect(distributionReasons?.length).toBe(3);
    });
  });

  describe("Summary Section", () => {
    beforeEach(() => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );
    });

    it("should display distribution summary", () => {
      const distributionSummary = elementTree.root?.querySelector(
        ".distribution-summary",
      );
      expect(distributionSummary).toBeTruthy();
    });

    it("should display summary items", () => {
      const summaryItems = elementTree.root?.querySelectorAll(".summary-item");
      expect(summaryItems?.length).toBe(2);

      const summaryLabels =
        elementTree.root?.querySelectorAll(".summary-label");
      expect(summaryLabels?.length).toBe(2);

      const summaryValues =
        elementTree.root?.querySelectorAll(".summary-value");
      expect(summaryValues?.length).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty distributions array", () => {
      const emptyDistribution: RevenueDistribution = {
        ...mockDistribution,
        distributions: [],
      };

      render(
        <RevenueDetails
          distribution={emptyDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );

      const distributionItems =
        elementTree.root?.querySelectorAll(".distribution-item");
      expect(distributionItems?.length).toBe(0);
    });

    it("should handle single distribution item", () => {
      const singleDistribution: RevenueDistribution = {
        ...mockDistribution,
        distributions: [mockDistribution.distributions[0]],
      };

      render(
        <RevenueDetails
          distribution={singleDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );

      const distributionItems =
        elementTree.root?.querySelectorAll(".distribution-item");
      expect(distributionItems?.length).toBe(1);
    });

    it("should handle unknown category types", () => {
      const unknownCategoryDistribution: RevenueDistribution = {
        ...mockDistribution,
        distributions: [
          {
            party: "未知方",
            percentage: 100,
            amount: 10000,
            reason: "未知类别测试",
            category: "unknown" as any,
          },
        ],
      };

      render(
        <RevenueDetails
          distribution={unknownCategoryDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );

      const distributionItems =
        elementTree.root?.querySelectorAll(".distribution-item");
      expect(distributionItems?.length).toBe(1);

      const categoryIndicators = elementTree.root?.querySelectorAll(
        ".category-indicator",
      );
      expect(categoryIndicators?.length).toBe(1);
    });
  });

  describe("Component Structure", () => {
    it("should match expected component structure", () => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );

      expect(elementTree.root).toMatchSnapshot();
    });

    it("should render with correct CSS classes", () => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );

      // Check main container classes
      expect(
        elementTree.root?.querySelector(".revenue-details.visible"),
      ).toBeTruthy();
      expect(elementTree.root?.querySelector(".details-overlay")).toBeTruthy();
      expect(elementTree.root?.querySelector(".details-panel")).toBeTruthy();

      // Check section classes
      expect(elementTree.root?.querySelector(".basic-info")).toBeTruthy();
      expect(
        elementTree.root?.querySelector(".distribution-section"),
      ).toBeTruthy();
      expect(
        elementTree.root?.querySelector(".distribution-summary"),
      ).toBeTruthy();
    });
  });

  describe("Animation and Styling", () => {
    it("should apply correct CSS classes for animations", () => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );

      const revenueDetails =
        elementTree.root?.querySelector(".revenue-details");
      expect(revenueDetails).toBeTruthy();
      expect(revenueDetails?.classList.contains("visible")).toBe(true);
    });

    it("should render percentage bars with correct structure", () => {
      render(
        <RevenueDetails
          distribution={mockDistribution}
          isVisible={true}
          onClose={mockOnClose}
        />,
      );

      const percentageBars =
        elementTree.root?.querySelectorAll(".percentage-bar");
      expect(percentageBars?.length).toBe(3);

      const percentageFills =
        elementTree.root?.querySelectorAll(".percentage-fill");
      expect(percentageFills?.length).toBe(3);
    });
  });
});
