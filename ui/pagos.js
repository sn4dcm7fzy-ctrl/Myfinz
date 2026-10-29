// Pantalla Pagos: lista con filtro y formulario para añadir, editar y borrar.
import { formatearEuros, parsearEuros } from '../formato.js';
import { mesFinDesdeCuotas } from '../calculos.js';
import { validar } from '../almacen.js';
import { el, generarId, ETIQUETA_TIPO } from './util.js';

let filtro = 'todos';
let formulario = null; // null = cerrado; { pago: Pago|null } = abierto (null = pago nuevo)

// Al salir de la pantalla se descarta el formulario: podria apuntar a un pago que ya no existe.
export function cerrarFormulario() {
  formulario = null;
}

export function render(raiz, ctx) {
  raiz.replaceChildren(
    el('h2', { style: 'font-size:1.6rem;letter-spacing:-0.02em' }, 'Pagos'),
    formulario ? vistaFormulario(raiz, ctx) : barraSuperior(raiz, ctx),
    ...(formulario ? [] : lista(raiz, ctx)),
  );
}

function barraSuperior(raiz, ctx) {
  const selector = el(
    'select',
    { 'aria-label': 'Filtrar por tipo', onchange: (e) => { filtro = e.target.value; render(raiz, ctx); } },
    el('option', { value: 'todos', selected: filtro === 'todos' }, 'Todos'),
    ...Object.entries(ETIQUETA_TIPO).map(([valor, texto]) =>
      el('option', { value: valor, selected: filtro === valor }, texto)),
  );
  return el(
    'div',
    { class: 'barra-superior' },
    el('label', {}, 'Mostrar', selector),
    el('button', { type: 'button', class: 'primario', onclick: () => { formulario = { pago: null }; render(raiz, ctx); } }, 'Añadir pago'),
  );
}

function lista(raiz, ctx) {
  const pagos = ctx.estado.pagos.filter((p) => filtro === 'todos' || p.tipo === filtro);
  if (pagos.length === 0) {
    return [el('p', { class: 'suave' }, ctx.estado.pagos.length === 0
      ? 'Todavía no hay pagos. Pulsa «Añadir pago» para empezar.'
      : 'No hay pagos de este tipo.')];
  }
  return pagos.map((pago) => tarjetaPago(raiz, ctx, pago));
}

function tarjetaPago(raiz, ctx, pago) {
  const detalle = [
    pago.dia === null ? 'sin fecha de cobro' : `cobra el día ${pago.dia}`,
    pago.mesFin === null ? 'sin fin' : `hasta ${pago.mesFin}`,
  ];
  if (pago.saldo !== null) detalle.push(`pendiente ${formatearEuros(pago.saldo)}`);
  if (pago.reembolso !== null) {
    detalle.push(`te devuelven ${formatearEuros(pago.reembolso)}${pago.reembolsoDe ? ` (${pago.reembolsoDe})` : ''}`);
  }
  return el(
    'div',
    { class: `item ${pago.tipo}` },
    el('div', { class: 'fila' },
      el('div', {}, el('div', { class: 'tipo' }, ETIQUETA_TIPO[pago.tipo]), el('strong', {}, pago.nombre)),
      el('span', { class: 'importe' }, formatearEuros(pago.importe))),
    el('div', { class: 'suave' }, detalle.join(' · ')),
    el('div', { class: 'acciones' },
      el('button', { type: 'button', class: 'texto', onclick: () => { formulario = { pago }; render(raiz, ctx); } }, 'Editar'),
      el('button', { type: 'button', class: 'texto peligro', onclick: () => borrar(raiz, ctx, pago) }, 'Borrar')),
  );
}

function borrar(raiz, ctx, pago) {
  if (!confirm(`¿Borrar «${pago.nombre}»?`)) return;
  ctx.estado.pagos = ctx.estado.pagos.filter((p) => p.id !== pago.id);
  ctx.persistir();
  render(raiz, ctx);
}

function centimosATexto(c) {
  return c === null ? '' : formatearEuros(c).replace(' €', '');
}

function vistaFormulario(raiz, ctx) {
  const previo = formulario.pago;
  const campos = {
    nombre: el('input', { type: 'text', maxlength: '60', required: true, value: previo?.nombre ?? '' }),
    tipo: el('select', {}, ...Object.entries(ETIQUETA_TIPO).map(([v, t]) =>
      el('option', { value: v, selected: (previo?.tipo ?? 'deuda') === v }, t))),
    importe: el('input', { type: 'text', inputmode: 'decimal', required: true, value: previo ? centimosATexto(previo.importe) : '' }),
    dia: el('input', { type: 'number', min: '1', max: '31', inputmode: 'numeric', value: previo?.dia ?? '' }),
    modoFin: el('select', {},
      el('option', { value: 'sin', selected: !previo?.mesFin }, 'Sin fin'),
      el('option', { value: 'cuotas' }, 'Cuotas restantes (contando este mes)'),
      el('option', { value: 'mes', selected: !!previo?.mesFin }, 'Último mes de pago')),
    cuotas: el('input', { type: 'number', min: '1', inputmode: 'numeric' }),
    mesFin: el('input', { type: 'month', value: previo?.mesFin ?? '' }),
    saldo: el('input', { type: 'text', inputmode: 'decimal', value: previo ? centimosATexto(previo.saldo) : '' }),
    reembolso: el('input', { type: 'text', inputmode: 'decimal', value: previo ? centimosATexto(previo.reembolso) : '' }),
    reembolsoDe: el('input', { type: 'text', maxlength: '60', value: previo?.reembolsoDe ?? '' }),
  };
  const error = el('p', { class: 'error', role: 'alert', hidden: true });
  const cajaCuotas = el('label', {}, 'Cuotas restantes', campos.cuotas);
  const cajaMes = el('label', {}, 'Último mes de pago', campos.mesFin);
  const actualizarFin = () => {
    cajaCuotas.hidden = campos.modoFin.value !== 'cuotas';
    cajaMes.hidden = campos.modoFin.value !== 'mes';
  };
  campos.modoFin.addEventListener('change', actualizarFin);
  actualizarFin();

  const mostrarError = (texto) => { error.textContent = texto; error.hidden = false; };

  const guardarPago = (e) => {
    e.preventDefault();
    const importe = parsearEuros(campos.importe.value);
    if (importe === null) return mostrarError('El importe no es válido. Ejemplo: 1.234,50');

    let mesFin = null;
    if (campos.modoFin.value === 'cuotas') {
      const n = Number(campos.cuotas.value);
      if (!Number.isInteger(n) || n < 1) return mostrarError('Las cuotas restantes deben ser un número entero de 1 o más');
      mesFin = mesFinDesdeCuotas(ctx.mes, n);
    } else if (campos.modoFin.value === 'mes') {
      if (!campos.mesFin.value) return mostrarError('Elige el último mes de pago');
      mesFin = campos.mesFin.value;
    }

    const opcional = (campo, nombre) => {
      if (campo.value.trim() === '') return { valor: null };
      const c = parsearEuros(campo.value);
      return c === null ? { error: `${nombre} no es válido. Ejemplo: 1.234,50` } : { valor: c };
    };
    const saldo = opcional(campos.saldo, 'El saldo pendiente');
    if (saldo.error) return mostrarError(saldo.error);
    const reembolso = opcional(campos.reembolso, 'El reembolso');
    if (reembolso.error) return mostrarError(reembolso.error);

    const nuevo = {
      id: previo?.id ?? generarId(),
      nombre: campos.nombre.value.trim(),
      tipo: campos.tipo.value,
      importe,
      dia: campos.dia.value === '' ? null : Number(campos.dia.value),
      mesFin,
      saldo: saldo.valor,
      reembolso: reembolso.valor,
      reembolsoDe: campos.reembolsoDe.value.trim() || null,
    };
    const pagos = previo
      ? ctx.estado.pagos.map((p) => (p.id === previo.id ? nuevo : p))
      : [...ctx.estado.pagos, nuevo];
    const r = validar({ version: ctx.estado.version, ingresos: ctx.estado.ingresos, pagos });
    if (!r.ok) return mostrarError(r.error);

    ctx.estado.pagos = r.datos.pagos;
    ctx.persistir();
    formulario = null;
    render(raiz, ctx);
  };

  return el(
    'form',
    { class: 'tarjeta', novalidate: true, onsubmit: guardarPago },
    el('h3', {}, previo ? 'Editar pago' : 'Nuevo pago'),
    el('label', {}, 'Nombre', campos.nombre),
    el('label', {}, 'Tipo', campos.tipo),
    el('label', {}, 'Importe mensual (€)', campos.importe),
    el('label', {}, 'Día de cobro (vacío = sin fecha)', campos.dia),
    el('label', {}, 'Cuándo termina', campos.modoFin),
    cajaCuotas,
    cajaMes,
    el('label', {}, 'Saldo pendiente (€, opcional)', campos.saldo),
    el('label', {}, 'Te lo devuelve otra persona (€ al mes, opcional)', campos.reembolso),
    el('label', {}, '¿Quién te lo devuelve? (opcional)', campos.reembolsoDe),
    error,
    el('div', { class: 'acciones' },
      el('button', { type: 'submit', class: 'primario' }, 'Guardar'),
      el('button', { type: 'button', onclick: () => { formulario = null; render(raiz, ctx); } }, 'Cancelar')),
  );
}
