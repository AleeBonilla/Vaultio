import { BookOpen, ChevronRight, Clock, FileText, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { catalogApi, resourcesApi, type Career, type ResourceSummary } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

function SkeletonCard() {
  return (
    <div className="h-44 animate-pulse rounded-2xl border border-blue-100 bg-white/85 p-5 shadow-sm shadow-blue-900/5">
      <div className="mb-4 h-4 w-20 rounded bg-blue-100" />
      <div className="mb-2 h-5 w-3/4 rounded bg-slate-200" />
      <div className="h-4 w-1/2 rounded bg-slate-200" />
    </div>
  );
}

export function Dashboard() {
  const { profile } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [careerCounts, setCareerCounts] = useState<Record<number, number>>({});
  const [recent, setRecent] = useState<ResourceSummary[]>([]);
  const [popular, setPopular] = useState<ResourceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [loadedCareers, allResources, allCourses] = await Promise.all([
          catalogApi.careers(),
          resourcesApi.list(),
          catalogApi.courses(),
        ]);
        if (!active) return;
        setCareers(loadedCareers);
        setRecent(allResources.slice(0, 6));
        setPopular([...allResources].sort((a, b) => b.downloads - a.downloads).slice(0, 3));

        const counts: Record<number, number> = {};
        for (const career of loadedCareers) {
          const careerCourseIds = allCourses.filter((c) => c.careerIds.includes(career.id)).map((c) => c.id);
          counts[career.id] = allResources.filter((r) => careerCourseIds.includes(r.courseId)).length;
        }
        setCareerCounts(counts);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-10 rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-sm shadow-blue-900/5 backdrop-blur">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Inicio</p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">
          Hola{profile?.firstName ? `, ${profile.firstName}` : ""}
        </h1>
        <p className="max-w-2xl text-slate-600">
          Descubrí y organizá tus materiales de estudio desde tu comunidad estudiantil.
        </p>
      </div>

      <div className="mb-12">
        <Link
          to="/app/resources"
          aria-label="Explorar todos los recursos academicos disponibles"
          className="group flex items-center justify-between rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/15 transition-colors hover:from-blue-700 hover:to-cyan-600"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Explorar todos los recursos</h3>
              <p className="text-white/90 text-sm">
                Apuntes, exámenes, ejercicios y código de todas las carreras.
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <section className="mb-12" aria-labelledby="dashboard-careers-title">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 id="dashboard-careers-title" className="text-2xl font-bold text-slate-900">Explorar por carrera</h2>
          </div>
          <Link
            to="/app/courses"
            aria-label="Ver todas las carreras"
            className="font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            Ver todas
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : careers.length === 0 ? (
          <p className="text-slate-600">Todavía no hay carreras registradas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {careers.map((career) => (
              <Link
                key={career.id}
                to={`/app/courses/${career.id}`}
                aria-label={`Abrir carrera ${career.name}, plan ${career.studyPlan}, ${careerCounts[career.id] ?? 0} recursos disponibles`}
                className="group rounded-2xl border border-blue-100 bg-white/85 p-6 shadow-sm shadow-blue-900/5 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-semibold text-white shadow-md shadow-blue-600/20">
                    {career.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-2 font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                      {career.name}
                    </h3>
                    <div className="text-sm text-slate-600">
                      {careerCounts[career.id] ?? 0} recursos disponibles
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400 transition-colors group-hover:text-blue-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {popular.length > 0 && (
        <section className="mb-12" aria-label="Recursos mas descargados">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Más descargados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popular.map((resource) => (
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
        </section>
      )}

      <section aria-label="Recursos subidos recientemente">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Subidos recientemente</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-white/85 p-6 text-slate-600 shadow-sm shadow-blue-900/5">
            Todavía no hay recursos publicados.{" "}
            <Link to="/app/upload" className="text-blue-600 hover:underline">
              Sé el primero en subir uno
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((resource) => (
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
      </section>
    </div>
  );
}
