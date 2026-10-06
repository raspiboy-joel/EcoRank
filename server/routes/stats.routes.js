// =====================================================================
//  RUTAS DE ESTADÍSTICAS
// =====================================================================

import { Router } from 'express'
import { obtenerEstadisticas } from '../controllers/stats.controller.js'

const router = Router()

router.get('/stats', obtenerEstadisticas) // Dashboard de impacto ambiental

export default router
