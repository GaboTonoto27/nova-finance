import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  NavigationRoute,
  Transaction,
  FinancialSummary,
  TransactionType,
  Transaccion,
  TipoMovimiento,
  CategoriaFinanciera,
  Moneda,
  Presupuesto,
  MetaAhorro,
} from './types/finance';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { Header } from './components/common/Header';
import { TransactionModal } from './components/common/TransactionModal';
import { WelcomeModal } from './components/common/WelcomeModal';
import { PresupuestoModal } from './components/common/PresupuestoModal';
import { MetaModal } from './components/common/MetaModal';
import { NovaLogo } from './components/common/NovaLogo';
import { AlertToast } from './components/common/AlertToast';
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
import { AlertProvider, useAlert } from './context/AlertContext';
import { crearTransaccion } from './firebase/transactions';
import { actualizarSaldoInicial } from './firebase/users';
import {
  crearPresupuesto,
  actualizarPresupuesto,
  eliminarPresupuesto,
  crearPresupuestosIniciales,
} from './firebase/presupuestos';
import { crearMeta, actualizarMeta, eliminarMeta } from './firebase/metas';
import { useTransacciones } from './hooks/useTransacciones';
import { usePresupuestos } from './hooks/usePresupuestos';
import { useMetas } from './hooks/useMetas';
import { CATEGORY_LABELS } from './data/copy';
import {
  recalcularPresupuestos,
  obtenerPresupuestosExcedidos,
} from './utils/calcularGastado';

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
  const { showAlert } = useAlert();

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

  // Hooks de Firestore
  const { transacciones: transactions } = useTransacciones(usuario?.uid ?? null);

  const { presupuestos, cargando: cargandoPresupuestos } = usePresupuestos(
    usuario?.uid ?? null
  );

  const { metas, cargando: cargandoMetas } = useMetas(usuario?.uid ?? null);

  // Presupuestos con el campo 'gastado' calculado desde las transacciones reales
  const presupuestosConGastado = useMemo(
    () => recalcularPresupuestos(presupuestos, transactions),
    [presupuestos, transactions]
  );

  // Estados de modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialType, setAddModalInitialType] =
    useState<TransactionType>('expense');
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  const [isPresupuestoModalOpen, setIsPresupuestoModalOpen] = useState(false);
  const [presupuestoEditar, setPresupuestoEditar] = useState<Presupuesto | null>(null);

  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metaEditar, setMetaEditar] = useState<MetaAhorro | null>(null);

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

  // Auto-crear presupuestos iniciales
  useEffect(() => {
    if (
      usuario &&
      perfil?.saldoInicial?.configurado &&
      !cargandoPresupuestos &&
      presupuestos.length === 0
    ) {
      crearPresupuestosIniciales().catch((err) => {
        console.error('Error al crear presupuestos iniciales:', err);
      });
    }
  }, [usuario, perfil, cargandoPresupuestos, presupuestos.length]);

  // Detectar presupuestos excedidos y notificar al usuario una vez por sesion
  const presupuestosExcedidosNotificados = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (cargandoPresupuestos) return;

    const excedidos = obtenerPresupuestosExcedidos(presupuestosConGastado);

    excedidos.forEach(({ presupuesto, exceso }) => {
      const id = presupuesto.id || '';
      if (!id || presupuestosExcedidosNotificados.current.has(id)) return;

      presupuestosExcedidosNotificados.current.add(id);

      const nombreCategoria =
        CATEGORY_LABELS[presupuesto.categoria] || presupuesto.categoria;
      const excesoFormateado = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(exceso);

      showAlert({
        type: 'warning',
        title: 'Presupuesto excedido',
        message: `Te pasaste ${excesoFormateado} en "${nombreCategoria}". Cuidá tu bolsillo.`,
        duration: 7000,
      });
    });
  }, [presupuestosConGastado, cargandoPresupuestos, showAlert]);

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

  // Transacciones
  const handleAddTransaction = async (newTxData: Omit<Transaction, 'id'>) => {
    try {
      const transaccionPayload = mapearATransaccion(newTxData);
      await crearTransaccion(transaccionPayload);

      const esIngreso = newTxData.type === 'income';
      const montoFormateado = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(newTxData.amount);

      showAlert({
        type: esIngreso ? 'success' : 'info',
        title: esIngreso ? 'Ingreso registrado' : 'Gasto registrado',
        message: `${montoFormateado} en "${newTxData.description || newTxData.merchant}".`,
        icon: esIngreso ? 'ingreso' : 'gasto',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error al guardar la transaccion en Firestore:', error);
      const mensaje =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la transaccion. Intenta de nuevo.';
      showAlert({ type: 'error', title: 'Error al guardar', message: mensaje });
    }
  };

  // Presupuestos
  const handleNuevoPresupuesto = () => {
    setPresupuestoEditar(null);
    setIsPresupuestoModalOpen(true);
  };

  const handleEditarPresupuesto = (p: Presupuesto) => {
    setPresupuestoEditar(p);
    setIsPresupuestoModalOpen(true);
  };

  const handleGuardarPresupuesto = async (data: {
    categoria: Presupuesto['categoria'] | string;
    categoriaCustom?: string;
    limite: number;
    color: string;
    iconName: string;
  }) => {
    const esEdicion = Boolean(presupuestoEditar && presupuestoEditar.id);

    const nombreCategoria =
      data.categoriaCustom ||
      CATEGORY_LABELS[data.categoria as string] ||
      data.categoria;

    if (esEdicion && presupuestoEditar?.id) {
      await actualizarPresupuesto(presupuestoEditar.id, {
        categoria: data.categoria as Presupuesto['categoria'],
        limite: data.limite,
        color: data.color,
        iconName: data.iconName,
      });
    } else {
      await crearPresupuesto({
        categoria: data.categoria as Presupuesto['categoria'],
        limite: data.limite,
        gastado: 0,
        color: data.color,
        iconName: data.iconName,
      });
    }

    showAlert({
      type: 'success',
      title: esEdicion ? 'Presupuesto actualizado' : 'Presupuesto creado',
      message: `Categoria "${nombreCategoria}" guardada correctamente.`,
      icon: 'presupuesto',
      duration: 5000,
    });
  };

  const handleEliminarPresupuesto = async (p: Presupuesto) => {
    if (!p.id) return;
    const nombre = CATEGORY_LABELS[p.categoria] || p.categoria;
    const confirmado = window.confirm(
      `Eliminar el presupuesto de "${nombre}"?\n\nEsta accion no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      await eliminarPresupuesto(p.id);
      showAlert({
        type: 'info',
        title: 'Presupuesto eliminado',
        message: `Se elimino "${nombre}".`,
        icon: 'presupuesto',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el presupuesto.',
      });
    }
  };

  const categoriasPresupuestoUsadas = useMemo(
    () => presupuestos.map((p) => p.categoria as string),
    [presupuestos]
  );

  // Metas
  const handleNuevaMeta = () => {
    setMetaEditar(null);
    setIsMetaModalOpen(true);
  };

  const handleEditarMeta = (m: MetaAhorro) => {
    setMetaEditar(m);
    setIsMetaModalOpen(true);
  };

  const handleGuardarMeta = async (data: {
    nombre: string;
    montoObjetivo: number;
    fechaObjetivo: string;
    categoria: MetaAhorro['categoria'];
    color: string;
    iconName: string;
  }) => {
    const esEdicion = Boolean(metaEditar && metaEditar.id);

    if (esEdicion && metaEditar?.id) {
      await actualizarMeta(metaEditar.id, {
        nombre: data.nombre,
        montoObjetivo: data.montoObjetivo,
        fechaObjetivo: data.fechaObjetivo,
        categoria: data.categoria,
        color: data.color,
        iconName: data.iconName,
      });
    } else {
      await crearMeta({
        nombre: data.nombre,
        montoObjetivo: data.montoObjetivo,
        montoActual: 0,
        fechaObjetivo: data.fechaObjetivo,
        categoria: data.categoria,
        color: data.color,
        iconName: data.iconName,
        completada: false,
      });
    }

    showAlert({
      type: 'success',
      title: esEdicion ? 'Meta actualizada' : 'Meta creada',
      message: `"${data.nombre}" guardada correctamente.`,
      icon: 'meta',
      duration: 5000,
    });
  };

  const handleEliminarMeta = async (m: MetaAhorro) => {
    if (!m.id) return;
    const confirmado = window.confirm(
      `Eliminar la meta "${m.nombre}"?\n\nEsta accion no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      await eliminarMeta(m.id);
      showAlert({
        type: 'info',
        title: 'Meta eliminada',
        message: `"${m.nombre}" fue eliminada.`,
        icon: 'meta',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error al eliminar meta:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar la meta.',
      });
    }
  };

  const handleAbonarMeta = async (m: MetaAhorro, monto: number) => {
    if (!m.id) return;
    const nuevoMonto = Math.min(m.montoObjetivo, m.montoActual + monto);
    const completada = nuevoMonto >= m.montoObjetivo;
    await actualizarMeta(m.id, {
      montoActual: nuevoMonto,
      completada,
    });

    const montoFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(monto);

    showAlert({
      type: completada ? 'success' : 'info',
      title: completada ? 'Meta completada!' : 'Abono registrado',
      message: completada
        ? `Alcanzaste tu meta "${m.nombre}". Felicidades!`
        : `Abonaste ${montoFormateado} a "${m.nombre}".`,
      icon: 'ahorro',
      duration: 5000,
    });
  };

  // Reset
  const handleResetData = () => {
    showAlert({
      type: 'info',
      title: 'Proximamente',
      message: 'La funcionalidad de reset estara disponible en una proxima version.',
    });
  };

  // Saldo inicial
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

  // Loading
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
              presupuestos={presupuestosConGastado}
              metas={metas}
              cargandoPresupuestos={cargandoPresupuestos}
              cargandoMetas={cargandoMetas}
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
              presupuestos={presupuestosConGastado}
              cargando={cargandoPresupuestos}
              onNuevoPresupuesto={handleNuevoPresupuesto}
              onEditarPresupuesto={handleEditarPresupuesto}
              onEliminarPresupuesto={handleEliminarPresupuesto}
            />
          )}

          {currentRoute === 'goals' && (
            <GoalsView
              metas={metas}
              cargando={cargandoMetas}
              onNuevaMeta={handleNuevaMeta}
              onEditarMeta={handleEditarMeta}
              onEliminarMeta={handleEliminarMeta}
              onAbonarMeta={handleAbonarMeta}
            />
          )}

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

      <PresupuestoModal
        isOpen={isPresupuestoModalOpen}
        onClose={() => {
          setIsPresupuestoModalOpen(false);
          setPresupuestoEditar(null);
        }}
        onSave={handleGuardarPresupuesto}
        presupuestoEditar={presupuestoEditar}
        categoriasYaUsadas={categoriasPresupuestoUsadas}
      />

      <MetaModal
        isOpen={isMetaModalOpen}
        onClose={() => {
          setIsMetaModalOpen(false);
          setMetaEditar(null);
        }}
        onSave={handleGuardarMeta}
        metaEditar={metaEditar}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <AuthProvider>
          <AppContent />
          <AlertToast />
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}