import { useState } from "@lynx-js/react";
import { DatePicker } from "../components/DatePicker.tsx";
import { Icon } from "../components/Icon.tsx";
import {
  type AISearchResponse,
  aiSearchService,
} from "../services/aiService.ts";
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
  data: LivestreamRecord[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Get icon for livestream records
  const getTypeIcon = (type: string) => {
    return "document";
  };

  // Get weekend status text
  const getWeekendText = (isWeekend: number) => {
    return isWeekend === 1 ? "Weekend" : "Weekday";
  };

  // Get duration category text
  const getDurationText = (minutes: number) => {
    if (minutes < 60) return "Short";
    if (minutes <= 90) return "Medium";
    return "Long";
  };

  // Filter livestream records based on input content
  const getMatchingOptions = () => {
    if (!inputValue.trim()) {
      // If no input, show recent streams as suggestions
      return data.slice(0, 5).map((item) => ({
        id: item.content.stream_id,
        label: `Stream ${item.content.stream_id} - ${new Date(item.timestamp).toLocaleDateString()}`,
        iconName: "document",
        type: "livestream" as const,
        status: "",
        date: new Date(item.timestamp).toLocaleDateString(),
        reportType: "livestream",
      }));
    }

    const query = inputValue.toLowerCase();
    const matchingStreams = data
      .filter(
        (item) =>
          item.content.stream_id.toLowerCase().includes(query) ||
          new Date(item.timestamp).toLocaleDateString().includes(query)
      )
      .map((item) => ({
        id: item.content.stream_id,
        label: `Stream ${item.content.stream_id} - ${new Date(item.timestamp).toLocaleDateString()}`,
        iconName: "document",
        type: "livestream" as const,
        status: "",
        date: new Date(item.timestamp).toLocaleDateString(),
        reportType: "livestream",
      }));

    return matchingStreams;
  };

  const matchingOptions = getMatchingOptions();

  const handleOptionSelect = async (optionId: string, optionLabel?: string) => {
    if (optionId === "ai") {
      // Start thinking state
      setIsThinking(true);
      setIsOpen(false);

      console.log("Start AI thinking state, isThinking:", true);

      try {
        // Ensure at least 1 second of thinking state
        await Promise.all([
          onAISearch(inputValue),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
      } catch (error) {
        console.error("AI search failed:", error);
      } finally {
        // Restore user input
        console.log("End AI thinking state, isThinking:", false);
        setTimeout(() => {
          setIsThinking(false);
        }, 1000);
      }
    } else {
      // For livestream options, use transcript for search
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
      <view className={`search-input-wrapper ${isThinking ? "thinking" : ""}`}>
        <input
          className={`smart-search-input ${isThinking ? "disabled" : ""}`}
          placeholder={isThinking ? "" : "Search livestreams..."}
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
          {/* Click overlay to close search box */}
          <view className="search-overlay" bindtap={handleClickOutside}></view>
          <view className="search-options-dropdown">
            {/* Show matching livestream options */}
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
                      Livestream • {option.date}
                    </text>
                  </view>
                </view>
              </view>
            ))}

            {/* AI option always shown at the end */}
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
                      : "Use AI for smart search"}
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
          size={20}
          className="dropdown-arrow"
        />
      </view>

      {isOpen && (
        <>
          {/* Click overlay to close dropdown */}
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

interface LivestreamRecord {
  content: {
    stream_id: string;
    keyframes: Array<{
      timestamp: number;
      image_data: string;
    }>;
    transcript: string;
    basic_metrics: {
      duration_minutes: number;
      peak_viewers: number;
      average_viewers: number;
      total_comments: number;
      total_likes: number;
    };
    interaction_metrics: {
      engagement_rate: number;
      retention_rate: number;
      total_viewers: number;
      chat_activity: number;
    };
    creator_profile: {
      historical_avg_score: number;
      follower_count: number;
      consistency_score: number;
      experience_months: number;
    };
    duration_hours: number;
    time_of_day: number;
    day_of_week: number;
    is_weekend: number;
  };
  timestamp: string;
}

const mockData: LivestreamRecord[] = [
  {
    content: {
      stream_id: "stream_2024_001",
      keyframes: [],
      transcript:
        "Welcome to my first stream of 2024! Let's start the year with some gaming content.",
      basic_metrics: {
        duration_minutes: 120,
        peak_viewers: 850,
        average_viewers: 650,
        total_comments: 2100,
        total_likes: 3200,
      },
      interaction_metrics: {
        engagement_rate: 0.72,
        retention_rate: 0.58,
        total_viewers: 1200,
        chat_activity: 0.75,
      },
      creator_profile: {
        historical_avg_score: 0.65,
        follower_count: 8000,
        consistency_score: 0.78,
        experience_months: 12,
      },
      duration_hours: 2.0,
      time_of_day: 20,
      day_of_week: 1,
      is_weekend: 0,
    },
    timestamp: "2024-01-15T20:30:00.000000",
  },
  {
    content: {
      stream_id: "stream_2024_002",
      keyframes: [],
      transcript: "Mid-year special stream! Thanks everyone for the support.",
      basic_metrics: {
        duration_minutes: 95,
        peak_viewers: 1200,
        average_viewers: 950,
        total_comments: 2800,
        total_likes: 4500,
      },
      interaction_metrics: {
        engagement_rate: 0.68,
        retention_rate: 0.62,
        total_viewers: 1800,
        chat_activity: 0.71,
      },
      creator_profile: {
        historical_avg_score: 0.67,
        follower_count: 9500,
        consistency_score: 0.81,
        experience_months: 14,
      },
      duration_hours: 1.58,
      time_of_day: 19,
      day_of_week: 5,
      is_weekend: 1,
    },
    timestamp: "2024-06-20T19:00:00.000000",
  },
  {
    content: {
      stream_id: "stream_2024_003",
      keyframes: [],
      transcript: "End of year celebration stream! Let's review 2024 together.",
      basic_metrics: {
        duration_minutes: 180,
        peak_viewers: 2000,
        average_viewers: 1600,
        total_comments: 4500,
        total_likes: 7800,
      },
      interaction_metrics: {
        engagement_rate: 0.75,
        retention_rate: 0.7,
        total_viewers: 2500,
        chat_activity: 0.82,
      },
      creator_profile: {
        historical_avg_score: 0.7,
        follower_count: 12000,
        consistency_score: 0.85,
        experience_months: 16,
      },
      duration_hours: 3.0,
      time_of_day: 21,
      day_of_week: 6,
      is_weekend: 1,
    },
    timestamp: "2024-12-31T21:00:00.000000",
  },
  {
    content: {
      stream_id: "stream_2025_001",
      keyframes: [],
      transcript:
        "Happy New Year 2025! Let's start fresh with some new content.",
      basic_metrics: {
        duration_minutes: 110,
        peak_viewers: 1800,
        average_viewers: 1400,
        total_comments: 3200,
        total_likes: 5200,
      },
      interaction_metrics: {
        engagement_rate: 0.73,
        retention_rate: 0.65,
        total_viewers: 2200,
        chat_activity: 0.78,
      },
      creator_profile: {
        historical_avg_score: 0.72,
        follower_count: 15000,
        consistency_score: 0.88,
        experience_months: 18,
      },
      duration_hours: 1.83,
      time_of_day: 20,
      day_of_week: 3,
      is_weekend: 0,
    },
    timestamp: "2025-01-01T20:00:00.000000",
  },
  {
    content: {
      stream_id: "stream_2025_002",
      keyframes: [],
      transcript: "Spring update stream! New features and improvements coming.",
      basic_metrics: {
        duration_minutes: 85,
        peak_viewers: 1600,
        average_viewers: 1200,
        total_comments: 2800,
        total_likes: 4800,
      },
      interaction_metrics: {
        engagement_rate: 0.69,
        retention_rate: 0.61,
        total_viewers: 2000,
        chat_activity: 0.74,
      },
      creator_profile: {
        historical_avg_score: 0.73,
        follower_count: 16000,
        consistency_score: 0.89,
        experience_months: 19,
      },
      duration_hours: 1.42,
      time_of_day: 19,
      day_of_week: 2,
      is_weekend: 0,
    },
    timestamp: "2025-03-15T19:30:00.000000",
  },
  {
    content: {
      stream_id: "stream_2025_003",
      keyframes: [],
      transcript: "Summer gaming marathon! 24 hours of non-stop content.",
      basic_metrics: {
        duration_minutes: 1440,
        peak_viewers: 3500,
        average_viewers: 2800,
        total_comments: 12000,
        total_likes: 25000,
      },
      interaction_metrics: {
        engagement_rate: 0.81,
        retention_rate: 0.75,
        total_viewers: 5000,
        chat_activity: 0.88,
      },
      creator_profile: {
        historical_avg_score: 0.75,
        follower_count: 18000,
        consistency_score: 0.91,
        experience_months: 20,
      },
      duration_hours: 24.0,
      time_of_day: 12,
      day_of_week: 6,
      is_weekend: 1,
    },
    timestamp: "2025-07-12T12:00:00.000000",
  },
  {
    content: {
      stream_id: "stream_2025_004",
      keyframes: [],
      transcript: "August kickoff stream! Back to regular schedule.",
      basic_metrics: {
        duration_minutes: 90,
        peak_viewers: 2200,
        average_viewers: 1800,
        total_comments: 3800,
        total_likes: 6200,
      },
      interaction_metrics: {
        engagement_rate: 0.76,
        retention_rate: 0.68,
        total_viewers: 2800,
        chat_activity: 0.79,
      },
      creator_profile: {
        historical_avg_score: 0.76,
        follower_count: 20000,
        consistency_score: 0.92,
        experience_months: 21,
      },
      duration_hours: 1.5,
      time_of_day: 20,
      day_of_week: 1,
      is_weekend: 0,
    },
    timestamp: "2025-08-01T20:00:00.000000",
  },
  {
    content: {
      stream_id: "stream_2025_005",
      keyframes: [],
      transcript: "Mid-August special! Community Q&A session.",
      basic_metrics: {
        duration_minutes: 75,
        peak_viewers: 2400,
        average_viewers: 2000,
        total_comments: 4200,
        total_likes: 6800,
      },
      interaction_metrics: {
        engagement_rate: 0.78,
        retention_rate: 0.71,
        total_viewers: 3000,
        chat_activity: 0.81,
      },
      creator_profile: {
        historical_avg_score: 0.77,
        follower_count: 22000,
        consistency_score: 0.93,
        experience_months: 21,
      },
      duration_hours: 1.25,
      time_of_day: 19,
      day_of_week: 3,
      is_weekend: 0,
    },
    timestamp: "2025-08-15T19:00:00.000000",
  },
  {
    content: {
      stream_id: "stream_2025_006",
      keyframes: [],
      transcript: "Late August gaming stream! New game release coverage.",
      basic_metrics: {
        duration_minutes: 105,
        peak_viewers: 2800,
        average_viewers: 2300,
        total_comments: 5200,
        total_likes: 8500,
      },
      interaction_metrics: {
        engagement_rate: 0.8,
        retention_rate: 0.73,
        total_viewers: 3500,
        chat_activity: 0.84,
      },
      creator_profile: {
        historical_avg_score: 0.78,
        follower_count: 24000,
        consistency_score: 0.94,
        experience_months: 22,
      },
      duration_hours: 1.75,
      time_of_day: 21,
      day_of_week: 5,
      is_weekend: 1,
    },
    timestamp: "2025-08-25T21:00:00.000000",
  },
  {
    content: {
      stream_id: "stream_2025_007",
      keyframes: [],
      transcript: "End of August finale! Month wrap-up and next month preview.",
      basic_metrics: {
        duration_minutes: 120,
        peak_viewers: 3200,
        average_viewers: 2600,
        total_comments: 6500,
        total_likes: 10000,
      },
      interaction_metrics: {
        engagement_rate: 0.82,
        retention_rate: 0.76,
        total_viewers: 4000,
        chat_activity: 0.86,
      },
      creator_profile: {
        historical_avg_score: 0.79,
        follower_count: 26000,
        consistency_score: 0.95,
        experience_months: 22,
      },
      duration_hours: 2.0,
      time_of_day: 20,
      day_of_week: 6,
      is_weekend: 1,
    },
    timestamp: "2025-08-30T20:00:00.000000",
  },
];

export function ReportsPage(props: { onBack?: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // AI search handler function
  const handleAISearch = async (query: string): Promise<void> => {
    try {
      console.log("AI search query:", query);

      // Call AI service (validation handled internally)
      const aiResult: AISearchResponse = await aiSearchService.searchToFilters({
        query,
      });

      // Apply AI results to existing filters
      // 1) searchTerm: set if provided, otherwise clear
      setSearchTerm(aiResult.searchTerm ?? "");

      // 2) weekend: set if provided, otherwise clear
      setStatusFilter(aiResult.weekend ?? "");

      // 3) duration: set if provided, otherwise clear
      setTypeFilter(aiResult.duration ?? "");

      // 4) dateRange: set if provided, otherwise clear
      if (
        aiResult.dateRange &&
        aiResult.dateRange.start &&
        aiResult.dateRange.end
      ) {
        setDateFilter(
          `${aiResult.dateRange.start} ~ ${aiResult.dateRange.end}`
        );
      } else {
        setDateFilter("");
      }
    } catch (error) {
      console.error("AI search failed:", error);
      throw error;
    }
  };

  const filteredData = mockData.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.content.stream_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(item.timestamp).toLocaleDateString().includes(searchTerm);

    // Handle date range filtering
    let matchesDate = true;
    if (dateFilter?.includes(" ~ ")) {
      const [startDateStr, endDateStr] = dateFilter.split(" ~ ");
      const itemDate = new Date(item.timestamp);
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      matchesDate = itemDate >= startDate && itemDate <= endDate;
    }

    // Filter by weekend/weekday
    let matchesWeekend = true;
    if (statusFilter === "weekend") {
      matchesWeekend = item.content.is_weekend === 1;
    } else if (statusFilter === "weekday") {
      matchesWeekend = item.content.is_weekend === 0;
    }

    // Filter by duration
    let matchesDuration = true;
    if (typeFilter === "short") {
      matchesDuration = item.content.basic_metrics.duration_minutes < 60;
    } else if (typeFilter === "medium") {
      matchesDuration =
        item.content.basic_metrics.duration_minutes >= 60 &&
        item.content.basic_metrics.duration_minutes <= 90;
    } else if (typeFilter === "long") {
      matchesDuration = item.content.basic_metrics.duration_minutes > 90;
    }

    return matchesSearch && matchesDate && matchesWeekend && matchesDuration;
  });

  // Helper function to format engagement and retention rates
  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1) + "%";
  };

  return (
    <view className="reports-page">
      {/* Top navigation bar */}
      <view className="reports-header">
        <view className="back-button" bindtap={props.onBack}>
          <Icon name="back" size={24} className="back-icon" />
          <text>Back</text>
        </view>
      </view>

      {/* Content area */}
      <view className="reports-content">
        {/* Smart search box */}
        <SmartSearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          onAISearch={handleAISearch}
          data={mockData}
        />

        {/* Filter options */}
        <view className="filters-container">
          <view className="filter-group">
            <DatePicker value={dateFilter} onChange={setDateFilter} />
          </view>

          <view className="filter-group">
            <Dropdown
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by Weekend"
              showStatusDots={false}
              options={[
                { value: "", label: "All Streams" },
                { value: "weekend", label: "Weekend Streams" },
                { value: "weekday", label: "Weekday Streams" },
              ]}
            />
          </view>

          <view className="filter-group">
            <Dropdown
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Filter by Duration"
              options={[
                { value: "", label: "All Durations" },
                { value: "short", label: "Short (< 60 min)" },
                { value: "medium", label: "Medium (60-90 min)" },
                { value: "long", label: "Long (> 90 min)" },
              ]}
            />
          </view>
        </view>

        {/* Table */}
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
                  <text className="table-cell header-cell">Date</text>
                  <text className="table-cell header-cell">Time</text>
                  <text className="table-cell header-cell">Duration (min)</text>
                  <text className="table-cell header-cell">Peak Viewers</text>
                  <text className="table-cell header-cell">Avg Viewers</text>
                  <text className="table-cell header-cell">Total Viewers</text>
                  <text className="table-cell header-cell">Comments</text>
                  <text className="table-cell header-cell">Likes</text>
                  <text className="table-cell header-cell">
                    Engagement Rate
                  </text>
                  <text className="table-cell header-cell">Retention Rate</text>
                  <text className="table-cell header-cell">Chat Activity</text>
                  <text className="table-cell header-cell">Weekend</text>
                  <text className="table-cell header-cell">Followers</text>
                </view>

                <view className="table-body">
                  {filteredData.map((item: LivestreamRecord) => {
                    const streamDate = new Date(item.timestamp);
                    const isWeekend =
                      item.content.is_weekend === 1 ? "Yes" : "No";

                    return (
                      <view key={item.content.stream_id} className="table-row">
                        <text className="table-cell">
                          {streamDate.toLocaleDateString()}
                        </text>
                        <text className="table-cell">
                          {streamDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </text>
                        <text className="table-cell">
                          {item.content.basic_metrics.duration_minutes}
                        </text>
                        <text className="table-cell">
                          {item.content.basic_metrics.peak_viewers.toLocaleString()}
                        </text>
                        <text className="table-cell">
                          {item.content.basic_metrics.average_viewers.toLocaleString()}
                        </text>
                        <text className="table-cell">
                          {item.content.interaction_metrics.total_viewers.toLocaleString()}
                        </text>
                        <text className="table-cell">
                          {item.content.basic_metrics.total_comments.toLocaleString()}
                        </text>
                        <text className="table-cell">
                          {item.content.basic_metrics.total_likes.toLocaleString()}
                        </text>
                        <text className="table-cell">
                          {(
                            item.content.interaction_metrics.engagement_rate *
                            100
                          ).toFixed(1)}
                          %
                        </text>
                        <text className="table-cell">
                          {(
                            item.content.interaction_metrics.retention_rate *
                            100
                          ).toFixed(1)}
                          %
                        </text>
                        <text className="table-cell">
                          {(
                            item.content.interaction_metrics.chat_activity * 100
                          ).toFixed(1)}
                          %
                        </text>
                        <text className="table-cell">{isWeekend}</text>
                        <text className="table-cell">
                          {item.content.creator_profile.follower_count.toLocaleString()}
                        </text>
                      </view>
                    );
                  })}
                </view>
              </view>
            </scroll-view>
          </scroll-view>
        </view>
      </view>
    </view>
  );
}
