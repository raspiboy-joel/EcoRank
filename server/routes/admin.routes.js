// =====================================================================
//  RUTAS DEL ADMINISTRADOR (protegidas por contraseña)
// =====================================================================

import { Router } from 'express'
import { verificarAdmin } from '../middleware/admin.middleware.js'
import {
  login,
  listarTodo,
  actualizarEstudiante,
  eliminarEstudiante,
  reiniciarRanking,
  exportarCSV
} from '../controllers/admin.controller.js'

const router = Router()

// La única ruta SIN protección es /login (sirve para probar la contraseña).
router.post('/login', login)

// A partir de aquí, TODAS las rutas exigen el header "x-admin-password".
router.use(verificarAdmin)

router.get('/students', listarTodo)                 // Ver todo
router.put('/student/:id', actualizarEstudiante)    // Editar datos / puntos
router.delete('/student/:id', eliminarEstudiante)   // Eliminar estudiante
router.post('/reset', reiniciarRanking)             // Reiniciar ranking
router.get('/export', exportarCSV)                  // Exportar CSV

export default router
