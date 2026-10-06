// =====================================================================
//  CLIENTE DE LA API
// ---------------------------------------------------------------------
//  Funciones para hablar con el servidor de EcoRank.
// =====================================================================

const API_URL = 'https://ecorank-y8hk.onrender.com'

// Llama a la API y devuelve la respuesta en JSON.
export async function api(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_URL}/api${ruta}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(opciones.headers || {})
    },
    ...opciones
  })

  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    throw new Error(datos.error || 'No se pudo conectar con el servidor.')
  }

  return datos
}

// --- Utilidades del modo administrador -------------------------------

const CLAVE_SESION = 'ecorank_admin_password'

export function guardarClaveAdmin(password) {
  sessionStorage.setItem(CLAVE_SESION, password)
}

export function obtenerClaveAdmin() {
  return sessionStorage.getItem(CLAVE_SESION) || ''
}

export function cerrarSesionAdmin() {
  sessionStorage.removeItem(CLAVE_SESION)
}

export function headersAdmin() {
  return { 'x-admin-password': obtenerClaveAdmin() }
}

