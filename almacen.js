// Datos de la app: validar, migrar, exportar e importar. Sin DOM.
import { mesInicioPara } from './calculos.js';
// Todos los importes son céntimos enteros. El formato lleva `version` para poder migrarlo.

// Versión 3: { version, perfilActivo, perfiles: [{ id, nombre, ingresos, pagos }] }.
// Las versiones 1 y 2 eran un solo bloque { version, ingresos, pagos }: se migran a un único perfil.
export const VERSION = 3;
export const NOMBRE_INICIAL = 'Mi perfil';
export const MAX_NOMBRE_PERFIL = 30;
const ID_INICIAL = 'perfil-1';
const TIPOS = ['deuda', 'contrato', 'suscripcion'];

export function datosVacios() {
  return { version: VERSION, perfilActivo: ID_INICIAL, perfiles: [{ id: ID_INICIAL, nombre: NOMBRE_INICIAL, ingresos: 0, pagos: [] }] };
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
  const mesInicio = p.mesInicio ?? null;
  if (mesInicio !== null && !esMes(mesInicio)) return `${donde}.mesInicio debe ser AAAA-MM`;
  if (mesInicio !== null && mesFin !== null && mesInicio > mesFin) return `${donde}.mesInicio no puede ser posterior a mesFin`;
  const pagados = p.pagados ?? {};
  if (pagados === null || typeof pagados !== 'object' || Array.isArray(pagados)
    || !Object.entries(pagados).every(([mes, v]) => esMes(mes) && esEntero(v))) {
    return `${donde}.pagados no es válido`;
  }
  const reembolsoDe = p.reembolsoDe ?? null;
  if (reembolsoDe !== null && (typeof reembolsoDe !== 'string' || reembolsoDe.length > 60)) {
    return `${donde}.reembolsoDe debe ser un texto de hasta 60 caracteres`;
  }
  return null;
}

// Valida un bloque { version: 1|2, ingresos, pagos } (un perfil) y devuelve { ingresos, pagos }
// normalizados (campos opcionales a null); no modifica la entrada.
// En la versión 1 los pagos empiezan en `mes` (null = sin límite).
export function validarPerfil(obj, mes = null) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, error: 'Los datos deben ser un objeto' };
  }
  if (!Number.isInteger(obj.version) || obj.version < 1) {
    return { ok: false, error: 'La versión de los datos no es válida' };
  }
  if (obj.version > 2) return { ok: false, error: 'version-futura' };
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
    pagados: { ...(p.pagados ?? {}) },
    mesInicio: obj.version === 1 ? mesInicioPara(mes, p.mesFin ?? null) : (p.mesInicio ?? null),
  }));
  return { ok: true, datos: { ingresos: obj.ingresos, pagos } };
}

const esObjeto = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

// Valida los datos completos y devuelve una copia en versión 3. Acepta las versiones 1, 2 y 3.
export function validar(obj, mes = null) {
  if (!esObjeto(obj)) return { ok: false, error: 'Los datos deben ser un objeto' };
  if (!Number.isInteger(obj.version) || obj.version < 1) {
    return { ok: false, error: 'La versión de los datos no es válida' };
  }
  if (obj.version > VERSION) return { ok: false, error: 'version-futura' };
  if (obj.version < 3) {
    const r = validarPerfil(obj, mes);
    if (!r.ok) return r;
    return { ok: true, datos: { version: VERSION, perfilActivo: ID_INICIAL, perfiles: [{ id: ID_INICIAL, nombre: NOMBRE_INICIAL, ...r.datos }] } };
  }
  if (!Array.isArray(obj.perfiles) || obj.perfiles.length === 0) {
    return { ok: false, error: 'perfiles debe ser una lista con al menos un perfil' };
  }
  const ids = new Set();
  const nombres = new Set();
  const perfiles = [];
  for (let i = 0; i < obj.perfiles.length; i++) {
    const p = obj.perfiles[i];
    const donde = `perfiles[${i}]`;
    if (!esObjeto(p)) return { ok: false, error: `${donde} no es un perfil` };
    if (typeof p.id !== 'string' || p.id === '') return { ok: false, error: `${donde}.id debe ser un texto` };
    if (ids.has(p.id)) return { ok: false, error: `${donde}.id está repetido` };
    ids.add(p.id);
    const nombre = typeof p.nombre === 'string' ? p.nombre.trim() : '';
    if (nombre.length < 1 || nombre.length > MAX_NOMBRE_PERFIL) {
      return { ok: false, error: `${donde}.nombre debe tener entre 1 y ${MAX_NOMBRE_PERFIL} caracteres` };
    }
    if (nombres.has(nombre.toLowerCase())) return { ok: false, error: `${donde}.nombre está repetido` };
    nombres.add(nombre.toLowerCase());
    const r = validarPerfil({ version: 2, ingresos: p.ingresos, pagos: p.pagos });
    if (!r.ok) return { ok: false, error: `${donde}: ${r.error}` };
    perfiles.push({ id: p.id, nombre, ...r.datos });
  }
  if (!ids.has(obj.perfilActivo)) return { ok: false, error: 'perfilActivo no es ningún perfil' };
  return { ok: true, datos: { version: VERSION, perfilActivo: obj.perfilActivo, perfiles } };
}

export function exportarJSON(datos) {
  return JSON.stringify(datos, null, 2);
}

export function importarJSON(texto, mes = null) {
  let obj;
  try {
    obj = JSON.parse(texto);
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido' };
  }
  return validar(obj, mes);
}

export const CLAVE = 'mis-pagos-v1';

// `storage` solo necesita getItem(clave) y setItem(clave, texto), como localStorage.
// Nunca escribe al cargar: si lo guardado está corrupto, se deja intacto.
// `migrado` avisa de que lo guardado era de una versión anterior: quien llama debe guardarlo ya migrado.
export function cargar(storage, mes = null) {
  let texto;
  try {
    texto = storage.getItem(CLAVE);
  } catch {
    return { datos: datosVacios(), aviso: 'sin-almacenamiento' };
  }
  if (texto === null || texto === undefined) return { datos: datosVacios() };
  const r = importarJSON(texto, mes);
  if (!r.ok) return { datos: datosVacios(), aviso: 'datos-corruptos' };
  const migrado = JSON.parse(texto).version < VERSION;
  return migrado ? { datos: r.datos, migrado } : { datos: r.datos };
}

export function guardar(storage, datos) {
  try {
    storage.setItem(CLAVE, exportarJSON(datos));
    return true;
  } catch {
    return false;
  }
}
