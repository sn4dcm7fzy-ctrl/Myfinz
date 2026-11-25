// Idiomas de la app: español, alemán e inglés. Sin DOM.
// Cada texto tiene una clave y su versión en los tres idiomas; `{hueco}` se rellena con `t(clave, { hueco })`.
// Las cifras y fechas no cambian con el idioma (ver formato.js).

export const IDIOMAS = ['es', 'de', 'en'];
export const NOMBRE_IDIOMA = { es: 'Español', de: 'Deutsch', en: 'English' };
export const CLAVE_IDIOMA = 'mis-pagos-idioma';

export const TEXTOS = {
  'tipo.deuda': { es: 'Deuda', de: 'Schulden', en: 'Debt' },
  'tipo.contrato': { es: 'Contrato', de: 'Vertrag', en: 'Contract' },
  'tipo.suscripcion': { es: 'Suscripción', de: 'Abo', en: 'Subscription' },

  'tab.barra': { es: 'Pantallas', de: 'Bildschirme', en: 'Screens' },
  'tab.resumen': { es: 'Resumen', de: 'Übersicht', en: 'Summary' },
  'tab.pagos': { es: 'Pagos', de: 'Zahlungen', en: 'Payments' },
  'tab.calendario': { es: 'Calendario', de: 'Kalender', en: 'Calendar' },
  'tab.ajustes': { es: 'Ajustes', de: 'Einstellungen', en: 'Settings' },
  'app.proximamente': { es: 'Próximamente', de: 'Demnächst', en: 'Coming soon' },

  'aviso.corruptos': {
    es: 'Los datos guardados estaban dañados. Se ha guardado una copia aparte y la app empieza vacía. Si tienes una copia de seguridad, impórtala en Ajustes.',
    de: 'Die gespeicherten Daten waren beschädigt. Eine Kopie wurde separat aufbewahrt und die App startet leer. Wenn du eine Sicherung hast, importiere sie in den Einstellungen.',
    en: 'Your saved data was damaged. A copy was kept separately and the app starts empty. If you have a backup, import it in Settings.',
  },
  'aviso.sinAlmacenamiento': {
    es: 'Este navegador no permite guardar datos: lo que añadas se perderá al cerrar la app.',
    de: 'Dieser Browser erlaubt kein Speichern: Was du hinzufügst, geht beim Schließen der App verloren.',
    en: 'This browser does not allow saving data: anything you add will be lost when you close the app.',
  },
  'aviso.noGuardado': {
    es: 'No se pudieron guardar los cambios. Exporta una copia de seguridad cuanto antes.',
    de: 'Die Änderungen konnten nicht gespeichert werden. Exportiere so bald wie möglich eine Sicherung.',
    en: 'Your changes could not be saved. Export a backup as soon as possible.',
  },

  'resumen.cinta.mayor': {
    es: 'Cobros por día de {mes}. El mayor es el día {dia}: {importe}.',
    de: 'Abbuchungen pro Tag im {mes}. Am höchsten am {dia}. mit {importe}.',
    en: 'Charges per day in {mes}. The largest is on day {dia}: {importe}.',
  },
  'resumen.cinta.nada': {
    es: 'Cobros por día de {mes}. Ningún cobro con fecha.',
    de: 'Abbuchungen pro Tag im {mes}. Keine Abbuchung mit Datum.',
    en: 'Charges per day in {mes}. No charges with a date.',
  },
  'resumen.nota': { es: 'día {dia} · {importe}', de: '{dia}. · {importe}', en: 'day {dia} · {importe}' },
  'resumen.hoy': { es: 'hoy', de: 'heute', en: 'today' },
  'resumen.vacio': {
    es: 'No hay pagos este mes. Añádelos en la pestaña Pagos y aquí verás el resumen.',
    de: 'Diesen Monat gibt es keine Zahlungen. Füge sie im Tab Zahlungen hinzu, dann siehst du hier die Übersicht.',
    en: 'No payments this month. Add them in the Payments tab and you will see the summary here.',
  },
  'resumen.totalAria': { es: 'Pagos del mes: {importe}', de: 'Zahlungen des Monats: {importe}', en: 'Payments this month: {importe}' },
  'resumen.totalPie': { es: 'se cobra este mes', de: 'werden diesen Monat abgebucht', en: 'charged this month' },
  'resumen.dejar.titulo': { es: 'Cuánto dejar en la cuenta', de: 'Wie viel auf dem Konto bleiben sollte', en: 'How much to keep in the account' },
  'resumen.dejar.texto': {
    es: 'Peor caso: lo que se cobra el día 1 más los pagos sin fecha. Déjalo en la cuenta antes de que entre el sueldo para que no falle ningún cobro.',
    de: 'Schlimmster Fall: was am 1. abgebucht wird plus die Zahlungen ohne Datum. Lass es auf dem Konto, bevor das Gehalt kommt, damit keine Abbuchung platzt.',
    en: 'Worst case: what is charged on day 1 plus the payments without a date. Keep it in the account before your salary arrives so no charge fails.',
  },
  'resumen.porTipo': { es: 'Por tipo', de: 'Nach Art', en: 'By type' },
  'resumen.porTipoAria': { es: 'Reparto del mes por tipo de pago', de: 'Aufteilung des Monats nach Zahlungsart', en: 'Breakdown of the month by payment type' },
  'resumen.reembolsos': {
    es: 'Otras personas te devuelven {importe} al mes. No cuenta como ingreso tuyo.',
    de: 'Andere Personen zahlen dir {importe} im Monat zurück. Das zählt nicht als dein Einkommen.',
    en: 'Other people pay you back {importe} a month. It does not count as your income.',
  },
  'resumen.porcentaje.titulo': { es: 'Cuotas de deuda sobre tus ingresos', de: 'Schuldenraten im Verhältnis zu deinem Einkommen', en: 'Debt payments as a share of your income' },
  'resumen.porcentaje.sinIngresos': {
    es: 'Añade tus ingresos en Ajustes para ver este porcentaje.',
    de: 'Trage dein Einkommen in den Einstellungen ein, um diesen Prozentsatz zu sehen.',
    en: 'Add your income in Settings to see this percentage.',
  },
  'resumen.proximo.titulo': { es: 'Próximo cobro', de: 'Nächste Abbuchung', en: 'Next charge' },
  'resumen.proximo.nada': {
    es: 'No hay cobros con fecha en los próximos dos meses.',
    de: 'In den nächsten zwei Monaten gibt es keine Abbuchungen mit Datum.',
    en: 'No charges with a date in the next two months.',
  },
  'resumen.semana.titulo': { es: 'Próximos 7 días', de: 'Nächste 7 Tage', en: 'Next 7 days' },
  'resumen.semana.nada': { es: 'Ningún cobro en los próximos 7 días.', de: 'Keine Abbuchung in den nächsten 7 Tagen.', en: 'No charges in the next 7 days.' },

  'calendario.diasSemana': { es: 'L,M,X,J,V,S,D', de: 'M,D,M,D,F,S,S', en: 'M,T,W,T,F,S,S' },
  'calendario.dia.sinCobros': { es: 'Día {dia}: sin cobros', de: 'Tag {dia}: keine Abbuchungen', en: 'Day {dia}: no charges' },
  'calendario.dia.unPago': { es: 'Día {dia}: 1 pago, {importe}', de: 'Tag {dia}: 1 Zahlung, {importe}', en: 'Day {dia}: 1 payment, {importe}' },
  'calendario.dia.pagos': { es: 'Día {dia}: {n} pagos, {importe}', de: 'Tag {dia}: {n} Zahlungen, {importe}', en: 'Day {dia}: {n} payments, {importe}' },
  'calendario.mesAria': { es: '{mes}: {importe}', de: '{mes}: {importe}', en: '{mes}: {importe}' },
  'calendario.mesAriaLibera': { es: '{mes}: {importe}, se liberan {libera}', de: '{mes}: {importe}, {libera} werden frei', en: '{mes}: {importe}, {libera} freed up' },
  'calendario.verde': {
    es: 'Verde: mes en que termina una cuota y se libera dinero.',
    de: 'Grün: Monat, in dem eine Rate endet und Geld frei wird.',
    en: 'Green: month when an instalment ends and money is freed up.',
  },
  'calendario.titulo': { es: 'Calendario', de: 'Kalender', en: 'Calendar' },
  'calendario.vacio': { es: 'No hay pagos este mes.', de: 'Diesen Monat gibt es keine Zahlungen.', en: 'No payments this month.' },
  'calendario.dia': { es: 'Día {dia}', de: 'Tag {dia}', en: 'Day {dia}' },
  'calendario.sinFecha': { es: 'Sin fecha de cobro', de: 'Ohne Abbuchungsdatum', en: 'No charge date' },
  'calendario.proximos12': { es: 'Próximos 12 meses', de: 'Nächste 12 Monate', en: 'Next 12 months' },
  'calendario.terminan': { es: 'Cuando terminan cuotas', de: 'Wenn Raten enden', en: 'When instalments end' },

  'pagos.titulo': { es: 'Pagos', de: 'Zahlungen', en: 'Payments' },
  'pagos.mesAnterior': { es: 'Mes anterior', de: 'Vorheriger Monat', en: 'Previous month' },
  'pagos.mesSiguiente': { es: 'Mes siguiente', de: 'Nächster Monat', en: 'Next month' },
  'pagos.pagadoFalta': { es: 'Pagado {pagado} · Falta {falta}', de: 'Bezahlt {pagado} · Offen {falta}', en: 'Paid {pagado} · Remaining {falta}' },
  'pagos.filtrar': { es: 'Filtrar por tipo', de: 'Nach Art filtern', en: 'Filter by type' },
  'pagos.todos': { es: 'Todos', de: 'Alle', en: 'All' },
  'pagos.mostrar': { es: 'Mostrar', de: 'Anzeigen', en: 'Show' },
  'pagos.anadir': { es: 'Añadir pago', de: 'Zahlung hinzufügen', en: 'Add payment' },
  'pagos.vacio': {
    es: 'Todavía no hay pagos. Pulsa «Añadir pago» para empezar.',
    de: 'Noch keine Zahlungen. Tippe auf „Zahlung hinzufügen“, um zu beginnen.',
    en: 'No payments yet. Tap “Add payment” to get started.',
  },
  'pagos.vacioMes': { es: 'No hay pagos este mes.', de: 'Diesen Monat gibt es keine Zahlungen.', en: 'No payments this month.' },
  'pagos.vacioTipo': { es: 'No hay pagos de este tipo.', de: 'Keine Zahlungen dieser Art.', en: 'No payments of this type.' },
  'pagos.sinFecha': { es: 'sin fecha de cobro', de: 'ohne Abbuchungsdatum', en: 'no charge date' },
  'pagos.cobraDia': { es: 'cobra el día {dia}', de: 'Abbuchung am {dia}.', en: 'charged on day {dia}' },
  'pagos.sinFin': { es: 'sin fin', de: 'ohne Ende', en: 'no end' },
  'pagos.hasta': { es: 'hasta {mes}', de: 'bis {mes}', en: 'until {mes}' },
  'pagos.pendiente': { es: 'pendiente {importe}', de: 'offen {importe}', en: 'outstanding {importe}' },
  'pagos.devuelven': { es: 'te devuelven {importe}', de: 'du bekommst {importe} zurück', en: '{importe} paid back to you' },
  'pagos.marcarPagado': { es: 'Marcar como pagado', de: 'Als bezahlt markieren', en: 'Mark as paid' },
  'pagos.marcarNoPagado': { es: 'Marcar como no pagado', de: 'Als nicht bezahlt markieren', en: 'Mark as not paid' },
  'pagos.subir': { es: 'Subir', de: 'Nach oben', en: 'Move up' },
  'pagos.bajar': { es: 'Bajar', de: 'Nach unten', en: 'Move down' },
  'pagos.editar': { es: 'Editar', de: 'Bearbeiten', en: 'Edit' },
  'pagos.borrar': { es: 'Borrar', de: 'Löschen', en: 'Delete' },
  'pagos.borrarConfirmar': { es: '¿Borrar «{nombre}»?', de: '„{nombre}“ löschen?', en: 'Delete “{nombre}”?' },
  'pagos.form.sinFin': { es: 'Sin fin', de: 'Ohne Ende', en: 'No end' },
  'pagos.form.cuotasOpcion': { es: 'Cuotas restantes (contando este mes)', de: 'Verbleibende Raten (inkl. dieses Monats)', en: 'Remaining instalments (including this month)' },
  'pagos.form.ultimoMes': { es: 'Último mes de pago', de: 'Letzter Zahlungsmonat', en: 'Last payment month' },
  'pagos.form.cuotas': { es: 'Cuotas restantes', de: 'Verbleibende Raten', en: 'Remaining instalments' },
  'pagos.error.importe': { es: 'El importe no es válido. Ejemplo: 1.234,50', de: 'Der Betrag ist ungültig. Beispiel: 1.234,50', en: 'The amount is not valid. Example: 1.234,50' },
  'pagos.error.cuotas': {
    es: 'Las cuotas restantes deben ser un número entero de 1 o más',
    de: 'Die verbleibenden Raten müssen eine ganze Zahl ab 1 sein',
    en: 'Remaining instalments must be a whole number of 1 or more',
  },
  'pagos.error.ultimoMes': { es: 'Elige el último mes de pago', de: 'Wähle den letzten Zahlungsmonat', en: 'Choose the last payment month' },
  'pagos.error.saldo': { es: 'El saldo pendiente no es válido. Ejemplo: 1.234,50', de: 'Der offene Betrag ist ungültig. Beispiel: 1.234,50', en: 'The outstanding balance is not valid. Example: 1.234,50' },
  'pagos.error.reembolso': { es: 'El reembolso no es válido. Ejemplo: 1.234,50', de: 'Die Rückzahlung ist ungültig. Beispiel: 1.234,50', en: 'The repayment is not valid. Example: 1.234,50' },
  'pagos.error.marcado': {
    es: 'Este pago tiene marcado {mes}, fuera del nuevo rango. Desmárcalo antes de acortar el pago.',
    de: 'Diese Zahlung ist für {mes} abgehakt, außerhalb des neuen Zeitraums. Entferne den Haken, bevor du die Zahlung verkürzt.',
    en: 'This payment is ticked for {mes}, outside the new range. Untick it before shortening the payment.',
  },
  'pagos.form.editar': { es: 'Editar pago', de: 'Zahlung bearbeiten', en: 'Edit payment' },
  'pagos.form.nuevo': { es: 'Nuevo pago', de: 'Neue Zahlung', en: 'New payment' },
  'pagos.form.nombre': { es: 'Nombre', de: 'Name', en: 'Name' },
  'pagos.form.tipo': { es: 'Tipo', de: 'Art', en: 'Type' },
  'pagos.form.importe': { es: 'Importe mensual (€)', de: 'Monatlicher Betrag (€)', en: 'Monthly amount (€)' },
  'pagos.form.dia': { es: 'Día de cobro (vacío = sin fecha)', de: 'Abbuchungstag (leer = ohne Datum)', en: 'Charge day (empty = no date)' },
  'pagos.form.termina': { es: 'Cuándo termina', de: 'Wann es endet', en: 'When it ends' },
  'pagos.form.saldo': { es: 'Saldo pendiente (€, opcional)', de: 'Offener Betrag (€, optional)', en: 'Outstanding balance (€, optional)' },
  'pagos.form.reembolso': { es: 'Te lo devuelve otra persona (€ al mes, opcional)', de: 'Jemand anders zahlt es dir zurück (€ pro Monat, optional)', en: 'Someone else pays you back (€ a month, optional)' },
  'pagos.form.reembolsoDe': { es: '¿Quién te lo devuelve? (opcional)', de: 'Wer zahlt es dir zurück? (optional)', en: 'Who pays you back? (optional)' },
  'pagos.form.guardar': { es: 'Guardar', de: 'Speichern', en: 'Save' },
  'pagos.form.cancelar': { es: 'Cancelar', de: 'Abbrechen', en: 'Cancel' },

  'ajustes.titulo': { es: 'Ajustes', de: 'Einstellungen', en: 'Settings' },
  'ajustes.idioma.titulo': { es: 'Idioma', de: 'Sprache', en: 'Language' },
  'ajustes.ingresos.titulo': { es: 'Ingresos de {nombre}', de: 'Einkommen von {nombre}', en: 'Income for {nombre}' },
  'ajustes.ingresos.campo': { es: 'Ingresos mensuales propios (€)', de: 'Eigenes Monatseinkommen (€)', en: 'Your own monthly income (€)' },
  'ajustes.ingresos.ayuda': {
    es: 'Solo se usan para calcular qué parte se va en cuotas de deuda.',
    de: 'Wird nur verwendet, um zu berechnen, welcher Anteil in Schuldenraten fließt.',
    en: 'Only used to work out how much goes on debt payments.',
  },
  'ajustes.ingresos.guardar': { es: 'Guardar ingresos', de: 'Einkommen speichern', en: 'Save income' },
  'ajustes.ingresos.error': { es: 'Los ingresos no son válidos. Ejemplo: 1.200,00', de: 'Das Einkommen ist ungültig. Beispiel: 1.200,00', en: 'The income is not valid. Example: 1.200,00' },
  'ajustes.ingresos.guardados': { es: 'Ingresos guardados.', de: 'Einkommen gespeichert.', en: 'Income saved.' },
  'ajustes.copia.titulo': { es: 'Copia de seguridad', de: 'Sicherung', en: 'Backup' },
  'ajustes.copia.ayuda': {
    es: 'Tus datos solo viven en este iPhone. Exporta una copia de vez en cuando por si el navegador los borra.',
    de: 'Deine Daten sind nur auf diesem iPhone. Exportiere ab und zu eine Sicherung, falls der Browser sie löscht.',
    en: 'Your data only lives on this iPhone. Export a backup now and then in case the browser deletes it.',
  },
  'ajustes.copia.exportar': { es: 'Exportar copia', de: 'Sicherung exportieren', en: 'Export backup' },
  'ajustes.copia.importar': { es: 'Importar copia', de: 'Sicherung importieren', en: 'Import backup' },
  'ajustes.copia.lista': {
    es: 'Copia lista. Guárdala en un sitio seguro: contiene tus datos.',
    de: 'Sicherung bereit. Bewahre sie an einem sicheren Ort auf: Sie enthält deine Daten.',
    en: 'Backup ready. Keep it somewhere safe: it contains your data.',
  },
  'ajustes.copia.exportada': {
    es: 'Copia exportada. Guárdala en un sitio seguro: contiene tus datos.',
    de: 'Sicherung exportiert. Bewahre sie an einem sicheren Ort auf: Sie enthält deine Daten.',
    en: 'Backup exported. Keep it somewhere safe: it contains your data.',
  },
  'ajustes.importar.futura': {
    es: 'Esa copia es de una versión más nueva de la app. No se ha cambiado nada.',
    de: 'Diese Sicherung stammt von einer neueren Version der App. Es wurde nichts geändert.',
    en: 'That backup is from a newer version of the app. Nothing has been changed.',
  },
  'ajustes.importar.error': {
    es: 'No se pudo importar: {error}. No se ha cambiado nada.',
    de: 'Import nicht möglich: {error}. Es wurde nichts geändert.',
    en: 'Could not import: {error}. Nothing has been changed.',
  },
  'ajustes.importar.hecho': { es: 'Copia importada.', de: 'Sicherung importiert.', en: 'Backup imported.' },
  'ajustes.borrar.titulo': { es: 'Borrar todo', de: 'Alles löschen', en: 'Delete everything' },
  'ajustes.borrar.boton': { es: 'Borrar todos los datos', de: 'Alle Daten löschen', en: 'Delete all data' },
  'ajustes.borrar.confirmar': {
    es: 'Se borrarán todos los perfiles, pagos e ingresos de este iPhone. ¿Seguro?',
    de: 'Alle Profile, Zahlungen und Einkommen auf diesem iPhone werden gelöscht. Sicher?',
    en: 'All profiles, payments and income on this iPhone will be deleted. Are you sure?',
  },
  'ajustes.borrar.hecho': { es: 'Todo borrado.', de: 'Alles gelöscht.', en: 'Everything deleted.' },

  'perfil.uno': { es: 'perfil', de: 'Profil', en: 'profile' },
  'perfil.varios': { es: 'perfiles', de: 'Profile', en: 'profiles' },
  'perfil.gestionar': { es: 'Gestionar perfiles…', de: 'Profile verwalten…', en: 'Manage profiles…' },
  'perfil.titulo': { es: 'Perfiles', de: 'Profile', en: 'Profiles' },
  'perfil.ayuda': {
    es: 'Cada perfil lleva sus propios pagos e ingresos, separados de los demás.',
    de: 'Jedes Profil hat eigene Zahlungen und eigenes Einkommen, getrennt von den anderen.',
    en: 'Each profile has its own payments and income, kept apart from the others.',
  },
  'perfil.activo': { es: 'activo', de: 'aktiv', en: 'active' },
  'perfil.renombrar': { es: 'Renombrar', de: 'Umbenennen', en: 'Rename' },
  'perfil.borrar': { es: 'Borrar', de: 'Löschen', en: 'Delete' },
  'perfil.nuevo': { es: '+ Nuevo perfil', de: '+ Neues Profil', en: '+ New profile' },
  'perfil.pedirNombre': { es: 'Nombre del perfil', de: 'Name des Profils', en: 'Profile name' },
  'perfil.creado': { es: 'Perfil «{nombre}» creado. Ahora estás en él.', de: 'Profil „{nombre}“ erstellt. Du bist jetzt darin.', en: 'Profile “{nombre}” created. You are now in it.' },
  'perfil.renombrado': { es: 'Nombre cambiado.', de: 'Name geändert.', en: 'Name changed.' },
  'perfil.borrarConfirmar': {
    es: 'Se borrará el perfil «{nombre}» con todos sus pagos. ¿Seguro?',
    de: 'Das Profil „{nombre}“ wird mit allen Zahlungen gelöscht. Sicher?',
    en: 'The profile “{nombre}” will be deleted with all its payments. Are you sure?',
  },
  'perfil.borrado': { es: 'Perfil «{nombre}» borrado.', de: 'Profil „{nombre}“ gelöscht.', en: 'Profile “{nombre}” deleted.' },
  'perfil.error.vacio': { es: 'El nombre no puede estar vacío', de: 'Der Name darf nicht leer sein', en: 'The name cannot be empty' },
  'perfil.error.largo': { es: 'El nombre puede tener como mucho {max} caracteres', de: 'Der Name darf höchstens {max} Zeichen haben', en: 'The name can have at most {max} characters' },
  'perfil.error.repetido': { es: 'Ya hay un perfil con ese nombre', de: 'Es gibt schon ein Profil mit diesem Namen', en: 'There is already a profile with that name' },
  'perfil.error.ultimo': { es: 'Tiene que quedar al menos un perfil', de: 'Mindestens ein Profil muss bleiben', en: 'At least one profile must remain' },
  'perfil.error.noExiste': { es: 'Ese perfil no existe', de: 'Dieses Profil gibt es nicht', en: 'That profile does not exist' },

  'ajustes.importar.confirmar': {
    es: 'Esto reemplaza todos tus perfiles por la copia ({n} {perfiles}). ¿Continuar?',
    de: 'Damit werden alle deine Profile durch die Sicherung ersetzt ({n} {perfiles}). Fortfahren?',
    en: 'This replaces all your profiles with the backup ({n} {perfiles}). Continue?',
  },
};

let actual = 'es';

export function idioma() {
  return actual;
}

export function fijarIdioma(cod) {
  actual = IDIOMAS.includes(cod) ? cod : 'es';
}

export function t(clave, vars = {}) {
  const entrada = TEXTOS[clave];
  if (!entrada) throw new Error(`Falta el texto: ${clave}`);
  return entrada[actual].replace(/\{(\w+)\}/g, (_, hueco) => String(vars[hueco]));
}

const mayuscula = (s) => s.charAt(0).toLocaleUpperCase(actual) + s.slice(1);

// '2026-11' -> 'Noviembre 2026' / 'November 2026'; con 'short', solo el mes: 'Nov'.
export function nombreMes(mes, estilo = 'long') {
  const [anio, m] = mes.split('-').map(Number);
  const fecha = new Date(anio, m - 1, 1);
  const nombre = mayuscula(new Intl.DateTimeFormat(actual, { month: estilo }).format(fecha).replace('.', ''));
  return estilo === 'short' ? nombre : `${nombre} ${anio}`;
}

// Nunca lanza: si no hay almacenamiento o el valor no vale, español.
export function cargarIdioma(storage) {
  try {
    const cod = storage.getItem(CLAVE_IDIOMA);
    return IDIOMAS.includes(cod) ? cod : 'es';
  } catch {
    return 'es';
  }
}

export function guardarIdioma(storage, cod) {
  try {
    storage.setItem(CLAVE_IDIOMA, cod);
    return true;
  } catch {
    return false;
  }
}
