import { BookOpen, Search, Star, Users, TrendingUp, Shield } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#0066CC] rounded-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl text-[#1a1a1a]">Vaultio</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Registrarse</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-5xl font-bold text-[#1a1a1a] mb-6">
            Tus Recursos Académicos,
            <span className="text-[#0066CC]"> Organizados</span>
          </h1>
          <p className="text-xl text-[#666666] mb-8">
            Descubre, comparte y organiza materiales de estudio para cursos del ITCR. Accede a exámenes pasados, apuntes, ejercicios y código—todo en un solo lugar.
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg">
              Comenzar Gratis
            </Button>
          </Link>
        </div>

        <div className="bg-[#F5F7FA] rounded-lg p-8 border border-[#E0E0E0]">
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Crect fill='%23F5F7FA' width='800' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%230066CC'%3EVistaPrevia de la Plataforma%3C/text%3E%3C/svg%3E"
            alt="Platform preview"
            className="w-full rounded-md"
          />
        </div>
      </section>

      <section className="bg-[#F5F7FA] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-12">
            ¿Por qué Vaultio?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 border border-[#E0E0E0]">
              <div className="w-12 h-12 bg-[#E3F2FD] rounded-md flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#0066CC]" />
              </div>
              <h3 className="font-semibold text-lg text-[#1a1a1a] mb-3">
                Búsqueda y Filtros Inteligentes
              </h3>
              <p className="text-[#666666] leading-relaxed">
                Encuentra exactamente lo que necesitas con filtros avanzados por carrera, curso, profesor, tipo de recurso y dificultad.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-[#E0E0E0]">
              <div className="w-12 h-12 bg-[#E3F2FD] rounded-md flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-[#0066CC]" />
              </div>
              <h3 className="font-semibold text-lg text-[#1a1a1a] mb-3">
                Calificaciones de la Comunidad
              </h3>
              <p className="text-[#666666] leading-relaxed">
                Ve lo que funciona. Lee reseñas y calificaciones de estudiantes que han usado los materiales.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-[#E0E0E0]">
              <div className="w-12 h-12 bg-[#E3F2FD] rounded-md flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-[#0066CC]" />
              </div>
              <h3 className="font-semibold text-lg text-[#1a1a1a] mb-3">
                Organizado por Curso
              </h3>
              <p className="text-[#666666] leading-relaxed">
                Navega recursos estructurados por carrera, curso y categoría—no más archivos dispersos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-[#0066CC]" />
            </div>
            <div className="text-4xl font-bold text-[#0066CC] mb-2">5,000+</div>
            <div className="text-[#666666]">Estudiantes Activos</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-10 h-10 text-[#0066CC]" />
            </div>
            <div className="text-4xl font-bold text-[#0066CC] mb-2">12,000+</div>
            <div className="text-[#666666]">Recursos Compartidos</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-[#0066CC]" />
            </div>
            <div className="text-4xl font-bold text-[#0066CC] mb-2">100%</div>
            <div className="text-[#666666]">Verificado por Estudiantes</div>
          </div>
        </div>
      </section>

      <section className="bg-[#0066CC] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para aprobar tus exámenes?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a miles de estudiantes que están estudiando de forma más inteligente.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#E0E0E0] py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-[#666666] text-sm">
          © 2026 Vaultio.
        </div>
      </footer>
    </div>
  );
}