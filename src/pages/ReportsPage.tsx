import { useState } from "@lynx-js/react";
import { aiSearchService } from "../services/aiService.ts";
import {
  type AISearchResult,
  validateAISearchResult,
} from "../utils/validation.ts";
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
        return "💰";
      case "analytics":
        return "📊";
      case "user":
        return "👥";
      default:
        return "📄";
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
        icon: getTypeIcon(item.type),
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
        icon: getTypeIcon(item.type),
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
      setIsThinking(true);
      try {
        await onAISearch(inputValue);
      } catch (error) {
        console.error("AI搜索失败:", error);
      } finally {
        setIsThinking(false);
      }
    } else {
      // 对于报表选项，使用报表标题进行搜索
      const searchTerm = optionLabel || inputValue;
      setInputValue(searchTerm);
      onChange(searchTerm);
    }
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsOpen(true);
  };

  return (
    <view className="smart-search-container">
      <view className="search-input-wrapper">
        <input
          className="smart-search-input"
          placeholder="搜索报表..."
          value={inputValue}
          bindinput={(e: { detail: { value: string } }) =>
            handleInputChange(e.detail.value)
          }
          bindfocus={handleInputFocus}
        />

        <view className="search-action">
          {isThinking ? (
            <text className="thinking-icon">🤔</text>
          ) : (
            <text className="search-icon">🔍</text>
          )}
        </view>
      </view>

      {isOpen && (
        <view className="search-options-dropdown">
          {/* 显示匹配的报表选项 */}
          {matchingOptions.map((option) => (
            <view
              key={option.id}
              className="search-option"
              bindtap={() => handleOptionSelect(option.id, option.label)}
            >
              <view className="search-option-content">
                <text className="search-option-icon">{option.icon}</text>
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
              <text className="search-option-icon">⭐</text>
              <view className="search-option-text">
                <text className="search-option-label">Ask AI</text>
                <text className="search-option-desc">
                  {inputValue.trim() ? `"${inputValue}"` : "使用AI进行智能搜索"}
                </text>
              </view>
            </view>
          </view>
        </view>
      )}

      {isThinking && (
        <view className="thinking-overlay">
          <text className="thinking-text">AI正在理解您的需求...</text>
        </view>
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
        <text className="dropdown-arrow">{isOpen ? "▲" : "▼"}</text>
      </view>

      {isOpen && (
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
              {value === option.value && <text className="check-icon">✓</text>}
            </view>
          ))}
        </view>
      )}
    </view>
  );
}

// 日期选择器组件
function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);

  // 生成2025年8月的日历数据
  const generateCalendar = () => {
    const year = 2025;
    const month = 8; // 8月

    // 获取当月第一天是星期几 (0=周日, 1=周一, ...)
    const firstDay = new Date(year, month - 1, 1).getDay();
    // 获取当月总天数
    const daysInMonth = new Date(year, month, 0).getDate();
    // 获取上个月的天数
    const prevMonthDays = new Date(year, month - 1, 0).getDate();

    const calendar = [];

    // 添加上个月的日期（灰色显示）
    for (let i = firstDay - 1; i >= 0; i--) {
      calendar.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isNextMonth: false,
      });
    }

    // 添加当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false,
      });
    }

    // 添加下个月的日期（灰色显示）
    const remainingCells = 42 - calendar.length; // 6行 x 7列 = 42个格子
    for (let day = 1; day <= remainingCells; day++) {
      calendar.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true,
      });
    }

    return calendar;
  };

  const handleDateSelect = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;

    if (!startDate || (startDate && endDate)) {
      // 开始新的选择
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // 选择结束日期
      if (day >= startDate) {
        setEndDate(day);
        const rangeStr = `2025-08-${startDate.toString().padStart(2, "0")} ~ 2025-08-${day.toString().padStart(2, "0")}`;
        onChange(rangeStr);
        setIsOpen(false);
      } else {
        // 如果选择的日期小于开始日期，重新开始
        setStartDate(day);
        setEndDate(null);
      }
    }
  };

  const isDateInRange = (day: number) => {
    if (!startDate) return false;
    if (!endDate) return day === startDate;
    return day >= startDate && day <= endDate;
  };

  const isDateRangeStart = (day: number) => {
    return startDate === day;
  };

  const isDateRangeEnd = (day: number) => {
    return endDate === day;
  };

  const calendar = generateCalendar();
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <view className="custom-date-picker">
      <view className="date-picker-trigger" bindtap={() => setIsOpen(!isOpen)}>
        <text className="date-picker-icon">📅</text>
        <text className="date-picker-text">
          {value ? `${value}` : "Select Date Range"}
        </text>
      </view>

      {isOpen && (
        <view className="date-picker-dropdown">
          {/* 月份导航 */}
          <view className="calendar-header">
            <text className="nav-arrow">‹</text>
            <text className="current-month">August 2025</text>
            <text className="nav-arrow">›</text>
          </view>

          {/* 星期标题 */}
          <view className="weekdays">
            {weekDays.map((day) => (
              <text key={day} className="weekday">
                {day}
              </text>
            ))}
          </view>

          {/* 日期网格 */}
          <view className="calendar-grid">
            {calendar.map((date, index) => (
              <text
                key={`${date.isCurrentMonth ? "current" : date.isNextMonth ? "next" : "prev"}-${date.day}-${index}`}
                className={`calendar-day ${
                  !date.isCurrentMonth ? "other-month" : ""
                } ${
                  date.isCurrentMonth && isDateInRange(date.day)
                    ? "in-range"
                    : ""
                } ${
                  date.isCurrentMonth && isDateRangeStart(date.day)
                    ? "range-start"
                    : ""
                } ${
                  date.isCurrentMonth && isDateRangeEnd(date.day)
                    ? "range-end"
                    : ""
                }`}
                bindtap={() => handleDateSelect(date.day, date.isCurrentMonth)}
              >
                {date.day}
              </text>
            ))}
          </view>
        </view>
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

      // 调用 AI 服务
      const aiResult = await aiSearchService.searchToFilters({ query });

      // 验证 AI 返回的结果
      const validatedResult: AISearchResult = validateAISearchResult(aiResult);

      // 将 AI 结果应用到现有筛选器
      if (validatedResult.searchTerm) {
        setSearchTerm(validatedResult.searchTerm);
      }
      if (validatedResult.status) {
        setStatusFilter(validatedResult.status);
      }
      if (validatedResult.type) {
        setTypeFilter(validatedResult.type);
      }
      if (validatedResult.dateRange) {
        setDateFilter(
          `${validatedResult.dateRange.start} ~ ${validatedResult.dateRange.end}`,
        );
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
        <text className="back-button" bindtap={props.onBack}>
          ← 返回
        </text>
        <text className="reports-title">Lynx</text>
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
                  {filteredData.map((item) => (
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
