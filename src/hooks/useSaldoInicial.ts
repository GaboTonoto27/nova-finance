import { useMemo } from 'react';
import {
  EstadoEdicionSaldo,
  PeriodoActualizacion,
  EntradaHistorialSaldo,
  MAX_INTENTOS_SALDO_INICIAL,
} from '../types/finance';
import { PerfilUsuario } from '../firebase/users';

// ============================================================================
// NOVA v0.4.5.5 - Hook useSaldoInicial
// ============================================================================
// Centraliza toda la logica de bloqueo y permisos de edicion del saldo inicial.
//
// Reglas:
// - 0-24h desde ultimoCambioEn: edicion libre.
// - 24-48h: edicion con confirmacion.
// - +48h: bloqueado hasta proximaActualizacion.
//
// Intentos:
// - Maximo 3 intentos de correccion por periodo.
// - Los intentos se renuevan al cambiar de periodo.

const HORAS_VENTANA_LIBRE = 24;
const HORAS_VENTANA_CONFIRMACION = 48;

export type NivelAdvertencia = 'ok' | 'info' | 'warn' | 'danger' | 'blocked';

export interface UseSaldoInicialResult {
  montoActual: number;
  periodo: PeriodoActualizacion;
  proximaActualizacion: Date | null;
  historialSaldos: EntradaHistorialSaldo[];

  configurado: boolean;
  estadoEdicion: EstadoEdicionSaldo;
  puedeEditar: boolean;
  requiereConfirmacion: boolean;

  diasRestantes: number;
  horasDesdeUltimoCambio: number;
  textoBloqueo: string | null;

  fraseContextual: string;
  textoActualizacion: string;
  avisoProactivo: { tipo: 'hoy' | 'manana' | 'proximo' | null; mensaje: string } | null;

  puedeDeshacer: boolean;
  montoAnterior: number | null;
  minutosRestantesDeshacer: number;

  // Intentos
  intentosUsados: number;
  intentosRestantes: number;
  intentosMaximos: number;
  nivelAdvertencia: NivelAdvertencia;
  mensajeAdvertencia: string | null;
}

const FRASES_CONTEXTUALES: Record<PeriodoActualizacion, string> = {
  mensual: 'Tu saldo se actualiza cada mes, como tu sueldo.',
  quincenal: 'Tu saldo se actualiza cada quincena, como tu pago.',
  anual: 'Tu saldo se actualiza cada ano, como tus impuestos.',
};

const TEXTOS_ACTUALIZACION: Record<PeriodoActualizacion, string> = {
  mensual: 'Podes actualizar tu saldo inicial de este mes',
  quincenal: 'Podes actualizar tu saldo inicial de esta quincena',
  anual: 'Podes actualizar tu saldo inicial de este ano',
};

function calcularNivelAdvertencia(
  intentosRestantes: number,
  estadoEdicion: EstadoEdicionSaldo
): { nivel: NivelAdvertencia; mensaje: string | null } {
  if (estadoEdicion === 'bloqueado' || intentosRestantes === 0) {
    return {
      nivel: 'blocked',
      mensaje: 'Usaste los 3 intentos de correccion disponibles en este periodo.',
    };
  }

  if (intentosRestantes === 1) {
    return {
      nivel: 'danger',
      mensaje:
        'Te queda 1 intento de correccion. Es tu ultima oportunidad en este periodo. Revisa bien antes de guardar.',
    };
  }

  if (intentosRestantes === 2) {
    return {
      nivel: 'warn',
      mensaje:
        'Te quedan 2 intentos de correccion. Usalos con cuidado, el saldo inicial es la base de todos tus calculos.',
    };
  }

  return {
    nivel: 'ok',
    mensaje: null,
  };
}

export function useSaldoInicial(perfil: PerfilUsuario | null): UseSaldoInicialResult {
  return useMemo(() => {
    const saldo = perfil?.saldoInicial;

    const defaults: UseSaldoInicialResult = {
      montoActual: 0,
      periodo: 'mensual',
      proximaActualizacion: null,
      historialSaldos: [],
      configurado: false,
      estadoEdicion: 'libre',
      puedeEditar: true,
      requiereConfirmacion: false,
      diasRestantes: 0,
      horasDesdeUltimoCambio: 0,
      textoBloqueo: null,
      fraseContextual: FRASES_CONTEXTUALES.mensual,
      textoActualizacion: TEXTOS_ACTUALIZACION.mensual,
      avisoProactivo: null,
      puedeDeshacer: false,
      montoAnterior: null,
      minutosRestantesDeshacer: 0,
      intentosUsados: 0,
      intentosRestantes: MAX_INTENTOS_SALDO_INICIAL,
      intentosMaximos: MAX_INTENTOS_SALDO_INICIAL,
      nivelAdvertencia: 'ok',
      mensajeAdvertencia: null,
    };

    if (!saldo) return defaults;

    const ahora = new Date();
    const ultimoCambio = new Date(saldo.ultimoCambioEn);
    const proxima = saldo.proximaActualizacion
      ? new Date(saldo.proximaActualizacion)
      : null;

    const msDesdeCambio = ahora.getTime() - ultimoCambio.getTime();
    const horasDesdeUltimoCambio = msDesdeCambio / (1000 * 60 * 60);

    let diasRestantes = 0;
    if (proxima) {
      const msRestantes = proxima.getTime() - ahora.getTime();
      diasRestantes = Math.max(0, Math.ceil(msRestantes / (1000 * 60 * 60 * 24)));
    }

    // Determinar estado de edicion
    let estadoEdicion: EstadoEdicionSaldo = 'bloqueado';
    if (horasDesdeUltimoCambio < HORAS_VENTANA_LIBRE) {
      estadoEdicion = 'libre';
    } else if (horasDesdeUltimoCambio < HORAS_VENTANA_CONFIRMACION) {
      estadoEdicion = 'confirmacion';
    } else if (proxima && ahora >= proxima) {
      estadoEdicion = 'libre';
    }

    // Calcular intentos
    const intentosUsados = saldo.intentosUsados ?? 0;
    const intentosRestantes = Math.max(0, MAX_INTENTOS_SALDO_INICIAL - intentosUsados);

    // Si no quedan intentos, se bloquea la edicion
    if (intentosRestantes === 0) {
      estadoEdicion = 'bloqueado';
    }

    const puedeEditar = estadoEdicion === 'libre' || estadoEdicion === 'confirmacion';
    const requiereConfirmacion = estadoEdicion === 'confirmacion';

    let textoBloqueo: string | null = null;
    if (estadoEdicion === 'bloqueado' && proxima) {
      const fechaFormateada = proxima.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      if (intentosRestantes === 0) {
        textoBloqueo = `Usaste los 3 intentos de correccion. Vas a poder volver a editarlo el ${fechaFormateada}.`;
      } else {
        textoBloqueo = `Tu saldo se bloquea 48 horas despues de la ultima actualizacion. Vas a poder editarlo el ${fechaFormateada}.`;
      }
    }

    // Aviso proactivo
    let avisoProactivo: UseSaldoInicialResult['avisoProactivo'] = null;
    if (proxima && estadoEdicion === 'bloqueado' && intentosRestantes > 0) {
      if (diasRestantes === 0) {
        avisoProactivo = {
          tipo: 'hoy',
          mensaje: `Hoy es el dia! ${TEXTOS_ACTUALIZACION[saldo.periodoActualizacion]}.`,
        };
      } else if (diasRestantes === 1) {
        avisoProactivo = {
          tipo: 'manana',
          mensaje: 'Manana vas a poder actualizar tu saldo inicial',
        };
      } else if (diasRestantes <= 3) {
        avisoProactivo = {
          tipo: 'proximo',
          mensaje: `En ${diasRestantes} dias vas a poder actualizar tu saldo inicial`,
        };
      }
    }

    // Deshacer (5 minutos)
    const MINUTOS_DESHACER = 5;
    const minutosDesdeCambio = msDesdeCambio / (1000 * 60);
    const puedeDeshacer = minutosDesdeCambio < MINUTOS_DESHACER;
    const minutosRestantesDeshacer = Math.max(
      0,
      Math.floor(MINUTOS_DESHACER - minutosDesdeCambio)
    );

    let montoAnterior: number | null = null;
    if (puedeDeshacer && saldo.historialSaldos && saldo.historialSaldos.length >= 2) {
      montoAnterior = saldo.historialSaldos[saldo.historialSaldos.length - 2].monto;
    }

    // Nivel de advertencia segun intentos
    const { nivel, mensaje } = calcularNivelAdvertencia(intentosRestantes, estadoEdicion);

    return {
      montoActual: saldo.monto,
      periodo: saldo.periodoActualizacion,
      proximaActualizacion: proxima,
      historialSaldos: saldo.historialSaldos || [],
      configurado: saldo.configurado,
      estadoEdicion,
      puedeEditar,
      requiereConfirmacion,
      diasRestantes,
      horasDesdeUltimoCambio: Math.floor(horasDesdeUltimoCambio),
      textoBloqueo,
      fraseContextual: FRASES_CONTEXTUALES[saldo.periodoActualizacion],
      textoActualizacion: TEXTOS_ACTUALIZACION[saldo.periodoActualizacion],
      avisoProactivo,
      puedeDeshacer,
      montoAnterior,
      minutosRestantesDeshacer,
      intentosUsados,
      intentosRestantes,
      intentosMaximos: MAX_INTENTOS_SALDO_INICIAL,
      nivelAdvertencia: nivel,
      mensajeAdvertencia: mensaje,
    };
  }, [perfil]);
}