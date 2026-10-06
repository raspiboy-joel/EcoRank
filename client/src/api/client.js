// =====================================================================
//  CLIENTE DE LA API
// ---------------------------------------------------------------------
//  Funciones para hablar con el servidor. Todas las páginas usan esto
//  en lugar de escribir fetch() a mano, así el código queda ordenado.
// =====================================================================

// Llama a la API y devuelve la respuesta en JSON.
// Si el servidor responde con error, lanzamos una excepción con el mensaje.
export async function api(ruta, opciones = {}) {
  const respuesta = await fetch(`/api${ruta}`, {
    headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
    ...opciones
  })

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new Error(datos.error || 'No se pudo conectar con el servidor.')
  }
  return datos
}

// --- Utilidades del modo administrador -------------------------------
// La contraseña se guarda en sessionStorage (se borra al cerrar la pestaña)
// y se envía en cada petición del panel dentro del header x-admin-password.

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
