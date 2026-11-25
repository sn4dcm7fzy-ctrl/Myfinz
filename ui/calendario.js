// Pantalla Calendario: cuadrícula del mes, detalle por día y proyección de los próximos 12 meses.
import { formatearEuros } from '../formato.js';
import { cobrosPorDia, importesPorDia, proyeccion, semanasDelMes, estaActivo } from '../calculos.js';
import { el, montar, TIPOS } from './util.js';
import { nombreMes, t } from '../i18n.js';

// La proyección entra con una secuencia solo la primera vez que se abre en cada apertura de la app.
let proyeccionVista = false;

function cuadricula(pagos, mes, diaHoy) {
  const porDia = importesPorDia(pagos, mes);
  const conteo = new Map(cobrosPorDia(pagos, mes).map(({ dia, pagos: lista }) => [dia, lista.length]));
  const maximo = Math.max(...porDia.map((d) => d.total), 1);

  const celda = (dia) => {
    if (dia === null) return el('div', { class: 'celda vacia', 'aria-hidden': 'true' });
    const info = porDia[dia - 1];
    const n = conteo.get(dia) ?? 0;
    const etiqueta = n === 0
      ? t('calendario.dia.sinCobros', { dia })
      : t(n === 1 ? 'calendario.dia.unPago' : 'calendario.dia.pagos', { dia, n, importe: formatearEuros(info.total) });
    return el('div', {
      class: `celda${dia === diaHoy ? ' hoy' : ''}`,
      'data-dia': dia,
      'aria-label': etiqueta,
      style: `--nivel:${info.total / maximo}`,
    },
    el('span', {}, String(dia)),
    el('span', { class: 'puntos' }, TIPOS.filter((tipo) => info.porTipo[tipo] > 0).map((tipo) => el('span', { class: `punto ${tipo}` }))));
  };

  return el('div', { class: 'cuadricula' },
    t('calendario.diasSemana').split(',').map((d) => el('div', { class: 'cab', 'aria-hidden': 'true' }, d)),
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
          'aria-label': d.liberado > 0
            ? t('calendario.mesAriaLibera', { mes: nombreMes(d.mes), importe: formatearEuros(d.total), libera: formatearEuros(d.liberado) })
            : t('calendario.mesAria', { mes: nombreMes(d.mes), importe: formatearEuros(d.total) }),
        },
        el('div', { class: 'relleno', style: `height:${(d.total / maximo) * 100}%;--i:${i}` })))),
    el('div', { class: 'nombres-meses', 'aria-hidden': 'true' }, datos.map((d) => el('span', {}, nombreMes(d.mes, 'short')))),
    datos.some((d) => d.liberado > 0)
      ? el('p', { class: 'suave', style: 'margin-top:10px' }, t('calendario.verde'))
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
    el('p', { class: 'mes' }, t('calendario.titulo')),
    el('h2', { style: 'font-size:1.6rem;letter-spacing:-0.02em;margin-bottom:14px' }, nombreMes(mes)),
    cuadricula(pagos, mes, diaHoy),

    porDia.length === 0 && sinFecha.length === 0
      ? el('p', { class: 'suave' }, t('calendario.vacio'))
      : null,
    ...porDia.map(({ dia, pagos: lista }) =>
      [el('h3', {}, t('calendario.dia', { dia })), el('ul', { class: 'filas' }, lista.map(filaPago))]).flat(),
    sinFecha.length > 0
      ? [el('h3', {}, t('calendario.sinFecha')), el('ul', { class: 'filas' }, sinFecha.map(filaPago))]
      : null,

    el('h3', {}, t('calendario.proximos12')),
    ...graficoProyeccion(datos),
    libera.length > 0 ? el('h3', {}, t('calendario.terminan')) : null,
    libera.length > 0
      ? el('ul', { class: 'filas' }, libera.map((d) =>
        el('li', {}, el('span', {}, nombreMes(d.mes)), el('span', { class: 'importe' }, `+${formatearEuros(d.liberado)}`))))
      : null,
  );
}
