// =====================================================================
//  CONSTANTES DEL FRONTEND
// ---------------------------------------------------------------------
//  Las categorías deben coincidir con server/config.js. Aquí además
//  definimos cómo se VE cada una (icono, colores para claro/oscuro y
//  para gráficos). El salón es texto libre: no hay lista cerrada.
// =====================================================================

export const MATERIALES = [
  {
    clave: 'plastico',
    icono: '🟢',
    puntos: 10,
    color: '#22C55E', // para gráficos (Chart.js)
    suave: 'bg-eco-light dark:bg-eco/15',
    texto: 'text-eco-deep dark:text-eco',
    barra: 'bg-eco'
  },
  {
    clave: 'papel',
    icono: '🟤',
    puntos: 8,
    color: '#B45309',
    suave: 'bg-amber-100 dark:bg-amber-500/15',
    texto: 'text-amber-800 dark:text-amber-400',
    barra: 'bg-amber-600'
  },
  {
    clave: 'organico',
    icono: '🟠',
    puntos: 5,
    color: '#F97316',
    suave: 'bg-orange-100 dark:bg-orange-500/15',
    texto: 'text-orange-700 dark:text-orange-400',
    barra: 'bg-orange-500'
  }
]

// Búsqueda rápida por clave: infoMaterial('papel') → {icono:'🟤', ...}
export const infoMaterial = (clave) => MATERIALES.find((m) => m.clave === clave)
