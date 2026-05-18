import { AlertTriangle, Calendar, Mail, Star, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { catalogApi, usersApi, type Career, type PublicProfile as PublicProfileData } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function PublicProfile() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    let active = true;
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([usersApi.publicProfile(id), catalogApi.careers()])
      .then(([profileData, loadedCareers]) => {
        if (!active) return;
        setData(profileData);
        setCareers(loadedCareers);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "No se pudo cargar el perfil");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="h-40 animate-pulse rounded-3xl border border-blue-100 bg-white/85" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error || "Perfil no encontrado"}</div>
      </div>
    );
  }

  const user = data.user;
  const isOwnProfile = profile?.id === user.id;
  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "?";
  const careerNames = user.careerIds
    .map((careerId) => careers.find((career) => career.id === careerId)?.name)
    .filter((name): name is string => Boolean(name));

  const handleReport = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) return;
    setSubmittingReport(true);
    try {
      await usersApi.reportUser(user.id, trimmed);
      setReason("");
      setShowReport(false);
      toast.success("Reporte enviado para revisión");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo reportar al usuario");
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 rounded-3xl border border-blue-100 bg-white/85 p-8 shadow-sm shadow-blue-900/5">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-6">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={`Foto de ${user.firstName}`}
                className="h-24 w-24 flex-shrink-0 rounded-full object-cover shadow-lg shadow-blue-900/10"
              />
            ) : (
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-3xl font-bold text-white shadow-lg shadow-blue-600/20">
                {initials}
              </div>
            )}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Perfil público</p>
              <h1 className="mb-2 text-3xl font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </h1>
              <div className="mb-3 flex flex-wrap items-center gap-3 text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                <span className="hidden text-slate-300 sm:inline">•</span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Reputación: {user.reputationScore}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {careerNames.map((name) => (
                  <Badge key={name} variant="blue">
                    {name}
                  </Badge>
                ))}
                <Badge variant="green">{user.role}</Badge>
              </div>
              {user.bio && <p className="mt-4 max-w-xl text-slate-700">{user.bio}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwnProfile ? (
              <Link to="/app/profile/edit">
                <Button variant="secondary" className="rounded-full border-blue-100 hover:bg-blue-50">
                  Editar mi perfil
                </Button>
              </Link>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="flex items-center gap-2 rounded-full border-red-100 text-red-600 hover:bg-red-50"
                onClick={() => setShowReport((current) => !current)}
              >
                <AlertTriangle className="h-4 w-4" />
                Reportar usuario
              </Button>
            )}
          </div>
        </div>

        {showReport && (
          <form onSubmit={handleReport} className="mt-6 rounded-2xl border border-red-100 bg-red-50/60 p-4">
            <label htmlFor="reportReason" className="mb-2 block text-sm font-semibold text-slate-900">
              Motivo del reporte
            </label>
            <textarea
              id="reportReason"
              value={reason}
              maxLength={255}
              onChange={(event) => setReason(event.target.value)}
              className="w-full resize-none rounded-xl border border-red-100 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              rows={3}
              placeholder="Describe brevemente el problema..."
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowReport(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" className="rounded-full bg-red-600 hover:bg-red-700" disabled={submittingReport || !reason.trim()}>
                {submittingReport ? "Enviando..." : "Enviar reporte"}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-blue-100 pt-8 md:grid-cols-3">
          <Stat label="Recursos subidos" value={data.stats.uploads} icon={<Upload className="h-5 w-5 text-blue-600" />} />
          <Stat label="Rating promedio" value={data.stats.avgRatingReceived.toFixed(1)} icon={<Star className="h-5 w-5 text-blue-600" />} />
          <Stat label="Descargas recibidas" value={data.stats.totalDownloads} icon={<Upload className="h-5 w-5 text-blue-600" />} />
        </div>
      </div>

      <section className="rounded-2xl border border-blue-100 bg-white/85 p-6 shadow-sm shadow-blue-900/5">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Recursos publicados</h2>
        {data.uploads.length === 0 ? (
          <p className="text-slate-600">Este usuario todavía no ha publicado recursos.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.uploads.map((resource) => (
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

function Stat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-center">
      <div className="mb-2 flex items-center justify-center">{icon}</div>
      <div className="text-2xl font-bold text-blue-600">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}
