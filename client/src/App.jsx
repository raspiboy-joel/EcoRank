// =====================================================================
//  APP PRINCIPAL
// ---------------------------------------------------------------------
//  Define las "páginas" (rutas) de EcoRank y el esqueleto común:
//  barra de navegación arriba + contenido + pie de página.
// =====================================================================

import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import ComoUsar from './pages/ComoUsar.jsx'
import Registro from './pages/Registro.jsx'
import Ranking from './pages/Ranking.jsx'
import Impacto from './pages/Impacto.jsx'
import Perfil from './pages/Perfil.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* pt-20 deja espacio para la barra de navegación fija */}
      <main className="flex-1 pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/como-usar" element={<ComoUsar />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/impacto" element={<Impacto />} />
          <Route path="/perfil/:id" element={<Perfil />} />
          <Route path="/admin" element={<Admin />} />

          {/* Cualquier ruta desconocida muestra un mensaje simple */}
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-xl px-6 py-24 text-center">
                <p className="font-display text-6xl font-bold">404</p>
                <p className="mt-3 text-gray-500 dark:text-gray-400">{t('notFound')}</p>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
