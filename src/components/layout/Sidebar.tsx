import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BotMessageSquare,
  CalendarClock,
  CarFront,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import logoImg from "../../assets/logo.png";

const links = [
  {
    to: "/assistant",
    label: "VehicleGPT",
    icon: BotMessageSquare,
    badge: "AI",
    highlight: true,
  },
  { to: "/my-vehicle", label: "My Vehicle", icon: CarFront },
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/events", label: "Events", icon: CalendarClock },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col border-r border-zinc-800/80 bg-[#0e1015] transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* Brand Header & Top-Right Toggle */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-2.5 border-b border-zinc-800/80 px-2 py-3.5">
          <img
            src={logoImg}
            alt="VehicleGPT"
            className="h-8 w-8 shrink-0 rounded-lg object-contain shadow-sm shadow-orange-500/20"
          />
          <button
            type="button"
            onClick={onToggle}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="group flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/90 bg-zinc-900/90 text-zinc-400 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 active:scale-95"
          >
            <PanelLeftOpen className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-3.5 py-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={logoImg}
              alt="VehicleGPT"
              className="h-8 w-8 shrink-0 rounded-lg object-contain shadow-sm shadow-orange-500/20"
            />
            <span className="truncate text-base font-bold uppercase tracking-wide text-white">
              Vehicle<span className="text-orange-500">GPT</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onToggle}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800/90 bg-zinc-900/90 text-zinc-400 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 active:scale-95"
          >
            <PanelLeftClose className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        </div>
      )}

      {/* Nav links */}
      <nav className="mt-3 flex flex-1 flex-col gap-1.5 px-2">
        {links.map(({ to, label, icon: Icon, ...item }) => {
          const isHighlight = "highlight" in item && item.highlight;
          const badge = "badge" in item ? item.badge : null;

          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center rounded-lg transition-all ${
                  collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
                } text-sm font-semibold ${
                  isActive
                    ? isHighlight
                      ? "border border-orange-500/40 bg-orange-500/15 text-orange-400 shadow-[0_0_14px_rgba(245,124,32,0.15)]"
                      : "bg-orange-500/10 text-orange-400"
                    : isHighlight
                    ? "text-zinc-300 hover:bg-zinc-800/80 hover:text-orange-300"
                    : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative shrink-0">
                    <Icon className="h-5 w-5" />
                    {isHighlight && !isActive && (
                      <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-orange-400 animate-pulse" />
                    )}
                  </div>
                  {!collapsed && (
                    <span className="truncate flex-1">{label}</span>
                  )}
                  {!collapsed && badge && (
                    <span className="ml-auto rounded border border-orange-500/30 bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                      {badge}
                    </span>
                  )}
                  {/* Tooltip on collapsed */}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-100 shadow-xl group-hover:block z-50">
                      {label} {badge && `(${badge})`}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-zinc-800/80 px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
          © {new Date().getFullYear()} VehicleGPT
        </div>
      )}
    </aside>
  );
}
