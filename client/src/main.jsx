// =====================================================================
//  PUNTO DE ENTRADA DE REACT
//  Aquí arranca toda la aplicación y se monta en el <div id="root">.
// =====================================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './i18n' // activa el sistema bilingüe (español/inglés)
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ThemeProvider = modo claro/oscuro · BrowserRouter = navegación sin recargar */}
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
