// =====================================================================
//  SISTEMA BILINGÜE (i18next)
// ---------------------------------------------------------------------
//  Todo el texto del sitio vive en es.json y en.json. Para agregar un
//  idioma nuevo en el futuro (por ejemplo francés):
//    1. Crea fr.json copiando la estructura de es.json.
//    2. Impórtalo aquí y agrégalo a "resources".
//    3. Añádelo a IDIOMAS en components/LanguageSwitcher.jsx.
//  ¡Nada más! El resto del código no cambia.
// =====================================================================

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './es.json'
import en from './en.json'

const CLAVE_IDIOMA = 'ecorank_idioma'

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en }
  },
  lng: localStorage.getItem(CLAVE_IDIOMA) || 'es', // español por defecto
  fallbackLng: 'es',
  interpolation: { escapeValue: false } // React ya protege contra XSS
})

// Al cambiar el idioma: lo recordamos y actualizamos el atributo lang
// del documento (bueno para accesibilidad y buscadores).
i18n.on('languageChanged', (idioma) => {
  localStorage.setItem(CLAVE_IDIOMA, idioma)
  document.documentElement.lang = idioma
})
document.documentElement.lang = i18n.language

// Ayudita para formatear fechas y números según el idioma actual.
export const localeActual = () => (i18n.language === 'en' ? 'en-US' : 'es-PA')

export default i18n
