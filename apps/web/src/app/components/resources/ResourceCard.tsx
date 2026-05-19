import { Bookmark, Download, Edit3, Eye, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { resourcesApi } from "../../lib/api";
import { Badge } from "../ui/Badge";
import { RatingStars } from "../ui/RatingStars";
import { ResourceTypeIcon } from "./ResourceTypeIcon";

interface ResourceCardProps {
  id: string;
  title: string;
  course: string;
  type: string;
  rating: number;
  downloads: number;
  views: number;
  author: string;
  authorId?: string;
  date: string;
  professor?: string | null;
  fileExtension?: string;
  saved?: boolean;
  canManage?: boolean;
  onSavedChange?: (saved: boolean) => void;
  onDelete?: () => void;
}

const TYPE_COLORS: Record<string, "blue" | "green" | "purple" | "orange" | "red"> = {
  Examen: "red",
  "Examenes anteriores": "red",
  Apuntes: "green",
  Ejercicios: "purple",
  "Ejercicios resueltos": "purple",
  Codigo: "orange",
  "Codigo fuente": "orange",
  Resumen: "blue",
  Resumenes: "blue",
};

export function ResourceCard({
  id,
  title,
  course,
  type,
  rating,
  downloads,
  views,
  author,
  authorId,
  date,
  professor,
  fileExtension,
  saved = false,
  canManage = false,
  onSavedChange,
  onDelete,
}: ResourceCardProps) {
  const titleId = useId();
  const [isSaved, setIsSaved] = useState(saved);
  const [pending, setPending] = useState(false);

  const handleToggleSaved = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    setPending(true);
    const next = !isSaved;
    setIsSaved(next);
    try {
      if (next) await resourcesApi.save(id);
      else await resourcesApi.unsave(id);
      toast.success(next ? "Recurso guardado" : "Recurso retirado de guardados");
      onSavedChange?.(next);
    } catch (err) {
      setIsSaved(!next);
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar el guardado");
    } finally {
      setPending(false);
    }
  };

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col rounded-2xl border border-blue-100 bg-white/85 p-5 shadow-sm shadow-blue-900/5 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          <ResourceTypeIcon type={type} fileExtension={fileExtension} className="flex-shrink-0" />
          <Badge variant={TYPE_COLORS[type] || "blue"} className="whitespace-nowrap">
            {type}
          </Badge>
        </div>
        <button
          type="button"
          onClick={handleToggleSaved}
          disabled={pending}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Quitar ${title} de guardados` : `Guardar ${title}`}
          className="flex-shrink-0 rounded-md p-1.5 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          <Bookmark
            aria-hidden="true"
            className={`w-4 h-4 transition-colors ${
              isSaved ? "fill-blue-600 text-blue-600" : "text-slate-500 hover:text-blue-600"
            }`}
          />
        </button>
      </div>

      <h3 id={titleId} className="mb-2 line-clamp-2 min-h-[2.5rem] font-semibold text-slate-900">
        <Link
          to={`/app/resources/${id}`}
          aria-label={`Abrir recurso ${title}`}
          className="rounded-sm hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {title}
        </Link>
      </h3>
      <p className="mb-4 line-clamp-1 text-sm text-slate-600">{course}</p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <RatingStars rating={rating} size={14} />
        <span className="text-sm text-slate-600">
          {rating > 0 ? rating.toFixed(1) : "Sin calificaciones"}
        </span>
      </div>

      <div className="mb-4 space-y-1 text-xs text-slate-600">
        <p>
          Por{" "}
          {authorId ? (
            <Link to={`/app/users/${authorId}`} className="font-medium text-blue-600 hover:text-blue-800">
              {author}
            </Link>
          ) : (
            <span>{author}</span>
          )}
        </p>
        {professor && <p>Prof. {professor}</p>}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-blue-100 pt-4">
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1" aria-label={`${downloads} descargas`}>
            <Download aria-hidden="true" className="w-3.5 h-3.5" />
            {downloads}
          </span>
          <span className="flex items-center gap-1" aria-label={`${views} vistas`}>
            <Eye aria-hidden="true" className="w-3.5 h-3.5" />
            {views}
          </span>
        </div>
        <span className="text-xs text-slate-400">{date}</span>
      </div>

      {canManage && (
        <div className="mt-4 flex gap-2 border-t border-blue-100 pt-4">
          <Link
            to={`/app/resources/${id}/edit`}
            aria-label={`Editar recurso ${title}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            <Edit3 aria-hidden="true" className="h-4 w-4" />
            Editar
          </Link>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Eliminar recurso ${title}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}
