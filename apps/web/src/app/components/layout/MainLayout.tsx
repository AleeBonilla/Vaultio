import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-400/10 blur-[120px]" />
      <div className="pointer-events-none fixed -right-64 top-1/3 h-[420px] w-[420px] rounded-full bg-cyan-300/10 blur-[110px]" />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-blue-600 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Saltar al contenido principal
      </a>
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <TopNav onOpenMobileMenu={() => setMobileOpen(true)} />
      <main id="main-content" className="relative z-0 pt-16 lg:ml-64" tabIndex={-1}>
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
