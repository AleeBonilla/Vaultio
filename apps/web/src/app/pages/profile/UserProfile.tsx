import { AlertTriangle, BookOpen, Calendar, Edit, Mail, Star, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  catalogApi,
  resourcesApi,
  usersApi,
  type Career,
  type Course,
  type ResourceSummary,
  type UserStats,
} from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export function UserProfile() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [uploads, setUploads] = useState<ResourceSummary[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [resourceToDelete, setResourceToDelete] = useState<ResourceSummary | null>(null);
  const [deletingResource, setDeletingResource] = useState(false);
  const [loading, setLoading] = useState(true);
  const deleteDialogTitleId = useId();
  const deleteDialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([usersApi.stats(), usersApi.uploads(), catalogApi.careers(), usersApi.courses()])
      .then(([loadedStats, loadedUploads, loadedCareers, loadedCourses]) => {
        if (!active) return;
        setStats(loadedStats);
        setUploads(loadedUploads);
        setCareers(loadedCareers);
        setCourses(loadedCourses);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (resourceToDelete) deleteDialogRef.current?.focus();
  }, [resourceToDelete]);

  if (!profile) return null;

  const initials =
    `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    "?";
  const careerNames = profile.careerIds
    .map((id) => careers.find((career) => career.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const handleDeleteResource = async () => {
    if (!resourceToDelete) return;
    setDeletingResource(true);
    try {
      await resourcesApi.delete(resourceToDelete.id);
      setUploads((current) => current.filter((item) => item.id !== resourceToDelete.id));
      setResourceToDelete(null);
      toast.success("Recurso eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar el recurso");
    } finally {
      setDeletingResource(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 rounded-3xl border border-blue-100 bg-white/85 p-8 shadow-sm shadow-blue-900/5">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={`Foto de ${profile.firstName}`}
                className="h-24 w-24 flex-shrink-0 rounded-full object-cover shadow-lg shadow-blue-900/10"
              />
            ) : (
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-3xl font-bold text-white shadow-lg shadow-blue-600/20">
                {initials}
              </div>
            )}
            <div>
              <h1 className="mb-2 text-3xl font-bold text-slate-900">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="mb-3 text-sm font-semibold text-blue-600">@{profile.username}</p>
              <div className="mb-3 flex flex-wrap items-center gap-3 text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </span>
                <span className="hidden text-slate-300 sm:inline">•</span>
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
              {profile.bio && <p className="mt-4 max-w-xl text-slate-700">{profile.bio}</p>}
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-slate-900">Cursos que estoy llevando</p>
                {courses.length === 0 ? (
                  <p className="text-sm text-slate-500">No has agregado cursos todavía.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course) => (
                      <Badge key={course.id} variant="purple" className="whitespace-normal text-left">
                        {course.code} - {course.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Link to="/app/profile/edit">
            <Button
              variant="secondary"
              className="flex min-w-40 items-center justify-center gap-2 whitespace-nowrap rounded-full border-blue-100 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4" />
              Editar perfil
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-blue-100 pt-8 md:grid-cols-4">
          <Stat
            label="Recursos subidos"
            value={stats?.uploads ?? 0}
            icon={<Upload className="w-5 h-5 text-blue-600" />}
          />
          <Stat
            label="Guardados"
            value={stats?.saved ?? 0}
            icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          />
          <Stat
            label="Calificaciones dadas"
            value={stats?.ratingsGiven ?? 0}
            icon={<Star className="w-5 h-5 text-blue-600" />}
          />
          <Stat
            label="Rating promedio recibido"
            value={(stats?.avgRatingReceived ?? 0).toFixed(1)}
            icon={<Star className="w-5 h-5 text-blue-600" />}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-blue-100 bg-white/85 p-6 shadow-sm shadow-blue-900/5">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Mis recursos subidos</h2>
        {loading ? (
          <p className="text-slate-600">Cargando...</p>
        ) : uploads.length === 0 ? (
          <p className="text-slate-600">
            Todavía no has subido recursos.{" "}
            <Link to="/app/upload" className="text-blue-600 hover:underline">
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
                authorId={resource.authorId}
                date={formatDate(resource.date)}
                professor={resource.professor}
                fileExtension={resource.fileExtension}
                canManage
                onDelete={() => setResourceToDelete(resource)}
              />
            ))}
          </div>
        )}
      </section>

      {resourceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div
            ref={deleteDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={deleteDialogTitleId}
            tabIndex={-1}
            className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl shadow-blue-950/20"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 id={deleteDialogTitleId} className="text-lg font-semibold text-slate-900">
                    Eliminar recurso
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Esta accion quitara el recurso de la plataforma. No se eliminara el historial asociado.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setResourceToDelete(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-blue-50 hover:text-slate-700"
                disabled={deletingResource}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <p className="text-sm font-semibold text-slate-900">{resourceToDelete.title}</p>
              <p className="mt-1 text-sm text-slate-600">{resourceToDelete.course}</p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-full border-blue-100 hover:bg-blue-50"
                onClick={() => setResourceToDelete(null)}
                disabled={deletingResource}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1 rounded-full bg-red-600 hover:bg-red-700"
                onClick={handleDeleteResource}
                disabled={deletingResource}
              >
                {deletingResource ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-center">
      <div aria-hidden="true" className="mb-2 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-2xl font-bold text-blue-600">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}
