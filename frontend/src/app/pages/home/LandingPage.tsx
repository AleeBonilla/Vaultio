import { BookOpen, Search, Star, Users, TrendingUp, Shield, ChevronRight, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { publicApi, type PublicStats } from '../../lib/api';

export function LandingPage() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    publicApi.stats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-sans selection:bg-blue-500/20">
      {/* Background patterns/gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-blue-300/20 blur-[120px] rounded-full pointer-events-none" />

      <nav className="relative z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" /> {/* blue-600 */}
                  <stop offset="100%" stopColor="#06b6d4" /> {/* cyan-500 */}
                </linearGradient>
              </defs>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#logo-gradient)" />
            </svg>
            <span className="font-extrabold text-3xl tracking-tighter text-slate-900 lowercase">vaultio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">Iniciar Sesión</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-8 shadow-sm">
            <Zap className="w-4 h-4" />
            <span>La nueva forma de estudiar en el TEC</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-tight">
            Tus Recursos Académicos,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Supercargados.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto font-light">
            Descubre, comparte y organiza materiales de estudio. Accede a exámenes pasados, apuntes, ejercicios y código en una plataforma diseñada para el éxito.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 hover:shadow-blue-600/30">
                Comenzar Gratis <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg font-medium text-slate-700 hover:text-blue-600 bg-white border border-slate-200 shadow-sm hover:border-blue-200 rounded-full transition-all hover:-translate-y-1">
                Explorar recursos
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-2xl blur opacity-30 hover:opacity-50 transition duration-1000 hover:duration-200"></div>
          <div className="relative rounded-2xl bg-white border border-slate-200 p-2 shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01] duration-500">
            <img
              src="/vaultio_platform_preview_light.png"
              alt="Vaultio Platform Preview"
              className="w-full rounded-xl shadow-inner border border-slate-100 object-cover"
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">¿Por qué Vaultio?</h2>
            <p className="text-slate-600 text-lg">Diseñado específicamente para las necesidades de estudiantes de ingeniería.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white border border-slate-200 rounded-2xl p-8 hover:bg-blue-50/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-blue-100/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Búsqueda Inteligente</h3>
              <p className="text-slate-600 leading-relaxed">
                Encuentra exactamente lo que necesitas con filtros avanzados por carrera, curso, profesor, tipo de recurso y dificultad.
              </p>
            </div>

            <div className="group bg-white border border-slate-200 rounded-2xl p-8 hover:bg-blue-50/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-cyan-100/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-cyan-100 border border-cyan-200 rounded-xl flex items-center justify-center mb-6 text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Calidad Verificada</h3>
              <p className="text-slate-600 leading-relaxed">
                Ve lo que funciona. Lee reseñas y calificaciones de estudiantes que han usado los materiales para asegurar su utilidad.
              </p>
            </div>

            <div className="group bg-white border border-slate-200 rounded-2xl p-8 hover:bg-blue-50/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-indigo-100/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Organizado por Curso</h3>
              <p className="text-slate-600 leading-relaxed">
                Navega recursos estructurados por carrera, curso y categoría. Olvídate de los archivos dispersos en chats de WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="py-6 md:py-0 px-4 group">
            <div className="flex items-center justify-center mb-6 transform group-hover:-translate-y-1 transition-transform">
              <div className="p-4 bg-blue-100 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="text-5xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 transition-all">{stats?.users ?? "—"}</div>
            <div className="text-slate-500 font-medium">Estudiantes registrados</div>
          </div>
          <div className="py-6 md:py-0 px-4 group">
            <div className="flex items-center justify-center mb-6 transform group-hover:-translate-y-1 transition-transform">
              <div className="p-4 bg-cyan-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
            <div className="text-5xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-500 transition-all">{stats?.resources ?? "—"}</div>
            <div className="text-slate-500 font-medium">Recursos compartidos</div>
          </div>
          <div className="py-6 md:py-0 px-4 group">
            <div className="flex items-center justify-center mb-6 transform group-hover:-translate-y-1 transition-transform">
              <div className="p-4 bg-indigo-100 rounded-full">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <div className="text-5xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-blue-600 transition-all">{stats?.courses ?? "—"}</div>
            <div className="text-slate-500 font-medium">Cursos cubiertos</div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
          
          <h2 className="relative z-10 text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            ¿Listo para dominar el semestre?
          </h2>
          <p className="relative z-10 text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-light">
            Únete a la comunidad de estudiantes que están optimizando su forma de estudiar y compartiendo el conocimiento.
          </p>
          <Link to="/register" className="relative z-10 inline-block">
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-blue-700 hover:bg-slate-50 font-bold rounded-full shadow-xl transition-all hover:scale-105 active:scale-95">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-1.5 mb-4 md:mb-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="font-extrabold text-2xl tracking-tighter text-slate-900 lowercase">vaultio</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 Vaultio. Construido para estudiantes, por estudiantes.
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
             <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Privacidad</a>
             <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
