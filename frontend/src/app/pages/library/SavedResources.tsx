import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { usersApi, type ResourceSummary } from "../../lib/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

type SortMode = "recent" | "rating" | "downloads" | "alphabetical";

export function SavedResources() {
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("recent");

  useEffect(() => {
    let active = true;
    usersApi
      .saved()
      .then((items) => {
        if (active) setResources(items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const sorted = [...resources].sort((left, right) => {
    if (sort === "rating") return right.rating - left.rating;
    if (sort === "downloads") return right.downloads - left.downloads;
    if (sort === "alphabetical") return left.title.localeCompare(right.title, "es");
    return new Date(right.date).getTime() - new Date(left.date).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Recursos guardados</h1>
          <p className="text-[#666666]">Tus materiales marcados en un solo lugar.</p>
        </div>
        <select
          aria-label="Ordenar guardados"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortMode)}
          className="px-4 py-2.5 border border-[#E0E0E0] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] bg-white text-[#1a1a1a]"
        >
          <option value="recent">Más recientes</option>
          <option value="rating">Mejor calificados</option>
          <option value="downloads">Más descargados</option>
          <option value="alphabetical">Alfabético</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg border border-[#E0E0E0] bg-white p-6 text-[#666666]">Cargando guardados...</div>
      ) : resources.length === 0 ? (
        <div className="rounded-lg border border-[#E0E0E0] bg-white p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#E3F2FD] mx-auto flex items-center justify-center mb-4">
            <Bookmark className="w-7 h-7 text-[#0066CC]" />
          </div>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-2">Aún no tenés recursos guardados</h2>
          <p className="text-[#666666] mb-4">Hacé clic en el marcador de cualquier recurso para guardarlo aquí.</p>
          <Link to="/app/resources" className="text-[#0066CC] hover:underline">
            Explorar recursos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((resource) => (
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
              saved
              onSavedChange={(next) => {
                if (!next) setResources((current) => current.filter((item) => item.id !== resource.id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
