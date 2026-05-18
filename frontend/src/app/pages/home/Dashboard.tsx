import { BookOpen, ChevronRight, Clock, FileText, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { SearchBar } from "../../components/ui/SearchBar";
import { catalogApi, resourcesApi, type Career, type ResourceSummary } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 h-44 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-20 mb-4" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
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

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const value = formData.get("q");
    if (typeof value === "string" && value.trim()) {
      window.location.href = `/app/resources?search=${encodeURIComponent(value.trim())}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
          ¡Hola{profile?.firstName ? `, ${profile.firstName}` : ""}!
        </h1>
        <p className="text-[#666666]">Descubrí y organizá tus materiales de estudio.</p>
      </div>

      <form onSubmit={handleSearch} className="mb-10">
        <SearchBar name="q" large placeholder="Buscar recursos, cursos o temas..." />
      </form>

      <div className="mb-12">
        <Link
          to="/app/resources"
          className="bg-gradient-to-r from-[#0066CC] to-[#004A99] text-white rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Explorar todos los recursos</h3>
              <p className="text-white/90 text-sm">Apuntes, exámenes, ejercicios y código de todas las carreras.</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#0066CC]" />
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Explorar por carrera</h2>
          </div>
          <Link to="/app/courses" className="text-[#0066CC] hover:text-[#004A99] font-medium transition-colors">
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
          <p className="text-[#666666]">Todavía no hay carreras registradas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {careers.map((career) => (
              <Link
                key={career.id}
                to={`/app/courses/${career.id}`}
                className="bg-white border border-[#E0E0E0] rounded-lg p-6 hover:border-[#0066CC] hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0066CC] to-[#004A99] rounded-md flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {career.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#0066CC] transition-colors">
                      {career.name}
                    </h3>
                    <div className="text-sm text-[#666666]">{careerCounts[career.id] ?? 0} recursos disponibles</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#999999] group-hover:text-[#0066CC] transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {popular.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-[#0066CC]" />
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Más descargados</h2>
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
                date={formatDate(resource.date)}
                professor={resource.professor}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-6 h-6 text-[#0066CC]" />
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Subidos recientemente</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-lg border border-[#E0E0E0] bg-white p-6 text-[#666666]">
            Todavía no hay recursos publicados.{" "}
            <Link to="/app/upload" className="text-[#0066CC] hover:underline">
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
                date={formatDate(resource.date)}
                professor={resource.professor}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
