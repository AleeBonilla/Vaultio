import { Bookmark, Calendar, Download, FileText, MessageSquare, Share2, Tag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { CommentBlock } from '../../components/comments/CommentBlock';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RatingStars } from '../../components/ui/RatingStars';
import { resourcesApi, type ResourceDetail as ResourceDetailData } from '../../lib/api';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatFileSize(value?: number) {
  if (!value) return 'No disponible';
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function ResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState<ResourceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadResource() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const loadedResource = await resourcesApi.detail(id);
        if (active) setResource(loadedResource);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el recurso');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResource();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-gray-600">Cargando recurso...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'Recurso no encontrado'}
        </div>
      </div>
    );
  }

  const comments = resource.comments.map((comment) => ({
    author: comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'Usuario',
    date: formatDate(comment.createdAt),
    rating: 0,
    comment: comment.content,
    helpful: 0,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link to="/app" className="hover:text-[#0066CC]">Inicio</Link>
        <span>/</span>
        <Link to="/app/resources" className="hover:text-[#0066CC]">Recursos</Link>
        <span>/</span>
        <span className="text-gray-900">{resource.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="blue">{resource.type}</Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {resource.title}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {resource.course}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <RatingStars rating={resource.rating} size={18} />
                  <span className="font-semibold text-gray-900">{resource.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({resource.ratingsCount} calificaciones)</span>
                </div>
              </div>
              <button type="button" aria-label={`Guardar recurso ${resource.title}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bookmark className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="bg-gray-100 rounded-lg aspect-[4/3] flex items-center justify-center mb-6">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Archivo {resource.fileExtension?.toUpperCase() || 'digital'}</p>
                <p className="text-sm text-gray-500">{resource.originalFilename}</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <Button
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => window.open(resource.fileUrl, '_blank', 'noopener,noreferrer')}
              >
                <Download className="w-4 h-4" />
                Descargar Recurso
              </Button>
              <Button variant="secondary" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Compartir
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="font-semibold text-lg text-gray-900 mb-3">Descripcion</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {resource.description}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-lg text-gray-900">
                Resenas y Comentarios ({comments.length})
              </h2>
            </div>

            {comments.length === 0 ? (
              <p className="text-gray-600">Este recurso aun no tiene comentarios.</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, idx) => (
                  <CommentBlock key={idx} {...comment} />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Informacion del Recurso</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Subido por</p>
                  <p className="font-medium text-gray-900">{resource.author}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de subida</p>
                  <p className="font-medium text-gray-900">{formatDate(resource.date)}</p>
                </div>
              </div>

              {resource.professor && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Profesor</p>
                    <p className="font-medium text-gray-900">{resource.professor}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Semestre</p>
                  <p className="font-medium text-gray-900">{resource.academicPeriod?.name || 'No especificado'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Descargas</p>
                  <p className="font-medium text-gray-900">{resource.downloads} veces</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tipo de archivo</p>
                  <p className="font-medium text-gray-900">
                    {resource.fileExtension?.toUpperCase() || 'Archivo'} ({formatFileSize(resource.fileSize)})
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Etiquetas</h4>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="gray">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
