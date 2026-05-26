"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { ProductCard } from "./ProductCard";
import { CartSheet } from "./CartSheet";
import { Footer } from "./Footer";

interface HomeClientProps {
  initialProducts: any[];
}

export function HomeClient({ initialProducts }: HomeClientProps) {
  // --- ESTADOS ---
  const [productos, setProductos] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeMarkets, setActiveMarkets] = useState(["Carrefour", "Coto", "Dia"]);
  const [sortBy, setSortBy] = useState("savings");
  const [cart, setCart] = useState<{ [key: string]: { qty: number; product: any } }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAnimatingCart, setIsAnimatingCart] = useState(false);

  // --- OBTENER PRODUCTOS DESDE LA API ---
  const fetchProducts = async (queryStr = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/coto?query=${encodeURIComponent(queryStr)}`);
      if (!res.ok) {
        throw new Error(`Error en el servidor: ${res.statusText}`);
      }
      const data = await res.json();
      setProductos(data);
    } catch (err: any) {
      console.error("Error al buscar productos:", err);
      setError("No se pudieron cargar los productos de Coto. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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
  const addToCart = (product: any) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        qty: (prev[product.id]?.qty || 0) + 1,
        product,
      },
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

  const totalItemsInCart = Object.values(cart).reduce((a, b) => a + b.qty, 0);

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
    fetchProducts("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchTerm);
  };

  // --- FILTRADO Y ORDENADO ---
  const filteredProducts = productos
    .filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      return true;
    })
    .sort((a, b) => {
      const infoA = getLowestPriceInfo(a.prices);
      const infoB = getLowestPriceInfo(b.prices);

      if (sortBy === "price-asc") return infoA.minPrice - infoB.minPrice;
      if (sortBy === "price-desc") return infoB.minPrice - infoA.minPrice;
      return infoB.savingsPercent - infoA.savingsPercent;
    });

  const calculateBasketTotals = () => {
    let totalOptimized = 0;
    const totalsByMarket = { Carrefour: 0, Coto: 0, Dia: 0 };

    Object.values(cart).forEach(({ product, qty }) => {
      const { minPrice } = getLowestPriceInfo(product.prices);
      if (minPrice !== Infinity) {
        totalOptimized += minPrice * qty;
      }

      (Object.keys(totalsByMarket) as Array<keyof typeof totalsByMarket>).forEach((market) => {
        totalsByMarket[market] += (product.prices[market] || 0) * qty;
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
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSubmitSearch={handleSearchSubmit}
        totalItemsInCart={totalItemsInCart}
        onOpenCart={() => toggleCartModal(true)}
      />

      {/* DASHBOARD PRINCIPAL */}
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col md:flex-row px-4 sm:px-6 py-8 gap-8">
        {/* FILTROS (SIDEBAR) */}
        <Sidebar
          activeMarkets={activeMarkets}
          onMarketToggle={handleMarketCheckboxChange}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onResetFilters={resetFilters}
        />

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-grow flex flex-col">
          {/* HEADER SECCIÓN */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200/80 gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-955">Comparador de Precios</h1>
              <p className="text-sm text-slate-500 mt-1">
                {loading
                  ? "Cargando productos..."
                  : `Mostrando ${filteredProducts.length} productos relevados en tiempo real`}
              </p>
            </div>
            <div className="flex items-center gap-2.5 text-xs bg-white border border-slate-200/80 px-3.5 py-2 rounded-full shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-500">Datos de Coto en tiempo real</span>
            </div>
          </div>

          {/* GRILLA */}
          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col justify-between animate-pulse shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 bg-slate-100 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-5 bg-slate-200 rounded w-1/3 mt-1.5" />
                    </div>
                  </div>
                  <div className="my-4 border-t border-dashed border-slate-200/80 pt-3 space-y-2">
                    <div className="h-8 bg-slate-50 rounded" />
                    <div className="h-8 bg-slate-50 rounded" />
                    <div className="h-8 bg-slate-50 rounded" />
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                    <div className="space-y-1">
                      <div className="h-3 bg-slate-200 rounded w-10" />
                      <div className="h-6 bg-slate-200 rounded w-20" />
                    </div>
                    <div className="h-9 bg-slate-200 rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 border border-rose-100 rounded-xl bg-rose-50/50 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-12 h-12 mx-auto text-rose-500 mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-rose-800 font-bold">{error}</p>
              <button onClick={() => fetchProducts(searchTerm)} className="mt-3 text-sm text-rose-600 font-extrabold hover:underline flex items-center gap-1.5 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Reintentar
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 border border-slate-200/80 rounded-xl bg-white shadow-sm">
              <p className="text-slate-500 font-bold">No se encontraron productos que coincidan.</p>
              <button onClick={resetFilters} className="mt-3 text-sm text-emerald-600 font-extrabold hover:underline">Reestablecer filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  activeMarkets={activeMarkets}
                  onAddToCart={addToCart}
                  getLowestPriceInfo={getLowestPriceInfo}
                />
              ))}
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
      <Footer />

      {/* MODAL / SHEET CANASTA */}
      <CartSheet
        isOpen={isCartOpen}
        isAnimating={isAnimatingCart}
        onClose={() => toggleCartModal(false)}
        cart={cart}
        activeMarkets={activeMarkets}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
        getLowestPriceInfo={getLowestPriceInfo}
        totalOptimized={totalOptimized}
        totalsByMarket={totalsByMarket}
        savingsDiff={savingsDiff}
        savingsPct={pct}
      />
    </div>
  );
}
