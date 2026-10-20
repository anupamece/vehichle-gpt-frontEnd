import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isAssistant = location.pathname === "/assistant";

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0c10] text-zinc-200">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {!isAssistant ? (
          <Topbar />
        ) : (
          <div className="md:hidden">
            <Topbar />
          </div>
        )}
        <main
          className={`flex-1 ${
            isAssistant ? "overflow-hidden p-0" : "overflow-y-auto p-4 md:p-6"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
