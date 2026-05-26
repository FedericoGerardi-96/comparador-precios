import React from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    image: string;
    prices: { [key: string]: number };
  };
  activeMarkets: string[];
  onAddToCart: (product: any) => void;
  getLowestPriceInfo: (prices: { [key: string]: number }) => {
    minPrice: number;
    bestMarket: string;
    savingsPercent: number;
  };
}

export function ProductCard({
  product,
  activeMarkets,
  onAddToCart,
  getLowestPriceInfo,
}: ProductCardProps) {
  const { minPrice, bestMarket, savingsPercent } = getLowestPriceInfo(product.prices);

  const sortedMarkets = (Object.entries(product.prices || {}) as [string, number][])
    .filter(([m]) => activeMarkets.includes(m))
    .sort((a, b) => a[1] - b[1]);

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      
      {/* Badge de ahorro */}
      {savingsPercent > 2 && minPrice !== Infinity && (
        <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm shadow-emerald-600/5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.63l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
          </svg>
          Ahorrás {savingsPercent}%
        </span>
      )}

      {/* Información Básica */}
      <div className="flex gap-4">
        <div className="h-16 w-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center shadow-sm">
          <img
            src={product.image}
            className="h-full w-full object-cover"
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
            {product.brand}
          </p>
          <h3 className="font-bold text-sm text-slate-800 pr-16 mt-0.5 break-words line-clamp-2" title={product.name}>
            {product.name}
          </h3>
          <span className="inline-block bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-md mt-1.5 font-bold tracking-wide">
            {product.category}
          </span>
        </div>
      </div>

      {/* Comparativa de Precios */}
      <div className="my-4 border-t border-dashed border-slate-200/80 pt-3 space-y-1.5">
        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
          Comparativa de precios
        </p>
        {minPrice === Infinity ? (
          <p className="text-xs text-slate-400 font-semibold py-1">Selecciona un supermercado activo</p>
        ) : (
          sortedMarkets.map(([market, price], index) => {
            const isCheapest = index === 0;
            return (
              <div
                key={market}
                className={`flex items-center justify-between text-xs py-2 px-2.5 rounded-lg transition-colors ${
                  isCheapest
                    ? "text-emerald-700 font-bold bg-emerald-50/60 border border-emerald-500/10"
                    : "text-slate-500 font-medium"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {isCheapest ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-600">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
                    </div>
                  )}
                  {market === "Dia" ? "Super Día" : market}
                </span>
                <span className={isCheapest ? "text-emerald-700" : "text-slate-600"}>
                  {price > 0 ? `$${price.toLocaleString("es-AR")}` : "N/A"}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Tarjeta */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
        <div>
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Mejor Precio</span>
          <span className="text-xl font-extrabold text-emerald-600">
            {minPrice === Infinity ? "-" : `$${minPrice.toLocaleString("es-AR")}`}
          </span>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={minPrice === Infinity}
          className="h-9 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Agregar a Canasta
        </button>
      </div>

    </div>
  );
}
