import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface pb-[60px] md:pb-0">
      <header className="bg-card border-b border-border-light sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-[50px] flex items-center justify-between">
          <div className="flex items-center gap-[9px]">
            <div className="w-[30px] h-[30px] rounded-[9px] bg-brand-bg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="14" rx="2.5" />
                <line x1="4" y1="10" x2="20" y2="10" />
                <circle cx="8.5" cy="20" r="1.2" fill="#D97706" stroke="none" />
                <circle cx="15.5" cy="20" r="1.2" fill="#D97706" stroke="none" />
              </svg>
            </div>
            <span className="font-extrabold text-[17px] tracking-[.06em] text-heading">CINK</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-tertiary hidden sm:inline">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="text-placeholder hover:text-secondary transition-colors"
              title="Odhlásit se"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
