import React, { useState } from 'react';
import {
  Shield,
  Sliders,
  Bell,
  RefreshCw,
  CheckCircle2,
  Lock,
  Globe,
  Database,
  Smartphone,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import { UI_COPY } from '../data/copy';
import { useTheme } from '../context/ThemeContext';

interface SettingsViewProps {
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetData }) => {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState('COP');
  const [cycleStart, setCycleStart] = useState('1');
  const [notifications, setNotifications] = useState(true);
  const [autoReconcile, setAutoReconcile] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 max-w-4xl">
      {/* View Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
          {UI_COPY.sections.systemPreferences}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 font-normal">
          Personaliza tu experiencia, moneda base y privacidad de tu dinero
        </p>
      </div>

      {savedToast && (
        <div className="flex items-center gap-2 p-3.5 bg-teal-950/40 border border-teal-800/60 rounded-2xl text-xs text-teal-600 dark:text-teal-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-500 dark:text-teal-400" />
          <span>Tus preferencias se guardaron correctamente en este dispositivo.</span>
        </div>
      )}

      {/* Theme / Appearance Selection */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors interactive-card">
        <div className="border-b border-[var(--color-border)] pb-3">
          <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
            <span>Tema y apariencia</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Elige el estilo visual con el que te sientas más cómodo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Dark Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all interactive-pill ${
              theme === 'dark'
                ? 'border-[var(--color-accent)] bg-[var(--color-surface-subtle)] ring-1 ring-[var(--color-accent)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
            }`}
            aria-label="Seleccionar tema oscuro obsidiana"
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-amber-300">
              <Moon className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--color-text)]">
                  Tema Oscuro
                </span>
                {theme === 'dark' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                Fondo obsidiana con acentos verde azulado. Ideal para descansar la vista.
              </p>
            </div>
          </button>

          {/* Light Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all interactive-pill ${
              theme === 'light'
                ? 'border-[var(--color-accent)] bg-[var(--color-surface-subtle)] ring-1 ring-[var(--color-accent)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
            }`}
            aria-label="Seleccionar tema claro luminoso"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
              <Sun className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--color-text)]">
                  Tema Claro
                </span>
                {theme === 'light' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                Tarjetas blancas luminosas y alto contraste para leer fácilmente.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Financial Parameters */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs transition-colors interactive-card">
        <div className="border-b border-[var(--color-border)] pb-3">
          <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
            <span>{UI_COPY.sections.financialConfiguration}</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Moneda en la que ves tu dinero y día de corte mensual
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Moneda Principal
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl text-xs font-semibold text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="COP">COP ($) — Peso colombiano</option>
              <option value="USD">USD ($) — Dólar estadounidense</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — Libra esterlina</option>
              <option value="BRL">BRL (R$) — Real brasileño</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Día de corte mensual
            </label>
            <select
              value={cycleStart}
              onChange={(e) => setCycleStart(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl text-xs font-semibold text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="1">1 de cada mes (Inicio de mes)</option>
              <option value="15">15 de cada mes (Pago quincenal)</option>
              <option value="25">25 de cada mes (Pago de nómina)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications & Automation */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors interactive-card">
        <div className="border-b border-[var(--color-border)] pb-3">
          <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
            <span>{UI_COPY.sections.alertsMonitoring}</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Avisos para ayudarte a no sobrepasar tus metas de gasto
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors">
            <div>
              <span className="text-xs font-bold text-[var(--color-text)] block">
                Aviso cuando llegues al 90% de un presupuesto
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] block mt-0.5">
                Te avisaremos antes de que se acabe tu límite en cualquier categoría
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 accent-teal-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors">
            <div>
              <span className="text-xs font-bold text-[var(--color-text)] block">
                Categorización automática inteligente
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] block mt-0.5">
                Detecta automáticamente el tipo de gasto según el nombre del comercio
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoReconcile}
              onChange={(e) => setAutoReconcile(e.target.checked)}
              className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 accent-teal-500"
            />
          </label>
        </div>
      </div>

      {/* Data Privacy & Trust Notice */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs transition-colors interactive-card">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--color-text)]">
          <Lock className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
          <span>Tu privacidad ante todo</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
          NOVA está diseñada pensando en la seguridad de tu información. Todos tus datos y cuentas residen de forma privada en tu dispositivo local. No compartimos tus movimientos ni usamos rastreadores publicitarios.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs">
            <span className="text-[var(--color-accent)] block font-bold mb-0.5">
              1. Privacidad Local
            </span>
            <span className="text-[var(--color-text-secondary)] text-xs">
              Tus finanzas no salen de tu navegador.
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs">
            <span className="text-[var(--color-accent)] block font-bold mb-0.5">
              2. Sin Publicidad
            </span>
            <span className="text-[var(--color-text-secondary)] text-xs">
              Cero anuncios, cero venta de datos.
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs">
            <span className="text-[var(--color-accent)] block font-bold mb-0.5">
              3. Adaptada a Colombia
            </span>
            <span className="text-[var(--color-text-secondary)] text-xs">
              Formateo nativo en pesos colombianos ($ COP).
            </span>
          </div>
        </div>
      </div>

      {/* Save & Reset Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onResetData}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all border border-transparent hover:border-rose-500/20 interactive-pill"
          type="button"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{UI_COPY.actions.resetDefaultData}</span>
        </button>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-xs font-bold rounded-full transition-all shadow-sm shadow-teal-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 interactive-pill"
          type="button"
        >
          {UI_COPY.actions.savePreferences}
        </button>
      </div>
    </div>
  );
};
