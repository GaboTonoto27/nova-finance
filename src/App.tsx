import React, { useState, useEffect } from 'react';
import { NavigationRoute, Transaction, FinancialSummary, BudgetCategory, TransactionType } from './types/finance';
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
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { BudgetsView } from './views/BudgetsView';
import { GoalsView } from './views/GoalsView';
import { AnalyticsView } from './views/AnalyticsView';
import { InsightsView } from './views/InsightsView';
import { SettingsView } from './views/SettingsView';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  // Navigation State with URL Hash synchronization
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
      if (validRoutes.includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle adding a new transaction dynamically
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now().toString(36)}`,
    };

    // Prepend to transaction feed
    setTransactions((prev) => [newTx, ...prev]);

    // Recalculate financial summary live
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

    // Update budget spend if category matches
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
  };

  // Reset to initial demo mock data
  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSummary(INITIAL_SUMMARY);
  };

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

          {currentRoute === 'goals' && (
            <GoalsView goals={INITIAL_GOALS} />
          )}

          {currentRoute === 'analytics' && (
            <AnalyticsView />
          )}

          {currentRoute === 'insights' && (
            <InsightsView />
          )}

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
      <AppContent />
    </ThemeProvider>
  );
}
