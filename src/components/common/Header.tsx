import React, { useState, useRef, useEffect } from 'react';
import { Plus, Bell, Calendar, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { NavigationRoute } from '../../types/finance';
import { NovaLogo } from './NovaLogo';
import { UI_COPY } from '../../data/copy';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentRoute: NavigationRoute;
  onOpenAddModal: () => void;
}

const ROUTE_LABELS: Record<NavigationRoute, { title: string; subtitle: string }> = {
  dashboard: { title: 'Inicio', subtitle: 'Tu resumen financiero de hoy' },
  transactions: { title: 'Movimientos', subtitle: 'Tus ingresos y gastos organizados' },
  budgets: { title: 'Presupuestos', subtitle: 'Controla lo que gastas mes a mes' },
  goals: { title: 'Tus Metas', subtitle: 'Ahorros para lo que sueñas' },
  analytics: { title: 'Estadísticas', subtitle: 'Cómo se mueve tu dinero en el tiempo' },
  insights: { title: 'Consejos para ti', subtitle: 'Recomendaciones personalizadas' },
  settings: { title: 'Ajustes', subtitle: 'Tus preferencias y privacidad' },
};

export const Header: React.FC<HeaderProps> = ({ currentRoute, onOpenAddModal }) => {
  const current = ROUTE_LABELS[currentRoute];
  const { theme, toggleTheme } = useTheme();
  const { usuario, perfil, cerrarSesion, obtenerIniciales } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const nombreUsuario = perfil?.nombre || usuario?.displayName || UI_COPY.brand.userTitle || 'Usuario';
  const emailUsuario = perfil?.email || usuario?.email || '';
  const iniciales = obtenerIniciales();

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-20 bg-[var(--color-header-bg)] backdrop-blur-md border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 transition-colors">
      {/* Zone 1: Friendly Section Title (No admin breadcrumb) */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden flex items-center gap-2.5">
          <NovaLogo size="sm" />
          <span className="text-sm font-bold text-[var(--color-text)]">
            {current.title}
          </span>
        </div>
        <div className="hidden md:flex flex-col">
          <h2 className="text-base font-bold text-[var(--color-text)] tracking-tight">
            {current.title}
          </h2>
          <span className="text-xs text-[var(--color-text-secondary)] font-normal">
            {current.subtitle}
          </span>
        </div>
      </div>

      {/* Zone 2: Date/Cycle Contextual Label */}
      <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
        <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        <span>Septiembre 2026 · <strong className="text-[var(--color-text)] font-semibold">Corte al 30</strong></span>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onOpenAddModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-xs font-semibold rounded-full transition-all whitespace-nowrap shadow-sm shadow-teal-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 interactive-pill"
          type="button"
          aria-label={UI_COPY.actions.addTransaction}
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{UI_COPY.actions.addTransaction}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)] rounded-full transition-all interactive-pill"
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
          )}
        </button>

        <button
          type="button"
          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-full transition-colors relative"
          aria-label="Notificaciones"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-teal-400 rounded-full" />
        </button>

        {/* User Avatar with dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow-xs hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer focus:outline-none"
            aria-label="Menú de usuario"
            aria-expanded={isMenuOpen}
          >
            {iniciales}
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--color-border)] px-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
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

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    cerrarSesion();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

