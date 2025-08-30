import "@lynx-js/preact-devtools";
import "@lynx-js/react/debug";
import { root, useState } from "@lynx-js/react";

import { LivestreamChatbotPage } from "./pages/LivestreamChatbotPage.js";
import { ReportsPage } from "./pages/ReportsPage.js";

function AppRouter() {
  const [currentPage, setCurrentPage] = useState<"chatbot" | "reports">(
    "chatbot",
  );

  if (currentPage === "reports") {
    return <ReportsPage onBack={() => setCurrentPage("chatbot")} />;
  }

  return (
    <LivestreamChatbotPage
      onNavigateToReports={() => setCurrentPage("reports")}
    />
  );
}

root.render(<AppRouter />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
