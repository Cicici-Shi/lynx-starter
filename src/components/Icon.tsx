interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

// 使用 PNG 格式图标 - Icons8 免费资源
const iconMap = {
  // 类型图标
  sales: "https://img.icons8.com/material-rounded/24/000000/money-bag.png",
  analytics: "https://img.icons8.com/material-rounded/24/000000/bar-chart.png",
  user: "https://img.icons8.com/material-rounded/24/000000/user.png",
  document: "https://img.icons8.com/material-rounded/24/000000/document.png",

  // 界面图标
  search: "https://img.icons8.com/material-rounded/24/000000/search.png",
  back: "https://img.icons8.com/material-rounded/24/000000/back.png",
  dropdown:
    "https://img.icons8.com/material-rounded/24/000000/expand-arrow.png",
  dropup:
    "https://img.icons8.com/material-rounded/24/000000/collapse-arrow.png",
  calendar: "https://img.icons8.com/material-rounded/24/000000/calendar.png",
  ai: "https://img.icons8.com/material-rounded/24/000000/sparkles.png",
  thinking: "https://img.icons8.com/material-rounded/24/000000/loading.png",
};

export function Icon({ name, size = 16, className = "" }: IconProps) {
  const iconUrl = iconMap[name as keyof typeof iconMap];

  if (!iconUrl) {
    return <text className={`icon ${className}`}>?</text>;
  }

  return (
    <image
      src={iconUrl}
      className={`icon ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
}
