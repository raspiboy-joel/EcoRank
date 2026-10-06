// =====================================================================
//  RUTA DE RECICLAJE (la usa la Raspberry Pi del basurero)
// ---------------------------------------------------------------------
//  Endpoint SEGURO: si defines la variable de entorno DEVICE_API_KEY,
//  el dispositivo debe enviar esa clave en el header "x-api-key".
//  Ejemplo para activarla:
//      DEVICE_API_KEY=miClaveDelBasurero npm run dev
//  Si NO la defines, el endpoint queda abierto (útil mientras se
//  desarrolla y se prueba en la red local del colegio).
// =====================================================================

import { Router } from 'express'
import { registrarReciclaje } from '../controllers/recycle.controller.js'

const router = Router()

// Filtro de seguridad para dispositivos externos.
function verificarDispositivo(req, res, next) {
  const claveConfigurada = process.env.DEVICE_API_KEY
  if (claveConfigurada && req.headers['x-api-key'] !== claveConfigurada) {
    return res.status(401).json({ error: 'No autorizado: clave de dispositivo incorrecta.' })
  }
  next()
}

router.post('/recycle', verificarDispositivo, registrarReciclaje)

export default router
