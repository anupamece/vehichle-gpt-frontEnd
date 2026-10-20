import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  BotMessageSquare,
  CalendarClock,
  CarFront,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import logoImg from "../../assets/logo.png";

const links = [
  { to: "/assistant", label: "VehicleGPT", icon: BotMessageSquare, badge: "AI" },
  { to: "/my-vehicle", label: "My Vehicle", icon: CarFront },
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/events", label: "Events", icon: CalendarClock },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

function pageName(pathname: string): string {
  const map: Record<string, string> = {
    "/assistant": "VehicleGPT Assistant",
    "/my-vehicle": "Vehicle Overview",
    "/": "Dashboard",
    "/events": "Events",
    "/analytics": "Analytics",
  };
  return map[pathname] ?? "VehicleGPT";
}

export default function Topbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800/80 bg-[#0e1015]/95 px-4 py-3 backdrop-blur md:px-6">
      {pathname !== "/assistant" ? (
        <h1 className="text-base font-bold uppercase tracking-wide text-white">
          {pageName(pathname)}
        </h1>
      ) : (
        <div />
      )}

      {/* Mobile hamburger */}
      <button
        type="button"
        className="md:hidden text-zinc-400"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <nav className="absolute left-0 top-full z-40 flex w-full flex-col gap-1 border-b border-zinc-800/80 bg-[#0e1015] p-3 md:hidden">
          {/* Mobile brand */}
          <div className="mb-2 flex items-center gap-2 px-3">
            <img src={logoImg} alt="" className="h-7 w-7 rounded" />
            <span className="text-sm font-bold uppercase text-white">
              Vehicle<span className="text-orange-500">GPT</span>
            </span>
          </div>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-orange-500/10 text-orange-400"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
