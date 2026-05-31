import { Link } from "react-router";
import { VaultioLogo } from "../components/ui/VaultioLogo";

export function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6 text-slate-900">
      <div className="absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[120px]" />
      <div className="absolute -left-64 top-1/3 h-[420px] w-[420px] rounded-full bg-cyan-300/20 blur-[110px]" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 inline-flex items-center gap-2">
          <VaultioLogo />
        </div>
        <p className="mb-3 text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">
          404
        </p>
        <h1 className="mb-3 text-2xl font-semibold text-slate-900">Página no encontrada</h1>
        <p className="mb-8 text-slate-600">
          No pudimos encontrar lo que buscás. Verificá la URL o volvé al inicio.
        </p>
        <Link
          to="/app"
          className="inline-flex rounded-full bg-blue-600 px-4 py-2 font-medium text-white shadow-lg shadow-blue-600/15 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
