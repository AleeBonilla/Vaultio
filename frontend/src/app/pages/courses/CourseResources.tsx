import { ArrowLeft, BookOpen, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { FilterPanel, type FilterValues } from "../../components/filters/FilterPanel";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { Button } from "../../components/ui/Button";
import { catalogApi, resourcesApi, type Career, type Course, type ResourceSummary } from "../../lib/api";

type SortMode = "recent" | "rating" | "downloads" | "views";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function CourseResources() {
  const { careerId, courseId } = useParams();
  const [showFilters, setShowFilters] = useState(true);
  const [career, setCareer] = useState<Career | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [typeOptions, setTypeOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ types: [], minRating: 0 });
  const [sort, setSort] = useState<SortMode>("recent");

  useEffect(() => {
    let active = true;
    if (!careerId || !courseId) return;

    setLoading(true);
    setError(null);
    Promise.all([
      catalogApi.careers(),
      catalogApi.coursesByCareer(careerId),
      resourcesApi.list({ courseId }),
      catalogApi.resourceTypes(),
    ])
      .then(([careers, courses, loadedResources, types]) => {
        if (!active) return;
        setCareer(careers.find((item) => String(item.id) === careerId) || null);
        setCourse(courses.find((item) => String(item.id) === courseId) || null);
        setResources(loadedResources);
        setTypeOptions(types.map((type) => ({ label: type.name, value: type.name })));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "No se pudo cargar el curso");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [careerId, courseId]);

  const filtered = useMemo(() => {
    let list = resources;
    if (filters.types.length > 0) list = list.filter((resource) => filters.types.includes(resource.type));
    if (filters.minRating > 0) list = list.filter((resource) => resource.rating >= filters.minRating);
    const sorted = [...list];
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "downloads") sorted.sort((a, b) => b.downloads - a.downloads);
    else if (sort === "views") sorted.sort((a, b) => b.views - a.views);
    else sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted;
  }, [resources, filters, sort]);

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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error || "Curso no encontrado"}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-sm text-[#666666] mb-4 flex-wrap">
          <Link to="/app" className="hover:text-[#0066CC]">Inicio</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/app/courses" className="hover:text-[#0066CC]">Carreras</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/app/courses/${careerId}`} className="hover:text-[#0066CC]">{career.name}</Link>
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

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-[#E3F2FD] rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8 text-[#0066CC]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">{course.name}</h1>
            <p className="text-[#666666]">
              {course.code} · {filtered.length} de {resources.length} recursos
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters((current) => !current)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        </Button>

        <select
          aria-label="Ordenar resultados"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortMode)}
          className="px-4 py-2.5 border border-[#E0E0E0] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] bg-white text-[#1a1a1a]"
        >
          <option value="recent">Más recientes</option>
          <option value="rating">Mejor calificados</option>
          <option value="downloads">Más descargados</option>
          <option value="views">Más vistos</option>
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {showFilters && (
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <FilterPanel
                typeOptions={typeOptions}
                values={filters}
                onChange={setFilters}
                onClear={() => setFilters({ types: [], minRating: 0 })}
              />
            </div>
          </aside>
        )}

        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-[#E0E0E0] bg-white p-10 text-center text-[#666666]">
              {resources.length === 0
                ? "Este curso aún no tiene recursos publicados. ¡Sé el primero en subir uno!"
                : "No hay recursos que coincidan con los filtros actuales."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((resource) => (
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
                  professor={resource.professor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
