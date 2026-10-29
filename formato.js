// Formato de importes. Todos los importes de la app son céntimos enteros.

export function formatearEuros(cent) {
  const signo = cent < 0 ? '-' : '';
  const abs = Math.abs(cent);
  const euros = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const centimos = String(abs % 100).padStart(2, '0');
  return `${signo}${euros},${centimos} €`;
}

// Devuelve céntimos enteros, o null si el texto no es un importe válido.
// Con coma: la coma es el decimal y los puntos son miles.
// Sin coma: un único punto seguido de 1-2 dígitos es decimal; si no, los puntos son miles.
export function parsearEuros(texto) {
  const t = String(texto).trim();
  let enteros;
  let decimales = '';

  if (t.includes(',')) {
    const m = t.match(/^(\d{1,3}(?:\.\d{3})+|\d+),(\d{1,2})$/);
    if (!m) return null;
    enteros = m[1].replace(/\./g, '');
    decimales = m[2];
  } else if (/^\d+\.\d{1,2}$/.test(t)) {
    [enteros, decimales] = t.split('.');
  } else if (/^\d{1,3}(?:\.\d{3})+$/.test(t)) {
    enteros = t.replace(/\./g, '');
  } else if (/^\d+$/.test(t)) {
    enteros = t;
  } else {
    return null;
  }

  return Number(enteros) * 100 + Number(decimales.padEnd(2, '0'));
}
