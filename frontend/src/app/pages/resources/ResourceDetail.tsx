import {
  Bookmark,
  Calendar,
  Download,
  FileText,
  MessageSquare,
  Share2,
  Tag,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { CommentBlock } from "../../components/comments/CommentBlock";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { RatingStars } from "../../components/ui/RatingStars";
import { resourcesApi, type ResourceDetail as ResourceDetailData } from "../../lib/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function formatFileSize(value?: number) {
  if (!value) return "No disponible";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function ResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState<ResourceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [downloads, setDownloads] = useState(0);
  const [commentDraft, setCommentDraft] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!id) return;
    setLoading(true);
    setError(null);
    resourcesApi
      .detail(id)
      .then((loaded) => {
        if (!active) return;
        setResource(loaded);
        setIsSaved(Boolean(loaded.saved));
        setUserRating(loaded.userRating ?? 0);
        setDownloads(loaded.downloads);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "No se pudo cargar el recurso");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const comments = useMemo(() => {
    if (!resource) return [];
    return resource.comments.map((comment) => ({
      id: comment.id,
      author: comment.author ? `${comment.author.firstName} ${comment.author.lastName}`.trim() : "Usuario",
      date: formatDate(comment.createdAt),
      content: comment.content,
    }));
  }, [resource]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-100 rounded animate-pulse" />
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error || "Recurso no encontrado"}</div>
      </div>
    );
  }

  const handleToggleSaved = async () => {
    const next = !isSaved;
    setIsSaved(next);
    try {
      if (next) await resourcesApi.save(resource.id);
      else await resourcesApi.unsave(resource.id);
      toast.success(next ? "Recurso guardado" : "Recurso retirado de guardados");
    } catch (err) {
      setIsSaved(!next);
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar el guardado");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: resource.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Enlace copiado al portapapeles");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("No se pudo compartir el enlace");
      }
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { url, downloads: total } = await resourcesApi.download(resource.id);
      setDownloads(total);
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Descarga iniciada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo descargar el archivo");
    } finally {
      setDownloading(false);
    }
  };

  const handleRate = async (stars: number) => {
    const previous = userRating;
    setUserRating(stars);
    try {
      const { rating, ratingsCount } = await resourcesApi.rate(resource.id, stars);
      setResource({ ...resource, rating, ratingsCount, userRating: stars });
      toast.success("¡Gracias por calificar!");
    } catch (err) {
      setUserRating(previous);
      toast.error(err instanceof Error ? err.message : "No se pudo calificar");
    }
  };

  const handleComment = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = commentDraft.trim();
    if (!content) return;
    setSubmittingComment(true);
    try {
      const { item } = await resourcesApi.comment(resource.id, content);
      setResource({ ...resource, comments: [...resource.comments, item] });
      setCommentDraft("");
      toast.success("Comentario publicado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo comentar");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
        <Link to="/app" className="hover:text-[#0066CC]">Inicio</Link>
        <span>/</span>
        <Link to="/app/resources" className="hover:text-[#0066CC]">Recursos</Link>
        <span>/</span>
        <span className="text-gray-900 line-clamp-1">{resource.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="blue">{resource.type}</Badge>
                  {resource.courseCode && <span className="text-sm text-gray-500">{resource.courseCode}</span>}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{resource.title}</h1>
                <p className="text-lg text-gray-600 mb-4">{resource.course}</p>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <RatingStars rating={resource.rating} size={18} />
                  <span className="font-semibold text-gray-900">
                    {resource.rating > 0 ? resource.rating.toFixed(1) : "Sin calificaciones"}
                  </span>
                  <span className="text-gray-500">({resource.ratingsCount} calificaciones)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleSaved}
                aria-pressed={isSaved}
                aria-label={isSaved ? "Quitar de guardados" : "Guardar recurso"}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC]"
              >
                <Bookmark
                  className={`w-5 h-5 transition-colors ${isSaved ? "fill-[#0066CC] text-[#0066CC]" : "text-gray-400"}`}
                />
              </button>
            </div>

            <div className="bg-gray-100 rounded-lg aspect-[4/3] flex items-center justify-center mb-6">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Archivo {resource.fileExtension?.toUpperCase() || "digital"}</p>
                <p className="text-sm text-gray-500">{resource.originalFilename}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                variant="primary"
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="w-4 h-4" />
                {downloading ? "Generando enlace..." : "Descargar recurso"}
              </Button>
              <Button variant="secondary" className="flex items-center gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Compartir
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="font-semibold text-lg text-gray-900 mb-3">Descripción</h2>
              <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{resource.description}</p>
              {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="gray">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="font-semibold text-lg text-gray-900 mb-3">Calificar este recurso</h2>
              <div className="flex items-center gap-3">
                <RatingStars rating={userRating} size={24} interactive onRate={handleRate} />
                <span className="text-sm text-[#666666]">
                  {userRating ? `Calificaste con ${userRating} estrellas` : "Hacé clic en una estrella para calificar"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-lg text-gray-900">Comentarios ({comments.length})</h2>
            </div>

            <form onSubmit={handleComment} className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Dejá tu comentario
              </label>
              <textarea
                id="comment"
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] resize-none"
                placeholder="¿Te resultó útil este recurso?"
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" variant="primary" size="sm" disabled={submittingComment || !commentDraft.trim()}>
                  {submittingComment ? "Publicando..." : "Comentar"}
                </Button>
              </div>
            </form>

            {comments.length === 0 ? (
              <p className="text-gray-600">Este recurso aún no tiene comentarios. ¡Sé el primero!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentBlock key={comment.id} author={comment.author} date={comment.date} content={comment.content} />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 lg:sticky lg:top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Información del recurso</h3>

            <div className="space-y-4">
              <InfoRow icon={<User className="w-5 h-5 text-gray-400" />} label="Subido por" value={resource.author} />
              <InfoRow
                icon={<Calendar className="w-5 h-5 text-gray-400" />}
                label="Fecha de subida"
                value={formatDate(resource.date)}
              />
              {resource.professor && (
                <InfoRow icon={<User className="w-5 h-5 text-gray-400" />} label="Profesor" value={resource.professor} />
              )}
              <InfoRow
                icon={<Tag className="w-5 h-5 text-gray-400" />}
                label="Semestre"
                value={resource.academicPeriod?.name || "No especificado"}
              />
              <InfoRow
                icon={<Download className="w-5 h-5 text-gray-400" />}
                label="Descargas"
                value={`${downloads} veces`}
              />
              <InfoRow
                icon={<FileText className="w-5 h-5 text-gray-400" />}
                label="Tipo de archivo"
                value={`${resource.fileExtension?.toUpperCase() || "Archivo"} (${formatFileSize(resource.fileSize)})`}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
