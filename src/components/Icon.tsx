interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

// 使用 PNG 格式图标 - Icons8 免费资源
const iconMap = {
  // 类型图标
  sales: "https://img.icons8.com/material/24/money-bag.png",
  analytics: "https://img.icons8.com/material/24/bar-chart.png",
  user: "https://img.icons8.com/material/24/user.png",
  document: "https://img.icons8.com/material/24/document.png",

  // 界面图标
  search: "https://img.icons8.com/material/24/search.png",
  back: "https://img.icons8.com/material/24/back.png",
  dropdown: "https://img.icons8.com/material/24/expand-arrow.png",
  dropup: "https://img.icons8.com/material/24/collapse-arrow.png",
  calendar: "https://img.icons8.com/material/24/calendar.png",
  close: "https://img.icons8.com/material/24/delete-sign.png",
  ai: "https://img.icons8.com/material/24/sparkles.png",
  thinking: "https://img.icons8.com/material/24/loading.png",

  // 聊天和机器人图标
  bot: "https://img.icons8.com/material/24/bot.png",
  send: "https://img.icons8.com/?size=100&id=VICAiHNPyI98&format=png&color=000000",

  // 时间和金钱图标
  clock: "https://img.icons8.com/material/24/time.png",
  money: "https://img.icons8.com/material/24/money.png",

  // 导航图标
  "arrow-right": "https://img.icons8.com/material/24/chevron-right.png",

  // 直播和状态图标
  livestream: "https://img.icons8.com/material/24/video.png",
  empty: "https://img.icons8.com/material/24/nothing-found.png",
  users: "https://img.icons8.com/material/24/groups.png",

  dashboard:
    "https://img.icons8.com/?size=100&id=TPXhNjRudwmY&format=png&color=000000",
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
