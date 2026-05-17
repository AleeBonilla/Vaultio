import { ArrowLeft, BookOpen, ChevronRight, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { FilterPanel } from '../../components/filters/FilterPanel';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { Button } from '../../components/ui/Button';
import { catalogApi, resourcesApi, type Career, type Course, type ResourceSummary } from '../../lib/api';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function CourseResources() {
  const { careerId, courseId } = useParams();
  const [showFilters, setShowFilters] = useState(true);
  const [career, setCareer] = useState<Career | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!careerId || !courseId) return;
      setLoading(true);
      setError(null);
      try {
        const [careers, courses, loadedResources] = await Promise.all([
          catalogApi.careers(),
          catalogApi.coursesByCareer(careerId),
          resourcesApi.list({ courseId }),
        ]);
        if (!active) return;
        setCareer(careers.find((item) => String(item.id) === careerId) || null);
        setCourse(courses.find((item) => String(item.id) === courseId) || null);
        setResources(loadedResources);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el curso');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [careerId, courseId]);

  const filterSections = [
    {
      title: 'Tipo de Recurso',
      type: 'checkbox' as const,
      options: [
        { label: 'Examenes', value: 'exam' },
        { label: 'Apuntes', value: 'notes' },
        { label: 'Ejercicios', value: 'exercises' },
        { label: 'Codigo', value: 'code' },
        { label: 'Resumenes', value: 'summary' },
      ],
    },
    {
      title: 'Calificacion',
      type: 'radio' as const,
      options: [
        { label: '4+ estrellas', value: '4+' },
        { label: '3+ estrellas', value: '3+' },
        { label: 'Todas', value: 'all' },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-[#666666]">Cargando recursos del curso...</p>
      </div>
    );
  }

  if (error || !course || !career) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'Curso no encontrado'}
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
          <Link to={`/app/courses/${careerId}`} className="hover:text-[#0066CC] transition-colors">
            {career.name}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1a1a1a] font-medium">{course.name}</span>
        </nav>

        <Link
          to={`/app/courses/${careerId}`}
          className="inline-flex items-center gap-2 text-[#0066CC] hover:text-[#004A99] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a {career.name}
        </Link>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-[#E3F2FD] rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8 text-[#0066CC]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">{course.name}</h1>
            <p className="text-[#666666]">{course.code} - {resources.length} recursos disponibles</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>

        <div className="flex items-center gap-4">
          <select className="px-4 py-2.5 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC] bg-white text-[#1a1a1a] transition-all">
            <option>Mas Recientes</option>
            <option>Mejor Calificados</option>
            <option>Mas Descargados</option>
            <option>Mas Vistos</option>
          </select>

          <div className="flex items-center gap-1 border border-[#E0E0E0] rounded-lg p-1 bg-white">
            <button type="button" aria-label="Vista en cuadricula" className="p-2 bg-[#E3F2FD] text-[#0066CC] rounded-lg transition-colors">
              <Grid className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Vista en lista" className="p-2 hover:bg-[#E3F2FD]/50 text-[#666666] rounded-lg transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {showFilters && (
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-20">
              <FilterPanel sections={filterSections} />
            </div>
          </aside>
        )}

        <div className="flex-1">
          {resources.length === 0 ? (
            <div className="rounded-lg border border-[#E0E0E0] bg-white p-6 text-[#666666]">
              Este curso aun no tiene recursos publicados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  id={resource.id}
                  title={resource.title}
                  course={resource.course}
                  type={resource.type}
                  rating={resource.rating}
                  downloads={resource.downloads}
                  views={resource.views}
                  author={resource.author}
                  date={formatDate(resource.date)}
                  professor={resource.professor || undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
