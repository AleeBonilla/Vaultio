import {
  Bookmark,
  Calendar,
  Download,
  ExternalLink,
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
import { ResourceTypeIcon } from "../../components/resources/ResourceTypeIcon";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { RatingStars } from "../../components/ui/RatingStars";
import {
  resourcesApi,
  storageApi,
  type ResourceComment,
  type ResourceDetail as ResourceDetailData,
} from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(value),
  );
}

function formatFileSize(value?: number) {
  if (!value) return "No disponible";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

interface UiComment extends ResourceComment {
  authorName: string;
  dateLabel: string;
}

const IMAGE_EXTENSIONS = new Set(["gif", "jpeg", "jpg", "png", "svg", "webp"]);

function normalizedExtension(resource: ResourceDetailData) {
  return (resource.fileExtension || resource.originalFilename.split(".").pop() || "")
    .replace(/^\./, "")
    .toLowerCase();
}

function ResourcePreview({ resource }: { resource: ResourceDetailData }) {
  const extension = normalizedExtension(resource);
  const isExternalResource = resource.storageProvider === "external" || extension === "link";
  const previewUrl =
    !isExternalResource && resource.storageKey ? storageApi.publicObjectUrl(resource.storageKey) : "";
  const isImage = IMAGE_EXTENSIONS.has(extension) || resource.mimeType.startsWith("image/");
  const isPdf = extension === "pdf" || resource.mimeType === "application/pdf";

  if (previewUrl && isImage) {
    return (
      <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-slate-50 shadow-inner">
        <img
          src={previewUrl}
          alt={`Vista previa de ${resource.title}`}
          className="max-h-[720px] w-full object-contain"
        />
      </div>
    );
  }

  if (previewUrl && isPdf) {
    return (
      <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-slate-50 shadow-inner">
        <iframe
          title={`Vista previa de ${resource.title}`}
          src={previewUrl}
          className="h-[720px] w-full bg-white"
        />
      </div>
    );
  }

  return (
    <div className="mb-6 flex aspect-[4/3] items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/60">
      <div className="text-center">
        <ResourceTypeIcon
          type={resource.type}
          fileExtension={resource.fileExtension}
          className="mx-auto mb-3 !p-4"
        />
        <p className="text-slate-600">
          {isExternalResource
            ? "Enlace externo"
            : `Archivo ${resource.fileExtension?.toUpperCase() || "digital"}`}
        </p>
        <p className="text-sm text-slate-500">{resource.originalFilename}</p>
        {!isExternalResource && (
          <p className="mt-2 text-xs text-slate-500">Vista previa no disponible para este tipo de archivo.</p>
        )}
      </div>
    </div>
  );
}

export function ResourceDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
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
      ...comment,
      authorName: comment.author
        ? `${comment.author.firstName} ${comment.author.lastName}`.trim()
        : "Comentario eliminado",
      dateLabel: formatDate(comment.createdAt),
    }));
  }, [resource]);

  const repliesByParent = useMemo(() => {
    const grouped = new Map<string, UiComment[]>();
    for (const comment of comments) {
      if (!comment.parentId) continue;
      grouped.set(comment.parentId, [...(grouped.get(comment.parentId) || []), comment]);
    }
    return grouped;
  }, [comments]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="h-6 bg-blue-100 rounded w-1/3 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white/85 border border-blue-100 rounded-2xl animate-pulse" />
          <div className="h-96 bg-white/85 border border-blue-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "Recurso no encontrado"}
        </div>
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
      toast.success(resource.storageProvider === "external" ? "Enlace abierto" : "Descarga iniciada");
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
      const { rating, ratingsCount, userRating } = await resourcesApi.rate(resource.id, stars);
      setUserRating(userRating ?? 0);
      setResource({ ...resource, rating, ratingsCount, userRating });
      toast.success(userRating ? "Calificación actualizada" : "Calificación eliminada");
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

  const replaceComment = (item: ResourceComment) => {
    setResource((current) => {
      if (!current) return current;
      return {
        ...current,
        comments: current.comments.map((comment) => (comment.id === item.id ? item : comment)),
      };
    });
  };

  const handleCommentVote = async (comment: UiComment, voteType: 1 | -1) => {
    try {
      const { item } =
        comment.userVote === voteType
          ? await resourcesApi.unvoteComment(resource.id, comment.id)
          : await resourcesApi.voteComment(resource.id, comment.id, voteType);
      replaceComment(item);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo registrar el voto");
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const { item } = await resourcesApi.comment(resource.id, content, parentId);
      setResource((current) => (current ? { ...current, comments: [...current.comments, item] } : current));
      toast.success("Respuesta publicada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo responder");
      throw err;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { item } = await resourcesApi.deleteComment(resource.id, commentId);
      replaceComment(item);
      toast.success("Comentario eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar el comentario");
    }
  };

  const renderComment = (comment: UiComment, depth = 0): JSX.Element => (
    <CommentBlock
      key={comment.id}
      author={comment.authorName}
      authorId={comment.author?.id || null}
      authorPhotoUrl={comment.author?.photoUrl || null}
      date={comment.dateLabel}
      content={comment.content}
      likes={comment.likes}
      dislikes={comment.dislikes}
      userVote={comment.userVote}
      isDeleted={comment.isDeleted}
      canDelete={!comment.isDeleted && profile?.id === comment.userId}
      depth={depth}
      onVote={(vote) => handleCommentVote(comment, vote)}
      onReply={(content) => handleReply(comment.id, content)}
      onDelete={() => handleDeleteComment(comment.id)}
    >
      {(repliesByParent.get(comment.id) || []).map((reply) => renderComment(reply, depth + 1))}
    </CommentBlock>
  );
  const isExternalResource = resource.storageProvider === "external" || resource.fileExtension === "link";

  return (
    <div className="max-w-7xl mx-auto">
      <nav
        aria-label="Ruta de navegacion del recurso"
        className="flex items-center gap-2 text-sm text-slate-600 mb-6 flex-wrap"
      >
        <Link to="/app" className="hover:text-blue-700">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/app/resources" className="hover:text-blue-700">
          Recursos
        </Link>
        <span aria-hidden="true">/</span>
        <span className="line-clamp-1 text-slate-900">{resource.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-2xl border border-blue-100 bg-white/85 p-6 shadow-sm shadow-blue-900/5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="blue">{resource.type}</Badge>
                  {resource.courseCode && (
                    <span className="text-sm text-slate-500">{resource.courseCode}</span>
                  )}
                </div>
                <h1 className="mb-2 text-3xl font-bold text-slate-900">{resource.title}</h1>
                <p className="mb-4 text-lg text-slate-600">{resource.course}</p>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <RatingStars rating={resource.rating} size={18} />
                  <span className="font-semibold text-slate-900">
                    {resource.rating > 0 ? resource.rating.toFixed(1) : "Sin calificaciones"}
                  </span>
                  <span className="text-slate-500">({resource.ratingsCount} calificaciones)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleSaved}
                aria-pressed={isSaved}
                aria-label={isSaved ? `Quitar ${resource.title} de guardados` : `Guardar ${resource.title}`}
                className="rounded-lg p-2 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Bookmark
                  aria-hidden="true"
                  className={`w-5 h-5 transition-colors ${isSaved ? "fill-blue-600 text-blue-600" : "text-slate-400"}`}
                />
              </button>
            </div>

            <ResourcePreview resource={resource} />

            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                variant="primary"
                className="flex min-w-[200px] flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 shadow-lg shadow-blue-600/15 hover:bg-blue-700"
                onClick={handleDownload}
                disabled={downloading}
              >
                {isExternalResource ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                {downloading
                  ? "Generando enlace..."
                  : isExternalResource
                    ? "Abrir link"
                    : "Descargar recurso"}
              </Button>
              <Button
                variant="secondary"
                className="flex items-center gap-2 rounded-full border-blue-100 hover:bg-blue-50"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </Button>
            </div>

            <div className="border-t border-blue-100 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Descripción</h2>
              <p className="mb-4 whitespace-pre-line leading-relaxed text-slate-700">
                {resource.description}
              </p>
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

            <div className="mt-6 border-t border-blue-100 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Calificar este recurso</h2>
              <div className="flex items-center gap-3">
                <RatingStars rating={userRating} size={24} interactive onRate={handleRate} />
                <span className="text-sm text-slate-600">
                  {userRating
                    ? `Calificaste con ${userRating} estrellas`
                    : "Hacé clic en una estrella para calificar"}
                </span>
              </div>
            </div>
          </div>

          <section
            aria-labelledby="resource-comments-title"
            className="rounded-2xl border border-blue-100 bg-white/85 p-6 shadow-sm shadow-blue-900/5"
          >
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare aria-hidden="true" className="w-5 h-5 text-blue-600" />
              <h2 id="resource-comments-title" className="text-lg font-semibold text-slate-900">
                Comentarios ({comments.length})
              </h2>
            </div>

            <form onSubmit={handleComment} className="mb-6">
              <label htmlFor="comment" className="mb-2 block text-sm font-medium text-slate-900">
                Dejá tu comentario
              </label>
              <textarea
                id="comment"
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-blue-100 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="¿Te resultó útil este recurso?"
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="rounded-full bg-blue-600 hover:bg-blue-700"
                  disabled={submittingComment || !commentDraft.trim()}
                >
                  {submittingComment ? "Publicando..." : "Comentar"}
                </Button>
              </div>
            </form>

            {comments.length === 0 ? (
              <p className="text-slate-600">Este recurso aún no tiene comentarios. ¡Sé el primero!</p>
            ) : (
              <div className="space-y-4">
                {comments.filter((comment) => !comment.parentId).map((comment) => renderComment(comment))}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-blue-100 bg-white/85 p-6 shadow-sm shadow-blue-900/5 lg:sticky lg:top-20">
            <h3 className="mb-4 font-semibold text-slate-900">Información del recurso</h3>

            <div className="space-y-4">
              <AuthorRow author={resource.author} authorId={resource.authorId} />
              <InfoRow
                icon={<Calendar className="w-5 h-5 text-blue-400" />}
                label="Fecha de subida"
                value={formatDate(resource.date)}
              />
              {resource.professor && (
                <InfoRow
                  icon={<User className="w-5 h-5 text-blue-400" />}
                  label="Profesor"
                  value={resource.professor}
                />
              )}
              <InfoRow
                icon={<Tag className="w-5 h-5 text-blue-400" />}
                label="Semestre"
                value={resource.academicPeriod?.name || "No especificado"}
              />
              <InfoRow
                icon={<Download className="w-5 h-5 text-blue-400" />}
                label={isExternalResource ? "Aperturas" : "Descargas"}
                value={`${downloads} veces`}
              />
              <InfoRow
                icon={<FileText className="w-5 h-5 text-blue-400" />}
                label={isExternalResource ? "Tipo de recurso" : "Tipo de archivo"}
                value={
                  isExternalResource
                    ? "Link externo"
                    : `${resource.fileExtension?.toUpperCase() || "Archivo"} (${formatFileSize(resource.fileSize)})`
                }
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
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function AuthorRow({ author, authorId }: { author: string; authorId: string }) {
  return (
    <div className="flex items-start gap-3">
      <User className="w-5 h-5 text-blue-400" />
      <div>
        <p className="text-sm text-slate-500">Subido por</p>
        <Link to={`/app/users/${authorId}`} className="font-medium text-blue-600 hover:text-blue-800">
          {author}
        </Link>
      </div>
    </div>
  );
}
