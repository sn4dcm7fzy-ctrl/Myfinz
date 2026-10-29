// Datos de la app: validar, migrar, exportar e importar. Sin DOM.
// Todos los importes son céntimos enteros. El formato lleva `version` para poder migrarlo.

export const VERSION = 1;
const TIPOS = ['deuda', 'contrato', 'suscripcion'];

export function datosVacios() {
  return { version: VERSION, ingresos: 0, pagos: [] };
}

const esEntero = (x) => Number.isInteger(x) && x >= 0;
const esMes = (x) => typeof x === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(x);

function validarPago(p, i, ids) {
  const donde = `pagos[${i}]`;
  if (p === null || typeof p !== 'object' || Array.isArray(p)) return `${donde} no es un pago`;
  if (typeof p.id !== 'string' || p.id === '') return `${donde}.id debe ser un texto`;
  if (ids.has(p.id)) return `${donde}.id está repetido`;
  ids.add(p.id);
  if (typeof p.nombre !== 'string' || p.nombre.length < 1 || p.nombre.length > 60) {
    return `${donde}.nombre debe tener entre 1 y 60 caracteres`;
  }
  if (!TIPOS.includes(p.tipo)) return `${donde}.tipo debe ser deuda, contrato o suscripcion`;
  if (!esEntero(p.importe)) return `${donde}.importe debe ser un entero de céntimos, 0 o más`;
  const dia = p.dia ?? null;
  if (dia !== null && !(Number.isInteger(dia) && dia >= 1 && dia <= 31)) {
    return `${donde}.dia debe estar entre 1 y 31`;
  }
  const mesFin = p.mesFin ?? null;
  if (mesFin !== null && !esMes(mesFin)) return `${donde}.mesFin debe ser AAAA-MM`;
  for (const campo of ['saldo', 'reembolso']) {
    const v = p[campo] ?? null;
    if (v !== null && !esEntero(v)) return `${donde}.${campo} debe ser un entero de céntimos, 0 o más`;
  }
  const reembolsoDe = p.reembolsoDe ?? null;
  if (reembolsoDe !== null && (typeof reembolsoDe !== 'string' || reembolsoDe.length > 60)) {
    return `${donde}.reembolsoDe debe ser un texto de hasta 60 caracteres`;
  }
  return null;
}

// Devuelve una copia normalizada (campos opcionales a null); no modifica la entrada.
export function validar(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, error: 'Los datos deben ser un objeto' };
  }
  if (!Number.isInteger(obj.version) || obj.version < 1) {
    return { ok: false, error: 'La versión de los datos no es válida' };
  }
  if (obj.version > VERSION) return { ok: false, error: 'version-futura' };
  if (!esEntero(obj.ingresos)) {
    return { ok: false, error: 'ingresos debe ser un entero de céntimos, 0 o más' };
  }
  if (!Array.isArray(obj.pagos)) return { ok: false, error: 'pagos debe ser una lista' };

  const ids = new Set();
  for (let i = 0; i < obj.pagos.length; i++) {
    const error = validarPago(obj.pagos[i], i, ids);
    if (error) return { ok: false, error };
  }

  const pagos = obj.pagos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    tipo: p.tipo,
    importe: p.importe,
    dia: p.dia ?? null,
    mesFin: p.mesFin ?? null,
    saldo: p.saldo ?? null,
    reembolso: p.reembolso ?? null,
    reembolsoDe: p.reembolsoDe ?? null,
  }));
  return { ok: true, datos: { version: VERSION, ingresos: obj.ingresos, pagos } };
}

export function exportarJSON(datos) {
  return JSON.stringify(datos, null, 2);
}

export function importarJSON(texto) {
  let obj;
  try {
    obj = JSON.parse(texto);
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido' };
  }
  return validar(obj);
}

export const CLAVE = 'mis-pagos-v1';

// `storage` solo necesita getItem(clave) y setItem(clave, texto), como localStorage.
// Nunca escribe al cargar: si lo guardado está corrupto, se deja intacto.
export function cargar(storage) {
  let texto;
  try {
    texto = storage.getItem(CLAVE);
  } catch {
    return { datos: datosVacios(), aviso: 'sin-almacenamiento' };
  }
  if (texto === null || texto === undefined) return { datos: datosVacios() };
  const r = importarJSON(texto);
  if (!r.ok) return { datos: datosVacios(), aviso: 'datos-corruptos' };
  return { datos: r.datos };
}

export function guardar(storage, datos) {
  try {
    storage.setItem(CLAVE, exportarJSON(datos));
    return true;
  } catch {
    return false;
  }
}
