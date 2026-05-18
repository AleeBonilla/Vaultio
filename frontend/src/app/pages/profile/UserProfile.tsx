import { BookOpen, Calendar, Edit, Mail, Star, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { catalogApi, usersApi, type Career, type ResourceSummary, type UserStats } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function UserProfile() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [uploads, setUploads] = useState<ResourceSummary[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([usersApi.stats(), usersApi.uploads(), catalogApi.careers()])
      .then(([loadedStats, loadedUploads, loadedCareers]) => {
        if (!active) return;
        setStats(loadedStats);
        setUploads(loadedUploads);
        setCareers(loadedCareers);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!profile) return null;

  const initials =
    `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    "?";
  const careerNames = profile.careerIds
    .map((id) => careers.find((career) => career.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white border border-[#E0E0E0] rounded-xl p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0066CC] to-[#004A99] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md flex-shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-3 text-[#666666]">
                <span className="inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </span>
                <span className="text-[#CCCCCC] hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reputación: {profile.reputationScore}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {careerNames.map((name) => (
                  <Badge key={name} variant="blue">
                    {name}
                  </Badge>
                ))}
                <Badge variant="green">{profile.role}</Badge>
              </div>
              {profile.bio && <p className="mt-4 text-[#333333] max-w-xl">{profile.bio}</p>}
            </div>
          </div>
          <Link to="/app/profile/edit">
            <Button variant="secondary" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar perfil
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-[#E0E0E0]">
          <Stat label="Recursos subidos" value={stats?.uploads ?? 0} icon={<Upload className="w-5 h-5 text-[#0066CC]" />} />
          <Stat label="Guardados" value={stats?.saved ?? 0} icon={<BookOpen className="w-5 h-5 text-[#0066CC]" />} />
          <Stat
            label="Calificaciones dadas"
            value={stats?.ratingsGiven ?? 0}
            icon={<Star className="w-5 h-5 text-[#0066CC]" />}
          />
          <Stat
            label="Rating promedio recibido"
            value={(stats?.avgRatingReceived ?? 0).toFixed(1)}
            icon={<Star className="w-5 h-5 text-[#0066CC]" />}
          />
        </div>
      </div>

      <section className="bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6">Mis recursos subidos</h2>
        {loading ? (
          <p className="text-[#666666]">Cargando...</p>
        ) : uploads.length === 0 ? (
          <p className="text-[#666666]">
            Todavía no has subido recursos.{" "}
            <Link to="/app/upload" className="text-[#0066CC] hover:underline">
              Subí el primero
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploads.map((resource) => (
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

function Stat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold text-[#0066CC]">{value}</div>
      <div className="text-sm text-[#666666]">{label}</div>
    </div>
  );
}
