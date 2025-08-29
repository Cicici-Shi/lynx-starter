import "@lynx-js/preact-devtools";
import "@lynx-js/react/debug";
import { root } from "@lynx-js/react";
import { useState } from "@lynx-js/react";

import { App } from "./App.js";
import { ReportsPage } from "./pages/ReportsPage.js";

function AppRouter() {
  const [currentPage, setCurrentPage] = useState<"home" | "reports">("home");

  if (currentPage === "reports") {
    return <ReportsPage onBack={() => setCurrentPage("home")} />;
  }

  return <App onNavigateToReports={() => setCurrentPage("reports")} />;
}

root.render(<AppRouter />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
