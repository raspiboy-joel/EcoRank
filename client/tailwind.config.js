// Configuración de Tailwind CSS: colores, fuentes, animaciones y modo oscuro.
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // el modo oscuro se activa agregando la clase "dark" al <html>
  theme: {
    extend: {
      colors: {
        // Verde principal del proyecto (#22C55E) y sus variaciones.
        eco: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          deep: '#15803D',
          light: '#DCFCE7',
          faint: '#F0FDF4'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgb(0 0 0 / 0.12)',
        eco: '0 12px 32px -10px rgb(34 197 94 / 0.45)'
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        'grow-bar': {
          from: { width: '0%' }
        },
        // Destello verde: resalta una fila del ranking cuando cambia de posición.
        flash: {
          from: { backgroundColor: 'rgb(34 197 94 / 0.18)' },
          to: { backgroundColor: 'transparent' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'scale-in': 'scale-in 0.35s ease-out both',
        'grow-bar': 'grow-bar 0.9s ease-out both',
        flash: 'flash 1.4s ease-out both'
      }
    }
  },
  plugins: []
}
