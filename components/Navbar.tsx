import React from "react";

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onSubmitSearch: (e: React.FormEvent) => void;
  totalItemsInCart: number;
  onOpenCart: () => void;
}

export function Navbar({
  searchTerm,
  setSearchTerm,
  onSubmitSearch,
  totalItemsInCart,
  onOpenCart,
}: NavbarProps) {
  return (
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
            <span className="font-extrabold text-lg tracking-tight text-slate-990">
              Ahorro<span className="text-emerald-600">Super</span>
            </span>
            <span className="text-[10px] block text-slate-400 font-bold tracking-widest -mt-1">ARGENTINA</span>
          </div>
        </div>

        {/* BUSCADOR */}
        <form onSubmit={onSubmitSearch} className="relative w-full max-w-xl mx-4 hidden md:block">
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
          <button type="submit" className="hidden">Buscar</button>
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 sm:flex">
            <span>Enter</span>
          </kbd>
        </form>

        {/* CANASTA BOTÓN */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={onOpenCart}
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
  );
}
