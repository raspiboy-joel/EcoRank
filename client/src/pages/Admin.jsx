// =====================================================================
//  PANEL DE ADMINISTRADOR
// ---------------------------------------------------------------------
//  Protegido por contraseña (por defecto: ecorank123).
//  Permite:
//   • Ver estadísticas generales.
//   • Ver el salón de cada estudiante, filtrar por salón, editar
//     (nombre, lista, salón, puntos) y eliminar. El QR nunca cambia.
//   • Reiniciar el ranking (puntos a 0 + historial limpio).
//   • Exportar: CSV (servidor), Excel (.xlsx) y PDF de estadísticas.
// =====================================================================

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  api,
  guardarClaveAdmin,
  obtenerClaveAdmin,
  cerrarSesionAdmin,
  headersAdmin
} from '../api/client.js'
import Modal from '../components/Modal.jsx'
import Avatar from '../components/Avatar.jsx'
import StatCard from '../components/StatCard.jsx'
import { localeActual } from '../i18n'

export default function Admin() {
  const { t } = useTranslation()
  const [autorizado, setAutorizado] = useState(false)

  return autorizado || obtenerClaveAdmin() ? (
    <Panel t={t} alSalir={() => setAutorizado(false)} />
  ) : (
    <Login t={t} alEntrar={() => setAutorizado(true)} />
  )
}

// =====================================================================
//  PANTALLA DE LOGIN
// =====================================================================
function Login({ t, alEntrar }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await api('/admin/login', { method: 'POST', body: JSON.stringify({ password }) })
      guardarClaveAdmin(password) // se guarda solo mientras la pestaña esté abierta
      alEntrar()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 py-16">
      <div className="mb-8 text-center">
        <p className="text-4xl">🔐</p>
        <h1 className="mt-3 font-display text-2xl font-bold">{t('admin.titulo')}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('admin.loginSub')}</p>
      </div>
      <form onSubmit={entrar} className="card space-y-4 p-7">
        <div>
          <label htmlFor="pass" className="label">
            {t('admin.password')}
          </label>
          <input
            id="pass"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
        </div>
        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 ring-1 ring-red-100 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
            ⚠️ {error}
          </p>
        )}
        <button type="submit" disabled={cargando} className="btn-primary w-full">
          {cargando ? t('admin.verificando') : t('admin.entrar')}
        </button>
      </form>
    </div>
  )
}

// =====================================================================
//  PANEL PRINCIPAL
// =====================================================================
function Panel({ t, alSalir }) {
  const [estudiantes, setEstudiantes] = useState(null)
  const [stats, setStats] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [filtroSalon, setFiltroSalon] = useState('todos') // filtro por salón
  const [editando, setEditando] = useState(null) // estudiante en el modal
  const [aviso, setAviso] = useState(null) // { tipo: 'ok'|'error', texto }

  const nf = (n) => Number(n || 0).toLocaleString(localeActual())

  function avisar(tipo, texto) {
    setAviso({ tipo, texto })
    setTimeout(() => setAviso(null), 4000)
  }

  // Carga (y recarga) la tabla de estudiantes y las estadísticas.
  async function cargar() {
    try {
      const [lista, estadisticas] = await Promise.all([
        api('/admin/students', { headers: headersAdmin() }),
        api('/stats')
      ])
      setEstudiantes(lista)
      setStats(estadisticas)
    } catch (err) {
      // Contraseña vencida o incorrecta → volvemos al login.
      cerrarSesionAdmin()
      alSalir()
    }
  }
  useEffect(() => {
    cargar()
  }, [])

  function salir() {
    cerrarSesionAdmin()
    alSalir()
  }

  // --- Acciones sobre estudiantes ---------------------------------------
  async function guardarEdicion(datos) {
    try {
      await api(`/admin/student/${editando.id}`, {
        method: 'PUT',
        headers: headersAdmin(),
        body: JSON.stringify(datos)
      })
      setEditando(null)
      avisar('ok', `✅ ${t('admin.guardado')}`)
      cargar()
    } catch (err) {
      avisar('error', `⚠️ ${err.message}`)
    }
  }

  async function eliminar(estudiante) {
    if (!window.confirm(t('admin.eliminarConfirm', { nombre: estudiante.nombre }))) return
    try {
      const r = await api(`/admin/student/${estudiante.id}`, {
        method: 'DELETE',
        headers: headersAdmin()
      })
      avisar('ok', `🗑️ ${r.mensaje}`)
      cargar()
    } catch (err) {
      avisar('error', `⚠️ ${err.message}`)
    }
  }

  async function reiniciar() {
    if (!window.confirm(t('admin.reiniciarConfirm'))) return
    try {
      await api('/admin/reset', { method: 'POST', headers: headersAdmin() })
      avisar('ok', `🔄 ${t('admin.reiniciado')}`)
      cargar()
    } catch (err) {
      avisar('error', `⚠️ ${err.message}`)
    }
  }

  // --- Exportaciones ------------------------------------------------------
  const hoy = () => new Date().toISOString().slice(0, 10)

  // CSV: lo genera el servidor; lo descargamos con la contraseña.
  async function exportarCSV() {
    try {
      const respuesta = await fetch('/api/admin/export', { headers: headersAdmin() })
      if (!respuesta.ok) throw new Error(t('comun.errorConexion'))
      const blob = await respuesta.blob()
      descargarBlob(blob, `ecorank-estudiantes-${hoy()}.csv`)
    } catch (err) {
      avisar('error', `⚠️ ${err.message}`)
    }
  }

  // Excel: 3 hojas → Estudiantes, Por salón y Por categoría.
  // La librería "xlsx" se carga solo al hacer clic (bundle más ligero).
  async function exportarExcel() {
    if (!estudiantes || !stats) return
    const XLSX = await import('xlsx')
    const libro = XLSX.utils.book_new()

    const hoja1 = XLSX.utils.aoa_to_sheet([
      [t('admin.id'), t('admin.nombre'), t('comun.numeroLista'), t('comun.salon'), t('comun.puntos'), t('admin.reciclajes'), t('admin.registro')],
      ...estudiantes.map((e) => [e.id, e.nombre, e.numero_lista, e.salon, e.puntos, e.total_reciclajes, e.fecha_registro])
    ])
    XLSX.utils.book_append_sheet(libro, hoja1, t('comun.estudiantes'))

    const hoja2 = XLSX.utils.aoa_to_sheet([
      [t('comoUsar.colTipo'), t('admin.pdfCantidad'), t('comun.puntos'), '%'],
      ...stats.categorias.map((c) => [t(`materiales.${c.material}.nombre`), c.cantidad, c.puntos, c.porcentaje])
    ])
    XLSX.utils.book_append_sheet(libro, hoja2, t('admin.pdfCategorias'))

    XLSX.writeFile(libro, `ecorank-${hoy()}.xlsx`)
  }

  // PDF: reporte de estadísticas con tablas.
  // jsPDF y autoTable también se cargan solo al hacer clic.
  async function exportarPDF() {
    if (!stats) return
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    const doc = new jsPDF()
    const g = stats.general

    doc.setFont('helvetica', 'bold').setFontSize(18)
    doc.text(t('admin.pdfTitulo'), 14, 18)
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(120)
    doc.text(`${t('admin.pdfGeneradoEl')}: ${new Date().toLocaleString(localeActual())}`, 14, 25)

    doc.setFontSize(12).setTextColor(0).setFont('helvetica', 'bold')
    doc.text(t('admin.pdfGeneral'), 14, 36)
    doc.setFont('helvetica', 'normal').setFontSize(10)
    const lineas = [
      `♻ ${t('impacto.totalResiduos')}: ${nf(g.total_residuos)}`,
      `${t('impacto.estudiantesReg')}: ${nf(g.total_estudiantes)}`,
      `${t('impacto.totalPuntos')}: ${nf(g.total_puntos)}`,
      `${t('impacto.promedioEst')}: ${nf(g.promedio_puntos)}`,
      `${t('impacto.lider')}: ${g.lider ? `${g.lider.nombre} (${g.lider.salon}, ${nf(g.lider.puntos)} ${t('comun.pts')})` : '—'}`
    ]
    lineas.forEach((l, i) => doc.text(l, 14, 43 + i * 6))

    // Tabla por categoría
    autoTable(doc, {
      startY: 84,
      head: [[t('comoUsar.colTipo'), t('admin.pdfCantidad'), t('comun.puntos'), '%']],
      body: stats.categorias.map((c) => [
        t(`materiales.${c.material}.nombre`),
        c.cantidad,
        c.puntos,
        `${c.porcentaje}%`
      ]),
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 }
    })

    // Tabla de estudiantes (incluye el salón de cada uno)
    const yEstudiantes = doc.lastAutoTable.finalY + 12
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(0)
    doc.text(t('admin.pdfEstudiantes'), 14, yEstudiantes)
    autoTable(doc, {
      startY: yEstudiantes + 4,
      head: [[t('admin.nombre'), t('comun.lista'), t('comun.salon'), t('comun.puntos'), t('admin.reciclajes')]],
      body: (estudiantes || []).map((e) => [e.nombre, e.numero_lista, e.salon, e.puntos, e.total_reciclajes]),
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 }
    })

    doc.save(`ecorank-estadisticas-${hoy()}.pdf`)
  }

  function descargarBlob(blob, nombre) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombre
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Render ---------------------------------------------------------------
  if (!estudiantes || !stats) {
    return <p className="p-16 text-center text-gray-400">{t('comun.cargando')}</p>
  }

  const q = filtro.trim().toLowerCase()
  const salonesExistentes = [...new Set(estudiantes.map((e) => e.salon))].sort()
  const visibles = estudiantes.filter(
    (e) =>
      (filtroSalon === 'todos' || e.salon === filtroSalon) &&
      (!q ||
        e.nombre.toLowerCase().includes(q) ||
        e.salon.toLowerCase().includes(q) ||
        String(e.numero_lista).includes(q) ||
        e.id.includes(q))
  )

  return (
    <div className="mx-auto max-w-6xl animate-fade-up px-6 py-12">
      {/* --- Encabezado + acciones globales -------------------------------- */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          🛠️ {t('admin.titulo')}
        </h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportarCSV} className="btn-secondary px-4 py-2 text-sm">
            📄 {t('admin.exportCSV')}
          </button>
          <button onClick={exportarExcel} className="btn-secondary px-4 py-2 text-sm">
            📗 {t('admin.exportExcel')}
          </button>
          <button onClick={exportarPDF} className="btn-secondary px-4 py-2 text-sm">
            📕 {t('admin.exportPDF')}
          </button>
          <button onClick={reiniciar} className="btn-danger">
            🔄 {t('admin.reiniciar')}
          </button>
          <button onClick={salir} className="btn-ghost">
            {t('admin.salir')} →
          </button>
        </div>
      </div>

      {/* --- Aviso flotante -------------------------------------------------- */}
      {aviso && (
        <p
          className={`mb-6 animate-scale-in rounded-2xl px-5 py-3.5 text-sm font-semibold ${
            aviso.tipo === 'ok'
              ? 'bg-eco-light text-eco-deep ring-1 ring-eco/30 dark:bg-eco/10 dark:text-eco'
              : 'bg-red-50 text-red-600 ring-1 ring-red-100 dark:bg-red-500/10 dark:text-red-400'
          }`}
        >
          {aviso.texto}
        </p>
      )}

      {/* --- Estadísticas generales ------------------------------------------ */}
      <h2 className="mb-4 font-display text-lg font-bold">📊 {t('admin.statsTitulo')}</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icono="👥" valor={nf(stats.general.total_estudiantes)} etiqueta={t('impacto.estudiantesReg')} />
        <StatCard icono="⭐" valor={nf(stats.general.total_puntos)} etiqueta={t('impacto.totalPuntos')} delay={60} />
        <StatCard icono="♻️" valor={nf(stats.general.total_residuos)} etiqueta={t('impacto.totalResiduos')} delay={120} />
        <StatCard icono="🌱" valor={nf(stats.general.promedio_puntos)} etiqueta={t('impacto.promedioEst')} delay={180} />
      </div>

      {/* --- Tabla de estudiantes ----------------------------------------------- */}
      <div className="mb-4 mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">
          👥 {t('comun.estudiantes')}{' '}
          <span className="text-sm font-semibold text-gray-400">({estudiantes.length})</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por salón (los salones salen de la propia base de datos) */}
          <select
            className="input w-full cursor-pointer py-2 text-sm sm:w-48"
            value={filtroSalon}
            onChange={(e) => setFiltroSalon(e.target.value)}
            aria-label={t('comun.salon')}
          >
            <option value="todos">🏫 {t('admin.filtroSalonTodos')}</option>
            {salonesExistentes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="search"
            className="input w-full py-2 text-sm sm:w-72"
            placeholder={`🔍 ${t('admin.buscarPh')}`}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {estudiantes.length === 0 ? (
        <p className="card p-10 text-center text-gray-400">{t('admin.vacio')}</p>
      ) : visibles.length === 0 ? (
        <p className="card p-10 text-center text-gray-400">{t('admin.sinResultados')}</p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/40">
                <th className="px-5 py-3.5">{t('admin.nombre')}</th>
                <th className="px-5 py-3.5">{t('admin.id')}</th>
                <th className="px-5 py-3.5">{t('comun.lista')}</th>
                <th className="px-5 py-3.5">{t('comun.salon')}</th>
                <th className="px-5 py-3.5">⭐ {t('comun.puntos')}</th>
                <th className="px-5 py-3.5">♻️ {t('admin.reciclajes')}</th>
                <th className="px-5 py-3.5 text-right">{t('admin.acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60 dark:border-gray-800/60 dark:hover:bg-gray-800/30"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar nombre={e.nombre} tamano="h-8 w-8 text-xs" />
                      <span className="font-semibold">{e.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{e.id}</td>
                  <td className="px-5 py-3">{e.numero_lista}</td>
                  <td className="px-5 py-3">
                    <span className="chip">{e.salon}</span>
                  </td>
                  <td className="px-5 py-3 font-bold text-eco-dark dark:text-eco">{nf(e.puntos)}</td>
                  <td className="px-5 py-3">{nf(e.total_reciclajes)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setEditando(e)} className="btn-ghost px-3 py-1.5 text-xs">
                      ✏️ {t('admin.editar')}
                    </button>
                    <button onClick={() => eliminar(e)} className="btn-danger px-3 py-1.5 text-xs">
                      🗑️ {t('admin.eliminar')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Modal de edición ---------------------------------------------------- */}
      {editando && (
        <ModalEditar
          t={t}
          estudiante={editando}
          alCerrar={() => setEditando(null)}
          alGuardar={guardarEdicion}
        />
      )}
    </div>
  )
}

// =====================================================================
//  MODAL: editar estudiante (nombre, n.º de lista, salón y puntos)
// =====================================================================
function ModalEditar({ t, estudiante, alCerrar, alGuardar }) {
  const [nombre, setNombre] = useState(estudiante.nombre)
  const [numeroLista, setNumeroLista] = useState(estudiante.numero_lista)
  const [salon, setSalon] = useState(estudiante.salon)
  const [puntos, setPuntos] = useState(estudiante.puntos)

  function enviar(e) {
    e.preventDefault()
    alGuardar({ nombre, numero_lista: numeroLista, salon, puntos })
  }

  return (
    <Modal titulo={`✏️ ${t('admin.editarTitulo')}`} alCerrar={alCerrar}>
      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label className="label">{t('admin.nombre')}</label>
          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('comun.numeroLista')}</label>
            <input
              type="number"
              className="input"
              value={numeroLista}
              onChange={(e) => setNumeroLista(e.target.value)}
              required
              min={1}
              max={999}
            />
          </div>
          <div>
            <label className="label">⭐ {t('comun.puntos')}</label>
            <input
              type="number"
              className="input"
              value={puntos}
              onChange={(e) => setPuntos(e.target.value)}
              required
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="label">🏫 {t('comun.salon')}</label>
          <input
            className="input"
            value={salon}
            onChange={(e) => setSalon(e.target.value)}
            required
            maxLength={30}
            placeholder={t('registro.salonPh')}
          />
        </div>
        <p className="rounded-2xl bg-gray-50 px-4 py-2.5 text-xs text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
          🔒 ID / QR: <span className="font-mono font-semibold">{estudiante.id}</span>
        </p>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={alCerrar} className="btn-secondary flex-1 py-2.5 text-sm">
            {t('comun.cancelar')}
          </button>
          <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">
            {t('comun.guardar')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
