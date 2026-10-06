// =====================================================================
//  SISTEMA DE LOGROS (insignias)
// ---------------------------------------------------------------------
//  Cada logro tiene un icono y una regla "logrado(estudiante)" que
//  devuelve true/false según los puntos y reciclajes del estudiante.
//  Los nombres y descripciones viven en los diccionarios de i18n
//  (clave: logros.lista.<id>). Para agregar un logro nuevo: añade una
//  entrada aquí y sus textos en es.json / en.json.
// =====================================================================

export const LOGROS = [
  { id: 'primer_reciclaje', icono: '🥉', logrado: (e) => (e.total_reciclajes || 0) >= 1 },
  { id: 'puntos_100',       icono: '🥈', logrado: (e) => (e.puntos || 0) >= 100 },
  { id: 'puntos_500',       icono: '🥇', logrado: (e) => (e.puntos || 0) >= 500 },
  { id: 'residuos_50',      icono: '♻️', logrado: (e) => (e.total_reciclajes || 0) >= 50 },
  { id: 'eco_heroe',        icono: '🌱', logrado: (e) => (e.puntos || 0) >= 1000 }
]
