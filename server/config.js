// =====================================================================
//  CONFIGURACIÓN CENTRAL DE ECORANK
// ---------------------------------------------------------------------
//  Un solo lugar para las reglas del proyecto: cómo se valida el salón
//  y qué materiales se aceptan (con sus puntos). Si el próximo año se
//  agregan categorías, solo se edita este archivo.
// =====================================================================

// ---------------------------------------------------------------------
//  SALÓN (texto libre)
//  El estudiante escribe su salón manualmente (ej: "10° A").
//  El dato se guarda para dejar el sistema preparado para expandirse
//  a otros salones o a toda la escuela en el futuro.
//  Esta función limpia el texto y lo rechaza si está vacío o es
//  demasiado largo. Devuelve el salón limpio, o null si no es válido.
// ---------------------------------------------------------------------
export function normalizarSalon(texto) {
  const limpio = String(texto || '').trim().replace(/\s+/g, ' ')
  if (limpio.length < 1 || limpio.length > 30) return null
  return limpio
}

// Las TRES categorías oficiales de residuos y sus puntos.
export const MATERIALES = {
  plastico: { puntos: 10 }, // 🟢 Botellas, tapas, envases
  papel:    { puntos: 8 },  // 🟤 Hojas, cajas, cuadernos
  organico: { puntos: 5 }   // 🟠 Restos de comida, frutas, vegetales
}

// Sinónimos aceptados (español/inglés) → categoría oficial.
const ALIAS = {
  plastic: 'plastico', botella: 'plastico', pet: 'plastico',
  paper: 'papel', carton: 'papel', cardboard: 'papel', 'papel y carton': 'papel',
  organic: 'organico', comida: 'organico', food: 'organico'
}

// Convierte cualquier texto ("Plástico", "PAPER", "orgánico") en la
// clave oficial ('plastico' | 'papel' | 'organico') o null si no existe.
export function normalizarMaterial(texto) {
  const limpio = String(texto || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes: plástico → plastico
  if (MATERIALES[limpio]) return limpio
  return ALIAS[limpio] || null
}
