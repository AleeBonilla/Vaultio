import { FileText, Download, Bookmark, Eye } from 'lucide-react';
import { Badge } from './ui/Badge';
import { RatingStars } from './ui/RatingStars';
import { Link } from 'react-router';

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
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  professor?: string;
}

export function ResourceCard({
  id,
  title,
  course,
  type,
  rating,
  downloads,
  views,
  author,
  date,
  difficulty,
  professor,
}: ResourceCardProps) {
  const typeColors: Record<string, 'blue' | 'green' | 'purple' | 'orange' | 'red'> = {
    'Exam': 'red',
    'Examen': 'red',
    'Notes': 'green',
    'Apuntes': 'green',
    'Exercises': 'purple',
    'Ejercicios': 'purple',
    'Code': 'orange',
    'Código': 'orange',
    'Summary': 'blue',
    'Resumen': 'blue',
  };

  const difficultyColors: Record<string, 'green' | 'orange' | 'red'> = {
    'Easy': 'green',
    'Fácil': 'green',
    'Medium': 'orange',
    'Medio': 'orange',
    'Hard': 'red',
    'Difícil': 'red',
  };

  return (
    <article className="bg-white border border-[#E0E0E0] rounded-lg p-5 hover:border-[#0066CC] transition-all h-full flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
            <div className="p-2 bg-[#E3F2FD] rounded-md flex-shrink-0">
              <FileText className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div className="flex-shrink min-w-0">
              <Badge variant={typeColors[type] || 'blue'} className="whitespace-nowrap">{type}</Badge>
            </div>
          </div>
          <button
            type="button"
            aria-label={`Guardar recurso ${title}`}
            className="p-1.5 hover:bg-[#F5F7FA] rounded-md transition-colors flex-shrink-0 ml-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2"
          >
            <Bookmark aria-hidden="true" className="w-4 h-4 text-[#666666] hover:text-[#0066CC] transition-colors" />
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
          <div className="flex items-center gap-1">
            <RatingStars rating={rating} size={14} />
            <span className="text-sm text-[#666666]">({rating.toFixed(1)})</span>
          </div>
          {difficulty && (
            <Badge variant={difficultyColors[difficulty]} className="text-xs">
              {difficulty}
            </Badge>
          )}
        </div>

        {professor && (
          <p className="text-xs text-[#666666] mb-4">Prof. {professor}</p>
        )}

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
