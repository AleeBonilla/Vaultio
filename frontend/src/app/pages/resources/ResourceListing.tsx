import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FilterPanel } from '../../components/filters/FilterPanel';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { Button } from '../../components/ui/Button';
import { resourcesApi, type ResourceSummary } from '../../lib/api';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function ResourceListing() {
  const [showFilters, setShowFilters] = useState(true);
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadResources() {
      setLoading(true);
      setError(null);
      try {
        const loadedResources = await resourcesApi.list();
        if (active) setResources(loadedResources);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los recursos');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResources();
    return () => {
      active = false;
    };
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#000000] mb-2">Todos los Recursos</h1>
        <p className="text-[#333333]">
          {loading ? 'Cargando recursos...' : `${resources.length} recursos encontrados`}
        </p>
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
          <select className="px-4 py-2.5 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] bg-white text-[#333333] transition-all shadow-sm">
            <option>Mas Recientes</option>
            <option>Mejor Calificados</option>
            <option>Mas Descargados</option>
            <option>Mas Vistos</option>
          </select>

          <div className="flex items-center gap-1 border border-[#E5E5E5] rounded-lg p-1 bg-white shadow-sm">
            <button type="button" aria-label="Vista en cuadricula" className="p-2 bg-[#FDECEA] text-[#CC0000] rounded-lg transition-colors">
              <Grid className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Vista en lista" className="p-2 hover:bg-[#FDECEA]/50 text-[#666666] rounded-lg transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {showFilters && (
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-20">
              <FilterPanel sections={filterSections} />
            </div>
          </aside>
        )}

        <div className="flex-1">
          {loading ? (
            <div className="rounded-lg border border-[#E0E0E0] bg-white p-6 text-[#666666]">
              Cargando recursos desde la API...
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-lg border border-[#E0E0E0] bg-white p-6 text-[#666666]">
              No hay recursos disponibles con los filtros actuales.
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
