import React, { useState, useEffect } from 'react';
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
import {
  INITIAL_SUMMARY,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
} from './data/mockData';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { Header } from './components/common/Header';
import { TransactionModal } from './components/common/TransactionModal';
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

type AuthMode = 'login' | 'register' | 'forgot';

// ---------------------------------------------------------------------------
// Mapeo del modelo viejo (Transaction, en ingles) al modelo nuevo
// (Transaccion, en espanol) que se persiste en Firestore.
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

  // Convierte "YYYY-MM-DD" a ISO 8601 completo
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
  const { usuario, cargando } = useAuth();

  // Auth screen state
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('recuperar') || hash.includes('forgot')) return 'forgot';
    if (hash.includes('registro') || hash.includes('register')) return 'register';
    return 'login';
  });

  // Navigation State with URL Hash synchronization for authenticated view
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

  // Financial Ledger In-Memory State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(INITIAL_BUDGETS);
  const [summary, setSummary] = useState<FinancialSummary>(INITIAL_SUMMARY);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialType, setAddModalInitialType] = useState<TransactionType>('expense');

  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    setAddModalInitialType(type);
    setIsAddModalOpen(true);
  };

  // Sync route with URL hash for navigation & bookmarking
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
        const cleanHash = window.location.hash.replace('#/', '').replace('#', '') as NavigationRoute;
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

  // -------------------------------------------------------------------------
  // Handle adding a new transaction:
  // 1) Persiste en Firestore (coleccion /users/{uid}/transactions)
  // 2) Solo si Firestore guarda OK, actualiza el estado local en memoria.
  // 3) Si falla, muestra el error y NO modifica el estado.
  // -------------------------------------------------------------------------
  const handleAddTransaction = async (newTxData: Omit<Transaction, 'id'>) => {
    try {
      // 1) Persistir en Firestore
      const transaccionPayload = mapearATransaccion(newTxData);
      await crearTransaccion(transaccionPayload);

      // 2) Actualizar estado local (solo si Firestore guardo OK)
      const newTx: Transaction = {
        ...newTxData,
        id: `tx-${Date.now().toString(36)}`,
      };

      setTransactions((prev) => [newTx, ...prev]);

      setSummary((prev) => {
        let newBalance = prev.currentBalance;
        let newIncome = prev.monthlyIncome;
        let newExpenses = prev.monthlyExpenses;

        if (newTx.type === 'income') {
          newBalance += newTx.amount;
          newIncome += newTx.amount;
        } else {
          newBalance -= newTx.amount;
          newExpenses += newTx.amount;
        }

        const newSavingsRate =
          newIncome > 0 ? Math.max(0, ((newIncome - newExpenses) / newIncome) * 100) : 0;

        return {
          ...prev,
          currentBalance: newBalance,
          monthlyIncome: newIncome,
          monthlyExpenses: newExpenses,
          savingsRate: newSavingsRate,
        };
      });

      if (newTx.type === 'expense') {
        setBudgets((prev) =>
          prev.map((b) => {
            if (b.name.toLowerCase().includes(newTx.category.toLowerCase())) {
              return { ...b, spent: b.spent + newTx.amount };
            }
            return b;
          })
        );
      }
    } catch (error) {
      console.error('Error al guardar la transaccion en Firestore:', error);
      const mensaje =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la transaccion. Intenta de nuevo.';
      alert(mensaje);
    }
  };

  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSummary(INITIAL_SUMMARY);
  };

  // 1. Loading screen while auth state resolves
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

  // 2. Unauthenticated views (Login, Register, Password Recovery)
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

  // 3. Authenticated App Layout
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col md:flex-row antialiased selection:bg-teal-500/20 selection:text-teal-400 transition-colors">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenAddModal={() => handleOpenAddModal('expense')}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10">
        {/* Top Header */}
        <Header
          currentRoute={currentRoute}
          onOpenAddModal={() => handleOpenAddModal('expense')}
        />

        {/* Route Container with subtle entry animation */}
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

          {currentRoute === 'settings' && (
            <SettingsView onResetData={handleResetData} />
          )}
        </main>
      </div>

      {/* Touch-Friendly Mobile Bottom Navigation */}
      <MobileNav
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenAddModal={() => handleOpenAddModal('expense')}
      />

      {/* Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        initialType={addModalInitialType}
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