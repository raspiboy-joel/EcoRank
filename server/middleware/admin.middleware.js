// =====================================================================
//  MIDDLEWARE DE ADMINISTRADOR
// ---------------------------------------------------------------------
//  Un "middleware" es un filtro que se ejecuta ANTES de una ruta.
//  Este revisa que la petición traiga la contraseña correcta en el
//  encabezado (header) "x-admin-password". Si no, responde 401.
//
//  Para cambiar la contraseña sin tocar el código, define la variable
//  de entorno ADMIN_PASSWORD antes de iniciar el servidor. Ejemplo:
//      ADMIN_PASSWORD=miClaveSecreta npm run dev
//
//  NOTA: esto es suficiente para un prototipo escolar. En un sistema
//  real se usarían usuarios, tokens (JWT) y contraseñas encriptadas.
// =====================================================================

export const CONTRASENA_ADMIN = process.env.ADMIN_PASSWORD || 'ecorank123'

export function verificarAdmin(req, res, next) {
  const password = req.headers['x-admin-password']
  if (password !== CONTRASENA_ADMIN) {
    return res.status(401).json({ error: 'No autorizado: contraseña de administrador incorrecta.' })
  }
  next() // contraseña correcta → la petición puede continuar
}
