// =====================================================================
//  TARJETA DE INSIGNIA (logro)
//  Dos estados: desbloqueada (a color, con ✓) o bloqueada (gris, 🔒).
// =====================================================================

import { useTranslation } from 'react-i18next'

export default function InsigniaCard({ logro, desbloqueado = false, delay = 0 }) {
  const { t } = useTranslation()

  return (
    <div
      className={`card animate-fade-up relative p-4 text-center transition-all duration-300 ${
        desbloqueado
          ? 'ring-2 ring-eco/40 hover:-translate-y-1'
          : 'opacity-60 grayscale hover:opacity-80'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Marca de estado en la esquina */}
      <span
        className={`absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-xs ${
          desbloqueado ? 'bg-eco text-white' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        title={desbloqueado ? t('logros.desbloqueado') : t('logros.bloqueado')}
      >
        {desbloqueado ? '✓' : '🔒'}
      </span>

      <span className="text-4xl">{logro.icono}</span>
      <p className="mt-2 font-display text-sm font-bold">{t(`logros.lista.${logro.id}.nombre`)}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        {t(`logros.lista.${logro.id}.desc`)}
      </p>
    </div>
  )
}
