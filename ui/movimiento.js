// Ayudas de movimiento. curvaSalida e interpolar son puras; contar y reducirMovimiento usan el navegador.

// cubic-bezier(0.23, 1, 0.32, 1): ease-out fuerte para UI (la misma que --ease-out de styles.css).
const X1 = 0.23;
const Y1 = 1;
const X2 = 0.32;
const Y2 = 1;
const cx = 3 * X1;
const bx = 3 * (X2 - X1) - cx;
const ax = 1 - cx - bx;
const cy = 3 * Y1;
const by = 3 * (Y2 - Y1) - cy;
const ay = 1 - cy - by;

const muestraX = (t) => ((ax * t + bx) * t + cx) * t;
const muestraY = (t) => ((ay * t + by) * t + cy) * t;

// t = progreso del tiempo (0..1); devuelve el progreso del valor (0..1).
export function curvaSalida(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  let bajo = 0;
  let alto = 1;
  let u = t;
  for (let i = 0; i < 40; i++) {
    const x = muestraX(u);
    if (Math.abs(x - t) < 1e-7) break;
    if (x < t) bajo = u; else alto = u;
    u = (bajo + alto) / 2;
  }
  return muestraY(u);
}

// Valor entero entre desde y hasta; con t >= 1 devuelve exactamente `hasta`.
export function interpolar(desde, hasta, t) {
  if (t >= 1) return hasta;
  return Math.round(desde + (hasta - desde) * curvaSalida(t));
}

export function reducirMovimiento() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Hace subir el número de `nodo` desde 0 hasta `hasta`. Con "reducir movimiento" lo escribe directo.
export function contar(nodo, hasta, ms, formatear) {
  if (reducirMovimiento()) {
    nodo.textContent = formatear(hasta);
    return;
  }
  const inicio = performance.now();
  nodo.textContent = formatear(0);
  const paso = (ahora) => {
    if (!nodo.isConnected) return;
    const t = (ahora - inicio) / ms;
    nodo.textContent = formatear(interpolar(0, hasta, t));
    if (t < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
