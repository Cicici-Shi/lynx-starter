import { useState, useEffect } from "@lynx-js/react";
import { Icon } from "./Icon.tsx";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 解析外部传入的日期范围值
  const parseValueToDate = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  // 当外部 value 改变时，更新内部状态
  useEffect(() => {
    if (value && value.includes(" ~ ")) {
      const [startStr, endStr] = value.split(" ~ ");
      const parsedStart = parseValueToDate(startStr);
      const parsedEnd = parseValueToDate(endStr);

      if (parsedStart && parsedEnd) {
        setStartDate(parsedStart);
        setEndDate(parsedEnd);
        // 设置当前月份为开始日期的月份
        setCurrentMonth(
          new Date(parsedStart.getFullYear(), parsedStart.getMonth(), 1),
        );
      }
    } else if (!value) {
      // 如果 value 为空，清除选择
      setStartDate(null);
      setEndDate(null);
    }
  }, [value]);

  // 生成指定月份的日历数据
  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // 获取当月第一天是星期几 (0=周日, 1=周一, ...)
    const firstDay = new Date(year, month, 1).getDay();
    // 获取当月总天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // 获取上个月的天数
    const prevMonthDays = new Date(year, month, 0).getDate();

    const calendar = [];

    // 添加上个月的日期（灰色显示）
    for (let i = firstDay - 1; i >= 0; i--) {
      calendar.push({
        day: prevMonthDays - i,
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isNextMonth: false,
      });
    }

    // 添加当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push({
        day,
        date: new Date(year, month, day),
        isCurrentMonth: true,
        isNextMonth: false,
      });
    }

    // 添加下个月的日期（灰色显示）
    const remainingCells = 42 - calendar.length; // 6行 x 7列 = 42个格子
    for (let day = 1; day <= remainingCells; day++) {
      calendar.push({
        day,
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isNextMonth: true,
      });
    }

    return calendar;
  };

  const handleDateSelect = (selectedDate: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;

    if (!startDate || (startDate && endDate)) {
      // 开始新的选择
      setStartDate(selectedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // 选择结束日期
      if (selectedDate >= startDate) {
        setEndDate(selectedDate);
        const rangeStr = `${formatDate(startDate)} ~ ${formatDate(selectedDate)}`;
        onChange(rangeStr);
        setIsOpen(false);
      } else {
        // 如果选择的日期小于开始日期，重新开始
        setStartDate(selectedDate);
        setEndDate(null);
      }
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onChange("");
    setIsOpen(false);
  };

  const isDateInRange = (date: Date) => {
    if (!startDate) return false;
    if (!endDate) return isSameDay(date, startDate);
    return date >= startDate && date <= endDate;
  };

  const isDateRangeStart = (date: Date) => {
    return startDate && isSameDay(date, startDate);
  };

  const isDateRangeEnd = (date: Date) => {
    return endDate && isSameDay(date, endDate);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getMonthYearString = (date: Date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const calendar = generateCalendar(currentMonth);
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <view className="custom-date-picker">
      <view className="date-picker-trigger">
        <view className="date-picker-main" bindtap={() => setIsOpen(!isOpen)}>
          <Icon name="calendar" size={16} className="date-picker-icon" />
          <text className="date-picker-text">
            {value ? `${value}` : "Select Date Range"}
          </text>
        </view>
        {value && (
          <view className="date-picker-clear" bindtap={handleClear}>
            <Icon name="close" size={14} className="clear-icon" />
          </view>
        )}
      </view>

      {isOpen && (
        <>
          {/* 点击遮罩关闭日期选择器 */}
          <view
            className="date-picker-overlay"
            bindtap={handleClickOutside}
          ></view>
          <view className="date-picker-dropdown">
            {/* 月份导航 */}
            <view className="calendar-header">
              <text className="nav-arrow" bindtap={() => navigateMonth("prev")}>
                ‹
              </text>
              <text className="current-month">
                {getMonthYearString(currentMonth)}
              </text>
              <text className="nav-arrow" bindtap={() => navigateMonth("next")}>
                ›
              </text>
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
              {calendar.map((dateItem, index) => (
                <text
                  key={`${dateItem.date.getTime()}-${index}`}
                  className={`calendar-day ${
                    !dateItem.isCurrentMonth ? "other-month" : ""
                  } ${
                    dateItem.isCurrentMonth && isDateInRange(dateItem.date)
                      ? "in-range"
                      : ""
                  } ${
                    dateItem.isCurrentMonth && isDateRangeStart(dateItem.date)
                      ? "range-start"
                      : ""
                  } ${
                    dateItem.isCurrentMonth && isDateRangeEnd(dateItem.date)
                      ? "range-end"
                      : ""
                  }`}
                  bindtap={() =>
                    handleDateSelect(dateItem.date, dateItem.isCurrentMonth)
                  }
                >
                  {dateItem.day}
                </text>
              ))}
            </view>
          </view>
        </>
      )}
    </view>
  );
}
