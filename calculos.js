// Lógica de fechas y totales. Funciones puras: sin DOM, sin almacenamiento, sin Date local.
// Meses como 'YYYY-MM', fechas como 'YYYY-MM-DD', importes en céntimos enteros.

function partesMes(mes) {
  const [anio, m] = mes.split('-').map(Number);
  return { anio, m };
}

function juntarMes(anio, m) {
  return `${anio}-${String(m).padStart(2, '0')}`;
}

export function sumarMes(mes, n) {
  const { anio, m } = partesMes(mes);
  const total = anio * 12 + (m - 1) + n;
  return juntarMes(Math.floor(total / 12), (total % 12) + 1);
}

// La cuota del mes actual cuenta: 1 cuota restante termina este mismo mes.
export function mesFinDesdeCuotas(mesActual, cuotas) {
  return sumarMes(mesActual, cuotas - 1);
}

// 'YYYY-MM' se compara bien como texto. mesInicio ausente o null = sin límite por delante.
export function estaActivo(pago, mes) {
  if (pago.mesInicio && mes < pago.mesInicio) return false;
  return pago.mesFin === null || mes <= pago.mesFin;
}

// El inicio nunca va después del fin: un pago ya terminado empieza (y se ve) en su último mes.
export function mesInicioPara(mesInicio, mesFin) {
  return mesInicio !== null && mesFin !== null && mesFin < mesInicio ? mesFin : mesInicio;
}

export function estaPagado(pago, mes) {
  return Object.hasOwn(pago.pagados ?? {}, mes);
}

// Marca el mes como pagado y baja el saldo (nunca por debajo de 0). Anota lo descontado para poder deshacerlo exacto.
export function marcarPagado(pago, mes) {
  if (!estaActivo(pago, mes) || estaPagado(pago, mes)) return pago;
  const descontado = pago.saldo === null ? 0 : Math.min(pago.saldo, pago.importe);
  return {
    ...pago,
    saldo: pago.saldo === null ? null : pago.saldo - descontado,
    pagados: { ...pago.pagados, [mes]: descontado },
  };
}

export function desmarcarPagado(pago, mes) {
  if (!estaPagado(pago, mes)) return pago;
  const { [mes]: descontado, ...resto } = pago.pagados;
  return {
    ...pago,
    saldo: pago.saldo === null ? null : pago.saldo + descontado,
    pagados: resto,
  };
}

// Lo que sale de la cuenta este mes: total de pagos activos, lo ya marcado y lo que falta. Sin reembolsos.
export function resumenPagado(pagos, mes) {
  let total = 0;
  let pagado = 0;
  for (const pago of pagos) {
    if (!estaActivo(pago, mes)) continue;
    total += pago.importe;
    if (estaPagado(pago, mes)) pagado += pago.importe;
  }
  return { total, pagado, falta: total - pagado };
}

// Sube (-1) o baja (1) un pago respecto a su vecino visible. `visibles` son los ids en el orden que se ve.
export function moverPago(pagos, id, direccion, visibles) {
  const posicion = visibles.indexOf(id);
  const vecino = visibles[posicion + direccion];
  if (posicion === -1 || vecino === undefined) return pagos;
  const a = pagos.findIndex((p) => p.id === id);
  const b = pagos.findIndex((p) => p.id === vecino);
  const nueva = [...pagos];
  [nueva[a], nueva[b]] = [nueva[b], nueva[a]];
  return nueva;
}

export function diasDelMes(mes) {
  const { anio, m } = partesMes(mes);
  if (m === 2) {
    const bisiesto = (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
    return bisiesto ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

export function diaEfectivo(dia, mes) {
  return Math.min(dia, diasDelMes(mes));
}

export function totalDelMes(pagos, mes) {
  const resultado = {
    total: 0,
    porTipo: { deuda: 0, contrato: 0, suscripcion: 0 },
    reembolsos: 0,
  };
  for (const pago of pagos) {
    if (!estaActivo(pago, mes)) continue;
    resultado.total += pago.importe;
    resultado.porTipo[pago.tipo] += pago.importe;
    resultado.reembolsos += pago.reembolso ?? 0;
  }
  return resultado;
}

// Porcentaje (1 decimal) de los ingresos que va a cuotas de deuda, sin descontar reembolsos.
// Devuelve null si no hay ingresos, para no dividir por cero.
export function porcentajeDeuda(pagos, mes, ingresos) {
  if (!ingresos) return null;
  const { porTipo } = totalDelMes(pagos, mes);
  return Math.round((porTipo.deuda / ingresos) * 1000) / 10;
}

// Peor caso: lo que se cobra el día 1 más lo que no tiene fecha, sin descontar reembolsos.
export function cuantoDejar(pagos, mes) {
  return pagos
    .filter((p) => estaActivo(p, mes) && (p.dia === null || diaEfectivo(p.dia, mes) === 1))
    .reduce((suma, p) => suma + p.importe, 0);
}

// Cobros del mes agrupados por día efectivo, ordenados. Excluye sin fecha y terminados.
export function cobrosPorDia(pagos, mes) {
  const grupos = new Map();
  for (const pago of pagos) {
    if (pago.dia === null || !estaActivo(pago, mes)) continue;
    const dia = diaEfectivo(pago.dia, mes);
    if (!grupos.has(dia)) grupos.set(dia, []);
    grupos.get(dia).push(pago);
  }
  return [...grupos.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([dia, lista]) => ({ dia, pagos: lista }));
}

function siguienteDia(fecha) {
  const mes = fecha.slice(0, 7);
  const dia = Number(fecha.slice(8, 10));
  if (dia < diasDelMes(mes)) return `${mes}-${String(dia + 1).padStart(2, '0')}`;
  return `${sumarMes(mes, 1)}-01`;
}

// Cobros desde `hoy` hasta `dias` días después (ambos incluidos), ordenados por fecha.
export function cobrosProximos(pagos, hoy, dias) {
  const resultado = [];
  let fecha = hoy;
  for (let i = 0; i <= dias; i++) {
    const mes = fecha.slice(0, 7);
    const dia = Number(fecha.slice(8, 10));
    for (const pago of pagos) {
      if (pago.dia !== null && estaActivo(pago, mes) && diaEfectivo(pago.dia, mes) === dia) {
        resultado.push({ fecha, pago });
      }
    }
    fecha = siguienteDia(fecha);
  }
  return resultado;
}

// `liberado` = importes de las cuotas cuyo último mes fue el mes anterior.
export function proyeccion(pagos, mesInicial, meses) {
  const resultado = [];
  for (let i = 0; i < meses; i++) {
    const mes = sumarMes(mesInicial, i);
    const anterior = sumarMes(mes, -1);
    const liberado = pagos
      .filter((p) => p.mesFin === anterior)
      .reduce((suma, p) => suma + p.importe, 0);
    resultado.push({ mes, total: totalDelMes(pagos, mes).total, liberado });
  }
  return resultado;
}

// Día de la semana del día 1 del mes, con el lunes como 0 (algoritmo de Sakamoto).
function diaSemanaDelPrimero(mes) {
  const { anio, m } = partesMes(mes);
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const y = m < 3 ? anio - 1 : anio;
  const domingoCero = (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[m - 1] + 1) % 7;
  return (domingoCero + 6) % 7;
}

// Semanas de lunes a domingo; los huecos antes del día 1 y después del último día son null.
export function semanasDelMes(mes) {
  const celdas = [...Array(diaSemanaDelPrimero(mes)).fill(null)];
  for (let d = 1; d <= diasDelMes(mes); d++) celdas.push(d);
  while (celdas.length % 7 !== 0) celdas.push(null);
  const semanas = [];
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
  return semanas;
}

// Una entrada por día del mes con lo que se cobra ese día (los pagos sin fecha no entran).
export function importesPorDia(pagos, mes) {
  const dias = Array.from({ length: diasDelMes(mes) }, (_, i) => ({
    dia: i + 1,
    total: 0,
    porTipo: { deuda: 0, contrato: 0, suscripcion: 0 },
  }));
  for (const pago of pagos) {
    if (pago.dia === null || !estaActivo(pago, mes)) continue;
    const entrada = dias[diaEfectivo(pago.dia, mes) - 1];
    entrada.total += pago.importe;
    entrada.porTipo[pago.tipo] += pago.importe;
  }
  return dias;
}
