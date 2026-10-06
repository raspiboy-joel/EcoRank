// =====================================================================
//  BASE DE DATOS (SQLite)
// ---------------------------------------------------------------------
//  Este archivo crea y configura la base de datos de EcoRank.
//  Usamos SQLite porque guarda todo en UN solo archivo (ecorank.db),
//  perfecto para un prototipo. Más adelante se puede migrar a MySQL
//  o PostgreSQL sin cambiar la lógica del proyecto.
// =====================================================================

import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

// En módulos ES no existe __dirname, así que lo calculamos:
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Abrimos (o creamos automáticamente) el archivo de base de datos.
const db = new Database(path.join(__dirname, 'ecorank.db'))

// Ajustes recomendados de SQLite:
db.pragma('journal_mode = WAL')   // mejor rendimiento en lecturas/escrituras
db.pragma('foreign_keys = ON')    // respeta las relaciones entre tablas

// ---------------------------------------------------------------------
//  TABLA: estudiantes
// ---------------------------------------------------------------------
//  id            → identificador legible, ej: "ecorank-00024" (va en el QR)
//  uuid          → identificador universal único (anti-falsificación)
//  nombre        → nombre completo del estudiante
//  numero_lista  → número de lista en el salón
//  qr_data       → texto EXACTO que contiene el código QR
//  puntos        → puntos acumulados (empieza en 0)
//  salon         → preparado para soportar varios salones en el futuro
//  fecha_registro→ cuándo se registró (hora UTC)
// ---------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS estudiantes (
    id             TEXT PRIMARY KEY,
    uuid           TEXT UNIQUE NOT NULL,
    nombre         TEXT NOT NULL,
    numero_lista   INTEGER NOT NULL,
    qr_data        TEXT NOT NULL,
    puntos         INTEGER NOT NULL DEFAULT 0,
    salon          TEXT NOT NULL DEFAULT 'Principal',
    fecha_registro TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// ---------------------------------------------------------------------
//  TABLA: reciclajes  (historial de actividad)
// ---------------------------------------------------------------------
//  Cada vez que un estudiante es identificado por su QR (por la
//  Raspberry Pi o por el admin), se guarda una fila aquí:
//
//   id               → número automático del registro
//   uuid_estudiante  → UUID del estudiante (referencia PRINCIPAL, es
//                      lo que usan los dispositivos externos)
//   material         → plastico | papel | organico
//   puntos_obtenidos → puntos que sumó ese reciclaje
//   fecha            → cuándo ocurrió (hora UTC)
//
//  Este historial alimenta: la cantidad real de reciclajes, los
//  gráficos personales, las estadísticas y el registro de actividad.
//  ON DELETE CASCADE = si se borra un estudiante, se borra su historial.
// ---------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS reciclajes (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid_estudiante  TEXT NOT NULL REFERENCES estudiantes(uuid) ON DELETE CASCADE,
    material         TEXT NOT NULL,
    puntos_obtenidos INTEGER NOT NULL,
    fecha            TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// ---------------------------------------------------------------------
//  MIGRACIÓN AUTOMÁTICA (para bases de datos de versiones anteriores)
//  Antes el historial usaba "estudiante_id" y "puntos". Si detectamos
//  ese formato viejo, lo convertimos al nuevo sin perder ningún dato.
// ---------------------------------------------------------------------
const columnas = db.prepare(`PRAGMA table_info(reciclajes)`).all().map((c) => c.name)
if (columnas.includes('estudiante_id')) {
  db.exec(`
    CREATE TABLE reciclajes_nueva (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid_estudiante  TEXT NOT NULL REFERENCES estudiantes(uuid) ON DELETE CASCADE,
      material         TEXT NOT NULL,
      puntos_obtenidos INTEGER NOT NULL,
      fecha            TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT INTO reciclajes_nueva (id, uuid_estudiante, material, puntos_obtenidos, fecha)
      SELECT r.id, e.uuid, r.material, r.puntos, r.fecha
      FROM reciclajes r JOIN estudiantes e ON e.id = r.estudiante_id;
    DROP TABLE reciclajes;
    ALTER TABLE reciclajes_nueva RENAME TO reciclajes;
  `)
  console.log('🔄 Historial migrado al nuevo formato (uuid_estudiante).')
}

// Índices para que el ranking y el historial sean rápidos.
db.exec(`CREATE INDEX IF NOT EXISTS idx_estudiantes_puntos ON estudiantes (puntos DESC);`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_reciclajes_uuid ON reciclajes (uuid_estudiante);`)

export default db
