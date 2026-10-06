// =====================================================================
//  BARRA DE NAVEGACIÓN
// ---------------------------------------------------------------------
//  Fija arriba, con efecto de vidrio esmerilado (backdrop-blur).
//  • En escritorio: enlaces + selector de idioma + botón de tema.
//  • En móvil: menú hamburguesa que despliega todo.
//  • El enlace "Mi QR" es inteligente: si ya te registraste en este
//    navegador, te lleva directo a tu perfil; si no, al registro.
// =====================================================================

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ThemeToggle from './ThemeToggle.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'

export default function Navbar() {
  const { t } = useTranslation()
  const [abierto, setAbierto] = useState(false) // menú móvil

  // Al registrarse, guardamos el id del estudiante en localStorage.
  const miId = localStorage.getItem('ecorank_mi_id')

  const enlaces = [
    { a: '/', texto: t('nav.inicio'), exacto: true },
    { a: '/como-usar', texto: t('nav.comoUsar') },
    { a: '/ranking', texto: t('nav.ranking') },
    { a: '/impacto', texto: `🌍 ${t('nav.impacto')}` },
    { a: miId ? `/perfil/${miId}` : '/registro', texto: t('nav.miQR') }
  ]

  // Estilo de los enlaces: verde cuando la página está activa.
  const claseEnlace = ({ isActive }) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-eco-light text-eco-deep dark:bg-eco/15 dark:text-eco'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950/80">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setAbierto(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-eco text-lg text-white shadow-eco">
            ♻️
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Eco<span className="text-eco-dark">Rank</span>
          </span>
        </Link>

        {/* Enlaces (solo escritorio) */}
        <div className="hidden items-center gap-1 lg:flex">
          {enlaces.map(({ a, texto, exacto }) => (
            <NavLink key={a + texto} to={a} end={exacto} className={claseEnlace}>
              {texto}
            </NavLink>
          ))}
        </div>

        {/* Controles a la derecha */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />

          {/* Botón hamburguesa (solo móvil/tablet) */}
          <button
            onClick={() => setAbierto((v) => !v)}
            aria-label={abierto ? t('nav.cerrarMenu') : t('nav.abrirMenu')}
            aria-expanded={abierto}
            className="grid h-9 w-9 place-items-center rounded-full text-xl transition hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            {abierto ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Menú desplegable móvil */}
      {abierto && (
        <div className="animate-fade-up border-t border-gray-100 bg-white/95 px-4 pb-5 pt-3 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95 lg:hidden">
          <div className="flex flex-col gap-1">
            {enlaces.map(({ a, texto, exacto }) => (
              <NavLink
                key={a + texto}
                to={a}
                end={exacto}
                className={claseEnlace}
                onClick={() => setAbierto(false)}
              >
                {texto}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 sm:hidden">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  )
}
