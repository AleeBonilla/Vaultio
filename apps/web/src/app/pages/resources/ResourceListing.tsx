import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { FilterPanel, type FilterValues } from "../../components/filters/FilterPanel";
import { SortSelect } from "../../components/filters/SortSelect";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { Button } from "../../components/ui/Button";
import { catalogApi, resourcesApi, type ResourceSummary } from "../../lib/api";

type SortMode = "recent" | "rating" | "downloads" | "views";

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "recent", label: "Más recientes" },
  { value: "rating", label: "Mejor calificados" },
  { value: "downloads", label: "Más descargados" },
  { value: "views", label: "Más vistos" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function ResourceListing() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [showFilters, setShowFilters] = useState(true);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ types: [], minRating: 0 });
  const [sort, setSort] = useState<SortMode>("recent");
  const [typeOptions, setTypeOptions] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([resourcesApi.list({ search: search || undefined }), catalogApi.resourceTypes()])
      .then(([loadedResources, types]) => {
        if (!active) return;
        setResources(loadedResources);
        setTypeOptions(types.map((type) => ({ label: type.name, value: type.name })));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "No se pudieron cargar los recursos");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search]);

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10 rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-sm shadow-blue-900/5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Biblioteca</p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">
          Todos los recursos
        </h1>
        <p className="text-slate-600">
          {loading ? "Cargando recursos..." : `${filtered.length} de ${resources.length} recursos`}
          {search && <span className="ml-1">para "{search}"</span>}
        </p>
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

      {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

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
          {loading ? (
            <div className="rounded-2xl border border-blue-100 bg-white/85 p-6 text-slate-600 shadow-sm shadow-blue-900/5">
              Cargando recursos...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-blue-100 bg-white/85 p-10 text-center text-slate-600 shadow-sm shadow-blue-900/5">
              No hay recursos que coincidan con los filtros actuales.
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
