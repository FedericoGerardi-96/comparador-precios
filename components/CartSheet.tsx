import React from "react";

interface CartSheetProps {
  isOpen: boolean;
  isAnimating: boolean;
  onClose: () => void;
  cart: { [key: string]: { qty: number; product: any } };
  activeMarkets: string[];
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  getLowestPriceInfo: (prices: { [key: string]: number }) => {
    minPrice: number;
    bestMarket: string;
    savingsPercent: number;
  };
  totalOptimized: number;
  totalsByMarket: { [key: string]: number };
  savingsDiff: number;
  savingsPct: number;
}

export function CartSheet({
  isOpen,
  isAnimating,
  onClose,
  cart,
  activeMarkets,
  onRemoveFromCart,
  onClearCart,
  getLowestPriceInfo,
  totalOptimized,
  totalsByMarket,
  savingsDiff,
  savingsPct,
}: CartSheetProps) {
  if (!isOpen) return null;

  const totalItemsInCart = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
      
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl p-6 flex flex-col justify-between border-l border-slate-200 transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabecera Canasta */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h2 className="font-extrabold text-lg flex items-center gap-2 text-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-emerald-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              Canasta Inteligente
            </h2>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="mt-6 space-y-4 max-h-[calc(100vh-420px)] overflow-y-auto pr-2">
            {totalItemsInCart === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                <p className="font-extrabold text-sm text-slate-500">Tu canasta está vacía.</p>
                <p className="text-xs text-slate-400 mt-1">Agregá productos de la comparativa para calcular tu ahorro.</p>
              </div>
            ) : (
              Object.values(cart).map(({ product, qty }) => {
                const { minPrice, bestMarket } = getLowestPriceInfo(product.prices);

                return (
                  <div key={product.id} className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-xs bg-slate-100 text-slate-700 h-6 w-6 rounded flex items-center justify-center border border-slate-200 shadow-sm">
                        {qty}x
                      </span>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{product.name}</p>
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                          Comprar en {bestMarket === "Dia" ? "Super Día" : bestMarket} — ${minPrice.toLocaleString("es-AR")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-slate-800">
                        ${(minPrice * qty).toLocaleString("es-AR")}
                      </span>
                      <button
                        onClick={() => onRemoveFromCart(product.id)}
                        className="text-rose-500 hover:bg-rose-50 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Análisis de Compra Óptima */}
        <div className="border-t border-slate-200 pt-6 mt-6 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-xl">
          <h3 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider mb-4">
            Análisis de Compra Óptima
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-500/20 p-4 rounded-xl shadow-sm">
              <div>
                <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full inline-block mb-1.5 shadow-sm shadow-emerald-600/10">
                  RECOMENDADO
                </span>
                <p className="font-extrabold text-sm text-emerald-700">Compra Dividida</p>
                <p className="text-[11px] text-slate-500 font-medium">Comprar cada ítem en el súper más barato.</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-lg text-emerald-600">
                  ${totalOptimized.toLocaleString("es-AR")}
                </p>
                {savingsDiff > 0 && totalItemsInCart > 0 ? (
                  <p className="text-[10px] text-emerald-600 font-bold">
                    ¡Ahorrás ${savingsDiff.toLocaleString("es-AR")} ({savingsPct}%)!
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold">Listo para comparar</p>
                )}
              </div>
            </div>

            {/* Comparativa por tienda única */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {[
                { id: "Carrefour", label: "Solo Carrefour" },
                { id: "Coto", label: "Solo Coto" },
                { id: "Dia", label: "Solo Día" },
              ].map((store) => {
                const price = totalsByMarket[store.id] || 0;
                const isStoreActive = activeMarkets.includes(store.id);
                return (
                  <div key={store.id} className="bg-white border border-slate-200 p-2.5 rounded-lg text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mb-1.5">
                      {store.label}
                    </p>
                    <p className={`font-bold text-sm ${isStoreActive ? "text-slate-700" : "text-slate-300 line-through"}`}>
                      {price > 0 && isStoreActive ? `$${price.toLocaleString("es-AR")}` : "-"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClearCart}
              disabled={totalItemsInCart === 0}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-sm transition-colors text-slate-500 disabled:opacity-50 shadow-sm"
            >
              Vaciar Lista
            </button>
            <button
              onClick={() => alert("¡Excelente elección! Lista de compras exportada listo para el súper.")}
              disabled={totalItemsInCart === 0}
              className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-colors shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:shadow-none"
            >
              Exportar Lista
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
