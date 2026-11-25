// Pantalla Ajustes: ingresos, copia de seguridad (exportar e importar) y borrar todo.
import { formatearEuros, parsearEuros } from '../formato.js';
import { datosVacios, exportarJSON, importarJSON } from '../almacen.js';
import { el, montar, hoyISO } from './util.js';
import { tarjetaPerfiles } from './perfiles.js';
import { t, idioma, IDIOMAS, NOMBRE_IDIOMA } from '../i18n.js';

export function render(raiz, ctx, mensajeInicial) {
  const mensaje = el('p', { role: 'status' });
  const decir = (texto, esError = false) => {
    mensaje.textContent = texto;
    mensaje.className = esError ? 'error' : 'suave';
  };

  if (mensajeInicial) decir(mensajeInicial);

  const campoIngresos = el('input', {
    type: 'text',
    inputmode: 'decimal',
    value: ctx.estado.ingresos ? formatearEuros(ctx.estado.ingresos).replace(' €', '') : '',
  });

  const guardarIngresos = (e) => {
    e.preventDefault();
    const texto = campoIngresos.value.trim();
    const cent = texto === '' ? 0 : parsearEuros(texto);
    if (cent === null) return decir(t('ajustes.ingresos.error'), true);
    ctx.estado.ingresos = cent;
    ctx.persistir();
    decir(t('ajustes.ingresos.guardados'));
  };

  const exportar = async () => {
    const nombre = `mis-pagos-${hoyISO()}.json`;
    const texto = exportarJSON(ctx.datos);
    // En un iPhone con la app instalada, la descarga con enlace puede no hacer nada: se prefiere el menú de compartir.
    const archivo = new File([texto], nombre, { type: 'application/json' });
    if (navigator.canShare?.({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo] });
        return decir(t('ajustes.copia.lista'));
      } catch (e) {
        if (e.name === 'AbortError') return; // el usuario cerró el menú de compartir
      }
    }
    const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
    const enlace = el('a', { href: url, download: nombre });
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    decir(t('ajustes.copia.exportada'));
  };

  const importar = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const r = importarJSON(await archivo.text(), ctx.mes);
    e.target.value = '';
    if (!r.ok) {
      return decir(r.error === 'version-futura'
        ? t('ajustes.importar.futura')
        : t('ajustes.importar.error', { error: r.error }), true);
    }
    const n = r.datos.perfiles.length;
    if (!confirm(t('ajustes.importar.confirmar', { n, perfiles: t(n === 1 ? 'perfil.uno' : 'perfil.varios') }))) return;
    ctx.datos = r.datos;
    ctx.persistir();
    ctx.alCambiarPerfiles(t('ajustes.importar.hecho'));
  };

  const borrarTodo = () => {
    if (!confirm(t('ajustes.borrar.confirmar'))) return;
    ctx.datos = datosVacios();
    ctx.persistir();
    ctx.alCambiarPerfiles(t('ajustes.borrar.hecho'));
  };

  montar(raiz,
    el('h2', {}, t('ajustes.titulo')),
    mensaje, // arriba: así se ve sin bajar, sobre todo lo que dice la tarjeta de perfiles

    // Cada idioma con su propio nombre, para encontrarlo aunque la app esté en otro.
    el('div', { class: 'tarjeta' },
      el('h3', {}, t('ajustes.idioma.titulo')),
      el('div', { class: 'acciones idiomas' },
        IDIOMAS.map((cod) => el('button', {
          type: 'button', class: 'idioma', lang: cod, 'aria-pressed': String(cod === idioma()),
          onclick: () => { if (cod !== idioma()) ctx.cambiarIdioma(cod); },
        }, NOMBRE_IDIOMA[cod])))),

    tarjetaPerfiles(ctx, decir),

    el('form', { class: 'tarjeta', onsubmit: guardarIngresos },
      el('h3', {}, t('ajustes.ingresos.titulo', { nombre: ctx.estado.nombre })),
      el('label', {}, t('ajustes.ingresos.campo'), campoIngresos),
      el('p', { class: 'suave' }, t('ajustes.ingresos.ayuda')),
      el('button', { type: 'submit', class: 'primario' }, t('ajustes.ingresos.guardar'))),

    el('div', { class: 'tarjeta' },
      el('h3', {}, t('ajustes.copia.titulo')),
      el('p', { class: 'suave' }, t('ajustes.copia.ayuda')),
      el('div', { class: 'acciones' },
        el('button', { type: 'button', onclick: exportar }, t('ajustes.copia.exportar')),
        el('label', { style: 'margin:0' }, t('ajustes.copia.importar'),
          el('input', { type: 'file', accept: '.json,application/json', onchange: importar })))),

    el('div', { class: 'tarjeta' },
      el('h3', {}, t('ajustes.borrar.titulo')),
      el('button', { type: 'button', class: 'peligro', onclick: borrarTodo }, t('ajustes.borrar.boton'))),

  );
}
