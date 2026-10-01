import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  BarChart3,
  Sparkles,
  Settings,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import { NavigationRoute } from '../../types/finance';
import { NovaLogo } from './NovaLogo';
import { UI_COPY } from '../../data/copy';

interface SidebarProps {
  currentRoute: NavigationRoute;
  onNavigate: (route: NavigationRoute) => void;
  onOpenAddModal: () => void;
}

interface NavItem {
  id: NavigationRoute;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: UI_COPY.nav.dashboard, icon: LayoutDashboard },
  { id: 'transactions', label: UI_COPY.nav.transactions, icon: ArrowLeftRight },
  { id: 'budgets', label: UI_COPY.nav.budgets, icon: PieChart },
  { id: 'goals', label: UI_COPY.nav.goals, icon: Target },
  { id: 'analytics', label: UI_COPY.nav.analytics, icon: BarChart3 },
  { id: 'insights', label: UI_COPY.nav.insights, icon: Sparkles, badge: UI_COPY.nav.newBadge },
  { id: 'settings', label: UI_COPY.nav.settings, icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  onOpenAddModal,
}) => {
  return (
    <aside
      className="hidden md:flex flex-col w-64 bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)] text-[var(--color-text-secondary)] h-screen sticky top-0 shrink-0 select-none z-30 transition-colors"
      aria-label="Navegación Principal"
    >
      {/* Brand Header */}
      <div className="h-18 px-6 flex items-center border-b border-[var(--color-border)]">
        <NovaLogo size="md" showSubtitle={true} />
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-5 pb-3">
        <button
          onClick={onOpenAddModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-sm font-semibold rounded-lg transition-all duration-150 shadow-sm shadow-teal-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          type="button"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{UI_COPY.actions.addTransaction}</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-xs font-semibold text-[var(--color-text-muted)]">
          {UI_COPY.nav.platform}
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-teal-500/10 text-[var(--color-accent)] font-semibold shadow-xs border border-teal-500/20'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
              }`}
              type="button"
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 stroke-[2] transition-colors ${
                    isActive
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Security & Client-Side Isolation Notice */}
      <div className="p-3.5 mx-3 mb-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] transition-colors">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)] mb-1">
          <ShieldCheck className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0 stroke-[2]" />
          <span>{UI_COPY.brand.privateWorkspace}</span>
        </div>
        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
          {UI_COPY.brand.privateNotice}
        </p>
      </div>

      {/* User profile footer */}
      <div className="px-4 py-3 border-t border-[var(--color-border)] flex items-center gap-3 transition-colors">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center text-xs font-bold shadow-xs">
          NM
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-[var(--color-text)] truncate">
            Nicolás Moreno
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)] truncate font-medium">
            Plan Personal
          </span>
        </div>
      </div>
    </aside>
  );
};

