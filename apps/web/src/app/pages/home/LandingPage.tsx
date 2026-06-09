import { BookOpen, Search, Star, Users, TrendingUp, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { HighContrastToggle } from "../../components/ui/HighContrastToggle";
import { VaultioLogo } from "../../components/ui/VaultioLogo";
import { publicApi, type PublicStats } from "../../lib/api";

export function LandingPage() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    publicApi
      .stats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-sans selection:bg-blue-500/20">
      {/* Background patterns/gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-blue-300/20 blur-[120px] rounded-full pointer-events-none" />

      <nav className="relative z-10 border-b border-blue-100/80 bg-white/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <VaultioLogo />
          <div className="flex items-center gap-4">
            <HighContrastToggle compact />
            <Link
              to="/login"
              className="rounded-full px-4 py-2 font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Iniciar Sesion
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg shadow-blue-600/15 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="text-center max-w-4xl mx-auto mb-14">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-7 tracking-tight leading-[1.05]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">
              Tus Recursos Académicos Organizados
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-light">
            Descubre, comparte y organiza materiales de estudio. Accede a soluciones, apuntes, ejercicios y
            código en una plataforma diseñada por y para estudiantes.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <p className="mb-5 text-center text-xs md:text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            Vista previa de la aplicación
          </p>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-2xl blur opacity-35"></div>
          <div className="relative rounded-2xl bg-white border border-blue-100 p-2 shadow-2xl shadow-blue-900/10 overflow-hidden">
            <img
              src="/preview.png"
              alt="Vista previa de Vaultio"
              className="w-full rounded-xl shadow-inner border border-slate-100 object-cover"
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 bg-white border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="mb-4 flex justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-600/20">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">¿Por qué Vaultio?</h2>
            <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Conocé perspectivas de estudio de cualquier estudiante, de cualquier carrera dentro de tu
              comunidad estudiantil.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="group bg-white border border-blue-100 rounded-2xl p-8 transition-colors duration-300 hover:border-blue-200 hover:bg-blue-50/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-28 bg-blue-100/40 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Búsqueda Inteligente</h3>
              <p className="text-slate-600 leading-relaxed">
                Encuentra exactamente lo que necesitas con filtros avanzados por carrera, curso, profesor,
                tipo de recurso y dificultad.
              </p>
            </div>

            <div className="group bg-white border border-blue-100 rounded-2xl p-8 transition-colors duration-300 hover:border-cyan-200 hover:bg-cyan-50/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-28 bg-cyan-100/40 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-cyan-100 border border-cyan-200 rounded-xl flex items-center justify-center mb-6 text-cyan-600">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Calidad Verificada</h3>
              <p className="text-slate-600 leading-relaxed">
                Ve lo que funciona. Lee reseñas y calificaciones de estudiantes que han usado los materiales
                para asegurar su utilidad.
              </p>
            </div>

            <div className="group bg-white border border-blue-100 rounded-2xl p-8 transition-colors duration-300 hover:border-indigo-200 hover:bg-indigo-50/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-28 bg-indigo-100/40 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Organizado por Curso</h3>
              <p className="text-slate-600 leading-relaxed">
                Navega por recursos organizados por carrera, curso y categoría. Olvídate de los desordenados
                repositorios en Drive, los grupos de WhatsApp, los servidores de Discord y otras herramientas
                dispersas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="rounded-2xl border border-blue-100 bg-white/80 p-8 shadow-sm shadow-blue-900/5">
            <div className="flex items-center justify-center mb-5">
              <div className="p-4 bg-blue-100 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500 mb-2 tracking-tight">
              {stats?.users ?? "—"}
            </div>
            <div className="text-slate-500 font-medium">Estudiantes registrados</div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white/80 p-8 shadow-sm shadow-blue-900/5">
            <div className="flex items-center justify-center mb-5">
              <div className="p-4 bg-cyan-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-500 mb-2 tracking-tight">
              {stats?.resources ?? "—"}
            </div>
            <div className="text-slate-500 font-medium">Recursos compartidos</div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white/80 p-8 shadow-sm shadow-blue-900/5">
            <div className="flex items-center justify-center mb-5">
              <div className="p-4 bg-indigo-100 rounded-full">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-2 tracking-tight">
              {stats?.courses ?? "—"}
            </div>
            <div className="text-slate-500 font-medium">Cursos cubiertos</div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-blue-100 py-10 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="mb-4 md:mb-0">
            <VaultioLogo textClassName="text-2xl" iconClassName="h-6 w-6" />
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 Vaultio. Construido para estudiantes, por estudiantes.
          </div>
        </div>
      </footer>
    </div>
  );
}
