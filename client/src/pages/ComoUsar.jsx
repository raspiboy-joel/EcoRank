// =====================================================================
//  PÁGINA "¿CÓMO USAR ECORANK?"
// ---------------------------------------------------------------------
//  1. El proceso en cuatro tarjetas (escanear QR → seleccionar residuo
//     manualmente → depositar → recibir puntos).
//  2. Tabla de clasificación de residuos (las 3 categorías oficiales).
//  3. Las insignias que se pueden desbloquear reciclando.
// =====================================================================

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MATERIALES } from '../utils/constants.js'
import { LOGROS } from '../utils/logros.js'
import InsigniaCard from '../components/InsigniaCard.jsx'

const ICONOS_PASOS = ['📱', '👆', '🗑️', '⭐']

export default function ComoUsar() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* --- Encabezado -------------------------------------------------- */}
      <div className="mb-12 text-center">
        <p className="eyebrow">📖 {t('comoUsar.eyebrow')}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {t('comoUsar.titulo')}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-500 dark:text-gray-400">
          {t('comoUsar.sub')}
        </p>
      </div>

      {/* --- 1) Los cuatro pasos ----------------------------------------- */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ICONOS_PASOS.map((icono, i) => (
          <div
            key={i}
            className="card group animate-fade-up relative overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
            style={{ animationDelay: `${i * 110}ms` }}
          >
            {/* Número gigante decorativo al fondo */}
            <span className="pointer-events-none absolute -right-2 -top-5 font-display text-8xl font-bold text-gray-100 transition-colors group-hover:text-eco-light dark:text-gray-800 dark:group-hover:text-eco/10">
              {i + 1}
            </span>

            <span className="relative inline-grid h-14 w-14 place-items-center rounded-2xl bg-eco-light text-3xl transition-transform duration-300 group-hover:scale-110 dark:bg-eco/15">
              {icono}
            </span>
            <p className="relative mt-4 text-xs font-bold uppercase tracking-widest text-eco-dark dark:text-eco">
              {t('comoUsar.paso')} {i + 1}
            </p>
            <h3 className="relative mt-1 font-display text-lg font-bold leading-snug">
              {t(`pasos.${i + 1}.titulo`)}
            </h3>
            <p className="relative mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t(`pasos.${i + 1}.texto`)}
            </p>
          </div>
        ))}
      </div>

      {/* --- 2) Tabla de clasificación de residuos ------------------------ */}
      <div className="mt-20">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            🗂️ {t('comoUsar.tablaTitulo')}
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{t('comoUsar.tablaSub')}</p>
        </div>

        <div className="card animate-fade-up overflow-hidden p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/40">
                <th className="px-6 py-4">{t('comoUsar.colTipo')}</th>
                <th className="hidden px-6 py-4 sm:table-cell">{t('comoUsar.colEjemplos')}</th>
                <th className="px-6 py-4 text-right">{t('comoUsar.colPuntos')}</th>
              </tr>
            </thead>
            <tbody>
              {MATERIALES.map((m) => (
                <tr
                  key={m.clave}
                  className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60 dark:border-gray-800/60 dark:hover:bg-gray-800/30"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-11 w-11 place-items-center rounded-2xl text-xl ${m.suave}`}>
                        {m.icono}
                      </span>
                      <div>
                        <p className="font-display font-bold">{t(`materiales.${m.clave}.nombre`)}</p>
                        {/* Ejemplos visibles en móvil (la columna se oculta) */}
                        <p className="text-xs text-gray-400 sm:hidden">
                          {t(`materiales.${m.clave}.ejemplos`)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-5 text-sm text-gray-500 dark:text-gray-400 sm:table-cell">
                    {t(`materiales.${m.clave}.ejemplos`)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`rounded-full px-3.5 py-1.5 font-display text-sm font-bold ${m.suave} ${m.texto}`}>
                      +{m.puntos} {t('comun.pts')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 3) Insignias -------------------------------------------------- */}
      <div className="mt-20">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            🏅 {t('comoUsar.logrosTitulo')}
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{t('comoUsar.logrosSub')}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {LOGROS.map((logro, i) => (
            <InsigniaCard key={logro.id} logro={logro} desbloqueado={false} delay={i * 80} />
          ))}
        </div>
      </div>

      {/* --- Cierre --------------------------------------------------------- */}
      <div className="mt-16 text-center">
        <p className="font-display text-xl font-bold">{t('comoUsar.listo')}</p>
        <Link to="/registro" className="btn-primary mt-4">
          {t('comun.generarQR')} →
        </Link>
      </div>
    </div>
  )
}
