"use client";

import React, { useState } from "react";

// Estructura de datos idéntica a la maqueta de alta fidelidad
const PRODUCTOS_DATA = [
  {
    id: "1",
    name: "Leche Entera La Serenísima 1L",
    brand: "La Serenísima",
    category: "Lácteos",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80",
    prices: {
      Carrefour: 1150,
      Coto: 1210,
      Dia: 1250
    }
  },
  {
    id: "2",
    name: "Yerba Mate Playadito 1Kg",
    brand: "Playadito",
    category: "Almacén",
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=200&q=80",
    prices: {
      Carrefour: 3600,
      Coto: 3450,
      Dia: 3800
    }
  },
  {
    id: "3",
    name: "Fideos Tallarines Lucchetti 500g",
    brand: "Lucchetti",
    category: "Almacén",
    image: "https://images.unsplash.com/photo-1612966608967-302fc5e26e0e?auto=format&fit=crop&w=200&q=80",
    prices: {
      Carrefour: 1050,
      Coto: 980,
      Dia: 990
    }
  },
  {
    id: "4",
    name: "Fernet Branca 750ml",
    brand: "Branca",
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=200&q=80",
    prices: {
      Carrefour: 8100,
      Coto: 8500,
      Dia: 7900
    }
  }
];

export default function HomePage() {
  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeMarkets, setActiveMarkets] = useState(["Carrefour", "Coto", "Dia"]);
  const [sortBy, setSortBy] = useState("savings");
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAnimatingCart, setIsAnimatingCart] = useState(false);

  // --- CONTROL DEL PANEL LATERAL (SHEET) ---
  const toggleCartModal = (open: boolean) => {
    if (open) {
      setIsCartOpen(true);
      setTimeout(() => setIsAnimatingCart(true), 50);
    } else {
      setIsAnimatingCart(false);
      setTimeout(() => setIsCartOpen(false), 300);
    }
  };

  // --- COMPORTAMIENTO DE CANASTA ---
  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const totalItemsInCart = Object.values(cart).reduce((a, b) => a + b, 0);

  // --- CÁLCULOS DE PRECIOS ---
  const getLowestPriceInfo = (prices: { [key: string]: number }) => {
    let minPrice = Infinity;
    let bestMarket = "";

    Object.entries(prices).forEach(([market, price]) => {
      if (activeMarkets.includes(market) && price < minPrice) {
        minPrice = price;
        bestMarket = market;
      }
    });

    let total = 0;
    let count = 0;
    Object.entries(prices).forEach(([market, price]) => {
      if (activeMarkets.includes(market)) {
        total += price;
        count++;
      }
    });

    const avg = total / count;
    const savingsPercent = avg > 0 ? Math.round(((avg - minPrice) / avg) * 100) : 0;

    return { minPrice, bestMarket, savingsPercent };
  };

  const handleMarketCheckboxChange = (market: string) => {
    setActiveMarkets((prev) =>
      prev.includes(market)
        ? prev.filter((m) => m !== market)
        : [...prev, market]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setActiveMarkets(["Carrefour", "Coto", "Dia"]);
    setSortBy("savings");
  };

  // --- FILTRADO Y ORDENADO ---
  const filteredProducts = PRODUCTOS_DATA.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    const searchLower = searchTerm.toLowerCase();
    if (!p.name.toLowerCase().includes(searchLower) && !p.brand.toLowerCase().includes(searchLower)) return false;
    return true;
  }).sort((a, b) => {
    const infoA = getLowestPriceInfo(a.prices);
    const infoB = getLowestPriceInfo(b.prices);

    if (sortBy === "price-asc") return infoA.minPrice - infoB.minPrice;
    if (sortBy === "price-desc") return infoB.minPrice - infoA.minPrice;
    return infoB.savingsPercent - infoA.savingsPercent;
  });

  const calculateBasketTotals = () => {
    let totalOptimized = 0;
    const totalsByMarket = { Carrefour: 0, Coto: 0, Dia: 0 };

    Object.entries(cart).forEach(([productId, qty]) => {
      const p = PRODUCTOS_DATA.find((prod) => prod.id === productId);
      if (!p) return;

      const { minPrice } = getLowestPriceInfo(p.prices);
      if (minPrice !== Infinity) {
        totalOptimized += minPrice * qty;
      }

      (Object.keys(totalsByMarket) as Array<keyof typeof totalsByMarket>).forEach((market) => {
        totalsByMarket[market] += (p.prices[market] || 0) * qty;
      });
    });

    const activeTotals = Object.entries(totalsByMarket)
      .filter(([market]) => activeMarkets.includes(market))
      .map(([_, val]) => val);

    const worstSingle = activeTotals.length > 0 ? Math.max(...activeTotals) : 0;
    const savingsDiff = worstSingle - totalOptimized;
    const pct = worstSingle > 0 ? Math.round((savingsDiff / worstSingle) * 100) : 0;

    return { totalOptimized, totalsByMarket, savingsDiff, pct };
  };

  const { totalOptimized, totalsByMarket, savingsDiff, pct } = calculateBasketTotals();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">

      {/* HEADER DE LA APP */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6 justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-emerald-600 text-white h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">Ahorro<span className="text-emerald-600">Super</span></span>
              <span className="text-[10px] block text-slate-400 font-bold tracking-widest -mt-1">ARGENTINA</span>
            </div>
          </div>

          {/* BUSCADOR */}
          <div className="relative w-full max-w-xl mx-4 hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar yerba, leche, fideos, marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm text-slate-800 shadow-inner"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 sm:flex">
              <span>Ctrl</span><span>K</span>
            </kbd>
          </div>

          {/* CANASTA BOTÓN */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => toggleCartModal(true)}
              className="relative flex items-center gap-2.5 h-10 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-emerald-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              <span className="font-bold text-sm hidden sm:inline text-slate-700">Mi Canasta</span>
              <div className="bg-emerald-600 text-white font-extrabold text-xs h-5 px-2 rounded-full flex items-center justify-center shadow-sm">
                {totalItemsInCart}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD PRINCIPAL */}
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col md:flex-row px-4 sm:px-6 py-8 gap-8">

        {/* FILTROS (SIDEBAR) */}
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
              <button onClick={resetFilters} className="text-xs text-indigo-600 font-bold hover:underline">Limpiar</button>
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
                  { id: "Dia", label: "Supermercado Día" }
                ].map((market) => (
                  <label key={market.id} className="flex items-center gap-2.5 text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activeMarkets.includes(market.id)}
                      onChange={() => handleMarketCheckboxChange(market.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 transition-all"
                    />
                    <span className="group-hover:text-emerald-600 transition-colors text-slate-600 font-semibold">{market.label}</span>
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
                  { id: "Bebidas", label: "Bebidas" }
                ].map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left text-sm py-2 px-3 rounded-lg font-semibold transition-colors ${isActive
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

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-grow flex flex-col">

          {/* HEADER SECCIÓN */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200/80 gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Comparador de Precios</h1>
              <p className="text-sm text-slate-500 mt-1">
                Mostrando {filteredProducts.length} productos relevados en tiempo real
              </p>
            </div>
            <div className="flex items-center gap-2.5 text-xs bg-white border border-slate-200/80 px-3.5 py-2 rounded-full shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-500">Último scraping: hace 2 horas</span>
            </div>
          </div>

          {/* GRILLA */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 border border-slate-200/80 rounded-xl bg-white shadow-sm">
              <p className="text-slate-500 font-bold">No se encontraron productos que coincidan.</p>
              <button onClick={resetFilters} className="mt-3 text-sm text-emerald-600 font-extrabold hover:underline">Reestablecer filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredProducts.map((p) => {
                const { minPrice, bestMarket, savingsPercent } = getLowestPriceInfo(p.prices);

                const sortedMarkets = Object.entries(p.prices)
                  .filter(([m]) => activeMarkets.includes(m))
                  .sort((a, b) => a[1] - b[1]);

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                  >
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
                        <img src={p.image} className="h-full w-full object-cover" alt={p.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{p.brand}</p>
                        <h3 className="font-bold text-sm text-slate-800 truncate pr-16 mt-0.5">{p.name}</h3>
                        <span className="inline-block bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-md mt-1.5 font-bold tracking-wide">
                          {p.category}
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
                              className={`flex items-center justify-between text-xs py-2 px-2.5 rounded-lg transition-colors ${isCheapest
                                  ? 'text-emerald-700 font-bold bg-emerald-50/60 border border-emerald-500/10'
                                  : 'text-slate-500 font-medium'
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
                                {market === 'Dia' ? 'Super Día' : market}
                              </span>
                              <span className={isCheapest ? 'text-emerald-700' : 'text-slate-600'}>${price.toLocaleString('es-AR')}</span>
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
                          {minPrice === Infinity ? "-" : `$${minPrice.toLocaleString('es-AR')}`}
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(p.id)}
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
              })}
            </div>
          )}

          {/* Banner Optimizador */}
          <div className="mt-8 p-5 rounded-xl border border-emerald-500/10 bg-gradient-to-r from-emerald-500/[0.08] to-indigo-500/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <div>
              <h3 className="font-bold text-sm text-emerald-800">¿Sabías que podés optimizar tu compra?</h3>
              <p className="text-xs text-slate-500 max-w-2xl mt-1 leading-relaxed font-medium">
                Si dividís tu lista de compras llevando cada producto al súper más barato, podés ahorrar en promedio un 15% al 18% en tu ticket final. La app hace esa cuenta matemática por vos automáticamente.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200/50 px-3 py-1.5 rounded-full inline-block shadow-sm">
                Función Canasta Inteligente Activa
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© 2026 AhorroSuper Argentina - Desarrollado en Next.js & Shadcn/ui.</p>
          <div className="flex gap-4 font-bold text-slate-500">
            <a href="#" className="hover:text-slate-800 transition-colors">Términos</a>
            <a href="#" className="hover:text-slate-800 transition-colors">API Docs</a>
            <a href="#" className="hover:text-slate-800 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      {/* MODAL / SHEET CANASTA */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">

          {/* Backdrop click */}
          <div className="absolute inset-0" onClick={() => toggleCartModal(false)} />

          {/* Panel */}
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl p-6 flex flex-col justify-between border-l border-slate-200 transition-transform duration-300 ease-out ${isAnimatingCart ? "translate-x-0" : "translate-x-full"
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
                  onClick={() => toggleCartModal(false)}
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
                  Object.entries(cart).map(([id, qty]) => {
                    const product = PRODUCTOS_DATA.find((p) => p.id === id);
                    if (!product) return null;

                    const { minPrice, bestMarket } = getLowestPriceInfo(product.prices);

                    return (
                      <div key={id} className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-xs bg-slate-100 text-slate-700 h-6 w-6 rounded flex items-center justify-center border border-slate-200 shadow-sm">
                            {qty}x
                          </span>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{product.name}</p>
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                              Comprar en {bestMarket === 'Dia' ? 'Super Día' : bestMarket} — ${minPrice.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-slate-800">${(minPrice * qty).toLocaleString('es-AR')}</span>
                          <button
                            onClick={() => removeFromCart(id)}
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
                    <p className="font-extrabold text-lg text-emerald-600">${totalOptimized.toLocaleString('es-AR')}</p>
                    {savingsDiff > 0 && totalItemsInCart > 0 ? (
                      <p className="text-[10px] text-emerald-600 font-bold">
                        ¡Ahorrás ${savingsDiff.toLocaleString('es-AR')} ({pct}%)!
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
                    { id: "Dia", label: "Solo Día" }
                  ].map((store) => {
                    const price = totalsByMarket[store.id as keyof typeof totalsByMarket] || 0;
                    const isStoreActive = activeMarkets.includes(store.id);
                    return (
                      <div key={store.id} className="bg-white border border-slate-200 p-2.5 rounded-lg text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mb-1.5">
                          {store.label}
                        </p>
                        <p className={`font-bold text-sm ${isStoreActive ? 'text-slate-700' : 'text-slate-300 line-through'}`}>
                          {price > 0 && isStoreActive ? `$${price.toLocaleString('es-AR')}` : "-"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={clearCart}
                  disabled={totalItemsInCart === 0}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-sm transition-colors text-slate-500 disabled:opacity-50 shadow-sm"
                >
                  Vaciar Lista
                </button>
                <button
                  onClick={() => alert('¡Excelente elección! Lista de compras exportada listo para el súper.')}
                  disabled={totalItemsInCart === 0}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-colors shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:shadow-none"
                >
                  Exportar Lista
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}