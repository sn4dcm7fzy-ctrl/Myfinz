// Pantalla Resumen: total del mes, porcentaje de deuda, próximo cobro y cuánto dejar en la cuenta.
import { formatearEuros } from '../formato.js';
import { totalDelMes, porcentajeDeuda, cuantoDejar, cobrosProximos, estaActivo } from '../calculos.js';
import { el, montar, ETIQUETA_TIPO } from './util.js';

export function nombreMes(mes) {
  const [anio, m] = mes.split('-').map(Number);
  return new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(new Date(anio, m - 1, 1));
}

export function fechaCorta(fecha) {
  return `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;
}

const lineaCobro = ({ fecha, pago }) =>
  el('div', { class: 'fila' }, el('span', {}, `${fechaCorta(fecha)} · ${pago.nombre}`), el('span', { class: 'importe' }, formatearEuros(pago.importe)));

export function render(raiz, ctx) {
  const { pagos, ingresos } = ctx.estado;
  const mes = ctx.mes;
  const activos = pagos.filter((p) => estaActivo(p, mes));

  if (activos.length === 0) {
    montar(raiz,
      el('h2', {}, `Resumen de ${nombreMes(mes)}`),
      el('p', { class: 'suave' }, 'No hay pagos este mes. Añádelos en la pestaña Pagos y aquí verás el resumen.'),
    );
    return;
  }

  const totales = totalDelMes(pagos, mes);
  const porcentaje = porcentajeDeuda(pagos, mes, ingresos);
  const siguiente = cobrosProximos(pagos, ctx.hoy, 62)[0];
  const semana = cobrosProximos(pagos, ctx.hoy, 7);

  montar(raiz,
    el('h2', {}, `Resumen de ${nombreMes(mes)}`),

    el('div', { class: 'tarjeta' },
      el('h3', {}, 'Pagos del mes'),
      el('div', { class: 'grande' }, formatearEuros(totales.total)),
      ...Object.entries(ETIQUETA_TIPO).map(([tipo, texto]) =>
        el('div', { class: 'fila' }, el('span', { class: 'suave' }, texto), el('span', { class: 'importe' }, formatearEuros(totales.porTipo[tipo])))),
      totales.reembolsos > 0
        ? el('p', { class: 'suave' }, `Otras personas te devuelven ${formatearEuros(totales.reembolsos)} al mes. No cuenta como ingreso tuyo.`)
        : null),

    el('div', { class: 'tarjeta' },
      el('h3', {}, 'Cuotas de deuda sobre tus ingresos'),
      porcentaje === null
        ? el('p', { class: 'suave' }, 'Añade tus ingresos en Ajustes para ver este porcentaje.')
        : el('div', { class: 'grande' }, `${String(porcentaje).replace('.', ',')} %`)),

    el('div', { class: 'tarjeta' },
      el('h3', {}, 'Cuánto dejar en la cuenta'),
      el('div', { class: 'grande' }, formatearEuros(cuantoDejar(pagos, mes))),
      el('p', { class: 'suave' }, 'Peor caso: lo que se cobra el día 1 más los pagos sin fecha. Dejarlo en la cuenta antes de que entre el sueldo evita que falle un cobro.')),

    el('div', { class: 'tarjeta' },
      el('h3', {}, 'Próximo cobro'),
      siguiente ? lineaCobro(siguiente) : el('p', { class: 'suave' }, 'No hay cobros con fecha en los próximos dos meses.')),

    el('div', { class: 'tarjeta' },
      el('h3', {}, 'Próximos 7 días'),
      semana.length === 0 ? el('p', { class: 'suave' }, 'Ningún cobro en los próximos 7 días.') : semana.map(lineaCobro)),
  );
}
