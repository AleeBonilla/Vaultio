import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { SortSelect } from "../../components/filters/SortSelect";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { usersApi, type ResourceSummary } from "../../lib/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

type SortMode = "recent" | "rating" | "downloads" | "alphabetical";

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "recent", label: "Mas recientes" },
  { value: "rating", label: "Mejor calificados" },
  { value: "downloads", label: "Mas descargados" },
  { value: "alphabetical", label: "Alfabetico" },
];

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
      <div className="mb-10 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-sm shadow-blue-900/5">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Biblioteca personal</p>
          <h1 className="mb-3 pb-1 text-4xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">
            Recursos guardados
          </h1>
          <p className="text-slate-600">Tus materiales marcados en un solo lugar.</p>
        </div>
        <SortSelect value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-blue-100 bg-white/85 p-6 text-slate-600 shadow-sm shadow-blue-900/5">
          Cargando guardados...
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-2xl border border-blue-100 bg-white/85 p-10 text-center shadow-sm shadow-blue-900/5">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <Bookmark className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Aun no tenes recursos guardados</h2>
          <p className="mb-4 text-slate-600">Hace clic en el marcador de cualquier recurso para guardarlo aqui.</p>
          <Link to="/app/resources" className="text-blue-600 hover:underline">
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
              authorId={resource.authorId}
              date={formatDate(resource.date)}
              professor={resource.professor}
              fileExtension={resource.fileExtension}
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
