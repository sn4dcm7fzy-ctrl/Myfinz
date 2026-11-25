// Arranque de la app: carga los datos, navega entre pantallas y guarda cambios.
import { cargar, guardar, CLAVE } from './almacen.js';
import { perfilActivo } from './perfiles.js';
import { el, hoyISO, mesActual } from './ui/util.js';
import * as pagos from './ui/pagos.js';
import * as resumen from './ui/resumen.js';
import * as calendario from './ui/calendario.js';
import * as ajustes from './ui/ajustes.js';
import { reducirMovimiento } from './ui/movimiento.js';
import { pintarSelector } from './ui/perfiles.js';

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
const { datos, aviso, migrado } = cargar(storage, mesActual());

// Si lo guardado estaba corrupto, se conserva una copia antes de que un guardado nuevo lo pise.
if (aviso === 'datos-corruptos') {
  try { storage.setItem(`${CLAVE}-corrupto`, storage.getItem(CLAVE)); } catch { /* sin espacio: se avisa igualmente */ }
}

const raiz = document.getElementById('contenido');
const cabecera = document.getElementById('cabecera');
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

// `datos`: todo lo guardado (todos los perfiles). `estado`: el perfil activo, { ingresos, pagos }.
export const ctx = {
  datos,
  get estado() { return perfilActivo(ctx.datos); },
  get hoy() { return hoyISO(); },
  get mes() { return mesActual(); },
  persistir() {
    if (!guardar(storage, ctx.datos)) {
      mostrarAviso('No se pudieron guardar los cambios. Exporta una copia de seguridad cuanto antes.');
    }
  },
  mostrar,
  // Tras crear, renombrar, borrar o elegir perfil: el formulario abierto era de otro perfil.
  alCambiarPerfiles(mensaje) {
    pagos.cerrarFormulario();
    pagos.reiniciarVista();
    mostrar(actual, false, mensaje);
  },
};

// Los datos de versiones anteriores se guardan ya migrados: así mesInicio no cambia al abrir la app otro mes.
if (migrado) ctx.persistir();

const ORDEN = ['resumen', 'pagos', 'calendario', 'ajustes'];
const indicador = document.querySelector('.indicador');
let actual = 'resumen';

// `fundido`: al cambiar de pestaña el contenido nuevo aparece con un fundido muy corto (140 ms).
// `mensaje`: aviso inicial para la pantalla (solo lo usa Ajustes).
function mostrar(nombre, fundido = false, mensaje = undefined) {
  if (nombre !== actual) pagos.cerrarFormulario();
  actual = nombre;
  for (const boton of document.querySelectorAll('#barra button')) {
    if (boton.dataset.pantalla === nombre) boton.setAttribute('aria-current', 'page');
    else boton.removeAttribute('aria-current');
  }
  indicador.style.transform = `translateX(${ORDEN.indexOf(nombre) * 100}%)`;
  const pantalla = pantallas[nombre];
  pintarSelector(cabecera, ctx);
  if (pantalla) pantalla.render(raiz, ctx, mensaje);
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
