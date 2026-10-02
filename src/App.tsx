import React, { useState, useEffect, useMemo } from 'react';
import {
  NavigationRoute,
  Transaction,
  FinancialSummary,
  BudgetCategory,
  TransactionType,
  Transaccion,
  TipoMovimiento,
  CategoriaFinanciera,
  Moneda,
} from './types/finance';
import { INITIAL_BUDGETS, INITIAL_GOALS } from './data/mockData';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { Header } from './components/common/Header';
import { TransactionModal } from './components/common/TransactionModal';
import { WelcomeModal } from './components/common/WelcomeModal';
import { NovaLogo } from './components/common/NovaLogo';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { BudgetsView } from './views/BudgetsView';
import { GoalsView } from './views/GoalsView';
import { AnalyticsView } from './views/AnalyticsView';
import { InsightsView } from './views/InsightsView';
import { SettingsView } from './views/SettingsView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { RecuperarPasswordView } from './views/RecuperarPasswordView';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { crearTransaccion } from './firebase/transactions';
import { actualizarSaldoInicial } from './firebase/users';
import { useTransacciones } from './hooks/useTransacciones';

type AuthMode = 'login' | 'register' | 'forgot';

// ---------------------------------------------------------------------------
// Mapeo del modelo legacy (Transaction, en ingles) al modelo Firestore
// (Transaccion, en espanol).
// ---------------------------------------------------------------------------
function mapearATransaccion(
  tx: Omit<Transaction, 'id'>
): Omit<Transaccion, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  const categoriaMap: Record<string, CategoriaFinanciera> = {
    Housing: 'vivienda',
    Groceries: 'mercado',
    Technology: 'tecnologia',
    'Health & Wellness': 'salud',
    'Transit & Mobility': 'transporte',
    'Culture & Equipment': 'ocio',
    Dining: 'ocio',
    Education: 'educacion',
    Utilities: 'vivienda',
    Income: 'otro',
    Investments: 'inversiones',
    Equipment: 'tecnologia',
    General: 'otro',
  };

  const tipo: TipoMovimiento = tx.type === 'income' ? 'ingreso' : 'gasto';
  const fechaISO = new Date(`${tx.date}T12:00:00.000Z`).toISOString();

  return {
    tipo,
    monto: tx.amount,
    moneda: 'COP' as Moneda,
    categoria: categoriaMap[tx.category] || 'otro',
    descripcion: tx.description || tx.merchant,
    fecha: fechaISO,
    medioPago: 'otro',
    contraparte: tx.merchant,
    nota: tx.notes,
  };
}

function AppContent() {
  const { usuario, perfil, cargando } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('recuperar') || hash.includes('forgot')) return 'forgot';
    if (hash.includes('registro') || hash.includes('register')) return 'register';
    return 'login';
  });

  const [currentRoute, setCurrentRoute] = useState<NavigationRoute>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '') as NavigationRoute;
    const validRoutes: NavigationRoute[] = [
      'dashboard',
      'transactions',
      'budgets',
      'goals',
      'analytics',
      'insights',
      'settings',
    ];
    return validRoutes.includes(hash) ? hash : 'dashboard';
  });

  const {
    transacciones: transactions,
    cargando: cargandoTransacciones,
    error: errorTransacciones,
  } = useTransacciones(usuario?.uid ?? null);

  const [budgets] = useState<BudgetCategory[]>(INITIAL_BUDGETS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [addModalInitialType, setAddModalInitialType] = useState<TransactionType>('expense');

  // Summary calculado a partir de transacciones reales + saldo inicial
  const summary: FinancialSummary = useMemo(() => {
    const saldoInicialMonto = perfil?.saldoInicial?.configurado
      ? perfil.saldoInicial.monto
      : 0;

    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let balanceTotal = saldoInicialMonto;

    for (const tx of transactions) {
      const fecha = new Date(tx.date);
      const esMesActual =
        fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;

      if (tx.type === 'income') {
        balanceTotal += tx.amount;
        if (esMesActual) monthlyIncome += tx.amount;
      } else {
        balanceTotal -= tx.amount;
        if (esMesActual) monthlyExpenses += tx.amount;
      }
    }

    const savingsRate =
      monthlyIncome > 0
        ? Math.max(0, ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
        : 0;

    return {
      currentBalance: balanceTotal,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      incomeChangePercentage: 0,
      expensesChangePercentage: 0,
      balanceChangePercentage: 0,
    };
  }, [transactions, perfil]);

  // Abre el modal de bienvenida si el usuario esta logueado pero
  // todavia no configuro su saldo inicial
  useEffect(() => {
    if (usuario && perfil && perfil.saldoInicial && !perfil.saldoInicial.configurado) {
      setIsWelcomeModalOpen(true);
    } else {
      setIsWelcomeModalOpen(false);
    }
  }, [usuario, perfil]);

  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    setAddModalInitialType(type);
    setIsAddModalOpen(true);
  };

  const navigateTo = (route: NavigationRoute) => {
    setCurrentRoute(route);
    window.location.hash = `/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (!usuario) {
        if (hash.includes('recuperar') || hash.includes('forgot')) {
          setAuthMode('forgot');
        } else if (hash.includes('registro') || hash.includes('register')) {
          setAuthMode('register');
        } else {
          setAuthMode('login');
        }
      } else {
        const cleanHash = window.location.hash
          .replace('#/', '')
          .replace('#', '') as NavigationRoute;
        const validRoutes: NavigationRoute[] = [
          'dashboard',
          'transactions',
          'budgets',
          'goals',
          'analytics',
          'insights',
          'settings',
        ];
        if (validRoutes.includes(cleanHash)) {
          setCurrentRoute(cleanHash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [usuario]);

  const handleAddTransaction = async (newTxData: Omit<Transaction, 'id'>) => {
    try {
      const transaccionPayload = mapearATransaccion(newTxData);
      await crearTransaccion(transaccionPayload);
    } catch (error) {
      console.error('Error al guardar la transaccion en Firestore:', error);
      const mensaje =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la transaccion. Intenta de nuevo.';
      alert(mensaje);
    }
  };

  const handleConfirmSaldoInicial = async (monto: number) => {
    if (!usuario) return;
    try {
      await actualizarSaldoInicial(usuario.uid, monto, 'COP');
      setIsWelcomeModalOpen(false);
    } catch (error) {
      console.error('Error al guardar saldo inicial:', error);
      throw error;
    }
  };

  const handleResetData = () => {
    alert('Funcionalidad en desarrollo. Se implementara en la Fase 03.4.');
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-6 text-[var(--color-text)] transition-colors">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <NovaLogo size="lg" showSubtitle={true} />
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-bounce" />
          </div>
          <span className="text-xs font-medium text-[var(--color-text-muted)] tracking-wide">
            Cargando tus finanzas...
          </span>
        </div>
      </div>
    );
  }

  if (!usuario) {
    if (authMode === 'register') {
      return (
        <RegisterView
          onSwitchToLogin={() => {
            setAuthMode('login');
            window.location.hash = '/login';
          }}
        />
      );
    }

    if (authMode === 'forgot') {
      return (
        <RecuperarPasswordView
          onBackToLogin={() => {
            setAuthMode('login');
            window.location.hash = '/login';
          }}
        />
      );
    }

    return (
      <LoginView
        onSwitchToRegister={() => {
          setAuthMode('register');
          window.location.hash = '/registro';
        }}
        onSwitchToForgot={() => {
          setAuthMode('forgot');
          window.location.hash = '/recuperar-password';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col md:flex-row antialiased selection:bg-teal-500/20 selection:text-teal-400 transition-colors">
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenAddModal={() => handleOpenAddModal('expense')}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10">
        <Header
          currentRoute={currentRoute}
          onOpenAddModal={() => handleOpenAddModal('expense')}
          onNavigate={navigateTo}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto view-enter">
          {currentRoute === 'dashboard' && (
            <DashboardView
              summary={summary}
              transactions={transactions}
              budgets={budgets}
              goals={INITIAL_GOALS}
              onOpenAddModal={handleOpenAddModal}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              onOpenAddModal={() => handleOpenAddModal('expense')}
            />
          )}

          {currentRoute === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              onOpenAddModal={() => handleOpenAddModal('expense')}
            />
          )}

          {currentRoute === 'goals' && <GoalsView goals={INITIAL_GOALS} />}

          {currentRoute === 'analytics' && <AnalyticsView />}

          {currentRoute === 'insights' && <InsightsView />}

          {currentRoute === 'settings' && <SettingsView onResetData={handleResetData} />}
        </main>
      </div>

      <MobileNav
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenAddModal={() => handleOpenAddModal('expense')}
      />

      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        initialType={addModalInitialType}
      />

      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        nombreUsuario={perfil?.nombre || 'Usuario'}
        onConfirm={handleConfirmSaldoInicial}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}