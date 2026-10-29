// Pantalla Calendario: cuadrícula del mes, detalle por día y proyección de los próximos 12 meses.
import { formatearEuros } from '../formato.js';
import { cobrosPorDia, importesPorDia, proyeccion, semanasDelMes, estaActivo } from '../calculos.js';
import { el, montar, ETIQUETA_TIPO } from './util.js';
import { nombreMes } from './resumen.js';

const TIPOS = Object.keys(ETIQUETA_TIPO);
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// La proyección entra con una secuencia solo la primera vez que se abre en cada apertura de la app.
let proyeccionVista = false;

function nombreMesCorto(mes) {
  const [anio, m] = mes.split('-').map(Number);
  return new Intl.DateTimeFormat('es', { month: 'short' }).format(new Date(anio, m - 1, 1)).replace('.', '');
}

function cuadricula(pagos, mes, diaHoy) {
  const porDia = importesPorDia(pagos, mes);
  const conteo = new Map(cobrosPorDia(pagos, mes).map(({ dia, pagos: lista }) => [dia, lista.length]));
  const maximo = Math.max(...porDia.map((d) => d.total), 1);

  const celda = (dia) => {
    if (dia === null) return el('div', { class: 'celda vacia', 'aria-hidden': 'true' });
    const info = porDia[dia - 1];
    const n = conteo.get(dia) ?? 0;
    const etiqueta = n === 0
      ? `Día ${dia}: sin cobros`
      : `Día ${dia}: ${n} ${n === 1 ? 'pago' : 'pagos'}, ${formatearEuros(info.total)}`;
    return el('div', {
      class: `celda${dia === diaHoy ? ' hoy' : ''}`,
      'data-dia': dia,
      'aria-label': etiqueta,
      style: `--nivel:${info.total / maximo}`,
    },
    el('span', {}, String(dia)),
    el('span', { class: 'puntos' }, TIPOS.filter((t) => info.porTipo[t] > 0).map((t) => el('span', { class: `punto ${t}` }))));
  };

  return el('div', { class: 'cuadricula' },
    DIAS_SEMANA.map((d) => el('div', { class: 'cab', 'aria-hidden': 'true' }, d)),
    semanasDelMes(mes).flat().map(celda));
}

function graficoProyeccion(datos) {
  const primera = !proyeccionVista;
  proyeccionVista = true;
  const maximo = Math.max(...datos.map((d) => d.total), 1);
  return [
    el('div', { class: `proyeccion${primera ? ' entra' : ''}` },
      datos.map((d, i) =>
        el('div', {
          class: `barra-mes${d.liberado > 0 ? ' libera' : ''}`,
          role: 'img',
          'aria-label': `${nombreMes(d.mes)}: ${formatearEuros(d.total)}${d.liberado > 0 ? `, se liberan ${formatearEuros(d.liberado)}` : ''}`,
        },
        el('div', { class: 'relleno', style: `height:${(d.total / maximo) * 100}%;--i:${i}` })))),
    el('div', { class: 'nombres-meses', 'aria-hidden': 'true' }, datos.map((d) => el('span', {}, nombreMesCorto(d.mes)))),
    datos.some((d) => d.liberado > 0)
      ? el('p', { class: 'suave', style: 'margin-top:10px' }, 'Verde: mes en que termina una cuota y se libera dinero.')
      : null,
  ];
}

export function render(raiz, ctx) {
  const { pagos } = ctx.estado;
  const mes = ctx.mes;
  const diaHoy = ctx.hoy.slice(0, 7) === mes ? Number(ctx.hoy.slice(8, 10)) : null;
  const porDia = cobrosPorDia(pagos, mes);
  const sinFecha = pagos.filter((p) => p.dia === null && estaActivo(p, mes));
  const datos = proyeccion(pagos, mes, 12);
  const libera = datos.filter((d) => d.liberado > 0);

  const filaPago = (p) =>
    el('li', {}, el('span', {}, p.nombre), el('span', { class: 'importe' }, formatearEuros(p.importe)));

  montar(raiz,
    el('p', { class: 'mes' }, 'Calendario'),
    el('h2', { style: 'font-size:1.6rem;letter-spacing:-0.02em;margin-bottom:14px' }, nombreMes(mes)),
    cuadricula(pagos, mes, diaHoy),

    porDia.length === 0 && sinFecha.length === 0
      ? el('p', { class: 'suave' }, 'No hay pagos este mes.')
      : null,
    ...porDia.map(({ dia, pagos: lista }) =>
      [el('h3', {}, `Día ${dia}`), el('ul', { class: 'filas' }, lista.map(filaPago))]).flat(),
    sinFecha.length > 0
      ? [el('h3', {}, 'Sin fecha de cobro'), el('ul', { class: 'filas' }, sinFecha.map(filaPago))]
      : null,

    el('h3', {}, 'Próximos 12 meses'),
    ...graficoProyeccion(datos),
    libera.length > 0 ? el('h3', {}, 'Cuando terminan cuotas') : null,
    libera.length > 0
      ? el('ul', { class: 'filas' }, libera.map((d) =>
        el('li', {}, el('span', {}, nombreMes(d.mes)), el('span', { class: 'importe' }, `+${formatearEuros(d.liberado)}`))))
      : null,
  );
}
