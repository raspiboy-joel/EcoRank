// =====================================================================
//  TEMA CLARO / OSCURO
// ---------------------------------------------------------------------
//  Un "contexto" de React que toda la app puede consultar:
//    const { oscuro, alternarTema } = useTema()
//
//  • La preferencia se guarda en LocalStorage (clave "ecorank_tema").
//  • Si el usuario nunca eligió, respetamos la preferencia del sistema.
//  • Al cambiar, se agrega/quita la clase "dark" del <html> y Tailwind
//    aplica automáticamente todas las variantes dark: del CSS.
// =====================================================================

import { createContext, useContext, useEffect, useState } from 'react'

const CLAVE_TEMA = 'ecorank_tema'
const TemaContext = createContext({ oscuro: false, alternarTema: () => {} })

export function ThemeProvider({ children }) {
  const [oscuro, setOscuro] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_TEMA)
    if (guardado) return guardado === 'oscuro'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Cada vez que cambia el tema: actualizamos el <html> y lo recordamos.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro)
    localStorage.setItem(CLAVE_TEMA, oscuro ? 'oscuro' : 'claro')
  }, [oscuro])

  const alternarTema = () => setOscuro((v) => !v)

  return <TemaContext.Provider value={{ oscuro, alternarTema }}>{children}</TemaContext.Provider>
}

export const useTema = () => useContext(TemaContext)
