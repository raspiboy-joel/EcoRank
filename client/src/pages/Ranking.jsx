// =====================================================================
//  PÁGINA DE RANKING (individual)
// ---------------------------------------------------------------------
//  Podio 🥇🥈🥉, buscador (nombre / n.º de lista), filtro por salón,
//  4 ordenamientos y un destello verde + flecha cuando alguien cambia
//  de posición. Se actualiza sola cada 5 segundos.
// =====================================================================

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client.js'
import Avatar from '../components/Avatar.jsx'
import { localeActual } from '../i18n'

const MEDALLAS = ['🥇', '🥈', '🥉']

export default function Ranking() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* --- Encabezado --------------------------------------------------- */}
      <div className="mb-8 text-center">
        <p className="eyebrow">🏆 {t('ranking.eyebrow')}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight">{t('ranking.titulo')}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('ranking.sub')}</p>
      </div>

      <ListaRanking t={t} />

      {/* Indicador "en vivo" */}
      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-eco opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-eco" />
        </span>
        {t('comun.actualizaAuto')}
      </p>
    </div>
  )
}

// =====================================================================
//  LISTA DEL RANKING
// =====================================================================
function ListaRanking({ t }) {
  const [ranking, setRanking] = useState(null)
  const [error, setError] = useState(false)

  // Filtros y ordenamiento:
  const [busqueda, setBusqueda] = useState('')
  const [salon, setSalon] = useState('todos')
  const [orden, setOrden] = useState('puntosDesc')

  // Para las animaciones: recordamos las posiciones anteriores y marcamos
  // quién subió ⬆️ o bajó ⬇️ desde la última actualización.
  const posicionesPrevias = useRef({})
  const [cambios, setCambios] = useState({}) // { id: 'sube' | 'baja' }

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const datos = await api('/ranking')
        if (!activo) return

        // Comparamos con las posiciones anteriores para detectar cambios.
        const previas = posicionesPrevias.current
        const nuevosCambios = {}
        for (const e of datos) {
          const antes = previas[e.id]
          if (antes !== undefined && antes !== e.posicion) {
            nuevosCambios[e.id] = e.posicion < antes ? 'sube' : 'baja'
          }
        }
        posicionesPrevias.current = Object.fromEntries(datos.map((e) => [e.id, e.posicion]))

        setRanking(datos)
        setError(false)
        if (Object.keys(nuevosCambios).length) {
          setCambios(nuevosCambios)
          setTimeout(() => activo && setCambios({}), 4000) // el destello dura 4 s
        }
      } catch {
        if (activo) setError(true)
      }
    }

    cargar()
    const intervalo = setInterval(cargar, 5000)
    return () => {
      activo = false
      clearInterval(intervalo)
    }
  }, [])

  if (error && !ranking) {
    return <p className="card p-8 text-center text-red-500">⚠️ {t('comun.errorConexion')}</p>
  }
  if (!ranking) {
    return <p className="p-8 text-center text-gray-400">{t('comun.cargando')}</p>
  }
  if (ranking.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-4xl">🌱</p>
        <p className="mt-3 font-semibold">{t('ranking.vacio')}</p>
        <Link to="/registro" className="btn-primary mt-5">
          {t('comun.generarQR')}
        </Link>
      </div>
    )
  }

  // --- Aplicar filtros y ordenamiento -----------------------------------
  const salonesDisponibles = [...new Set(ranking.map((e) => e.salon))].sort()
  const q = busqueda.trim().toLowerCase()

  let lista = ranking.filter((e) => {
    const coincideSalon = salon === 'todos' || e.salon === salon
    const coincideTexto =
      !q || e.nombre.toLowerCase().includes(q) || String(e.numero_lista).includes(q)
    return coincideSalon && coincideTexto
  })

  const ordenadores = {
    puntosDesc: (a, b) => a.posicion - b.posicion,
    puntosAsc: (a, b) => b.posicion - a.posicion,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre),
    lista: (a, b) => a.numero_lista - b.numero_lista
  }
  lista = [...lista].sort(ordenadores[orden])

  // El podio solo se muestra en la vista "normal" (sin filtros ni búsqueda).
  const vistaNormal = orden === 'puntosDesc' && salon === 'todos' && !q
  const podio = vistaNormal ? lista.slice(0, 3) : []
  const resto = vistaNormal ? lista.slice(3) : lista

  return (
    <>
      {/* --- Barra de búsqueda y filtros ---------------------------------- */}
      <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="search"
          className="input py-2.5 text-sm"
          placeholder={`🔍 ${t('ranking.buscarPh')}`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className="input cursor-pointer py-2.5 text-sm sm:w-40"
          value={salon}
          onChange={(e) => setSalon(e.target.value)}
          aria-label={t('comun.salon')}
        >
          <option value="todos">🏫 {t('ranking.filtroSalonTodos')}</option>
          {salonesDisponibles.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="input cursor-pointer py-2.5 text-sm sm:w-44"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          aria-label={t('ranking.ordenar')}
        >
          {['puntosDesc', 'puntosAsc', 'nombre', 'lista'].map((o) => (
            <option key={o} value={o}>
              {t(`ranking.orden.${o}`)}
            </option>
          ))}
        </select>
      </div>

      {lista.length === 0 && (
        <p className="card p-8 text-center text-gray-400">{t('ranking.sinResultados')}</p>
      )}

      {/* --- Podio 🥇🥈🥉 --------------------------------------------------- */}
      {podio.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {podio.map((e, i) => (
            <Link
              key={e.id}
              to={`/perfil/${e.id}`}
              className={`card animate-scale-in group p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                i === 0 ? 'ring-2 ring-amber-300/70 sm:order-2 sm:-translate-y-2' : ''
              } ${i === 1 ? 'sm:order-1' : ''} ${i === 2 ? 'sm:order-3' : ''}`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="text-4xl transition-transform duration-300 group-hover:scale-125 inline-block">
                {MEDALLAS[i]}
              </span>
              <p className="mt-2 truncate font-display font-bold">{e.nombre}</p>
              <p className="text-xs text-gray-400">
                {e.salon} · {t('comun.lista')} #{e.numero_lista}
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-eco-dark dark:text-eco">
                {e.puntos.toLocaleString(localeActual())}{' '}
                <span className="text-sm text-gray-400">{t('comun.pts')}</span>
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* --- Lista ----------------------------------------------------------- */}
      {resto.length > 0 && (
        <div className="card divide-y divide-gray-50 p-0 dark:divide-gray-800/70">
          {resto.map((e) => {
            const maximo = lista[0]?.puntos || 1
            const cambio = cambios[e.id]
            return (
              <Link
                key={e.id}
                to={`/perfil/${e.id}`}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/40 ${
                  cambio ? 'animate-flash' : ''
                }`}
              >
                {/* Posición global (con medalla si es top 3) */}
                <span className="w-9 shrink-0 text-center font-display text-lg font-bold text-gray-400">
                  {e.posicion <= 3 ? MEDALLAS[e.posicion - 1] : e.posicion}
                </span>

                <Avatar nombre={e.nombre} tamano="h-10 w-10 text-sm" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{e.nombre}</p>
                    {/* Flecha cuando cambia de posición */}
                    {cambio === 'sube' && (
                      <span className="text-xs font-bold text-eco" title={t('ranking.subio')}>
                        ▲
                      </span>
                    )}
                    {cambio === 'baja' && (
                      <span className="text-xs font-bold text-red-400" title={t('ranking.bajo')}>
                        ▼
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="chip">{e.salon}</span>
                    <span className="text-xs text-gray-400">#{e.numero_lista}</span>
                  </div>
                  {/* Barrita de progreso relativa al líder de la vista */}
                  <div className="mt-2 h-1.5 max-w-[220px] overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-eco transition-all duration-700"
                      style={{ width: `${Math.max(4, (e.puntos / maximo) * 100)}%` }}
                    />
                  </div>
                </div>

                <p className="shrink-0 font-display text-lg font-bold text-eco-dark dark:text-eco">
                  {e.puntos.toLocaleString(localeActual())}
                  <span className="ml-1 text-xs font-semibold text-gray-400">{t('comun.pts')}</span>
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
