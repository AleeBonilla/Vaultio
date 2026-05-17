import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { catalogApi, type Career, type Course } from '../../lib/api';

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
      {message}
    </div>
  );
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
        setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el catalogo');
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
        <p className="text-[#666666]">Cargando catalogo academico...</p>
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
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Explorar por Carrera</h1>
          <p className="text-[#666666]">Selecciona tu carrera para ver los cursos disponibles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {careers.map((career) => (
            <Link
              key={career.id}
              to={`/app/courses/${career.id}`}
              className="bg-white border border-[#E0E0E0] rounded-lg p-6 hover:border-[#0066CC] transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0066CC] rounded-md flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {career.code}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#0066CC] transition-colors">
                    {career.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-[#666666]">
                    <span>Plan {career.studyPlan}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#999999] group-hover:text-[#0066CC] transition-colors flex-shrink-0" />
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
        <nav className="flex items-center gap-2 text-sm text-[#666666] mb-4">
          <Link to="/app" className="hover:text-[#0066CC] transition-colors">Inicio</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/app/courses" className="hover:text-[#0066CC] transition-colors">Carreras</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1a1a1a] font-medium">{selectedCareer.name}</span>
        </nav>

        <Link
          to="/app/courses"
          className="inline-flex items-center gap-2 text-[#0066CC] hover:text-[#004A99] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Carreras
        </Link>

        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-[#0066CC] rounded-md flex items-center justify-center text-white font-semibold">
            {selectedCareer.code}
          </div>
          <h1 className="text-3xl font-bold text-[#000000]">{selectedCareer.name}</h1>
        </div>
        <p className="text-[#333333]">Selecciona un curso para explorar sus recursos</p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-[#E0E0E0] bg-white p-6 text-[#666666]">
          No hay cursos registrados para esta carrera todavia.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/app/courses/${careerId}/${course.id}`}
              className="bg-white border border-[#E0E0E0] rounded-lg p-6 hover:border-[#0066CC] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-[#E3F2FD] rounded-md flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-[#0066CC]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1a1a1a] group-hover:text-[#0066CC] transition-colors mb-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-[#666666]">{course.code}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#999999] group-hover:text-[#0066CC] transition-colors flex-shrink-0 mt-1" />
              </div>
              <div className="pt-4 border-t border-[#E0E0E0]">
                <p className="text-sm text-[#333333] font-medium">
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
