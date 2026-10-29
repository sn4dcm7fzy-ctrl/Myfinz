// Arranque de la app: carga los datos, navega entre pantallas y guarda cambios.
import { cargar, guardar, CLAVE } from './almacen.js';
import { el, hoyISO, mesActual } from './ui/util.js';
import * as pagos from './ui/pagos.js';
import * as resumen from './ui/resumen.js';
import * as calendario from './ui/calendario.js';
import * as ajustes from './ui/ajustes.js';
import { reducirMovimiento } from './ui/movimiento.js';

const pantallas = { resumen, pagos, calendario, ajustes };

function obtenerStorage() {
  try {
    return window.localStorage;
  } catch {
    return {
      getItem() { throw new Error('sin almacenamiento'); },
      setItem() { throw new Error('sin almacenamiento'); },
    };
  }
}

const storage = obtenerStorage();
const { datos, aviso } = cargar(storage);

// Si lo guardado estaba corrupto, se conserva una copia antes de que un guardado nuevo lo pise.
if (aviso === 'datos-corruptos') {
  try { storage.setItem(`${CLAVE}-corrupto`, storage.getItem(CLAVE)); } catch { /* sin espacio: se avisa igualmente */ }
}

const raiz = document.getElementById('contenido');
const cajaAviso = document.getElementById('aviso');

function mostrarAviso(texto) {
  cajaAviso.textContent = texto;
  cajaAviso.hidden = false;
}

const AVISOS = {
  'datos-corruptos': 'Los datos guardados estaban dañados. Se ha guardado una copia aparte y la app empieza vacía. Si tienes una copia de seguridad, impórtala en Ajustes.',
  'sin-almacenamiento': 'Este navegador no permite guardar datos: lo que añadas se perderá al cerrar la app.',
};
if (aviso) mostrarAviso(AVISOS[aviso]);

export const ctx = {
  estado: datos,
  get hoy() { return hoyISO(); },
  get mes() { return mesActual(); },
  persistir() {
    if (!guardar(storage, ctx.estado)) {
      mostrarAviso('No se pudieron guardar los cambios. Exporta una copia de seguridad cuanto antes.');
    }
  },
  mostrar,
};

const ORDEN = ['resumen', 'pagos', 'calendario', 'ajustes'];
const indicador = document.querySelector('.indicador');
let actual = 'resumen';

// `fundido`: al cambiar de pestaña el contenido nuevo aparece con un fundido muy corto (140 ms).
function mostrar(nombre, fundido = false) {
  if (nombre !== actual) pagos.cerrarFormulario();
  actual = nombre;
  for (const boton of document.querySelectorAll('#barra button')) {
    if (boton.dataset.pantalla === nombre) boton.setAttribute('aria-current', 'page');
    else boton.removeAttribute('aria-current');
  }
  indicador.style.transform = `translateX(${ORDEN.indexOf(nombre) * 100}%)`;
  const pantalla = pantallas[nombre];
  if (pantalla) pantalla.render(raiz, ctx);
  else raiz.replaceChildren(el('h2', {}, 'Próximamente'));
  if (fundido && !reducirMovimiento()) {
    raiz.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  }
}

for (const boton of document.querySelectorAll('#barra button')) {
  boton.addEventListener('click', () => mostrar(boton.dataset.pantalla, boton.dataset.pantalla !== actual));
}

mostrar('resumen');

// Una PWA en iPhone suele reanudarse sin recargar: se repinta lo que depende de la fecha.
// Pagos y Ajustes no se tocan para no perder lo que se esta escribiendo.
function alVolver() {
  if (document.visibilityState === 'hidden') return;
  if (actual === 'resumen' || actual === 'calendario') mostrar(actual);
}
document.addEventListener('visibilitychange', alVolver);
// pageshow también se dispara al cargar la página: solo importa cuando se restaura desde memoria (persisted).
window.addEventListener('pageshow', (e) => { if (e.persisted) alVolver(); });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* sin service worker, la app sigue funcionando */ });
}
