import React, { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  BarChart3,
  Sparkles,
  Settings,
  Plus,
  MoreHorizontal,
  X,
  LogOut,
} from 'lucide-react';
import { NavigationRoute } from '../../types/finance';
import { UI_COPY } from '../../data/copy';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  currentRoute: NavigationRoute;
  onNavigate: (route: NavigationRoute) => void;
  onOpenAddModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenAddModal,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { usuario, perfil, cerrarSesion, obtenerIniciales } = useAuth();

  const nombreUsuario = perfil?.nombre || usuario?.displayName || UI_COPY.brand.userTitle || 'Usuario';
  const emailUsuario = perfil?.email || usuario?.email || '';
  const iniciales = obtenerIniciales();

  const handleSelectRoute = (route: NavigationRoute) => {
    onNavigate(route);
    setShowMoreMenu(false);
  };

  const isMoreActive =
    currentRoute === 'analytics' ||
    currentRoute === 'insights' ||
    currentRoute === 'settings';

  return (
    <>
      {/* Drawer for More views on mobile */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreMenu(false)}
            aria-hidden="true"
          />
          <div className="relative bg-[var(--color-surface)] border-t border-[var(--color-border)] rounded-t-3xl p-5 pb-24 z-50 space-y-4 shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                {UI_COPY.nav.additionalSections}
              </span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => handleSelectRoute('analytics')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  currentRoute === 'analytics'
                    ? 'bg-teal-500/15 text-[var(--color-accent)] font-semibold border border-teal-500/30'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-[var(--color-accent)] stroke-[2]" />
                <span>{UI_COPY.nav.analytics}</span>
              </button>
              <button
                onClick={() => handleSelectRoute('insights')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  currentRoute === 'insights'
                    ? 'bg-teal-500/15 text-[var(--color-accent)] font-semibold border border-teal-500/30'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <Sparkles className="w-5 h-5 text-[var(--color-accent)] stroke-[2]" />
                <div className="flex items-center gap-2">
                  <span>{UI_COPY.nav.insights}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-300">
                    {UI_COPY.nav.activeBadge}
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleSelectRoute('settings')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  currentRoute === 'settings'
                    ? 'bg-teal-500/15 text-[var(--color-accent)] font-semibold border border-teal-500/30'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <Settings className="w-5 h-5 text-[var(--color-accent)] stroke-[2]" />
                <span>{UI_COPY.nav.settings}</span>
              </button>
            </div>

            {/* Mobile User Profile & Logout */}
            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                  {iniciales}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[var(--color-text)] truncate">
                    {nombreUsuario}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] truncate">
                    {emailUsuario || 'Plan Personal'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  cerrarSesion();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Touch Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-[var(--color-sidebar-bg)]/95 backdrop-blur-md border-t border-[var(--color-border)] px-2 py-1.5 transition-colors"
        aria-label="Navegación Móvil"
      >
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {/* Dashboard */}
          <button
            onClick={() => handleSelectRoute('dashboard')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              currentRoute === 'dashboard'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
            aria-label={UI_COPY.nav.dashboard}
            aria-current={currentRoute === 'dashboard' ? 'page' : undefined}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">{UI_COPY.nav.dashboard}</span>
          </button>

          {/* Transactions */}
          <button
            onClick={() => handleSelectRoute('transactions')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              currentRoute === 'transactions'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
            aria-label={UI_COPY.nav.transactions}
            aria-current={currentRoute === 'transactions' ? 'page' : undefined}
          >
            <ArrowLeftRight className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">{UI_COPY.nav.transactions}</span>
          </button>

          {/* Center Quick Add Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center w-11 h-11 bg-teal-500 text-slate-950 rounded-full shadow-lg shadow-teal-500/30 active:scale-95 transition-transform"
            aria-label={UI_COPY.actions.addTransaction}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Budgets */}
          <button
            onClick={() => handleSelectRoute('budgets')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              currentRoute === 'budgets'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
            aria-label={UI_COPY.nav.budgets}
            aria-current={currentRoute === 'budgets' ? 'page' : undefined}
          >
            <PieChart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">{UI_COPY.nav.budgets}</span>
          </button>

          {/* Goals or More */}
          <button
            onClick={() => handleSelectRoute('goals')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              currentRoute === 'goals'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
            aria-label={UI_COPY.nav.goals}
            aria-current={currentRoute === 'goals' ? 'page' : undefined}
          >
            <Target className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">{UI_COPY.nav.goals}</span>
          </button>

          {/* More Menu */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors ${
              isMoreActive || showMoreMenu
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
            aria-label="Más opciones de navegación"
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">{UI_COPY.nav.more}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
