// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { Icon } from "./Icon.tsx";
import { RevenueDetails } from "./RevenueDetails.tsx";
import type {
  LivestreamRecord,
  RevenueDistribution,
} from "../types/chatbot.ts";

/**
 * 直播记录展示组件属性接口
 */
export interface LivestreamRecordsProps {
  records: LivestreamRecord[];
  expandedRecordId: string | null;
  revenueDistributions: Map<string, RevenueDistribution>;
  onRecordClick: (recordId: string) => void;
  onRecordCollapse: () => void;
}

/**
 * 直播记录展示组件
 *
 * 功能特性:
 * - 展示最近3-5条直播记录
 * - 支持点击展开/收起收益分配详情
 * - 响应式卡片布局
 * - 状态指示器(完成/直播中/已安排)
 * - 空状态展示
 */
export function LivestreamRecords({
  records,
  expandedRecordId,
  revenueDistributions,
  onRecordClick,
  onRecordCollapse,
}: LivestreamRecordsProps) {
  // 如果没有记录，显示空状态
  if (records.length === 0) {
    return (
      <view className="records-section">
        <view className="section-header">
          <Icon name="livestream" size={20} className="section-icon" />
          <text className="section-title">最近直播</text>
        </view>

        <view className="empty-state">
          <Icon name="empty" size={48} className="empty-icon" />
          <text className="empty-title">暂无直播记录</text>
          <text className="empty-description">
            还没有直播记录，开始你的第一场直播吧！
          </text>
        </view>
      </view>
    );
  }

  return (
    <view className="records-section">
      <view className="section-header">
        <Icon name="livestream" size={20} className="section-icon" />
        <text className="section-title">最近直播</text>
      </view>

      <scroll-view
        className="records-scroll"
        scroll-orientation="vertical"
        scroll-bar-enable={true}
      >
        <view className="records-list">
          {records.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              isExpanded={expandedRecordId === record.id}
              revenueDistribution={revenueDistributions.get(record.id)}
              onRecordClick={onRecordClick}
              onRecordCollapse={onRecordCollapse}
            />
          ))}
        </view>
      </scroll-view>
    </view>
  );
}

/**
 * 单条直播记录卡片组件属性接口
 */
export interface RecordCardProps {
  record: LivestreamRecord;
  isExpanded: boolean;
  revenueDistribution?: RevenueDistribution;
  onRecordClick: (recordId: string) => void;
  onRecordCollapse: () => void;
}

/**
 * 单条直播记录卡片组件
 *
 * 功能特性:
 * - 显示直播基本信息（标题、日期、时长、收益）
 * - 状态指示器显示直播状态
 * - 点击展开/收起收益分配详情
 * - 收益分配详情可视化展示
 */
export function RecordCard({
  record,
  isExpanded,
  revenueDistribution,
  onRecordClick,
  onRecordCollapse,
}: RecordCardProps) {
  /**
   * 格式化日期显示
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

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
   * 获取状态显示文本
   */
  const getStatusText = (status: LivestreamRecord["status"]): string => {
    switch (status) {
      case "completed":
        return "已完成";
      case "live":
        return "直播中";
      case "scheduled":
        return "已安排";
      default:
        return "未知";
    }
  };

  return (
    <view className="record-item">
      {/* 直播记录卡片主体 */}
      <view
        className={`record-card ${isExpanded ? "expanded" : ""}`}
        bindtap={() => onRecordClick(record.id)}
      >
        <view className="record-main">
          <view className="record-info">
            <text className="record-title">{record.title}</text>
            <view className="record-meta">
              <text className="record-date">{formatDate(record.date)}</text>
              <text className="record-duration">{record.duration}</text>
              <text className="record-revenue">
                ¥{formatAmount(record.totalRevenue)}
              </text>
            </view>
            {/* 额外信息：观看人数 */}
            {record.viewerCount && (
              <view className="record-stats">
                <text className="stats-item">
                  观看: {record.viewerCount.toLocaleString()}人
                </text>
                {record.peakViewers && (
                  <text className="stats-item">
                    峰值: {record.peakViewers.toLocaleString()}人
                  </text>
                )}
              </view>
            )}
          </view>

          <view className="record-status">
            <view className="status-indicator">
              <view className={`status-dot status-${record.status}`}></view>
              <text className="status-text">
                {getStatusText(record.status)}
              </text>
            </view>
            <Icon
              name={isExpanded ? "dropup" : "dropdown"}
              size={16}
              className="expand-icon"
            />
          </view>
        </view>
      </view>

      {/* 收益分配详情展开面板 */}
      {revenueDistribution && (
        <RevenueDetails
          distribution={revenueDistribution}
          isVisible={isExpanded}
          onClose={onRecordCollapse}
        />
      )}
    </view>
  );
}
