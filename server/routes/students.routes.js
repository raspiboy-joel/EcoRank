// =====================================================================
//  RUTAS DE ESTUDIANTES (públicas)
// ---------------------------------------------------------------------
//  Aquí solo se DECLARAN las rutas. La lógica vive en /controllers.
// =====================================================================

import { Router } from 'express'
import {
  registrarEstudiante,
  listarEstudiantes,
  obtenerRanking,
  obtenerEstudiante
} from '../controllers/students.controller.js'

const router = Router()

router.post('/students', registrarEstudiante)   // Registrar + generar QR
router.get('/students', listarEstudiantes)      // Lista de estudiantes
router.get('/ranking', obtenerRanking)          // Clasificación por puntos
router.get('/student/:id', obtenerEstudiante)   // Perfil (acepta id o uuid)

export default router
