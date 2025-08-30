// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { Icon } from "./Icon.tsx";
import type { RevenueDistribution } from "../types/chatbot.ts";
import type { RevenueDetailsProps } from "../types/components.ts";
import "./RevenueDetails.css";

/**
 * 获取参与方类别的显示颜色
 */
function getCategoryColor(category: string, index: number): string {
  const colors = {
    streamer: "#10b981", // 绿色
    platform: "#3b82f6", // 蓝色
    partner: "#f59e0b", // 橙色
    other: "#6b7280", // 灰色
  };

  // 如果类别不存在，使用备用颜色数组
  const fallbackColors = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  return (
    colors[category as keyof typeof colors] ||
    fallbackColors[index % fallbackColors.length]
  );
}

/**
 * 收益分配详情组件
 *
 * 功能特性:
 * - 展示分配详情和分配比例、金额和理由
 * - 实现平滑的展开/收起动画效果
 * - 显示分配比例可视化条
 */
export function RevenueDetails({
  distribution,
  isVisible,
  onClose,
}: RevenueDetailsProps) {
  /**
   * 格式化金额显示
   */
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /**
   * 格式化计算时间
   */
  const formatCalculatedTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <view className={`revenue-details ${isVisible ? "visible" : ""}`}>
      <view className="details-overlay" bindtap={onClose}></view>
      <view className="details-panel">
        {/* 头部 */}
        <view className="details-header">
          <text className="details-title">收益分配详情</text>
          <view className="header-actions">
            <view className="close-button" bindtap={onClose}>
              <Icon name="close" size={20} className="close-icon" />
            </view>
          </view>
        </view>

        <scroll-view
          className="details-content"
          scroll-orientation="vertical"
          scroll-bar-enable={true}
        >
          {/* 基本信息 */}
          <view className="basic-info">
            <view className="info-item">
              <text className="info-label">总收益：</text>
              <text className="info-value total-amount">
                {distribution.currency} {formatAmount(distribution.totalAmount)}
              </text>
            </view>
            <view className="info-item">
              <text className="info-label">计算时间：</text>
              <text className="info-value">
                {formatCalculatedTime(distribution.calculatedAt)}
              </text>
            </view>
            <view className="info-item calculation-basis">
              <text className="info-label">计算依据：</text>
              <text className="info-value basis-text">
                {distribution.calculationBasis}
              </text>
            </view>
          </view>

          {/* 详细分配列表 */}
          <view className="distribution-section">
            <text className="section-title">分配详情</text>
            <view className="distribution-list">
              {distribution.distributions.map((item, index) => (
                <view
                  key={`${item.party}-${index}`}
                  className="distribution-item"
                >
                  <view className="item-header">
                    <view className="party-info">
                      <view
                        className="category-indicator"
                        style={{
                          backgroundColor: getCategoryColor(
                            item.category,
                            index,
                          ),
                        }}
                      ></view>
                      <text className="party-name">{item.party}</text>
                      <text className="party-category">({item.category})</text>
                    </view>
                    <view className="party-amount">
                      <text className="percentage">{item.percentage}%</text>
                      <text className="amount">
                        {distribution.currency} {formatAmount(item.amount)}
                      </text>
                    </view>
                  </view>

                  {/* 分配理由 */}
                  <text className="distribution-reason">{item.reason}</text>

                  {/* 分配比例可视化条 */}
                  <view className="percentage-bar">
                    <view
                      className="percentage-fill"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: getCategoryColor(item.category, index),
                      }}
                    ></view>
                  </view>
                </view>
              ))}
            </view>
          </view>

          {/* 分配汇总 */}
          <view className="distribution-summary">
            <view className="summary-item">
              <text className="summary-label">总计比例：</text>
              <text className="summary-value">
                {distribution.distributions.reduce(
                  (sum, item) => sum + item.percentage,
                  0,
                )}
                %
              </text>
            </view>
            <view className="summary-item">
              <text className="summary-label">总计金额：</text>
              <text className="summary-value">
                {distribution.currency}{" "}
                {formatAmount(
                  distribution.distributions.reduce(
                    (sum, item) => sum + item.amount,
                    0,
                  ),
                )}
              </text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  );
}
