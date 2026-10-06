// =====================================================================
//  AVATAR CON INICIALES
//  Genera un círculo de color con las iniciales del nombre. El color
//  se elige a partir del nombre, así cada estudiante tiene el suyo
//  y siempre es el mismo (sin necesidad de subir fotos).
// =====================================================================

const GRADIENTES = [
  'from-eco to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-teal-600'
]

// Convierte un nombre en un número estable para elegir su color.
function indiceDeColor(texto) {
  let suma = 0
  for (const letra of String(texto)) suma += letra.charCodeAt(0)
  return suma % GRADIENTES.length
}

export default function Avatar({ nombre = '?', tamano = 'h-16 w-16 text-xl' }) {
  const iniciales = String(nombre)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')

  return (
    <div
      className={`grid ${tamano} shrink-0 place-items-center rounded-full bg-gradient-to-br ${GRADIENTES[indiceDeColor(nombre)]} font-display font-bold text-white shadow-soft`}
      aria-hidden="true"
    >
      {iniciales || '?'}
    </div>
  )
}
