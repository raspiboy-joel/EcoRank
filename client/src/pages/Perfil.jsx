// =====================================================================
//  PÁGINA DE PERFIL DEL ESTUDIANTE
// ---------------------------------------------------------------------
//  Muestra:
//   • Avatar generado con sus iniciales + nombre, salón y n.º de lista.
//   • Sus números: puntos, posición y residuos reciclados.
//   • Su carné con el QR permanente (descargar / imprimir).
//   • Gráfico personal de reciclaje por categoría (dona).
//   • Logros: cuáles ya desbloqueó y cuáles le faltan.
//   • Historial de reciclaje.
//  Se actualiza sola cada 8 segundos (por si recicla mientras la ve).
// =====================================================================

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Doughnut } from 'react-chartjs-2'
import { api } from '../api/client.js'
import { useTema } from '../context/ThemeContext.jsx'
import { opcionesDona } from '../utils/chartSetup.js'
import { infoMaterial } from '../utils/constants.js'
import { LOGROS } from '../utils/logros.js'
import { localeActual } from '../i18n'
import QRCard from '../components/QRCard.jsx'
import Avatar from '../components/Avatar.jsx'
import InsigniaCard from '../components/InsigniaCard.jsx'

export default function Perfil() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { oscuro } = useTema()

  const [estudiante, setEstudiante] = useState(null)
  const [noExiste, setNoExiste] = useState(false)

  useEffect(() => {
    let activo = true
    const cargar = () =>
      api(`/student/${id}`)
        .then((d) => activo && setEstudiante(d))
        .catch(() => activo && setNoExiste(true))
    cargar()
    const intervalo = setInterval(cargar, 8000)
    return () => {
      activo = false
      clearInterval(intervalo)
    }
  }, [id])

  if (noExiste) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-5xl">🤔</p>
        <p className="mt-4 font-display text-2xl font-bold">{t('perfil.noEncontrado')}</p>
        <Link to="/" className="btn-primary mt-6">
          {t('perfil.volver')}
        </Link>
      </div>
    )
  }
  if (!estudiante) {
    return <p className="p-16 text-center text-gray-400">{t('comun.cargando')}</p>
  }

  const nf = (n) => Number(n || 0).toLocaleString(localeActual())
  const resumen = estudiante.resumen || []

  // Datos del gráfico personal (dona por categoría).
  const datosDona = {
    labels: resumen.map((r) => t(`materiales.${r.material}.nombre`, r.material)),
    datasets: [
      {
        data: resumen.map((r) => r.cantidad),
        backgroundColor: resumen.map((r) => infoMaterial(r.material)?.color || '#9CA3AF'),
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-up px-6 py-12">
      {/* --- Encabezado: avatar + identidad + números ----------------------- */}
      <div className="card mb-8 p-7">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <Avatar nombre={estudiante.nombre} tamano="h-20 w-20 text-2xl" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-3xl font-bold tracking-tight">
              {estudiante.nombre}
            </h1>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="chip">🏫 {estudiante.salon}</span>
              <span className="chip">
                {t('comun.numeroLista')} {estudiante.numero_lista}
              </span>
              <span className="chip font-mono">{estudiante.id}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-eco-light p-4 text-center dark:bg-eco/10">
            <p className="font-display text-3xl font-bold text-eco-deep dark:text-eco">
              {nf(estudiante.puntos)}
            </p>
            <p className="text-xs font-semibold text-eco-deep/70 dark:text-eco/70">
              ⭐ {t('comun.puntos')}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 text-center dark:bg-gray-800/60">
            <p className="font-display text-3xl font-bold">#{estudiante.posicion}</p>
            <p className="text-xs font-semibold text-gray-400">🏆 {t('comun.posicion')}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 text-center dark:bg-gray-800/60">
            <p className="font-display text-3xl font-bold">{nf(estudiante.total_reciclajes)}</p>
            <p className="text-xs font-semibold text-gray-400">♻️ {t('perfil.residuosReciclados')}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* --- Columna izquierda: QR + gráfico personal ---------------------- */}
        <div className="space-y-8">
          <QRCard estudiante={estudiante} />

          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-bold">📊 {t('perfil.miGrafico')}</h2>
            {estudiante.total_reciclajes > 0 ? (
              <div className="h-56">
                <Doughnut
                  key={`${oscuro}-${i18n.language}`}
                  data={datosDona}
                  options={opcionesDona(oscuro)}
                />
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">{t('perfil.sinGrafico')}</p>
            )}
          </div>
        </div>

        {/* --- Columna derecha: logros + historial ---------------------------- */}
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 font-display text-lg font-bold">🏅 {t('logros.titulo')}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {LOGROS.map((logro, i) => (
                <InsigniaCard
                  key={logro.id}
                  logro={logro}
                  desbloqueado={logro.logrado(estudiante)}
                  delay={i * 70}
                />
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-bold">🗒️ {t('perfil.historial')}</h2>
            {estudiante.historial.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                {t('perfil.historialVacio')}
              </p>
            ) : (
              <ul className="max-h-96 divide-y divide-gray-50 overflow-y-auto dark:divide-gray-800/70">
                {estudiante.historial.map((h, i) => {
                  const m = infoMaterial(h.material)
                  return (
                    <li key={i} className="flex items-center gap-3 py-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg ${m?.suave || 'bg-gray-100 dark:bg-gray-800'}`}
                      >
                        {m?.icono || '♻️'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {t(`materiales.${h.material}.nombre`, h.material)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(h.fecha.replace(' ', 'T') + 'Z').toLocaleString(
                            localeActual(),
                            { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
                          )}
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-sm font-bold text-eco-dark dark:text-eco">
                        +{h.puntos} {t('comun.pts')}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
