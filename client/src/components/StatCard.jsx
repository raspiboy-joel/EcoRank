// =====================================================================
//  TARJETA DE ESTADÍSTICA
//  Icono + valor grande + etiqueta. Se usa en el dashboard y el admin.
// =====================================================================

export default function StatCard({ icono, valor, etiqueta, extra, delay = 0 }) {
  return (
    <div
      className="card animate-fade-up p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-eco-light text-xl dark:bg-eco/15">
          {icono}
        </span>
      </div>
      <p className="mt-3 truncate font-display text-3xl font-bold tracking-tight">{valor}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-500 dark:text-gray-400">{etiqueta}</p>
      {extra && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{extra}</p>}
    </div>
  )
}
