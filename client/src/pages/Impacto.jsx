// =====================================================================
//  PÁGINA 🌍 IMPACTO AMBIENTAL (dashboard)
// ---------------------------------------------------------------------
//  Todo se calcula EN VIVO desde /api/stats (que a su vez sale del
//  historial de reciclajes, relacionado por el UUID del estudiante):
//   1. Tarjetas generales (residuos, estudiantes, puntos, promedio
//      y estudiante líder).
//   2. Tarjetas por categoría con % del total y barra de progreso.
//   3. Gráficos (Chart.js): dona de distribución, barras de puntos por
//      categoría y línea de evolución de los últimos 14 días.
//  Los colores de los gráficos se adaptan al modo claro/oscuro.
//  (El salón de cada estudiante se guarda en la base de datos, pero
//  esta versión no compara salones: se usa en un solo salón.)
// =====================================================================

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { api } from '../api/client.js'
import { useTema } from '../context/ThemeContext.jsx'
import { opcionesEjes, opcionesDona } from '../utils/chartSetup.js'
import { MATERIALES, infoMaterial } from '../utils/constants.js'
import StatCard from '../components/StatCard.jsx'
import { localeActual } from '../i18n'

export default function Impacto() {
  const { t, i18n } = useTranslation()
  const { oscuro } = useTema()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let activo = true
    const cargar = () =>
      api('/stats')
        .then((d) => activo && (setStats(d), setError(false)))
        .catch(() => activo && setError(true))
    cargar()
    const intervalo = setInterval(cargar, 10000)
    return () => {
      activo = false
      clearInterval(intervalo)
    }
  }, [])

  if (error && !stats) {
    return (
      <p className="mx-auto max-w-xl px-6 py-16 text-center text-red-500">
        ⚠️ {t('comun.errorConexion')}
      </p>
    )
  }
  if (!stats) {
    return <p className="p-16 text-center text-gray-400">{t('comun.cargando')}</p>
  }

  const { general, categorias, evolucion } = stats
  const nf = (n) => Number(n || 0).toLocaleString(localeActual())
  // Al cambiar tema o idioma, los gráficos se vuelven a dibujar (key).
  const claveGraficos = `${oscuro}-${i18n.language}`

  // --- Datos para los gráficos (dona, barras y línea) -------------------
  const etiquetasMateriales = MATERIALES.map((m) => t(`materiales.${m.clave}.nombre`))
  const coloresMateriales = MATERIALES.map((m) => m.color)

  const datosDona = {
    labels: etiquetasMateriales,
    datasets: [
      {
        data: categorias.map((c) => c.cantidad),
        backgroundColor: coloresMateriales,
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  }

  const datosBarras = {
    labels: etiquetasMateriales,
    datasets: [
      {
        label: t('impacto.graficos.puntos'),
        data: categorias.map((c) => c.puntos),
        backgroundColor: coloresMateriales,
        borderRadius: 12,
        maxBarThickness: 64
      }
    ]
  }

  const datosLinea = {
    labels: evolucion.map((d) =>
      new Date(d.fecha + 'T12:00:00').toLocaleDateString(localeActual(), {
        day: 'numeric',
        month: 'short'
      })
    ),
    datasets: [
      {
        label: t('impacto.graficos.cantidad'),
        data: evolucion.map((d) => d.cantidad),
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34,197,94,0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#22C55E'
      }
    ]
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* --- Encabezado ---------------------------------------------------- */}
      <div className="mb-10 text-center">
        <p className="eyebrow">🌍 {t('impacto.eyebrow')}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {t('impacto.titulo')}
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400">{t('impacto.sub')}</p>
      </div>

      {general.total_residuos === 0 && (
        <p className="card mb-8 p-5 text-center font-semibold text-gray-500 dark:text-gray-400">
          {t('comun.noHayDatos')}
        </p>
      )}

      {/* --- 1) Estadísticas generales -------------------------------------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icono="♻️" valor={nf(general.total_residuos)} etiqueta={t('impacto.totalResiduos')} />
        <StatCard icono="👥" valor={nf(general.total_estudiantes)} etiqueta={t('impacto.estudiantesReg')} delay={60} />
        <StatCard icono="⭐" valor={nf(general.total_puntos)} etiqueta={t('impacto.totalPuntos')} delay={120} />
        <StatCard icono="🌱" valor={nf(general.promedio_puntos)} etiqueta={t('impacto.promedioEst')} delay={180} />
        <StatCard
          icono="🥇"
          valor={general.lider ? general.lider.nombre : t('impacto.sinLider')}
          etiqueta={t('impacto.lider')}
          extra={general.lider ? `${general.lider.salon} · ${nf(general.lider.puntos)} ${t('comun.pts')}` : ''}
          delay={240}
        />
      </div>

      {/* --- 2) Por categoría ------------------------------------------------ */}
      <h2 className="mb-5 mt-14 font-display text-2xl font-bold">📦 {t('impacto.categoriasTitulo')}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {categorias.map((c, i) => {
          const m = infoMaterial(c.material)
          return (
            <div
              key={c.material}
              className="card animate-fade-up p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${m.suave}`}>
                  {m.icono}
                </span>
                <div>
                  <p className="font-display font-bold">{t(`materiales.${c.material}.nombre`)}</p>
                  <p className="text-xs text-gray-400">+{m.puntos} {t('comun.pts')}</p>
                </div>
              </div>
              <p className="mt-4 font-display text-3xl font-bold">
                {nf(c.cantidad)}{' '}
                <span className="text-sm font-semibold text-gray-400">{t('impacto.registrados')}</span>
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full ${m.barra} transition-all duration-700`}
                  style={{ width: `${c.porcentaje}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-xs font-semibold text-gray-400">
                {c.porcentaje}% {t('comun.delTotal')}
              </p>
            </div>
          )
        })}
      </div>

      {/* --- 3) Gráficos ------------------------------------------------------ */}
      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        <div className="card animate-fade-up p-6">
          <h3 className="mb-4 font-display font-bold">🍩 {t('impacto.graficos.distribucion')}</h3>
          <div className="h-64">
            <Doughnut key={claveGraficos} data={datosDona} options={opcionesDona(oscuro)} />
          </div>
        </div>
        <div className="card animate-fade-up p-6" style={{ animationDelay: '90ms' }}>
          <h3 className="mb-4 font-display font-bold">📊 {t('impacto.graficos.puntosCategoria')}</h3>
          <div className="h-64">
            <Bar key={claveGraficos} data={datosBarras} options={opcionesEjes(oscuro)} />
          </div>
        </div>
        <div className="card animate-fade-up p-6 lg:col-span-2" style={{ animationDelay: '180ms' }}>
          <h3 className="mb-4 font-display font-bold">📈 {t('impacto.graficos.evolucion')}</h3>
          <div className="h-64">
            <Line key={claveGraficos} data={datosLinea} options={opcionesEjes(oscuro)} />
          </div>
        </div>
      </div>
    </div>
  )
}
