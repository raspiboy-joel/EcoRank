// =====================================================================
//  PÁGINA PRINCIPAL
// ---------------------------------------------------------------------
//  1. Hero: qué es EcoRank (QR + puntos + ranking; el estudiante
//     SELECCIONA el tipo de residuo manualmente).
//  2. Los 4 pasos del sistema (resumen, con enlace a la guía).
//  3. Categorías y puntos (🟢 plástico, 🟤 papel, 🟠 orgánico).
//  4. Llamado final a generar el QR.
// =====================================================================

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MATERIALES } from '../utils/constants.js'

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-clip">
      <Hero t={t} />
      <Pasos t={t} />
      <Categorias t={t} />
      <CTAFinal t={t} />
    </div>
  )
}

// =====================================================================
//  1) HERO
// =====================================================================
function Hero({ t }) {
  return (
    <section className="relative">
      {/* Manchas de color desenfocadas, muy sutiles (gradientes discretos) */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-eco/25 via-emerald-300/15 to-transparent blur-3xl dark:from-eco/15 dark:via-emerald-500/10" />

      <div className="mx-auto max-w-4xl px-6 pb-16 pt-14 text-center sm:pt-20">
        <p className="eyebrow animate-fade-up">♻️ {t('home.eyebrow')}</p>

        <h1 className="animate-fade-up font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          {t('home.titulo1')}
          <br />
          {t('home.titulo2')}
          <br />
          <span className="bg-gradient-to-r from-eco-dark to-emerald-500 bg-clip-text text-transparent">
            {t('home.titulo3')}
          </span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-gray-600 dark:text-gray-300"
          style={{ animationDelay: '100ms' }}
        >
          {t('home.descripcion')}
        </p>
        <p
          className="mx-auto mt-3 max-w-xl animate-fade-up text-sm text-gray-500 dark:text-gray-400"
          style={{ animationDelay: '160ms' }}
        >
          {t('home.notaSeleccion')}
        </p>

        <div
          className="mt-9 flex animate-fade-up flex-col justify-center gap-3 sm:flex-row"
          style={{ animationDelay: '220ms' }}
        >
          <Link to="/registro" className="btn-primary">
            {t('comun.generarQR')} →
          </Link>
          <Link to="/ranking" className="btn-secondary">
            🏆 {t('comun.verRanking')}
          </Link>
        </div>
      </div>
    </section>
  )
}

// =====================================================================
//  2) LOS 4 PASOS (resumen — la guía completa vive en /como-usar)
// =====================================================================
const ICONOS_PASOS = ['📱', '👆', '🗑️', '⭐']

function Pasos({ t }) {
  return (
    <section className="border-y border-gray-100 bg-white py-20 transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t('home.pasosTitulo')}
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{t('home.pasosSub')}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ICONOS_PASOS.map((icono, i) => (
            <div
              key={i}
              className="card animate-fade-up p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{icono}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-eco-light font-display text-sm font-bold text-eco-deep dark:bg-eco/15 dark:text-eco">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{t(`pasos.${i + 1}.titulo`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {t(`pasos.${i + 1}.texto`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/como-usar" className="btn-ghost text-eco-deep dark:text-eco">
            📖 {t('home.verGuia')} →
          </Link>
        </div>
      </div>
    </section>
  )
}

// =====================================================================
//  3) CATEGORÍAS Y PUNTOS
// =====================================================================
function Categorias({ t }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t('home.categoriasTitulo')}
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('home.categoriasSub')}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {MATERIALES.map((m, i) => (
          <div
            key={m.clave}
            className="card animate-fade-up p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span
              className={`mx-auto grid h-16 w-16 place-items-center rounded-3xl text-3xl ${m.suave}`}
            >
              {m.icono}
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">
              {t(`materiales.${m.clave}.nombre`)}
            </h3>
            <p
              className={`mx-auto mt-3 inline-block rounded-full px-4 py-1.5 font-display text-lg font-bold ${m.suave} ${m.texto}`}
            >
              +{m.puntos} {t('comun.pts')}
            </p>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {t(`materiales.${m.clave}.ejemplos`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// =====================================================================
//  4) LLAMADO FINAL
// =====================================================================
function CTAFinal({ t }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 px-8 py-16 text-center text-white shadow-soft ring-1 ring-gray-800 dark:bg-gray-900">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-eco/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        <h2 className="relative font-display text-3xl font-bold tracking-tight sm:text-4xl">
          🔑 {t('home.ctaTitulo')}
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-gray-300">{t('home.ctaTexto')}</p>
        <Link to="/registro" className="btn-primary relative mt-8">
          {t('home.ctaBoton')} →
        </Link>
      </div>
    </section>
  )
}
