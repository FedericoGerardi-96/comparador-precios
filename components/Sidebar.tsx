import React from "react";

interface SidebarProps {
  activeMarkets: string[];
  onMarketToggle: (market: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onResetFilters: () => void;
}

export function Sidebar({
  activeMarkets,
  onMarketToggle,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  onResetFilters,
}: SidebarProps) {
  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        
        {/* Header Filtros */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h2 className="font-extrabold text-sm flex items-center gap-2 text-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filtros
          </h2>
          <button onClick={onResetFilters} className="text-xs text-indigo-600 font-bold hover:underline">
            Limpiar
          </button>
        </div>

        {/* SUPERMERCADOS */}
        <div className="mb-6">
          <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Supermercados</span>
          </h3>
          <div className="space-y-2.5">
            {[
              { id: "Carrefour", label: "Carrefour" },
              { id: "Coto", label: "Coto Digital" },
              { id: "Dia", label: "Supermercado Día" },
            ].map((market) => (
              <label key={market.id} className="flex items-center gap-2.5 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={activeMarkets.includes(market.id)}
                  onChange={() => onMarketToggle(market.id)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 transition-all"
                />
                <span className="group-hover:text-emerald-600 transition-colors text-slate-600 font-semibold">
                  {market.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div className="mb-6 border-t border-slate-100 pt-4">
          <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Categorías</span>
          </h3>
          <div className="space-y-1">
            {[
              { id: "all", label: "Todos los productos" },
              { id: "Almacén", label: "Almacén" },
              { id: "Lácteos", label: "Lácteos y Frescos" },
              { id: "Bebidas", label: "Bebidas" },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left text-sm py-2 px-3 rounded-lg font-semibold transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ORDENAMIENTO */}
        <div className="border-t border-slate-100 pt-4">
          <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-3">
            <span>Ordenar por</span>
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-600 font-semibold shadow-sm"
          >
            <option value="savings">Mayor Descuento/Ahorro</option>
            <option value="price-asc">Menor Precio</option>
            <option value="price-desc">Mayor Precio</option>
          </select>
        </div>

      </div>
    </aside>
  );
}
