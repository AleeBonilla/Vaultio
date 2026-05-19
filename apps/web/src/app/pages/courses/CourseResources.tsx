import { ArrowLeft, BookOpen, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { FilterPanel, type FilterValues } from "../../components/filters/FilterPanel";
import { SortSelect } from "../../components/filters/SortSelect";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { Button } from "../../components/ui/Button";
import { catalogApi, resourcesApi, type Career, type Course, type ResourceSummary } from "../../lib/api";

type SortMode = "recent" | "rating" | "downloads" | "views";

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "recent", label: "Más recientes" },
  { value: "rating", label: "Mejor calificados" },
  { value: "downloads", label: "Más descargados" },
  { value: "views", label: "Más vistos" },
];

const EMPTY_FILTERS: FilterValues = {
  typeId: "",
  careerId: "",
  courseId: "",
  professorId: "",
  academicPeriodId: "",
  minRating: 0,
  kind: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export function CourseResources() {
  const { careerId, courseId } = useParams();
  const [showFilters, setShowFilters] = useState(true);
  const [career, setCareer] = useState<Career | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [typeOptions, setTypeOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [professorOptions, setProfessorOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [periodOptions, setPeriodOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortMode>("recent");

  useEffect(() => {
    let active = true;
    if (!careerId || !courseId) return;

    setLoading(true);
    setError(null);
    Promise.all([
      catalogApi.careers(),
      catalogApi.coursesByCareer(careerId),
      resourcesApi.list({
        courseId,
        typeId: filters.typeId || undefined,
        professorId: filters.professorId || undefined,
        academicPeriodId: filters.academicPeriodId || undefined,
        minRating: filters.minRating || undefined,
        kind: filters.kind || undefined,
        sort,
      }),
      catalogApi.resourceTypes(),
      catalogApi.professors(Number(courseId)),
      catalogApi.academicPeriods(),
    ])
      .then(([careers, courses, loadedResources, types, professors, periods]) => {
        if (!active) return;
        setCareer(careers.find((item) => String(item.id) === careerId) || null);
        setCourse(courses.find((item) => String(item.id) === courseId) || null);
        setResources(loadedResources);
        setTypeOptions(types.map((type) => ({ label: type.name, value: String(type.id) })));
        setProfessorOptions(
          professors.map((professor) => ({
            label: `${professor.firstName} ${professor.lastName}`,
            value: String(professor.id),
          })),
        );
        setPeriodOptions(periods.map((period) => ({ label: period.name, value: String(period.id) })));
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
  }, [careerId, courseId, filters, sort]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-slate-600">Cargando recursos del curso...</p>
      </div>
    );
  }

  if (error || !course || !career) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "Curso no encontrado"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-4 flex-wrap">
          <Link to="/app" className="hover:text-blue-700">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/app/courses" className="hover:text-blue-700">
            Carreras
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/app/courses/${careerId}`} className="hover:text-blue-700">
            {career.name}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-slate-900">{course.name}</span>
        </nav>

        <Link
          to={`/app/courses/${careerId}`}
          className="mb-6 inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a {career.name}
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100">
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">{course.name}</h1>
            <p className="text-slate-600">
              {course.code} · {resources.length} recursos
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters((current) => !current)}
          className="flex items-center gap-2 rounded-full border-blue-100 hover:bg-blue-50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        </Button>

        <SortSelect value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {showFilters && (
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <FilterPanel
                typeOptions={typeOptions}
                careerOptions={[]}
                courseOptions={[]}
                professorOptions={professorOptions}
                periodOptions={periodOptions}
                values={filters}
                onChange={setFilters}
                onClear={() => setFilters(EMPTY_FILTERS)}
              />
            </div>
          </aside>
        )}

        <div className="flex-1">
          {resources.length === 0 ? (
            <div className="rounded-2xl border border-blue-100 bg-white/85 p-10 text-center text-slate-600 shadow-sm shadow-blue-900/5">
              {resources.length === 0
                ? "Este curso aún no tiene recursos publicados. ¡Sé el primero en subir uno!"
                : "No hay recursos que coincidan con los filtros actuales."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  authorId={resource.authorId}
                  date={formatDate(resource.date)}
                  professor={resource.professor}
                  fileExtension={resource.fileExtension}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
