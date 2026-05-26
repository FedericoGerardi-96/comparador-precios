import React from "react";

export function Footer() {
  return (
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
  );
}
