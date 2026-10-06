// =====================================================================
//  CONTROLADOR DE RECICLAJE — API para dispositivos externos
// ---------------------------------------------------------------------
//  Este endpoint está preparado para el BASURERO INTELIGENTE (una
//  Raspberry Pi con cámara web y sensores). El flujo esperado es:
//
//   1. La Raspberry Pi lee el QR del estudiante con la cámara.
//   2. Obtiene su identificador único.
//   3. Envía el UUID a esta API:
//
//        POST /api/recycle
//        { "uuid": "xxxxxxxx-xxxx-xxxx-xxxx", "material": "plastico" }
//
//   4. La API busca al estudiante correspondiente.
//   5. Registra un nuevo reciclaje en el historial (tabla "reciclajes").
//   6. Suma los puntos automáticamente y responde con la confirmación,
//      los puntos agregados y las estadísticas actualizadas.
//
//  El UUID es la referencia PRINCIPAL (no el nombre ni el número de
//  lista). Por compatibilidad también se acepta "studentId" con el id
//  legible ("ecorank-00024") o el contenido completo del QR.
//
//  Los puntos de cada categoría viven en config.js:
//   🟢 plastico = 10   🟤 papel = 8   🟠 organico = 5
// =====================================================================

import db from '../database/db.js'
import { buscarEstudiante, calcularPosicion } from './students.controller.js'
import { MATERIALES, normalizarMaterial } from '../config.js'

// =====================================================================
//  POST /api/recycle  →  Registrar un reciclaje y sumar puntos
// =====================================================================
export function registrarReciclaje(req, res) {
  // El dispositivo puede enviar "uuid" (recomendado) o "studentId".
  let identificador = req.body.uuid || req.body.studentId
  const { material, points } = req.body

  if (!identificador) {
    return res.status(400).json({ error: 'Falta el campo "uuid" (o "studentId").' })
  }

  // Detalle útil: si el lector envía el contenido COMPLETO del QR
  // (un JSON como {"id":"ecorank-00024"}), lo interpretamos solos.
  if (typeof identificador === 'string' && identificador.trim().startsWith('{')) {
    try {
      const qr = JSON.parse(identificador)
      identificador = qr.uuid || qr.id
    } catch {
      // Si no se puede interpretar, seguimos con el texto original.
    }
  }

  // 1) Buscamos al estudiante (por uuid o por id).
  const estudiante = buscarEstudiante(identificador)
  if (!estudiante) {
    return res.status(404).json({ error: `Estudiante "${identificador}" no encontrado.` })
  }

  // 2) Validamos el material. SOLO se aceptan las 3 categorías oficiales
  //    (con sinónimos en español/inglés). Cualquier otra cosa se rechaza
  //    para mantener limpias las estadísticas.
  const materialOficial = normalizarMaterial(material)
  if (!materialOficial) {
    return res.status(400).json({
      error: `Material "${material}" no válido. Usa: ${Object.keys(MATERIALES).join(', ')}.`
    })
  }

  // 3) Calculamos los puntos. Normalmente los define la categoría,
  //    pero se puede enviar "points" para casos especiales (con límites
  //    de seguridad para evitar errores o trampas).
  let puntos = parseInt(points, 10)
  if (!Number.isInteger(puntos)) {
    puntos = MATERIALES[materialOficial].puntos
  }
  puntos = Math.max(1, Math.min(puntos, 100))

  // 4) Guardamos el evento en el historial (referenciado por el UUID)
  //    Y sumamos los puntos. Usamos una transacción: o se hacen las
  //    DOS cosas, o ninguna.
  const transaccion = db.transaction(() => {
    db.prepare(
      `INSERT INTO reciclajes (uuid_estudiante, material, puntos_obtenidos) VALUES (?, ?, ?)`
    ).run(estudiante.uuid, materialOficial, puntos)

    db.prepare(`UPDATE estudiantes SET puntos = puntos + ? WHERE uuid = ?`).run(
      puntos,
      estudiante.uuid
    )
  })
  transaccion()

  // 5) Respondemos con la confirmación y las estadísticas actualizadas.
  const actualizado = db.prepare(`SELECT * FROM estudiantes WHERE uuid = ?`).get(estudiante.uuid)
  const totalReciclajes = db
    .prepare(`SELECT COUNT(*) AS c FROM reciclajes WHERE uuid_estudiante = ?`)
    .get(estudiante.uuid).c

  res.json({
    ok: true,
    mensaje: `♻️ Reciclaje registrado: +${puntos} puntos para ${actualizado.nombre} (${materialOficial}).`,
    puntos_obtenidos: puntos,
    estudiante: {
      uuid: actualizado.uuid,
      id: actualizado.id,
      nombre: actualizado.nombre,
      salon: actualizado.salon,
      puntos: actualizado.puntos,
      total_reciclajes: totalReciclajes,
      posicion: calcularPosicion(actualizado)
    }
  })
}
