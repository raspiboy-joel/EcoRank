// =====================================================================
//  CONFIGURACIÓN DE CHART.JS
// ---------------------------------------------------------------------
//  1. Registra (una sola vez) las piezas de Chart.js que usamos.
//  2. Exporta opciones base que cambian de color según el tema:
//     texto y rejillas claras en modo oscuro, y viceversa.
// =====================================================================

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
)

ChartJS.defaults.font.family = "'Inter', system-ui, sans-serif"

// Colores según el tema actual.
const paleta = (oscuro) => ({
  texto: oscuro ? '#9CA3AF' : '#6B7280',
  rejilla: oscuro ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
  tooltipFondo: oscuro ? '#111827' : '#1F2937'
})

// Opciones para gráficos CON ejes (barras y líneas).
export function opcionesEjes(oscuro, extra = {}) {
  const c = paleta(oscuro)
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: c.tooltipFondo, padding: 10, cornerRadius: 10 }
    },
    scales: {
      x: { ticks: { color: c.texto }, grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { color: c.texto, precision: 0 },
        grid: { color: c.rejilla }
      }
    },
    ...extra
  }
}

// Opciones para gráficos SIN ejes (dona / circular).
export function opcionesDona(oscuro) {
  const c = paleta(oscuro)
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: { position: 'bottom', labels: { color: c.texto, usePointStyle: true, padding: 16 } },
      tooltip: { backgroundColor: c.tooltipFondo, padding: 10, cornerRadius: 10 }
    }
  }
}
