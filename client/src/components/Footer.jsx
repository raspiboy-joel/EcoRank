// =====================================================================
//  PIE DE PÁGINA
//  Incluye el acceso discreto al panel de administración.
// =====================================================================

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-gray-200 bg-white transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-gray-500 dark:text-gray-400 sm:flex-row">
        <p>
          ♻️ <span className="font-semibold text-gray-700 dark:text-gray-200">EcoRank</span> ·{' '}
          {t('footer.linea1')}
        </p>
        <p className="flex items-center gap-3">
          <span>
            {t('footer.linea2')} · {new Date().getFullYear()}
          </span>
          <Link
            to="/admin"
            className="rounded-full px-2 py-0.5 text-xs font-semibold text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            {t('nav.admin')}
          </Link>
        </p>
      </div>
    </footer>
  )
}
