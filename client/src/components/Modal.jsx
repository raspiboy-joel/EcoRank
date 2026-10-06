// =====================================================================
//  MODAL (ventana emergente)
//  Componente reutilizable: se le pasa un título, contenido (children)
//  y una función alCerrar. Se usa en el panel de administrador.
// =====================================================================

import { useTranslation } from 'react-i18next'

export default function Modal({ titulo, alCerrar, children }) {
  const { t } = useTranslation()

  return (
    // Fondo oscuro semitransparente; clic afuera = cerrar
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
      onClick={alCerrar}
    >
      {/* stopPropagation evita que un clic DENTRO del modal lo cierre */}
      <div
        className="w-full max-w-md animate-scale-in rounded-3xl bg-white p-6 shadow-soft ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">{titulo}</h3>
          <button
            onClick={alCerrar}
            className="grid h-9 w-9 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label={t('comun.cerrar')}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
