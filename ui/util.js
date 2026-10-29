// Ayudas de interfaz. Los textos van siempre como nodos de texto (nunca como HTML).

export function el(tag, props = {}, ...hijos) {
  const nodo = document.createElement(tag);
  for (const [clave, valor] of Object.entries(props)) {
    if (clave === 'class') nodo.className = valor;
    else if (clave.startsWith('on')) nodo.addEventListener(clave.slice(2), valor);
    else if (valor === true) nodo.setAttribute(clave, '');
    else if (valor !== false && valor !== null && valor !== undefined) nodo.setAttribute(clave, valor);
  }
  for (const hijo of hijos.flat()) {
    if (hijo !== null && hijo !== undefined && hijo !== false) nodo.append(hijo);
  }
  return nodo;
}

const dos = (n) => String(n).padStart(2, '0');

export function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

export function mesActual() {
  return hoyISO().slice(0, 7);
}

export function generarId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export const ETIQUETA_TIPO = { deuda: 'Deuda', contrato: 'Contrato', suscripcion: 'Suscripción' };

// Sustituye el contenido de `raiz`. Ignora null/undefined/false (replaceChildren los escribiría como texto).
export function montar(raiz, ...hijos) {
  raiz.replaceChildren(...hijos.flat().filter((h) => h !== null && h !== undefined && h !== false));
}
