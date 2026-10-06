// =====================================================================
//  TARJETA DE QR (el "carné de reciclador")
// ---------------------------------------------------------------------
//  Muestra el QR permanente del estudiante como si fuera un carné
//  estudiantil. Permite:
//    • Descargarlo en PNG
//    • Imprimirlo
//
//  El QR se genera EN EL NAVEGADOR con la librería "qrcode", usando
//  el texto qr_data que guarda el servidor (nunca cambia).
// =====================================================================

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'

export default function QRCard({ estudiante }) {
  const { t } = useTranslation()
  // Guardamos la imagen del QR como una "data URL" (texto que es una imagen).
  const [imagenQR, setImagenQR] = useState('')

  useEffect(() => {
    if (!estudiante?.qr_data) return

    // Convertimos el texto del QR en una imagen PNG de alta calidad.
    QRCode.toDataURL(estudiante.qr_data, {
      width: 640,                    // tamaño grande para imprimir nítido
      margin: 2,
      errorCorrectionLevel: 'H',     // "H" = se lee incluso algo dañado
      color: { dark: '#111827', light: '#FFFFFF' }
    })
      .then(setImagenQR)
      .catch((err) => console.error('Error generando el QR:', err))
  }, [estudiante])

  // --- Imprimir: abrimos una ventana limpia solo con el carné ---------
  function imprimirQR() {
    const ventana = window.open('', '_blank', 'width=480,height=640')
    if (!ventana) return
    ventana.document.write(`
      <html>
        <head><title>QR — ${estudiante.nombre}</title></head>
        <body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif;">
          <h2 style="margin:0 0 4px;">${estudiante.nombre}</h2>
          <p style="margin:0 0 16px;color:#555;">${t('comun.numeroLista')} ${estudiante.numero_lista} · ${estudiante.salon || ''} · ${estudiante.id}</p>
          <img src="${imagenQR}" style="width:320px;height:320px;" />
          <p style="margin-top:16px;color:#16A34A;font-weight:bold;">${t('qr.notaImpresion')}</p>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `)
    ventana.document.close()
  }

  if (!estudiante) return null

  return (
    <div className="card overflow-hidden p-0">
      {/* Franja superior verde, como un carné real */}
      <div className="flex items-center justify-between bg-eco px-6 py-4 text-white">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">
            {t('qr.carne')}
          </p>
          <p className="font-display text-lg font-bold leading-tight">{estudiante.nombre}</p>
          <p className="text-xs font-semibold text-white/85">
            {t('comun.numeroLista')} {estudiante.numero_lista}
            {estudiante.salon ? ` · ${estudiante.salon}` : ''}
          </p>
        </div>
        <span className="text-3xl">♻️</span>
      </div>

      {/* El código QR (siempre sobre fondo blanco para que sea legible) */}
      <div className="flex flex-col items-center px-6 py-8">
        {imagenQR ? (
          <img
            src={imagenQR}
            alt={t('qr.alt', { nombre: estudiante.nombre })}
            className="h-56 w-56 rounded-2xl bg-white ring-1 ring-gray-100 dark:ring-gray-700"
          />
        ) : (
          <div className="grid h-56 w-56 animate-pulse place-items-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
            {t('qr.generando')}
          </div>
        )}

        {/* Identificador debajo del QR */}
        <p className="mt-4 rounded-full bg-gray-100 px-4 py-1.5 font-mono text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {estudiante.id}
        </p>
        <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
          {t('qr.permanente')}
        </p>

        {/* Acciones: descargar e imprimir */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={imagenQR || '#'}
            download={`qr-${estudiante.id}.png`}
            className={`btn-primary px-6 py-2.5 text-sm ${!imagenQR ? 'pointer-events-none opacity-50' : ''}`}
          >
            ⬇️ {t('qr.descargar')}
          </a>
          <button
            onClick={imprimirQR}
            disabled={!imagenQR}
            className="btn-secondary px-6 py-2.5 text-sm"
          >
            🖨️ {t('qr.imprimir')}
          </button>
        </div>
      </div>
    </div>
  )
}
