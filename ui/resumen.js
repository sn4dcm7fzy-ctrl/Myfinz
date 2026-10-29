// Pantalla Resumen: total del mes, cinta de cobros por día, cuánto dejar en la cuenta y próximos cobros.
import { formatearEuros } from '../formato.js';
import { totalDelMes, porcentajeDeuda, cuantoDejar, cobrosProximos, estaActivo, importesPorDia } from '../calculos.js';
import { el, montar, ETIQUETA_TIPO } from './util.js';
import { contar } from './movimiento.js';

// La secuencia de apertura (barras que crecen y total que sube) ocurre una vez por apertura de la app.
let yaAbierta = false;

export function nombreMes(mes) {
  const [anio, m] = mes.split('-').map(Number);
  return new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(new Date(anio, m - 1, 1));
}

export function fechaCorta(fecha) {
  return `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;
}

const TIPOS = Object.keys(ETIQUETA_TIPO);

const lineaCobro = ({ fecha, pago }) =>
  el('li', {}, el('span', {}, `${fechaCorta(fecha)} · ${pago.nombre}`), el('span', { class: 'importe' }, formatearEuros(pago.importe)));

function cintaDelMes(dias, mes, diaHoy, primera) {
  const maximo = Math.max(...dias.map((d) => d.total), 1);
  const mayor = dias.reduce((a, b) => (b.total > a.total ? b : a), dias[0]);
  const descripcion = mayor.total > 0
    ? `Cobros por día de ${nombreMes(mes)}. El mayor es el día ${mayor.dia}: ${formatearEuros(mayor.total)}.`
    : `Cobros por día de ${nombreMes(mes)}. Ningún cobro con fecha.`;

  const columnas = dias.map((d) =>
    el('div', {
      class: `dia${d.dia === diaHoy ? ' hoy' : ''}`,
      'data-dia': d.dia,
      'data-total': d.total,
      style: `--i:${d.dia - 1}`,
    },
    d.total > 0
      ? el('span', { class: 'barra', style: `height:${Math.max(6, (d.total / maximo) * 100)}%` },
        TIPOS.filter((t) => d.porTipo[t] > 0).map((t) => el('span', { class: `seg ${t}`, style: `flex-grow:${d.porTipo[t]}` })))
      : null));

  const marcas = [1, 8, 15, 22, 29].filter((d) => d <= dias.length);
  // La nota va sobre el día de mayor cobro; a la derecha de la mitad del mes se alinea hacia la izquierda.
  const centro = ((mayor.dia - 0.5) / dias.length) * 100;
  const posicion = mayor.dia <= dias.length / 2 ? `left:calc(${centro}% - 6px)` : `right:calc(${100 - centro}% - 6px);text-align:right`;
  return [
    el('div', { class: `cinta-con-nota${primera ? ' entra' : ''}` },
      mayor.total > 0
        ? el('span', { class: 'nota', 'aria-hidden': 'true', style: posicion }, `día ${mayor.dia} · ${formatearEuros(mayor.total)}`)
        : null,
      el('div', { class: `cinta${primera ? ' entra' : ''}`, role: 'img', 'aria-label': descripcion, style: `--n:${dias.length}` }, columnas)),
    el('div', { class: 'eje', 'aria-hidden': 'true', style: `--n:${dias.length}` },
      marcas.map((d) => el('span', { style: `grid-column:${d} / span 3` }, String(d)))),
    el('ul', { class: 'leyenda' },
      TIPOS.map((t) => el('li', {}, el('span', { class: `punto ${t}` }), ETIQUETA_TIPO[t])),
      diaHoy ? el('li', {}, el('span', { class: 'punto hoy' }), 'hoy') : null),
  ];
}

export function render(raiz, ctx) {
  const { pagos, ingresos } = ctx.estado;
  const mes = ctx.mes;
  const activos = pagos.filter((p) => estaActivo(p, mes));

  if (activos.length === 0) {
    montar(raiz,
      el('p', { class: 'mes' }, nombreMes(mes)),
      el('p', { class: 'total num' }, formatearEuros(0)),
      el('p', { class: 'total-pie' }, 'No hay pagos este mes. Añádelos en la pestaña Pagos y aquí verás el resumen.'),
    );
    return;
  }

  const primera = !yaAbierta;
  yaAbierta = true;

  const totales = totalDelMes(pagos, mes);
  const porcentaje = porcentajeDeuda(pagos, mes, ingresos);
  const siguiente = cobrosProximos(pagos, ctx.hoy, 62)[0];
  const semana = cobrosProximos(pagos, ctx.hoy, 7);
  const diaHoy = ctx.hoy.slice(0, 7) === mes ? Number(ctx.hoy.slice(8, 10)) : null;

  const total = el('p', { class: 'total num', 'aria-label': `Pagos del mes: ${formatearEuros(totales.total)}` }, formatearEuros(totales.total));
  if (primera) contar(total, totales.total, 700, formatearEuros);

  montar(raiz,
    el('p', { class: 'mes' }, nombreMes(mes)),
    total,
    el('p', { class: 'total-pie' }, 'se cobra este mes'),
    cintaDelMes(importesPorDia(pagos, mes), mes, diaHoy, primera),

    el('section', { class: 'dejar' },
      el('h3', { style: 'margin-top:0' }, 'Cuánto dejar en la cuenta'),
      el('p', { class: 'grande num' }, formatearEuros(cuantoDejar(pagos, mes))),
      el('p', { class: 'suave' }, 'Peor caso: lo que se cobra el día 1 más los pagos sin fecha. Déjalo en la cuenta antes de que entre el sueldo para que no falle ningún cobro.')),

    el('h3', {}, 'Por tipo'),
    el('div', { class: 'desglose', role: 'img', 'aria-label': 'Reparto del mes por tipo de pago' },
      TIPOS.filter((t) => totales.porTipo[t] > 0).map((t) => el('span', { class: `seg ${t}`, style: `flex-grow:${totales.porTipo[t]}` }))),
    el('ul', { class: 'filas' },
      TIPOS.map((t) => el('li', {}, el('span', {}, ETIQUETA_TIPO[t]), el('span', { class: 'importe' }, formatearEuros(totales.porTipo[t]))))),
    totales.reembolsos > 0
      ? el('p', { class: 'suave' }, `Otras personas te devuelven ${formatearEuros(totales.reembolsos)} al mes. No cuenta como ingreso tuyo.`)
      : null,

    el('h3', {}, 'Cuotas de deuda sobre tus ingresos'),
    porcentaje === null
      ? el('p', { class: 'suave' }, 'Añade tus ingresos en Ajustes para ver este porcentaje.')
      : el('p', { class: 'grande num', style: 'font-size:1.6rem;font-weight:700;margin:0' }, `${String(porcentaje).replace('.', ',')} %`),

    el('h3', {}, 'Próximo cobro'),
    siguiente
      ? el('ul', { class: 'filas' }, lineaCobro(siguiente))
      : el('p', { class: 'suave' }, 'No hay cobros con fecha en los próximos dos meses.'),

    el('h3', {}, 'Próximos 7 días'),
    semana.length === 0
      ? el('p', { class: 'suave' }, 'Ningún cobro en los próximos 7 días.')
      : el('ul', { class: 'filas' }, semana.map(lineaCobro)),
  );
}
