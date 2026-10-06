// =====================================================================
//  DATOS DE EJEMPLO (opcional) — ideal para demostraciones
// ---------------------------------------------------------------------
//  Crea 16 estudiantes (8 por salón) con reciclajes repartidos en los
//  últimos 14 días, para que el ranking, la competencia y el dashboard
//  se vean llenos en una presentación o feria.
//
//  Uso:            npm run seed          (desde /server o desde la raíz)
//  Si ya hay datos: FORCE=1 npm run seed  (agrega de todas formas)
//
//  ⚠️ Es solo para demos. Para volver a empezar, borra el archivo
//     server/database/ecorank.db o usa "Reiniciar ranking" en el admin.
// =====================================================================

import { v4 as uuidv4 } from 'uuid'
import db from './database/db.js'
import { MATERIALES } from './config.js'

// Salones de ejemplo SOLO para los datos demo (el sistema real acepta
// cualquier salón escrito manualmente por el estudiante).
const SALONES = ['10° A', '10° B']

const yaHayDatos = db.prepare(`SELECT COUNT(*) AS c FROM estudiantes`).get().c > 0
if (yaHayDatos && !process.env.FORCE) {
  console.log('⚠️  Ya existen estudiantes. Si igual quieres agregar datos demo: FORCE=1 npm run seed')
  process.exit(0)
}

const NOMBRES = [
  'Ana María Pérez', 'Luis González', 'Carla Mendoza', 'José Rodríguez',
  'María Fernanda Díaz', 'Carlos Espinosa', 'Valeria Castillo', 'Andrés Morales',
  'Sofía Herrera', 'Miguel Ángel Torres', 'Isabella Vega', 'Daniel Quintero',
  'Camila Rojas', 'Javier Pinzón', 'Lucía Navarro', 'Ricardo Samudio'
]

const CLAVES = Object.keys(MATERIALES)
const azar = (n) => Math.floor(Math.random() * n)

// Elige un material al azar (el plástico es el más común, como en la vida real).
function materialAlAzar() {
  const r = Math.random()
  return r < 0.45 ? 'plastico' : r < 0.8 ? 'papel' : 'organico'
}

const maximo = db.prepare(`SELECT MAX(CAST(substr(id, 9) AS INTEGER)) AS m FROM estudiantes`).get().m || 0

const insertar = db.transaction(() => {
  NOMBRES.forEach((nombre, i) => {
    const id = 'ecorank-' + String(maximo + i + 1).padStart(5, '0')
    const uuid = uuidv4() // referencia principal del estudiante
    const salon = SALONES[i % SALONES.length] // alterna 10° A / 10° B
    const lista = (i % 8) + 1 + (yaHayDatos ? 50 : 0) // evita chocar con listas reales

    db.prepare(
      `INSERT INTO estudiantes (id, uuid, nombre, numero_lista, salon, qr_data, puntos)
       VALUES (?, ?, ?, ?, ?, ?, 0)`
    ).run(id, uuid, nombre, lista, salon, JSON.stringify({ id }))

    // Entre 2 y 12 reciclajes por estudiante, en los últimos 14 días.
    const eventos = 2 + azar(11)
    let total = 0
    for (let e = 0; e < eventos; e++) {
      const material = materialAlAzar()
      const puntos = MATERIALES[material].puntos
      const hace = azar(14) // días atrás
      const fecha = new Date(Date.now() - hace * 86400000 - azar(36000) * 1000)
        .toISOString().slice(0, 19).replace('T', ' ')

      db.prepare(
        `INSERT INTO reciclajes (uuid_estudiante, material, puntos_obtenidos, fecha) VALUES (?, ?, ?, ?)`
      ).run(uuid, material, puntos, fecha)
      total += puntos
    }
    db.prepare(`UPDATE estudiantes SET puntos = ? WHERE id = ?`).run(total, id)
  })
})

insertar()
console.log(`✅ Datos demo listos: ${NOMBRES.length} estudiantes en ${SALONES.join(' y ')}.`)
console.log('   Abre la web y visita el Ranking y el dashboard de Impacto Ambiental. ♻️')
