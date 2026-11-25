// Operaciones sobre perfiles. Sin DOM. Nunca modifican la entrada: devuelven datos nuevos.
// Resultado: { ok: true, datos } o { ok: false, error }. `error` es una clave de texto de i18n.js.
import { MAX_NOMBRE_PERFIL } from './almacen.js';

export function perfilActivo(datos) {
  return datos.perfiles.find((p) => p.id === datos.perfilActivo);
}

// null si el nombre vale; si no, la clave del mensaje para el usuario. `idIgnorar`: el perfil que se renombra.
export function nombreValido(datos, nombre, idIgnorar = null) {
  const limpio = typeof nombre === 'string' ? nombre.trim() : '';
  if (limpio === '') return 'perfil.error.vacio';
  if (limpio.length > MAX_NOMBRE_PERFIL) return 'perfil.error.largo';
  const repetido = datos.perfiles.some((p) => p.id !== idIgnorar && p.nombre.toLowerCase() === limpio.toLowerCase());
  return repetido ? 'perfil.error.repetido' : null;
}

const existe = (datos, id) => datos.perfiles.some((p) => p.id === id);
const NO_EXISTE = { ok: false, error: 'perfil.error.noExiste' };

export function crearPerfil(datos, nombre, id) {
  const error = nombreValido(datos, nombre);
  if (error) return { ok: false, error };
  const nuevo = { id, nombre: nombre.trim(), ingresos: 0, pagos: [] };
  return { ok: true, datos: { ...datos, perfilActivo: id, perfiles: [...datos.perfiles, nuevo] } };
}

export function renombrarPerfil(datos, id, nombre) {
  if (!existe(datos, id)) return NO_EXISTE;
  const error = nombreValido(datos, nombre, id);
  if (error) return { ok: false, error };
  const perfiles = datos.perfiles.map((p) => (p.id === id ? { ...p, nombre: nombre.trim() } : p));
  return { ok: true, datos: { ...datos, perfiles } };
}

export function borrarPerfil(datos, id) {
  if (!existe(datos, id)) return NO_EXISTE;
  if (datos.perfiles.length === 1) return { ok: false, error: 'perfil.error.ultimo' };
  const perfiles = datos.perfiles.filter((p) => p.id !== id);
  const activo = datos.perfilActivo === id ? perfiles[0].id : datos.perfilActivo;
  return { ok: true, datos: { ...datos, perfilActivo: activo, perfiles } };
}

export function elegirPerfil(datos, id) {
  if (!existe(datos, id)) return NO_EXISTE;
  return { ok: true, datos: { ...datos, perfilActivo: id } };
}
