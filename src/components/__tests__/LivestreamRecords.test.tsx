// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, getQueriesForElement } from "@lynx-js/react/testing-library";
import { LivestreamRecords, RecordCard } from "../LivestreamRecords.tsx";
import { RevenueDetails } from "../RevenueDetails.tsx";
import type {
  LivestreamRecord,
  RevenueDistribution,
} from "../../types/chatbot.ts";

// Mock Icon component
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

describe("LivestreamRecords 组件测试", () => {
  const mockRecords: LivestreamRecord[] = [
    {
      id: "1",
      title: "测试直播1",
      date: "2024-12-28T20:00:00Z",
      duration: "2h 30m",
      totalRevenue: 15680.5,
      status: "completed",
      viewerCount: 1250,
      peakViewers: 1580,
    },
    {
      id: "2",
      title: "测试直播2",
      date: "2024-12-25T19:30:00Z",
      duration: "1h 45m",
      totalRevenue: 8920.3,
      status: "live",
      viewerCount: 890,
      peakViewers: 1120,
    },
  ];

  const mockDistributions = new Map<string, RevenueDistribution>([
    [
      "1",
      {
        recordId: "1",
        totalAmount: 15680.5,
        currency: "CNY",
        calculationBasis: "基于观看时长、互动率和打赏金额的综合算法",
        calculatedAt: "2024-12-28T22:30:00Z",
        distributions: [
          {
            party: "主播",
            percentage: 60,
            amount: 9408.3,
            reason: "主要内容创作者",
            category: "streamer",
          },
          {
            party: "平台",
            percentage: 40,
            amount: 6272.2,
            reason: "提供技术支持",
            category: "platform",
          },
        ],
      },
    ],
  ]);

  const mockProps = {
    records: mockRecords,
    expandedRecordId: null,
    revenueDistributions: mockDistributions,
    onRecordClick: vi.fn(),
    onRecordCollapse: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应该正确渲染组件结构", () => {
    render(<LivestreamRecords {...mockProps} />);

    // 检查组件是否正确渲染
    expect(elementTree.root).toMatchSnapshot();
  });

  it("应该显示正确的记录数量", () => {
    render(<LivestreamRecords {...mockProps} />);

    // 检查是否有正确数量的记录项
    const recordItems = elementTree.root?.querySelectorAll(".record-item");
    expect(recordItems).toHaveLength(2);
  });

  it("应该在空状态下显示空提示", () => {
    const emptyProps = {
      ...mockProps,
      records: [],
    };

    render(<LivestreamRecords {...emptyProps} />);

    // 检查是否有空状态容器
    const emptyState = elementTree.root?.querySelector(".empty-state");
    expect(emptyState).toBeTruthy();
  });

  it("应该在展开状态下显示收益详情", () => {
    const expandedProps = {
      ...mockProps,
      expandedRecordId: "1",
    };

    render(<LivestreamRecords {...expandedProps} />);

    // 检查是否有收益详情容器
    const revenueDetails = elementTree.root?.querySelector(".revenue-details");
    expect(revenueDetails).toBeTruthy();
  });
});

describe("RecordCard 组件测试", () => {
  const mockRecord: LivestreamRecord = {
    id: "1",
    title: "测试直播",
    date: "2024-12-28T20:00:00Z",
    duration: "2h 30m",
    totalRevenue: 15680.5,
    status: "completed",
    viewerCount: 1250,
    peakViewers: 1580,
  };

  const mockDistribution: RevenueDistribution = {
    recordId: "1",
    totalAmount: 15680.5,
    currency: "CNY",
    calculationBasis: "基于观看时长、互动率和打赏金额的综合算法",
    calculatedAt: "2024-12-28T22:30:00Z",
    distributions: [
      {
        party: "主播",
        percentage: 60,
        amount: 9408.3,
        reason: "主要内容创作者",
        category: "streamer",
      },
    ],
  };

  const mockProps = {
    record: mockRecord,
    isExpanded: false,
    revenueDistribution: mockDistribution,
    onRecordClick: vi.fn(),
    onRecordCollapse: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应该正确渲染记录卡片结构", () => {
    render(<RecordCard {...mockProps} />);

    // 检查基本结构
    const recordCard = elementTree.root?.querySelector(".record-card");
    expect(recordCard).toBeTruthy();

    const recordTitle = elementTree.root?.querySelector(".record-title");
    expect(recordTitle).toBeTruthy();

    const recordMeta = elementTree.root?.querySelector(".record-meta");
    expect(recordMeta).toBeTruthy();
  });

  it("应该在展开状态下显示收益详情", () => {
    const expandedProps = { ...mockProps, isExpanded: true };

    render(<RecordCard {...expandedProps} />);

    // 检查是否有收益详情
    const revenueDetails = elementTree.root?.querySelector(".revenue-details");
    expect(revenueDetails).toBeTruthy();
  });

  it("应该正确显示不同的直播状态", () => {
    const liveRecord = { ...mockRecord, status: "live" as const };
    const liveProps = { ...mockProps, record: liveRecord };

    render(<RecordCard {...liveProps} />);

    // 检查状态点样式
    const statusDot = elementTree.root?.querySelector(
      ".status-dot.status-live",
    );
    expect(statusDot).toBeTruthy();
  });
});

describe("RevenueDetails 组件测试", () => {
  const mockDistribution: RevenueDistribution = {
    recordId: "1",
    totalAmount: 15680.5,
    currency: "CNY",
    calculationBasis: "基于观看时长、互动率和打赏金额的综合算法",
    calculatedAt: "2024-12-28T22:30:00Z",
    distributions: [
      {
        party: "主播",
        percentage: 60,
        amount: 9408.3,
        reason: "主要内容创作者，承担直播策划和执行",
        category: "streamer",
      },
      {
        party: "平台",
        percentage: 40,
        amount: 6272.2,
        reason: "提供技术支持、流量推广和平台服务",
        category: "platform",
      },
    ],
  };

  const mockProps = {
    distribution: mockDistribution,
    isVisible: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应该正确渲染收益分配详情结构", () => {
    render(<RevenueDetails {...mockProps} />);

    // 检查主要结构元素
    const detailsHeader = elementTree.root?.querySelector(".details-header");
    expect(detailsHeader).toBeTruthy();

    const detailsContent = elementTree.root?.querySelector(".details-content");
    expect(detailsContent).toBeTruthy();

    const calculationBasis =
      elementTree.root?.querySelector(".calculation-basis");
    expect(calculationBasis).toBeTruthy();

    const distributionList =
      elementTree.root?.querySelector(".distribution-list");
    expect(distributionList).toBeTruthy();
  });

  it("应该显示正确数量的分配项目", () => {
    render(<RevenueDetails {...mockProps} />);

    // 检查分配项目数量
    const distributionItems =
      elementTree.root?.querySelectorAll(".distribution-item");
    expect(distributionItems).toHaveLength(2);
  });

  it("应该显示分配比例可视化条", () => {
    render(<RevenueDetails {...mockProps} />);

    // 检查百分比条
    const percentageBars =
      elementTree.root?.querySelectorAll(".percentage-bar");
    expect(percentageBars).toHaveLength(2);

    const percentageFills =
      elementTree.root?.querySelectorAll(".percentage-fill");
    expect(percentageFills).toHaveLength(2);
  });

  it("应该显示分类指示器", () => {
    render(<RevenueDetails {...mockProps} />);

    // 检查分类指示器
    const categoryIndicators = elementTree.root?.querySelectorAll(
      ".category-indicator",
    );
    expect(categoryIndicators).toHaveLength(2);
  });
});

describe("组件功能测试", () => {
  it("应该正确处理格式化函数", () => {
    const mockRecord: LivestreamRecord = {
      id: "1",
      title: "测试直播",
      date: "2024-12-28T20:00:00Z",
      duration: "2h 30m",
      totalRevenue: 1234.56,
      status: "completed",
    };

    const mockProps = {
      record: mockRecord,
      isExpanded: false,
      onRecordClick: vi.fn(),
      onRecordCollapse: vi.fn(),
    };

    render(<RecordCard {...mockProps} />);

    // 检查组件是否正确渲染（不依赖具体文本内容）
    const recordCard = elementTree.root?.querySelector(".record-card");
    expect(recordCard).toBeTruthy();
  });

  it("应该正确处理不同状态的样式", () => {
    const statuses: Array<LivestreamRecord["status"]> = [
      "completed",
      "live",
      "scheduled",
    ];

    statuses.forEach((status) => {
      const mockRecord: LivestreamRecord = {
        id: "1",
        title: "测试直播",
        date: "2024-12-28T20:00:00Z",
        duration: "2h 30m",
        totalRevenue: 1000,
        status,
      };

      const mockProps = {
        record: mockRecord,
        isExpanded: false,
        onRecordClick: vi.fn(),
        onRecordCollapse: vi.fn(),
      };

      render(<RecordCard {...mockProps} />);

      // 检查状态点是否有正确的类名
      const statusDot = elementTree.root?.querySelector(
        `.status-dot.status-${status}`,
      );
      expect(statusDot).toBeTruthy();
    });
  });
});
