// Configuración de Vite (la herramienta que ejecuta y construye el frontend).
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Cuando el frontend pide algo que empieza con /api,
    // Vite lo reenvía automáticamente al servidor Express (puerto 3001).
    // Así evitamos problemas de CORS durante el desarrollo.
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
