// =====================================================================
//  CONTROLADOR DE ESTUDIANTES
// ---------------------------------------------------------------------
//  Aquí vive la lógica de: registrar estudiantes, generar su QR
//  permanente, listar estudiantes, ver un perfil y calcular el ranking.
// =====================================================================

import { v4 as uuidv4 } from 'uuid'
import db from '../database/db.js'
import { normalizarSalon } from '../config.js'

// ---------------------------------------------------------------------
//  Genera el siguiente id con formato "ecorank-00001", "ecorank-00002"...
//  Busca el número más alto usado hasta ahora y le suma 1, así nunca
//  se repite aunque se borren estudiantes.
// ---------------------------------------------------------------------
function generarNuevoId() {
  const fila = db
    .prepare(`SELECT MAX(CAST(substr(id, 9) AS INTEGER)) AS maximo FROM estudiantes`)
    .get()
  const siguiente = (fila.maximo || 0) + 1
  return 'ecorank-' + String(siguiente).padStart(5, '0')
}

// ---------------------------------------------------------------------
//  Calcula la posición de un estudiante en el ranking.
//  (Se exporta porque el controlador de reciclaje también la usa.)
//  Regla simple: posición = (cuántos tienen MÁS puntos que él) + 1.
//  Si dos estudiantes empatan en puntos, comparten la misma posición.
// ---------------------------------------------------------------------
export function calcularPosicion(estudiante) {
  const fila = db
    .prepare(`SELECT COUNT(*) AS mejores FROM estudiantes WHERE puntos > ?`)
    .get(estudiante.puntos)
  return fila.mejores + 1
}

// Busca un estudiante ya sea por su id ("ecorank-00024") o por su uuid.
export function buscarEstudiante(identificador) {
  return db
    .prepare(`SELECT * FROM estudiantes WHERE id = ? OR uuid = ?`)
    .get(identificador, identificador)
}

// =====================================================================
//  POST /api/students  →  Registrar estudiante y generar su QR
// =====================================================================
export function registrarEstudiante(req, res) {
  // 1) Leemos y limpiamos los datos que llegan del formulario.
  const nombre = String(req.body.nombre || '').trim().replace(/\s+/g, ' ')
  const numeroLista = parseInt(req.body.numero_lista ?? req.body.numeroLista, 10)
  const salon = normalizarSalon(req.body.salon)

  // 2) Validaciones básicas (nunca confíes en los datos del navegador).
  if (nombre.length < 3) {
    return res.status(400).json({ error: 'Escribe tu nombre completo (mínimo 3 letras).' })
  }
  if (!Number.isInteger(numeroLista) || numeroLista < 1 || numeroLista > 999) {
    return res.status(400).json({ error: 'El número de lista debe ser un número entre 1 y 999.' })
  }
  if (!salon) {
    return res
      .status(400)
      .json({ error: 'Escribe tu salón (por ejemplo: 10° A). Máximo 30 caracteres.' })
  }

  // 3) ¿Este estudiante YA existe? (mismo nombre + mismo número de lista)
  //    Comparamos en minúsculas para que "Ana Pérez" y "ana pérez" cuenten igual.
  const existente = db
    .prepare(
      `SELECT * FROM estudiantes
       WHERE LOWER(TRIM(nombre)) = LOWER(?) AND numero_lista = ?`
    )
    .get(nombre, numeroLista)

  if (existente) {
    // Ya estaba registrado → devolvemos SU MISMO QR de siempre.
    // Nunca se crea uno nuevo: el QR es permanente.
    // (Su salón original se conserva; el admin puede corregirlo si hace falta.)
    return res.json({ estudiante: existente, existente: true })
  }

  // 4) Es nuevo → creamos su identidad permanente.
  const id = generarNuevoId()          // ej: "ecorank-00024" (legible)
  const uuid = uuidv4()                // ej: "a1b2c3d4-..."   (único mundial)

  // El QR NO contiene el nombre, solo el identificador.
  // Esto evita duplicados y falsificaciones, y es fácil de leer para el
  // escáner del basurero. Contenido exacto del QR:
  //   {"id":"ecorank-00024"}
  const qrData = JSON.stringify({ id })

  db.prepare(
    `INSERT INTO estudiantes (id, uuid, nombre, numero_lista, salon, qr_data)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, uuid, nombre, numeroLista, salon, qrData)

  const estudiante = db.prepare(`SELECT * FROM estudiantes WHERE id = ?`).get(id)
  res.status(201).json({ estudiante, existente: false })
}

// =====================================================================
//  GET /api/students  →  Lista de todos los estudiantes
// =====================================================================
export function listarEstudiantes(req, res) {
  const estudiantes = db
    .prepare(
      `SELECT id, nombre, numero_lista, puntos, salon, fecha_registro
       FROM estudiantes ORDER BY numero_lista ASC`
    )
    .all()
  res.json(estudiantes)
}

// =====================================================================
//  GET /api/ranking  →  Clasificación ordenada por puntos
// =====================================================================
export function obtenerRanking(req, res) {
  const estudiantes = db
    .prepare(
      `SELECT id, nombre, numero_lista, salon, puntos
       FROM estudiantes
       ORDER BY puntos DESC, nombre COLLATE NOCASE ASC`
    )
    .all()

  // Agregamos la posición (1, 2, 3...) a cada estudiante.
  const ranking = estudiantes.map((e, indice) => ({ ...e, posicion: indice + 1 }))
  res.json(ranking)
}

// =====================================================================
//  GET /api/student/:id  →  Perfil completo de un estudiante
//  Acepta el id ("ecorank-00024") o el uuid.
// =====================================================================
export function obtenerEstudiante(req, res) {
  const estudiante = buscarEstudiante(req.params.id)
  if (!estudiante) {
    return res.status(404).json({ error: 'Estudiante no encontrado.' })
  }

  // Historial de reciclaje (los 50 más recientes).
  //  ⚠️ Toda la información se relaciona por el UUID del estudiante.
  const historial = db
    .prepare(
      `SELECT material, puntos_obtenidos AS puntos, fecha FROM reciclajes
       WHERE uuid_estudiante = ?
       ORDER BY fecha DESC, id DESC
       LIMIT 50`
    )
    .all(estudiante.uuid)

  // Resumen por material (para el gráfico personal y los logros).
  const resumen = db
    .prepare(
      `SELECT material, COUNT(*) AS cantidad, SUM(puntos_obtenidos) AS puntos
       FROM reciclajes WHERE uuid_estudiante = ?
       GROUP BY material`
    )
    .all(estudiante.uuid)

  const total_reciclajes = resumen.reduce((suma, r) => suma + r.cantidad, 0)

  res.json({
    ...estudiante,
    posicion: calcularPosicion(estudiante),
    total_reciclajes,
    resumen,
    historial
  })
}
