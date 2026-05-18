import { BookOpen } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#0066CC] rounded-md flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-2xl text-[#1a1a1a]">Vaultio</span>
        </div>
        <p className="text-7xl font-bold text-[#0066CC] mb-3">404</p>
        <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-3">Página no encontrada</h1>
        <p className="text-[#666666] mb-8">
          No pudimos encontrar lo que buscás. Verificá la URL o volvé al inicio.
        </p>
        <Link to="/app">
          <Button variant="primary">Ir al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
