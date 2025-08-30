import { useState } from "@lynx-js/react";
import {
  aiSearchService,
  type AISearchResponse,
} from "../services/aiService.ts";
import { Icon } from "../components/Icon.tsx";
import { DatePicker } from "../components/DatePicker.tsx";
import "./ReportsPage.css";

// 扩展 Lynx 类型定义以支持 input 元素
declare module "@lynx-js/react" {
  namespace JSX {
    interface IntrinsicElements {
      input: {
        className?: string;
        placeholder?: string;
        value?: string;
        bindinput?: (e: { detail: { value: string } }) => void;
        bindkeypress?: (e: KeyboardEvent) => void;
        bindfocus?: () => void;
      };
    }
  }
}

// AI搜索结果类型定义（使用自定义验证替代zod）
// AISearchResult type is now imported from validation utils

// 智能搜索框组件
function SmartSearchBox({
  onChange,
  onAISearch,
  data,
}: {
  value: string;
  onChange: (value: string) => void;
  onAISearch: (query: string) => Promise<void>;
  data: ReportItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // 获取类型对应的图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sales":
        return "sales";
      case "analytics":
        return "analytics";
      case "user":
        return "user";
      default:
        return "document";
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成";
      case "pending":
        return "进行中";
      case "failed":
        return "失败";
      default:
        return status;
    }
  };

  // 获取类型文本
  const getTypeText = (type: string) => {
    switch (type) {
      case "sales":
        return "销售";
      case "analytics":
        return "分析";
      case "user":
        return "用户";
      default:
        return type;
    }
  };

  // 根据输入内容从真实数据中筛选匹配的报表
  const getMatchingOptions = () => {
    if (!inputValue.trim()) {
      // 如果没有输入，显示最近的几个报表作为建议
      return data.slice(0, 5).map((item) => ({
        id: item.id,
        label: item.title,
        iconName: getTypeIcon(item.type),
        type: "report" as const,
        status: item.status,
        date: item.date,
        reportType: item.type,
      }));
    }

    const query = inputValue.toLowerCase();
    const matchingReports = data
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          getTypeText(item.type).toLowerCase().includes(query) ||
          getStatusText(item.status).toLowerCase().includes(query),
      )
      .map((item) => ({
        id: item.id,
        label: item.title,
        iconName: getTypeIcon(item.type),
        type: "report" as const,
        status: item.status,
        date: item.date,
        reportType: item.type,
      }));

    return matchingReports;
  };

  const matchingOptions = getMatchingOptions();

  const handleOptionSelect = async (optionId: string, optionLabel?: string) => {
    if (optionId === "ai") {
      // 开始思考状态
      setIsThinking(true);
      setIsOpen(false);

      console.log("开始 AI 思考状态，isThinking:", true);

      try {
        // 确保至少显示 1 秒的思考状态
        await Promise.all([
          onAISearch(inputValue),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
      } catch (error) {
        console.error("AI搜索失败:", error);
      } finally {
        // 恢复用户输入
        console.log("结束 AI 思考状态，isThinking:", false);
        setIsThinking(false);
      }
    } else {
      // 对于报表选项，使用报表标题进行搜索
      const searchTerm = optionLabel || inputValue;
      setInputValue(searchTerm);
      onChange(searchTerm);
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsOpen(true);
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  return (
    <view className="smart-search-container">
      <view className="search-input-wrapper">
        <input
          className={`smart-search-input ${isThinking ? "disabled" : ""}`}
          placeholder={isThinking ? "" : "搜索报表..."}
          value={isThinking ? "Thinking..." : inputValue}
          bindinput={(e: { detail: { value: string } }) => {
            if (!isThinking) {
              handleInputChange(e.detail.value);
            }
          }}
          bindfocus={() => {
            if (!isThinking) {
              handleInputFocus();
            }
          }}
        />

        <view className="search-action">
          {isThinking ? (
            <Icon name="thinking" size={20} className="thinking-icon" />
          ) : (
            <Icon name="search" size={20} className="search-icon" />
          )}
        </view>
      </view>

      {isOpen && (
        <>
          {/* 点击遮罩关闭搜索框 */}
          <view className="search-overlay" bindtap={handleClickOutside}></view>
          <view className="search-options-dropdown">
            {/* 显示匹配的报表选项 */}
            {matchingOptions.map((option) => (
              <view
                key={option.id}
                className="search-option"
                bindtap={() => handleOptionSelect(option.id, option.label)}
              >
                <view className="search-option-content">
                  <Icon
                    name={option.iconName}
                    size={16}
                    className="search-option-icon"
                  />
                  <view className="search-option-text">
                    <text className="search-option-label">{option.label}</text>
                    <text className="search-option-desc">
                      {getTypeText(option.reportType)} •{" "}
                      {getStatusText(option.status)} • {option.date}
                    </text>
                  </view>
                </view>
              </view>
            ))}

            {/* AI选项始终显示在最后 */}
            <view
              className="search-option"
              bindtap={() => handleOptionSelect("ai")}
            >
              <view className="search-option-content">
                <Icon name="ai" size={16} className="search-option-icon" />
                <view className="search-option-text">
                  <text className="search-option-label">Ask AI</text>
                  <text className="search-option-desc">
                    {inputValue.trim()
                      ? `"${inputValue}"`
                      : "使用AI进行智能搜索"}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </>
      )}
    </view>
  );
}

// 通用下拉选择组件
function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  showStatusDots = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; statusClass?: string }[];
  placeholder: string;
  showStatusDots?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <view className="custom-dropdown">
      <view className="dropdown-trigger" bindtap={() => setIsOpen(!isOpen)}>
        <view className="dropdown-trigger-content">
          {selectedOption && showStatusDots && selectedOption.statusClass && (
            <view className={`status-dot ${selectedOption.statusClass}`}></view>
          )}
          <text className="dropdown-text">
            {selectedOption ? selectedOption.label : placeholder}
          </text>
        </view>
        <Icon
          name={isOpen ? "dropup" : "dropdown"}
          size={16}
          className="dropdown-arrow"
        />
      </view>

      {isOpen && (
        <>
          {/* 点击遮罩关闭下拉框 */}
          <view
            className="dropdown-overlay"
            bindtap={handleClickOutside}
          ></view>
          <view className="dropdown-menu">
            {options.map((option) => (
              <view
                key={option.value}
                className={`dropdown-item ${value === option.value ? "selected" : ""}`}
                bindtap={() => handleSelect(option.value)}
              >
                <view className="dropdown-item-content">
                  {showStatusDots && option.statusClass && (
                    <view className={`status-dot ${option.statusClass}`}></view>
                  )}
                  <text className="dropdown-item-text">{option.label}</text>
                </view>
                {value === option.value && (
                  <text className="check-icon">✓</text>
                )}
              </view>
            ))}
          </view>
        </>
      )}
    </view>
  );
}

interface ReportItem {
  id: string;
  title: string;
  date: string;
  status: "completed" | "pending" | "failed";
  type: "sales" | "analytics" | "user";
}

const mockData: ReportItem[] = [
  {
    id: "1",
    title: "销售报表 Q4",
    date: "2024-12-15",
    status: "completed",
    type: "sales",
  },
  {
    id: "2",
    title: "用户行为分析",
    date: "2024-12-14",
    status: "pending",
    type: "analytics",
  },
  {
    id: "3",
    title: "用户增长报告",
    date: "2024-12-13",
    status: "completed",
    type: "user",
  },
  {
    id: "4",
    title: "产品销售趋势",
    date: "2024-12-12",
    status: "failed",
    type: "sales",
  },
  {
    id: "5",
    title: "流量分析报告",
    date: "2024-12-11",
    status: "completed",
    type: "analytics",
  },
  {
    id: "6",
    title: "用户增长报告",
    date: "2024-12-10",
    status: "completed",
    type: "user",
  },
  {
    id: "7",
    title: "7用户增长报告",
    date: "2024-12-10",
    status: "completed",
    type: "user",
  },
  {
    id: "8",
    title: "8用户增长报告",
    date: "2024-12-10",
    status: "completed",
    type: "user",
  },
  {
    id: "9",
    title: "9用户增长报告",
    date: "2024-12-10",
    status: "completed",
    type: "user",
  },
  {
    id: "10",
    title: "8月销售报表",
    date: "2025-08-15",
    status: "completed",
    type: "sales",
  },
  {
    id: "11",
    title: "8月用户分析",
    date: "2025-08-20",
    status: "pending",
    type: "analytics",
  },
  {
    id: "12",
    title: "8月底总结",
    date: "2025-08-30",
    status: "completed",
    type: "user",
  },
];

export function ReportsPage(props: { onBack?: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // AI 搜索处理函数
  const handleAISearch = async (query: string): Promise<void> => {
    try {
      console.log("AI搜索查询:", query);

      // 调用 AI 服务（验证已在服务内部处理）
      const aiResult: AISearchResponse = await aiSearchService.searchToFilters({
        query,
      });

      // 将 AI 结果应用到现有筛选器
      // 1) searchTerm：若提供则设置，否则清空
      setSearchTerm(aiResult.searchTerm ?? "");

      // 2) status：若提供则设置，否则清空
      setStatusFilter(aiResult.status ?? "");

      // 3) type：若提供则设置，否则清空
      setTypeFilter(aiResult.type ?? "");

      // 4) dateRange：若提供则设置，否则清空
      if (
        aiResult.dateRange &&
        aiResult.dateRange.start &&
        aiResult.dateRange.end
      ) {
        setDateFilter(
          `${aiResult.dateRange.start} ~ ${aiResult.dateRange.end}`,
        );
      } else {
        setDateFilter("");
      }
    } catch (error) {
      console.error("AI搜索失败:", error);
      throw error;
    }
  };

  const filteredData = mockData.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // 处理日期范围筛选
    let matchesDate = true;
    if (dateFilter?.includes(" ~ ")) {
      const [startDateStr, endDateStr] = dateFilter.split(" ~ ");
      const itemDate = new Date(item.date);
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      matchesDate = itemDate >= startDate && itemDate <= endDate;
    }

    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesType = !typeFilter || item.type === typeFilter;

    return matchesSearch && matchesDate && matchesStatus && matchesType;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "status-success";
      case "pending":
        return "status-warning";
      case "failed":
        return "status-danger";
      default:
        return "status-info";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成";
      case "pending":
        return "进行中";
      case "failed":
        return "失败";
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "sales":
        return "销售";
      case "analytics":
        return "分析";
      case "user":
        return "用户";
      default:
        return type;
    }
  };

  return (
    <view className="reports-page">
      {/* 顶部导航栏 */}
      <view className="reports-header">
        <view className="back-button" bindtap={props.onBack}>
          <Icon name="back" size={16} className="back-icon" />
          <text>返回</text>
        </view>
      </view>

      {/* 内容区域 */}
      <view className="reports-content">
        {/* 智能搜索框 */}
        <SmartSearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          onAISearch={handleAISearch}
          data={mockData}
        />

        {/* 筛选项 */}
        <view className="filters-container">
          <view className="filter-group">
            <DatePicker value={dateFilter} onChange={setDateFilter} />
          </view>

          <view className="filter-group">
            <Dropdown
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="选择状态"
              showStatusDots={true}
              options={[
                { value: "", label: "全部状态" },
                {
                  value: "completed",
                  label: "已完成",
                  statusClass: "status-success",
                },
                {
                  value: "pending",
                  label: "进行中",
                  statusClass: "status-warning",
                },
                {
                  value: "failed",
                  label: "失败",
                  statusClass: "status-danger",
                },
              ]}
            />
          </view>

          <view className="filter-group">
            <Dropdown
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="选择类型"
              options={[
                { value: "", label: "全部类型" },
                { value: "sales", label: "销售" },
                { value: "analytics", label: "分析" },
                { value: "user", label: "用户" },
              ]}
            />
          </view>
        </view>

        {/* 表格 */}
        <view className="table-container">
          <scroll-view
            className="table-scroll-vertical"
            scroll-orientation="vertical"
            scroll-bar-enable={true}
          >
            <scroll-view
              className="table-scroll-horizontal"
              scroll-orientation="horizontal"
              scroll-bar-enable={true}
            >
              <view className="table-content">
                <view className="table-header">
                  <text className="table-cell header-cell">报表名称</text>
                  <text className="table-cell header-cell">日期</text>
                  <text className="table-cell header-cell">状态</text>
                  <text className="table-cell header-cell">类型</text>
                </view>

                <view className="table-body">
                  {filteredData.map((item: ReportItem) => (
                    <view key={item.id} className="table-row">
                      <text className="table-cell">{item.title}</text>
                      <text className="table-cell">{item.date}</text>
                      <view className="table-cell">
                        <view
                          className={`status-badge ${getStatusClass(item.status)}`}
                        >
                          <view className="status-dot"></view>
                          <text className="status-text">
                            {getStatusText(item.status)}
                          </text>
                        </view>
                      </view>
                      <text className="table-cell">
                        {getTypeText(item.type)}
                      </text>
                    </view>
                  ))}
                </view>
              </view>
            </scroll-view>
          </scroll-view>
        </view>
      </view>
    </view>
  );
}
