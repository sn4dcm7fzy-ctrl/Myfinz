// Perfiles en pantalla: el selector de arriba (con su menú) y la tarjeta «Perfiles» de Ajustes.
import { crearPerfil, renombrarPerfil, borrarPerfil, elegirPerfil } from '../perfiles.js';
import { el, montar, generarId } from './util.js';
import { reducirMovimiento } from './movimiento.js';

let cerrarMenuAbierto = null;

// Pinta en `cabecera` el botón con el perfil activo y su menú. Se llama cada vez que cambia algo.
export function pintarSelector(cabecera, ctx) {
  cerrarMenuAbierto?.();
  const { perfiles, perfilActivo } = ctx.datos;
  const activo = ctx.estado;

  const menu = el('ul', { class: 'menu-perfiles', id: 'menu-perfiles', hidden: true },
    perfiles.map((p) => el('li', {},
      el('button', {
        type: 'button',
        'aria-current': p.id === perfilActivo ? 'true' : null,
        onclick: () => cambiar(p.id),
      }, p.nombre))),
    el('li', { class: 'separador' },
      el('button', { type: 'button', onclick: () => { cerrar(); ctx.mostrar('ajustes', true); } }, 'Gestionar perfiles…')));

  const boton = el('button', {
    type: 'button', class: 'selector-perfil', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-controls': 'menu-perfiles',
    onclick: (e) => { e.stopPropagation(); if (menu.hidden) abrir(); else cerrar(); },
  }, el('span', { class: 'nombre' }, activo.nombre), el('span', { class: 'flecha', 'aria-hidden': 'true' }, '▾'));

  // pointerdown y no click: en iOS tocar una zona sin botones no genera click.
  function alTocarFuera(e) { if (!menu.contains(e.target) && !boton.contains(e.target)) cerrar(); }
  function alTeclear(e) { if (e.key === 'Escape') { cerrar(); boton.focus(); } }

  function abrir() {
    menu.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
    document.addEventListener('pointerdown', alTocarFuera);
    document.addEventListener('keydown', alTeclear);
    cerrarMenuAbierto = cerrar;
    if (!reducirMovimiento()) {
      menu.animate([{ opacity: 0, transform: 'translateY(-6px) scale(0.98)' }, { opacity: 1, transform: 'none' }],
        { duration: 160, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    }
  }

  function cerrar() {
    menu.hidden = true;
    boton.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', alTocarFuera);
    document.removeEventListener('keydown', alTeclear);
    if (cerrarMenuAbierto === cerrar) cerrarMenuAbierto = null;
  }

  function cambiar(id) {
    cerrar();
    if (id === perfilActivo) return;
    const r = elegirPerfil(ctx.datos, id);
    if (r.ok) aplicar(ctx, r.datos);
  }

  montar(cabecera, boton, menu);
}

// Guarda los datos nuevos y repinta el selector y la pantalla actual (con `mensaje` si es Ajustes).
function aplicar(ctx, datos, mensaje) {
  ctx.datos = datos;
  ctx.persistir();
  ctx.alCambiarPerfiles(mensaje);
}

// Tarjeta para Ajustes. `decir(texto, esError)` muestra el mensaje de la pantalla.
export function tarjetaPerfiles(ctx, decir) {
  const { perfiles } = ctx.datos;
  const unico = perfiles.length === 1;

  const nuevo = () => {
    const nombre = prompt('Nombre del perfil');
    if (nombre === null) return;
    const r = crearPerfil(ctx.datos, nombre, generarId());
    if (!r.ok) return decir(r.error, true);
    aplicar(ctx, r.datos, `Perfil «${nombre.trim()}» creado. Ahora estás en él.`);
  };

  const renombrar = (p) => {
    const nombre = prompt('Nombre del perfil', p.nombre);
    if (nombre === null) return;
    const r = renombrarPerfil(ctx.datos, p.id, nombre);
    if (!r.ok) return decir(r.error, true);
    aplicar(ctx, r.datos, 'Nombre cambiado.');
  };

  const borrar = (p) => {
    if (!confirm(`Se borrará el perfil «${p.nombre}» con todos sus pagos. ¿Seguro?`)) return;
    const r = borrarPerfil(ctx.datos, p.id);
    if (!r.ok) return decir(r.error, true);
    aplicar(ctx, r.datos, `Perfil «${p.nombre}» borrado.`);
  };

  return el('div', { class: 'tarjeta' },
    el('h3', {}, 'Perfiles'),
    el('p', { class: 'suave' }, 'Cada perfil lleva sus propios pagos e ingresos, separados de los demás.'),
    el('ul', { class: 'lista-perfiles' },
      perfiles.map((p) => el('li', { class: 'fila-perfil' },
        el('span', { class: `nombre${p.id === ctx.datos.perfilActivo ? ' activo' : ''}` }, p.nombre),
        el('button', { type: 'button', class: 'texto', onclick: () => renombrar(p) }, 'Renombrar'),
        el('button', { type: 'button', class: 'texto peligro', disabled: unico, onclick: () => borrar(p) }, 'Borrar')))),
    el('button', { type: 'button', onclick: nuevo }, '+ Nuevo perfil'));
}
