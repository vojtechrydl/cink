import { NavLink } from "react-router";

const tabs = [
  {
    to: "/",
    label: "Domů",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    ),
  },
  {
    to: "/katalog",
    label: "Katalog",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="8" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="20" y2="12" />
        <line x1="8" y1="18" x2="20" y2="18" />
        <circle cx="3.5" cy="6" r="1.1" />
        <circle cx="3.5" cy="12" r="1.1" />
        <circle cx="3.5" cy="18" r="1.1" />
      </svg>
    ),
  },
  {
    to: "/album",
    label: "Album",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.8" />
      </svg>
    ),
  },
  {
    to: "/statistiky",
    label: "Statistiky",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="6" y1="20" x2="6" y2="13" />
        <line x1="12" y1="20" x2="12" y2="6" />
        <line x1="18" y1="20" x2="18" y2="15" />
      </svg>
    ),
  },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 md:hidden">
      <div className="flex">
        {tabs.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-[3px] py-[9px] pb-[11px] transition-colors ${
                isActive
                  ? "text-brand"
                  : "text-placeholder"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {icon}
                <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
