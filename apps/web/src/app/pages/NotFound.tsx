import { Link } from "react-router";
import { Button } from "../components/ui/Button";

function LogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-600/20">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6 text-slate-900">
      <div className="absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[120px]" />
      <div className="absolute -left-64 top-1/3 h-[420px] w-[420px] rounded-full bg-cyan-300/20 blur-[110px]" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 inline-flex items-center gap-2">
          <LogoMark />
          <span className="text-3xl font-extrabold tracking-tighter text-slate-900 lowercase">vaultio</span>
        </div>
        <p className="mb-3 text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">404</p>
        <h1 className="mb-3 text-2xl font-semibold text-slate-900">Página no encontrada</h1>
        <p className="mb-8 text-slate-600">
          No pudimos encontrar lo que buscás. Verificá la URL o volvé al inicio.
        </p>
        <Link to="/app">
          <Button variant="primary" className="rounded-full bg-blue-600 shadow-lg shadow-blue-600/15 hover:bg-blue-700">Ir al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
