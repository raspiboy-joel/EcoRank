// =====================================================================
//  PÁGINA DE REGISTRO — "Generar mi QR"
// ---------------------------------------------------------------------
//  El estudiante escribe su nombre completo, su número de lista y
//  su SALÓN (manualmente, como texto — ej: "10° A").
//  Al enviar:
//    • Si es nuevo → el servidor crea su QR permanente.
//    • Si ya existía (mismo nombre + lista) → se muestra SU MISMO QR.
// =====================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client.js'
import QRCard from '../components/QRCard.jsx'

export default function Registro() {
  const { t } = useTranslation()

  // Estados del formulario:
  const [nombre, setNombre] = useState('')
  const [numeroLista, setNumeroLista] = useState('')
  const [salon, setSalon] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Resultado del registro (cuando ya tenemos el QR):
  const [resultado, setResultado] = useState(null) // { estudiante, existente }

  // --- Enviar el formulario al servidor --------------------------------
  async function generarQR(evento) {
    evento.preventDefault() // evita que la página se recargue
    setError('')
    setCargando(true)

    try {
      const datos = await api('/students', {
        method: 'POST',
        body: JSON.stringify({ nombre, numero_lista: numeroLista, salon })
      })

      setResultado(datos)

      // Recordamos al estudiante en ESTE navegador para que el enlace
      // "Mi QR" del menú lo lleve directo a su perfil.
      localStorage.setItem('ecorank_mi_id', datos.estudiante.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  // =====================================================================
  //  VISTA 2: ya tenemos el QR → mostramos el carné
  // =====================================================================
  if (resultado) {
    const { estudiante, existente } = resultado
    return (
      <div className="mx-auto max-w-lg animate-fade-up px-6 py-12">
        {/* Mensaje distinto si es nuevo o si ya existía */}
        <div
          className={`mb-6 rounded-2xl px-5 py-4 text-sm font-semibold ${
            existente
              ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20'
              : 'bg-eco-light text-eco-deep ring-1 ring-eco/30 dark:bg-eco/10 dark:text-eco'
          }`}
        >
          {existente ? t('registro.exitoExistente') : t('registro.exitoNuevo')}
        </div>

        <QRCard estudiante={estudiante} />

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={`/perfil/${estudiante.id}`} className="btn-primary">
            {t('registro.verPerfil')}
          </Link>
          <Link to="/ranking" className="btn-secondary">
            {t('comun.verRanking')}
          </Link>
        </div>
      </div>
    )
  }

  // =====================================================================
  //  VISTA 1: formulario de registro
  // =====================================================================
  return (
    <div className="mx-auto max-w-lg animate-fade-up px-6 py-12">
      <div className="mb-8 text-center">
        <p className="eyebrow">🪪 {t('registro.eyebrow')}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t('registro.titulo')}
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400">{t('registro.sub')}</p>
      </div>

      <form onSubmit={generarQR} className="card space-y-5 p-8">
        {/* Nombre completo */}
        <div>
          <label htmlFor="nombre" className="label">
            {t('registro.nombre')}
          </label>
          <input
            id="nombre"
            type="text"
            className="input"
            placeholder={t('registro.nombrePh')}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            minLength={3}
            autoComplete="name"
          />
        </div>

        {/* Número de lista */}
        <div>
          <label htmlFor="lista" className="label">
            {t('registro.listaLbl')}
          </label>
          <input
            id="lista"
            type="number"
            className="input"
            placeholder={t('registro.listaPh')}
            value={numeroLista}
            onChange={(e) => setNumeroLista(e.target.value)}
            required
            min={1}
            max={999}
          />
        </div>

        {/* Salón: el estudiante lo escribe MANUALMENTE (texto libre).
            Se guarda para dejar el sistema listo para más salones. */}
        <div>
          <label htmlFor="salon" className="label">
            {t('registro.salonLbl')}
          </label>
          <input
            id="salon"
            type="text"
            className="input"
            placeholder={t('registro.salonPh')}
            value={salon}
            onChange={(e) => setSalon(e.target.value)}
            required
            maxLength={30}
          />
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
            🏫 {t('registro.salonAyuda')}
          </p>
        </div>

        {/* Mensaje de error (si el servidor rechaza algo) */}
        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 ring-1 ring-red-100 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
            ⚠️ {error}
          </p>
        )}

        <button type="submit" disabled={cargando} className="btn-primary w-full">
          {cargando ? t('registro.generando') : t('registro.boton')}
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          {t('registro.notaPie')}
        </p>
      </form>
    </div>
  )
}
