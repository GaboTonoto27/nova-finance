export const UI_COPY = {
  brand: {
    name: 'NOVA',
    tagline: 'Tu dinero, simple y claro',
    privateWorkspace: 'Tu espacio seguro',
    privateNotice: 'Tus datos estan protegidos en tu dispositivo. Nadie mas tiene acceso.',
    tierLabel: 'Plan Personal',
    userTitle: 'Usuario',
  },
  auth: {
    loginTitle: 'Bienvenido de nuevo',
    loginSubtitle: 'Ingresa para continuar con tus finanzas',
    registerTitle: 'Crea tu cuenta',
    registerSubtitle: 'Empieza a organizar tu dinero hoy',
    forgotTitle: 'Recuperar contrasena',
    forgotSubtitle: 'Ingresa tu correo para recibir las instrucciones',
    continueWithGoogle: 'Continuar con Google',
    loginAction: 'Ingresar',
    registerAction: 'Crear cuenta',
    sendResetLink: 'Enviar enlace de recuperacion',
    signOut: 'Cerrar sesion',
    haveAccount: 'Ya tienes cuenta? Inicia sesion',
    noAccount: 'No tienes cuenta? Crear cuenta',
    forgotPassword: 'Olvidaste tu contrasena?',
  },
  nav: {
    dashboard: 'Inicio',
    transactions: 'Movimientos',
    budgets: 'Presupuestos',
    goals: 'Metas',
    analytics: 'Estadisticas',
    insights: 'Consejos',
    settings: 'Ajustes',
    platform: 'Menu principal',
    more: 'Mas',
    additionalSections: 'Otras secciones',
    newBadge: 'Nuevo',
    activeBadge: 'Al dia',
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
    monthlyOutflow: 'En que se fue el dinero',
    savingsRate: 'Cuanto estas ahorrando',
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
    attention: 'Atencion',
    inflow: 'Entro',
    outflow: 'Salio',
    netSurplus: 'Te quedo libre',
  },
  time: {
    cycle: 'Mes actual:',
    updatedToday: 'Actualizado hace poco',
  },
  forms: {
    amount: 'Cuanto fue? ($ COP) *',
    amountSimple: 'Monto',
    amountPlaceholder: '50000',
    merchant: 'Donde o con quien? *',
    merchantSimple: 'Lugar o persona',
    merchantPlaceholder: 'ej. Exito, D1, Netflix, Juan Perez',
    category: 'Categoria *',
    categorySimple: 'Categoria',
    date: 'Fecha *',
    dateSimple: 'Fecha',
    paymentChannel: 'Como pagaste?',
    paymentChannelPlaceholder: 'ej. Nequi, Bancolombia, Debito, Efectivo',
    note: 'Nota o detalle (opcional)',
    notePlaceholder: 'ej. Salida con amigos, compra semanal',
    expense: 'Gasto',
    income: 'Ingreso',
    searchPlaceholder: 'Buscar por lugar, detalle o medio de pago...',
    allCategories: 'Todas las categorias',
    allTypes: 'Todos los tipos',
    newestFirst: 'Mas recientes primero',
    oldestFirst: 'Mas antiguos primero',
    highestAmount: 'Mayor monto primero',
  },
  emptyStates: {
    noTransactionsTitle: 'Aun no tienes movimientos este mes',
    noTransactionsDesc: 'No encontramos registros con estos filtros. Empieza registrando tu primer gasto o ingreso.',
    noTransactionsCta: 'Registrar mi primer movimiento',
  },
} as const;

export function getGreeting(name: string = 'Usuario'): { greeting: string; subtitle: string } {
  const hour = new Date().getHours();
  let timeGreeting = 'Buenos dias';
  if (hour >= 12 && hour < 19) {
    timeGreeting = 'Buenas tardes';
  } else if (hour >= 19 || hour < 5) {
    timeGreeting = 'Buenas noches';
  }
  return {
    greeting: `${timeGreeting}, ${name}`,
    subtitle: 'Vas por buen camino este mes',
  };
}

export const CATEGORY_LABELS: Record<string, string> = {
  // Categorias legacy en ingles
  Housing: 'Vivienda y Servicios',
  Groceries: 'Mercado y Comida',
  Technology: 'Tecnologia y Suscripciones',
  'Health & Wellness': 'Salud y Cuidado',
  'Transit & Mobility': 'Transporte y Viajes',
  'Culture & Equipment': 'Ocio y Compras',
  Dining: 'Restaurantes y Cafe',
  Education: 'Cursos y Libros',
  Utilities: 'Servicios del hogar',
  Income: 'Sueldo e Ingresos',
  Investments: 'Ahorro e Inversion',
  Equipment: 'Tecnologia y Hogar',
  General: 'Varios',

  // Categorias de GASTO (nuevas, en espanol)
  vivienda: 'Vivienda',
  mercado: 'Mercado',
  transporte: 'Transporte',
  tecnologia: 'Tecnologia',
  salud: 'Salud',
  educacion: 'Educacion',
  ocio: 'Ocio y Entretenimiento',
  suscripciones: 'Suscripciones',
  deudas: 'Deudas',
  otro: 'Otro',

  // Categorias de INGRESO (nuevas, en espanol)
  sueldo: 'Sueldo',
  freelance: 'Freelance',
  ventas: 'Ventas',
  regalos: 'Regalos',
  inversiones: 'Inversiones',
  reembolsos: 'Reembolsos',
  prestamos: 'Prestamos',
  otros: 'Otros ingresos',

  // Ahorro
  ahorro: 'Ahorro',
};

export const BUDGET_LABELS: Record<string, string> = {
  'Housing & Residence': 'Vivienda y Servicios',
  'Groceries & Dining': 'Mercado y Salidas a Comer',
  'Technology & Cloud': 'Tecnologia y Suscripciones',
  'Health & Wellness': 'Salud y Cuidado Personal',
  'Transit & Mobility': 'Transporte y Movilidad',
  'Culture & Equipment': 'Ocio, Cultura y Gustos',
};

export const GOAL_CATEGORY_LABELS: Record<string, string> = {
  Security: 'Fondo de emergencia',
  Wealth: 'Inversion y futuro',
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

// ============================================================================
// Mensajes motivadores segun estado financiero
// ============================================================================

export interface FinancialMood {
  message: string;
  tone: 'excellent' | 'good' | 'warning' | 'alert' | 'neutral';
}

export function getFinancialMood(
  savingsRate: number,
  monthlyIncome: number,
  monthlyExpenses: number
): FinancialMood {
  if (monthlyIncome === 0 && monthlyExpenses === 0) {
    return {
      message: 'Empieza a registrar tus movimientos para ver tu progreso.',
      tone: 'neutral',
    };
  }

  if (monthlyIncome === 0) {
    return {
      message: 'Registra tus ingresos para calcular tu tasa de ahorro.',
      tone: 'neutral',
    };
  }

  if (monthlyExpenses > monthlyIncome) {
    return {
      message: 'Revisemos esos gastos: estas gastando mas de lo que ingresas.',
      tone: 'alert',
    };
  }

  if (savingsRate >= 30) {
    return {
      message: 'Excelente ritmo de ahorro. Vas muy bien este mes.',
      tone: 'excellent',
    };
  }

  if (savingsRate >= 15) {
    return {
      message: 'Buen ritmo. Estas ahorrando de forma saludable.',
      tone: 'good',
    };
  }

  if (savingsRate > 0) {
    return {
      message: 'Estas ahorrando poco. Intenta reducir algun gasto no esencial.',
      tone: 'warning',
    };
  }

  return {
    message: 'Sin ahorro este mes. Revisa tus gastos cuando puedas.',
    tone: 'warning',
  };
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Buenos dias';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}