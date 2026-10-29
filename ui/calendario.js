// Pantalla Calendario: cobros del mes por día y proyección de los próximos 12 meses.
import { formatearEuros } from '../formato.js';
import { cobrosPorDia, proyeccion, estaActivo } from '../calculos.js';
import { el, montar } from './util.js';
import { nombreMes } from './resumen.js';

export function render(raiz, ctx) {
  const { pagos } = ctx.estado;
  const mes = ctx.mes;
  const porDia = cobrosPorDia(pagos, mes);
  const sinFecha = pagos.filter((p) => p.dia === null && estaActivo(p, mes));

  const filaPago = (p) =>
    el('div', { class: 'fila' }, el('span', {}, p.nombre), el('span', { class: 'importe' }, formatearEuros(p.importe)));

  montar(raiz,
    el('h2', {}, `Calendario de ${nombreMes(mes)}`),

    porDia.length === 0 && sinFecha.length === 0
      ? el('p', { class: 'suave' }, 'No hay pagos este mes.')
      : null,

    ...porDia.map(({ dia, pagos: lista }) =>
      el('div', { class: 'tarjeta' }, el('h3', {}, `Día ${dia}`), lista.map(filaPago))),

    sinFecha.length > 0
      ? el('div', { class: 'tarjeta' }, el('h3', {}, 'Sin fecha de cobro'), sinFecha.map(filaPago))
      : null,

    el('h2', {}, 'Próximos 12 meses'),
    el('div', { class: 'tarjeta' },
      el('table', {},
        el('thead', {}, el('tr', {}, el('th', {}, 'Mes'), el('th', {}, 'Total'), el('th', {}, 'Se libera'))),
        el('tbody', {}, proyeccion(pagos, mes, 12).map(({ mes: m, total, liberado }) =>
          el('tr', {},
            el('td', {}, m),
            el('td', {}, formatearEuros(total)),
            el('td', {}, liberado > 0 ? `+${formatearEuros(liberado)}` : '—')))))),
  );
}
