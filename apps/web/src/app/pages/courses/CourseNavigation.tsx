import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { catalogApi, type Career, type Course } from "../../lib/api";

function ErrorState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{message}</div>;
}

export function CourseNavigation() {
  const { careerId } = useParams();
  const [careers, setCareers] = useState<Career[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const loadedCareers = await catalogApi.careers();
        const loadedCourses = careerId ? await catalogApi.coursesByCareer(careerId) : [];
        if (!active) return;
        setCareers(loadedCareers);
        setCourses(loadedCourses);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el catalogo");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [careerId]);

  const selectedCareer = careers.find((career) => String(career.id) === String(careerId));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-slate-600" role="status" aria-live="polite">Cargando catálogo académico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorState message={error} />
      </div>
    );
  }

  if (!careerId || !selectedCareer) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-sm shadow-blue-900/5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Catálogo académico
          </p>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">
            Explorar por carrera
          </h1>
          <p className="text-slate-600">Seleccioná tu carrera para ver los cursos disponibles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {careers.map((career) => (
            <Link
              key={career.id}
              to={`/app/courses/${career.id}`}
              aria-label={`Abrir carrera ${career.name}, plan ${career.studyPlan}`}
              className="group rounded-2xl border border-blue-100 bg-white/85 p-6 shadow-sm shadow-blue-900/5 transition-colors hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-semibold text-white shadow-md shadow-blue-600/20">
                  {career.code}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="mb-2 font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                    {career.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span>Plan {career.studyPlan}</span>
                  </div>
                </div>
                <ChevronRight aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-slate-400 transition-colors group-hover:text-blue-600" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <nav aria-label="Ruta de navegacion de carrera" className="flex items-center gap-2 text-sm text-slate-600 mb-4">
          <Link to="/app" className="hover:text-blue-700 transition-colors">
            Inicio
          </Link>
          <ChevronRight aria-hidden="true" className="w-4 h-4" />
          <Link to="/app/courses" className="hover:text-blue-700 transition-colors">
            Carreras
          </Link>
          <ChevronRight aria-hidden="true" className="w-4 h-4" />
          <span className="font-medium text-slate-900">{selectedCareer.name}</span>
        </nav>

        <Link
          to="/app/courses"
          className="mb-6 inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800"
        >
          <ArrowLeft aria-hidden="true" className="w-4 h-4" />
          Volver a Carreras
        </Link>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-semibold text-white shadow-md shadow-blue-600/20">
            {selectedCareer.code}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{selectedCareer.name}</h1>
        </div>
        <p className="text-slate-600">Seleccioná un curso para explorar sus recursos.</p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-blue-100 bg-white/85 p-6 text-slate-600 shadow-sm shadow-blue-900/5">
          No hay cursos registrados para esta carrera todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/app/courses/${careerId}/${course.id}`}
              aria-label={`Abrir curso ${course.code} ${course.name}, ${course.resourcesCount || 0} recursos disponibles`}
              className="group rounded-2xl border border-blue-100 bg-white/85 p-6 shadow-sm shadow-blue-900/5 transition-colors hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <BookOpen aria-hidden="true" className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                      {course.name}
                    </h3>
                    <p className="text-sm text-slate-600">{course.code}</p>
                  </div>
                </div>
                <ChevronRight aria-hidden="true" className="mt-1 h-5 w-5 flex-shrink-0 text-slate-400 transition-colors group-hover:text-blue-600" />
              </div>
              <div className="border-t border-blue-100 pt-4">
                <p className="text-sm font-medium text-slate-700">
                  {course.resourcesCount || 0} recursos disponibles
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
