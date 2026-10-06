// =====================================================================
//  ECORANK — SERVIDOR PRINCIPAL (Express)
// ---------------------------------------------------------------------
//  Este archivo arranca el servidor. Sus tareas:
//   1. Recibir peticiones de la página web (frontend).
//   2. Recibir peticiones de la Raspberry Pi (POST /api/recycle).
//   3. Conectar todo con la base de datos SQLite.
//
//  Para iniciarlo:   npm run dev   (dentro de la carpeta /server)
// =====================================================================

import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import studentsRoutes from './routes/students.routes.js'
import recycleRoutes from './routes/recycle.routes.js'
import statsRoutes from './routes/stats.routes.js'
import adminRoutes from './routes/admin.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// --- Middlewares globales -------------------------------------------
app.use(cors())          // permite que la Raspberry Pi y la web nos llamen
app.use(express.json())  // entiende peticiones con cuerpo en formato JSON

// --- Ruta de prueba ("¿está vivo el servidor?") ----------------------
app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'EcoRank', fecha: new Date().toISOString() })
})

// --- Rutas de la API --------------------------------------------------
app.use('/api', statsRoutes)      // /api/stats
app.use('/api', studentsRoutes)   // /api/students, /api/ranking, /api/student/:id
app.use('/api', recycleRoutes)    // /api/recycle  (basurero inteligente)
app.use('/api/admin', adminRoutes) // /api/admin/... (panel protegido)

// --- Servir la página web ya construida (modo producción) ------------
//  Si ejecutas "npm run build" dentro de /client, se crea /client/dist.
//  Este bloque hace que el MISMO servidor entregue la página web,
//  ideal para instalarlo todo junto (por ejemplo, en la Raspberry Pi).
const carpetaWeb = path.join(__dirname, '../client/dist')
if (fs.existsSync(carpetaWeb)) {
  app.use(express.static(carpetaWeb))

  // Cualquier otra ruta (que no sea /api) devuelve la página web.
  // Esto permite que React maneje sus propias rutas (/ranking, /perfil...).
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Ruta de API no encontrada.' })
    }
    res.sendFile(path.join(carpetaWeb, 'index.html'))
  })
}

// --- Manejo de errores inesperados ------------------------------------
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err.message)
  res.status(500).json({ error: 'Error interno del servidor.' })
})

// --- ¡A escuchar! ------------------------------------------------------
const PUERTO = process.env.PORT || 3001

app.listen(PUERTO, "0.0.0.0", () => {
  console.log("=============================================")
  console.log(`♻️ EcoRank listo`)
  console.log(`Local:   http://localhost:${PUERTO}`)
  console.log(`Red:     http://10.0.0.191:${PUERTO}`)
  console.log(`Health:  http://10.0.0.191:${PUERTO}/api/health`)
  console.log("=============================================")
})
