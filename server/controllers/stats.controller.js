// =====================================================================
//  CONTROLADOR DE ESTADÍSTICAS
// ---------------------------------------------------------------------
//  Alimenta el dashboard 🌍 Impacto Ambiental. Todo se calcula EN VIVO
//  desde el historial de reciclajes (tabla "reciclajes", relacionada
//  con cada estudiante por su UUID); nada de números inventados. Si
//  aún no hay reciclajes, los números simplemente salen en cero.
//
//  NOTA: el salón se guarda en cada estudiante para dejar el sistema
//  preparado para futuras expansiones, pero esta versión NO calcula
//  rankings ni competencias entre salones (se usa en un solo salón).
// =====================================================================

import db from '../database/db.js'
import { MATERIALES } from '../config.js'

const CLAVES_MATERIAL = Object.keys(MATERIALES) // ['plastico', 'papel', 'organico']

// =====================================================================
//  GET /api/stats  →  Todas las estadísticas del sistema
// =====================================================================
export function obtenerEstadisticas(req, res) {
  // --- Números generales ----------------------------------------------
  const totales = db
    .prepare(`SELECT COUNT(*) AS estudiantes, COALESCE(SUM(puntos), 0) AS puntos FROM estudiantes`)
    .get()
  const totalResiduos = db.prepare(`SELECT COUNT(*) AS c FROM reciclajes`).get().c

  const lider =
    db
      .prepare(
        `SELECT id, nombre, salon, puntos FROM estudiantes
         WHERE puntos > 0
         ORDER BY puntos DESC, nombre COLLATE NOCASE ASC LIMIT 1`
      )
      .get() || null

  // --- Por categoría (cantidad, puntos y % del total) -------------------
  const porMaterial = db
    .prepare(
      `SELECT material, COUNT(*) AS cantidad, COALESCE(SUM(puntos_obtenidos), 0) AS puntos
       FROM reciclajes GROUP BY material`
    )
    .all()

  const categorias = CLAVES_MATERIAL.map((clave) => {
    const fila = porMaterial.find((f) => f.material === clave)
    const cantidad = fila?.cantidad || 0
    return {
      material: clave,
      cantidad,
      puntos: fila?.puntos || 0,
      porcentaje: totalResiduos ? Math.round((cantidad / totalResiduos) * 1000) / 10 : 0
    }
  })

  // --- Evolución: últimos 14 días (rellenando los días sin actividad) ---
  const porDia = db
    .prepare(
      `SELECT date(fecha) AS dia, COUNT(*) AS cantidad, COALESCE(SUM(puntos_obtenidos), 0) AS puntos
       FROM reciclajes
       WHERE fecha >= datetime('now', '-14 days')
       GROUP BY date(fecha)`
    )
    .all()

  const evolucion = []
  for (let i = 13; i >= 0; i--) {
    const fecha = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const fila = porDia.find((f) => f.dia === fecha)
    evolucion.push({ fecha, cantidad: fila?.cantidad || 0, puntos: fila?.puntos || 0 })
  }

  res.json({
    general: {
      total_residuos: totalResiduos,
      total_estudiantes: totales.estudiantes,
      total_puntos: totales.puntos,
      promedio_puntos: totales.estudiantes
        ? Math.round((totales.puntos / totales.estudiantes) * 10) / 10
        : 0,
      lider
    },
    categorias,
    evolucion
  })
}
