// =====================================================================
//  SELECTOR DE IDIOMA (🇪🇸 / 🇺🇸)
//  Para agregar un idioma nuevo: añádelo a IDIOMAS y crea su JSON
//  en src/i18n/ (ver instrucciones en src/i18n/index.js).
// =====================================================================

import { useTranslation } from 'react-i18next'

const IDIOMAS = [
  { codigo: 'es', bandera: '🇪🇸', etiqueta: 'ES' },
  { codigo: 'en', bandera: '🇺🇸', etiqueta: 'EN' }
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center rounded-full bg-gray-100 p-1 dark:bg-gray-800">
      {IDIOMAS.map(({ codigo, bandera, etiqueta }) => {
        const activo = i18n.language === codigo
        return (
          <button
            key={codigo}
            onClick={() => i18n.changeLanguage(codigo)}
            aria-pressed={activo}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
              activo
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-white'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span>{bandera}</span>
            {etiqueta}
          </button>
        )
      })}
    </div>
  )
}
