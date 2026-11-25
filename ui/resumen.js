// Pantalla Resumen: total del mes, cinta de cobros por día, cuánto dejar en la cuenta y próximos cobros.
import { formatearEuros } from '../formato.js';
import { totalDelMes, porcentajeDeuda, cuantoDejar, cobrosProximos, estaActivo, importesPorDia } from '../calculos.js';
import { el, montar, TIPOS, etiquetaTipo } from './util.js';
import { nombreMes, t } from '../i18n.js';
import { contar } from './movimiento.js';

// La secuencia de apertura (barras que crecen y total que sube) ocurre una vez por apertura de la app.
let yaAbierta = false;


export function fechaCorta(fecha) {
  return `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;
}


const lineaCobro = ({ fecha, pago }) =>
  el('li', {}, el('span', {}, `${fechaCorta(fecha)} · ${pago.nombre}`), el('span', { class: 'importe' }, formatearEuros(pago.importe)));

function cintaDelMes(dias, mes, diaHoy, primera) {
  const maximo = Math.max(...dias.map((d) => d.total), 1);
  const mayor = dias.reduce((a, b) => (b.total > a.total ? b : a), dias[0]);
  const descripcion = mayor.total > 0
    ? t('resumen.cinta.mayor', { mes: nombreMes(mes), dia: mayor.dia, importe: formatearEuros(mayor.total) })
    : t('resumen.cinta.nada', { mes: nombreMes(mes) });

  const columnas = dias.map((d) =>
    el('div', {
      class: `dia${d.dia === diaHoy ? ' hoy' : ''}`,
      'data-dia': d.dia,
      'data-total': d.total,
      style: `--i:${d.dia - 1}`,
    },
    d.total > 0
      ? el('span', { class: 'barra', style: `height:${Math.max(6, (d.total / maximo) * 100)}%` },
        TIPOS.filter((tipo) => d.porTipo[tipo] > 0).map((tipo) => el('span', { class: `seg ${tipo}`, style: `flex-grow:${d.porTipo[tipo]}` })))
      : null));

  const marcas = [1, 8, 15, 22, 29].filter((d) => d <= dias.length);
  // La nota va sobre el día de mayor cobro; a la derecha de la mitad del mes se alinea hacia la izquierda.
  const centro = ((mayor.dia - 0.5) / dias.length) * 100;
  const posicion = mayor.dia <= dias.length / 2 ? `left:calc(${centro}% - 6px)` : `right:calc(${100 - centro}% - 6px);text-align:right`;
  return [
    el('div', { class: `cinta-con-nota${primera ? ' entra' : ''}` },
      mayor.total > 0
        ? el('span', { class: 'nota', 'aria-hidden': 'true', style: posicion }, t('resumen.nota', { dia: mayor.dia, importe: formatearEuros(mayor.total) }))
        : null,
      el('div', { class: `cinta${primera ? ' entra' : ''}`, role: 'img', 'aria-label': descripcion, style: `--n:${dias.length}` }, columnas)),
    el('div', { class: 'eje', 'aria-hidden': 'true', style: `--n:${dias.length}` },
      marcas.map((d) => el('span', { style: `grid-column:${d} / span 3` }, String(d)))),
    el('ul', { class: 'leyenda' },
      TIPOS.map((tipo) => el('li', {}, el('span', { class: `punto ${tipo}` }), etiquetaTipo(tipo))),
      diaHoy ? el('li', {}, el('span', { class: 'punto hoy' }), t('resumen.hoy')) : null),
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
      el('p', { class: 'total-pie' }, t('resumen.vacio')),
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

  const total = el('p', { class: 'total num', 'aria-label': t('resumen.totalAria', { importe: formatearEuros(totales.total) }) }, formatearEuros(totales.total));
  if (primera) contar(total, totales.total, 700, formatearEuros);

  montar(raiz,
    el('p', { class: 'mes' }, nombreMes(mes)),
    total,
    el('p', { class: 'total-pie' }, t('resumen.totalPie')),
    cintaDelMes(importesPorDia(pagos, mes), mes, diaHoy, primera),

    el('section', { class: 'dejar' },
      el('h3', { style: 'margin-top:0' }, t('resumen.dejar.titulo')),
      el('p', { class: 'grande num' }, formatearEuros(cuantoDejar(pagos, mes))),
      el('p', { class: 'suave' }, t('resumen.dejar.texto'))),

    el('h3', {}, t('resumen.porTipo')),
    el('div', { class: 'desglose', role: 'img', 'aria-label': t('resumen.porTipoAria') },
      TIPOS.filter((tipo) => totales.porTipo[tipo] > 0).map((tipo) => el('span', { class: `seg ${tipo}`, style: `flex-grow:${totales.porTipo[tipo]}` }))),
    el('ul', { class: 'filas' },
      TIPOS.map((tipo) => el('li', {}, el('span', {}, etiquetaTipo(tipo)), el('span', { class: 'importe' }, formatearEuros(totales.porTipo[tipo]))))),
    totales.reembolsos > 0
      ? el('p', { class: 'suave' }, t('resumen.reembolsos', { importe: formatearEuros(totales.reembolsos) }))
      : null,

    el('h3', {}, t('resumen.porcentaje.titulo')),
    porcentaje === null
      ? el('p', { class: 'suave' }, t('resumen.porcentaje.sinIngresos'))
      : el('p', { class: 'grande num', style: 'font-size:1.6rem;font-weight:700;margin:0' }, `${String(porcentaje).replace('.', ',')} %`),

    el('h3', {}, t('resumen.proximo.titulo')),
    siguiente
      ? el('ul', { class: 'filas' }, lineaCobro(siguiente))
      : el('p', { class: 'suave' }, t('resumen.proximo.nada')),

    el('h3', {}, t('resumen.semana.titulo')),
    semana.length === 0
      ? el('p', { class: 'suave' }, t('resumen.semana.nada'))
      : el('ul', { class: 'filas' }, semana.map(lineaCobro)),
  );
}
