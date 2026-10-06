// =====================================================================
//  BOTÓN DE TEMA (☀️ / 🌙)
//  Alterna entre modo claro y oscuro. La preferencia queda guardada.
// =====================================================================

import { useTranslation } from 'react-i18next'
import { useTema } from '../context/ThemeContext.jsx'

export default function ThemeToggle() {
  const { oscuro, alternarTema } = useTema()
  const { t } = useTranslation()

  return (
    <button
      onClick={alternarTema}
      title={oscuro ? t('nav.modoClaro') : t('nav.modoOscuro')}
      aria-label={t('nav.cambiarTema')}
      className="grid h-9 w-9 place-items-center rounded-full text-lg transition-all duration-200 hover:scale-110 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
    >
      {oscuro ? '☀️' : '🌙'}
    </button>
  )
}
