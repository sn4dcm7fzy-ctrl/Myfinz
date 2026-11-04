// Pantalla Ajustes: ingresos, copia de seguridad (exportar e importar) y borrar todo.
import { formatearEuros, parsearEuros } from '../formato.js';
import { datosVacios, exportarJSON, importarJSON } from '../almacen.js';
import { el, montar, hoyISO } from './util.js';

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
    if (cent === null) return decir('Los ingresos no son válidos. Ejemplo: 1.200,00', true);
    ctx.estado.ingresos = cent;
    ctx.persistir();
    decir('Ingresos guardados.');
  };

  const exportar = async () => {
    const nombre = `mis-pagos-${hoyISO()}.json`;
    const texto = exportarJSON(ctx.estado);
    // En un iPhone con la app instalada, la descarga con enlace puede no hacer nada: se prefiere el menú de compartir.
    const archivo = new File([texto], nombre, { type: 'application/json' });
    if (navigator.canShare?.({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo] });
        return decir('Copia lista. Guárdala en un sitio seguro: contiene tus datos.');
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
    decir('Copia exportada. Guárdala en un sitio seguro: contiene tus datos.');
  };

  const importar = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const r = importarJSON(await archivo.text(), ctx.mes);
    e.target.value = '';
    if (!r.ok) {
      return decir(r.error === 'version-futura'
        ? 'Esa copia es de una versión más nueva de la app. No se ha cambiado nada.'
        : `No se pudo importar: ${r.error}. No se ha cambiado nada.`, true);
    }
    if (!confirm(`Esto reemplaza tus datos actuales por la copia (${r.datos.pagos.length} pagos). ¿Continuar?`)) return;
    ctx.estado = r.datos;
    ctx.persistir();
    render(raiz, ctx, 'Copia importada.');
  };

  const borrarTodo = () => {
    if (!confirm('Se borrarán todos tus pagos e ingresos de este iPhone. ¿Seguro?')) return;
    ctx.estado = datosVacios();
    ctx.persistir();
    render(raiz, ctx, 'Todo borrado.');
  };

  montar(raiz,
    el('h2', {}, 'Ajustes'),

    el('form', { class: 'tarjeta', onsubmit: guardarIngresos },
      el('h3', {}, 'Tus ingresos'),
      el('label', {}, 'Ingresos mensuales propios (€)', campoIngresos),
      el('p', { class: 'suave' }, 'Solo se usan para calcular qué parte se va en cuotas de deuda.'),
      el('button', { type: 'submit', class: 'primario' }, 'Guardar ingresos')),

    el('div', { class: 'tarjeta' },
      el('h3', {}, 'Copia de seguridad'),
      el('p', { class: 'suave' }, 'Tus datos solo viven en este iPhone. Exporta una copia de vez en cuando por si el navegador los borra.'),
      el('div', { class: 'acciones' },
        el('button', { type: 'button', onclick: exportar }, 'Exportar copia'),
        el('label', { style: 'margin:0' }, 'Importar copia',
          el('input', { type: 'file', accept: '.json,application/json', onchange: importar })))),

    el('div', { class: 'tarjeta' },
      el('h3', {}, 'Borrar todo'),
      el('button', { type: 'button', class: 'peligro', onclick: borrarTodo }, 'Borrar todos los datos')),

    mensaje,
  );
}
