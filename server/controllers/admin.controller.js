// =====================================================================
//  CONTROLADOR DEL ADMINISTRADOR
// ---------------------------------------------------------------------
//  Funciones que solo puede usar el/la profe (o quien administre):
//  ver todo, editar datos, borrar estudiantes, modificar puntos,
//  cambiar de salón, reiniciar el ranking y exportar en CSV.
//
//  Todas estas rutas están protegidas por una contraseña simple
//  (ver middleware/admin.middleware.js).
// =====================================================================

import db from '../database/db.js'
import { CONTRASENA_ADMIN } from '../middleware/admin.middleware.js'
import { buscarEstudiante } from './students.controller.js'
import { normalizarSalon } from '../config.js'

// =====================================================================
//  POST /api/admin/login  →  Verificar la contraseña
// =====================================================================
export function login(req, res) {
  const { password } = req.body
  if (password === CONTRASENA_ADMIN) {
    return res.json({ ok: true })
  }
  res.status(401).json({ error: 'Contraseña incorrecta.' })
}

// =====================================================================
//  GET /api/admin/students  →  Lista completa (incluye uuid y qr_data)
// =====================================================================
export function listarTodo(req, res) {
  const estudiantes = db
    .prepare(
      `SELECT e.*,
              (SELECT COUNT(*) FROM reciclajes r WHERE r.uuid_estudiante = e.uuid) AS total_reciclajes
       FROM estudiantes e
       ORDER BY e.puntos DESC, e.nombre COLLATE NOCASE ASC`
    )
    .all()
  res.json(estudiantes)
}

// =====================================================================
//  PUT /api/admin/student/:id  →  Editar datos de un estudiante
//  Se pueden cambiar: nombre, numero_lista, puntos y salon.
//  OJO: el id, el uuid y el qr_data NUNCA cambian (el QR es permanente).
// =====================================================================
export function actualizarEstudiante(req, res) {
  const estudiante = buscarEstudiante(req.params.id)
  if (!estudiante) {
    return res.status(404).json({ error: 'Estudiante no encontrado.' })
  }

  // Si un campo no viene en la petición, conservamos el valor actual.
  const nombre = String(req.body.nombre ?? estudiante.nombre).trim().replace(/\s+/g, ' ')
  const numeroLista = parseInt(req.body.numero_lista ?? estudiante.numero_lista, 10)
  const puntos = parseInt(req.body.puntos ?? estudiante.puntos, 10)
  const salon = req.body.salon !== undefined ? normalizarSalon(req.body.salon) : estudiante.salon

  // Validaciones:
  if (nombre.length < 3) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 3 letras.' })
  }
  if (!Number.isInteger(numeroLista) || numeroLista < 1 || numeroLista > 999) {
    return res.status(400).json({ error: 'Número de lista inválido (1 a 999).' })
  }
  if (!Number.isInteger(puntos) || puntos < 0 || puntos > 1000000) {
    return res.status(400).json({ error: 'Puntos inválidos.' })
  }
  // Si el admin CAMBIA el salón, debe ser uno de los oficiales.
  if (req.body.salon !== undefined && !salon) {
    return res
      .status(400)
      .json({ error: 'El salón no puede estar vacío (máximo 30 caracteres).' })
  }

  db.prepare(
    `UPDATE estudiantes SET nombre = ?, numero_lista = ?, puntos = ?, salon = ? WHERE id = ?`
  ).run(nombre, numeroLista, puntos, salon, estudiante.id)

  const actualizado = db.prepare(`SELECT * FROM estudiantes WHERE id = ?`).get(estudiante.id)
  res.json({ ok: true, estudiante: actualizado })
}

// =====================================================================
//  DELETE /api/admin/student/:id  →  Eliminar un estudiante
//  (Su historial se borra solo, gracias al ON DELETE CASCADE.)
// =====================================================================
export function eliminarEstudiante(req, res) {
  const estudiante = buscarEstudiante(req.params.id)
  if (!estudiante) {
    return res.status(404).json({ error: 'Estudiante no encontrado.' })
  }
  db.prepare(`DELETE FROM estudiantes WHERE id = ?`).run(estudiante.id)
  res.json({ ok: true, mensaje: `${estudiante.nombre} fue eliminado.` })
}

// =====================================================================
//  POST /api/admin/reset  →  Reiniciar el ranking
//  Pone todos los puntos en 0 y limpia el historial de reciclajes.
//  Los estudiantes y sus QR permanentes NO se borran.
// =====================================================================
export function reiniciarRanking(req, res) {
  const transaccion = db.transaction(() => {
    db.prepare(`UPDATE estudiantes SET puntos = 0`).run()
    db.prepare(`DELETE FROM reciclajes`).run()
  })
  transaccion()
  res.json({ ok: true, mensaje: 'Ranking reiniciado: todos los puntos están en 0.' })
}

// =====================================================================
//  GET /api/admin/export  →  Descargar la base de datos en CSV
//  El CSV se puede abrir directamente en Excel o Google Sheets.
// =====================================================================
export function exportarCSV(req, res) {
  const filas = db
    .prepare(
      `SELECT id, uuid, nombre, numero_lista, salon, puntos, fecha_registro
       FROM estudiantes ORDER BY salon ASC, numero_lista ASC`
    )
    .all()

  // Función para "escapar" valores: si un nombre tiene comas o comillas,
  // el CSV no se rompe.
  const escapar = (valor) => `"${String(valor ?? '').replaceAll('"', '""')}"`

  const columnas = ['id', 'uuid', 'nombre', 'numero_lista', 'salon', 'puntos', 'fecha_registro']
  const lineas = [columnas.join(',')]
  for (const fila of filas) {
    lineas.push(columnas.map((c) => escapar(fila[c])).join(','))
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="ecorank-estudiantes.csv"')
  // El "\ufeff" (BOM) hace que Excel muestre bien las tildes y la ñ.
  res.send('\ufeff' + lineas.join('\n'))
}
