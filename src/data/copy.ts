export const UI_COPY = {
  brand: {
    name: 'NOVA',
    tagline: 'Tu dinero, simple y claro',
    privateWorkspace: 'Tu espacio seguro',
    privateNotice: 'Tus datos están protegidos en tu dispositivo. Nadie más tiene acceso.',
    tierLabel: 'Plan Personal',
    userTitle: 'Nicolás',
  },
  nav: {
    dashboard: 'Inicio',
    transactions: 'Movimientos',
    budgets: 'Presupuestos',
    goals: 'Metas',
    analytics: 'Estadísticas',
    insights: 'Consejos',
    settings: 'Ajustes',
    platform: 'Menú principal',
    more: 'Más',
    additionalSections: 'Otras secciones',
    newBadge: 'Nuevo',
    activeBadge: 'Al día',
  },
  sections: {
    systemPreferences: 'Ajustes y preferencias',
    financialConfiguration: 'Moneda y fechas de corte',
    alertsMonitoring: 'Notificaciones y avisos',
  },
  actions: {
    addTransaction: 'Registrar movimiento',
    addExpense: 'Registrar gasto',
    addIncome: 'Registrar ingreso',
    saveTransaction: 'Guardar',
    recordTransaction: 'Guardar',
    newTransaction: 'Nuevo movimiento',
    exportCSV: 'Descargar reporte',
    cancel: 'Cancelar',
    save: 'Guardar cambios',
    savePreferences: 'Guardar preferencias',
    clearFilters: 'Borrar filtros',
    viewAll: 'Ver todos',
    manageBudgets: 'Ajustar presupuestos',
    simulateContribution: 'Abonar a esta meta',
    confirmDeposit: 'Confirmar abono',
    resetDefaultData: 'Restablecer datos de ejemplo',
  },
  metrics: {
    balance: 'Saldo',
    netLiquidity: 'Tienes disponible',
    availableToSpend: 'Disponible para gastar',
    income: 'Ingresos',
    expenses: 'Gastos',
    monthlyInflow: 'Ingresos de este mes',
    monthlyOutflow: 'En qué se fue el dinero',
    savingsRate: 'Cuánto estás ahorrando',
    targetPrefix: 'Meta:',
    vsLastMonth: 'vs. el mes anterior',
    vsTargetBase: 'vs. lo esperado',
    spendingContraction: 'gastaste menos que el mes pasado',
    aboveTargetReserve: 'vas mejor de lo que planeaste',
    netPortfolioDelta: 'vs. el mes anterior',
  },
  status: {
    completed: 'Hecho',
    pending: 'Pendiente',
    positive: 'Favorable',
    attention: 'Atención',
    inflow: 'Entró',
    outflow: 'Salió',
    netSurplus: 'Te quedó libre',
  },
  time: {
    cycle: 'Mes actual:',
    updatedToday: 'Actualizado hace poco',
  },
  forms: {
    amount: '¿Cuánto fue? ($ COP) *',
    amountSimple: 'Monto',
    amountPlaceholder: '50000',
    merchant: '¿Dónde o con quién? *',
    merchantSimple: 'Lugar o persona',
    merchantPlaceholder: 'ej. Éxito, D1, Netflix, Juan Pérez',
    category: 'Categoría *',
    categorySimple: 'Categoría',
    date: 'Fecha *',
    dateSimple: 'Fecha',
    paymentChannel: '¿Cómo pagaste?',
    paymentChannelPlaceholder: 'ej. Nequi, Bancolombia, Débito, Efectivo',
    note: 'Nota o detalle (opcional)',
    notePlaceholder: 'ej. Salida con amigos, compra semanal',
    expense: 'Gasto',
    income: 'Ingreso',
    searchPlaceholder: 'Buscar por lugar, detalle o medio de pago...',
    allCategories: 'Todas las categorías',
    allTypes: 'Todos los tipos',
    newestFirst: 'Más recientes primero',
    oldestFirst: 'Más antiguos primero',
    highestAmount: 'Mayor monto primero',
  },
  emptyStates: {
    noTransactionsTitle: 'Aún no tienes movimientos este mes',
    noTransactionsDesc: 'No encontramos registros con estos filtros. Empieza registrando tu primer gasto o ingreso.',
    noTransactionsCta: 'Registrar mi primer movimiento',
  },
} as const;

export function getGreeting(name: string = 'Nicolás'): { greeting: string; subtitle: string } {
  const hour = new Date().getHours();
  let timeGreeting = 'Buenos días';
  if (hour >= 12 && hour < 19) {
    timeGreeting = 'Buenas tardes';
  } else if (hour >= 19 || hour < 5) {
    timeGreeting = 'Buenas noches';
  }
  return {
    greeting: `${timeGreeting}, ${name}`,
    subtitle: 'Vas por buen camino este mes · 3 movimientos recientes',
  };
}

export const CATEGORY_LABELS: Record<string, string> = {
  Housing: 'Vivienda y Servicios',
  Groceries: 'Mercado y Comida',
  Technology: 'Tecnología y Suscripciones',
  'Health & Wellness': 'Salud y Cuidado',
  'Transit & Mobility': 'Transporte y Viajes',
  'Culture & Equipment': 'Ocio y Compras',
  Dining: 'Restaurantes y Café',
  Education: 'Cursos y Libros',
  Utilities: 'Servicios del hogar',
  Income: 'Sueldo e Ingresos',
  Investments: 'Ahorro e Inversión',
  Equipment: 'Tecnología y Hogar',
  General: 'Varios',
};

export const BUDGET_LABELS: Record<string, string> = {
  'Housing & Residence': 'Vivienda y Servicios',
  'Groceries & Dining': 'Mercado y Salidas a Comer',
  'Technology & Cloud': 'Tecnología y Suscripciones',
  'Health & Wellness': 'Salud y Cuidado Personal',
  'Transit & Mobility': 'Transporte y Movilidad',
  'Culture & Equipment': 'Ocio, Cultura y Gustos',
};

export const GOAL_CATEGORY_LABELS: Record<string, string> = {
  Security: 'Fondo de emergencia',
  Wealth: 'Inversión y futuro',
  Lifestyle: 'Viajes y gustos',
};

export const MONTH_NAMES_ES: Record<string, string> = {
  Apr: 'Abr',
  May: 'May',
  Jun: 'Jun',
  Jul: 'Jul',
  Aug: 'Ago',
  Sep: 'Sep',
  Oct: 'Oct',
  Nov: 'Nov',
  Dec: 'Dic',
  Jan: 'Ene',
  Feb: 'Feb',
  Mar: 'Mar',
};

export function formatMonthEs(monthStr: string): string {
  const [m, y] = monthStr.split(' ');
  const esMonth = MONTH_NAMES_ES[m] || m;
  return y ? `${esMonth} ${y}` : esMonth;
}
