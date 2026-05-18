import { Bookmark, Download, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { resourcesApi } from "../../lib/api";
import { Badge } from "../ui/Badge";
import { RatingStars } from "../ui/RatingStars";

interface ResourceCardProps {
  id: string;
  title: string;
  course: string;
  type: string;
  rating: number;
  downloads: number;
  views: number;
  author: string;
  date: string;
  professor?: string | null;
  saved?: boolean;
  onSavedChange?: (saved: boolean) => void;
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
  date,
  professor,
  saved = false,
  onSavedChange,
}: ResourceCardProps) {
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
    <article className="bg-white border border-[#E0E0E0] rounded-lg p-5 hover:border-[#0066CC] hover:shadow-sm transition-all h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          <div className="p-2 bg-[#E3F2FD] rounded-md flex-shrink-0">
            <FileText aria-hidden="true" className="w-5 h-5 text-[#0066CC]" />
          </div>
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
          className="p-1.5 hover:bg-[#F5F7FA] rounded-md transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2 disabled:opacity-50"
        >
          <Bookmark
            aria-hidden="true"
            className={`w-4 h-4 transition-colors ${
              isSaved ? "fill-[#0066CC] text-[#0066CC]" : "text-[#666666] hover:text-[#0066CC]"
            }`}
          />
        </button>
      </div>

      <h3 className="font-semibold text-[#1a1a1a] mb-2 line-clamp-2 min-h-[2.5rem]">
        <Link
          to={`/app/resources/${id}`}
          className="rounded-sm hover:text-[#0066CC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2"
        >
          {title}
        </Link>
      </h3>
      <p className="text-sm text-[#666666] mb-4 line-clamp-1">{course}</p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <RatingStars rating={rating} size={14} />
        <span className="text-sm text-[#666666]">
          {rating > 0 ? rating.toFixed(1) : "Sin calificaciones"}
        </span>
      </div>

      {professor && <p className="text-xs text-[#666666] mb-4">Prof. {professor}</p>}

      <div className="flex items-center justify-between pt-4 border-t border-[#E0E0E0] mt-auto">
        <div className="flex items-center gap-4 text-xs text-[#666666]">
          <span className="flex items-center gap-1">
            <Download aria-hidden="true" className="w-3.5 h-3.5" />
            {downloads}
          </span>
          <span className="flex items-center gap-1">
            <Eye aria-hidden="true" className="w-3.5 h-3.5" />
            {views}
          </span>
        </div>
        <span className="text-xs text-[#999999]">{date}</span>
      </div>
    </article>
  );
}
