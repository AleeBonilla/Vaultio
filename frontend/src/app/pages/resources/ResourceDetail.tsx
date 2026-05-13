import { Download, Bookmark, Share2, FileText, Calendar, User, Tag, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RatingStars } from '../../components/ui/RatingStars';
import { CommentBlock } from '../../components/comments/CommentBlock';
import { Link } from 'react-router';

export function ResourceDetail() {
  const comments = [
    {
      author: 'María González',
      date: 'hace 2 días',
      rating: 5,
      comment: 'Excelente material! Me ayudó muchísimo para el final. Los ejercicios están muy bien explicados y las soluciones son claras.',
      helpful: 24,
    },
    {
      author: 'Carlos Mora',
      date: 'hace 1 semana',
      rating: 4,
      comment: 'Muy buen recurso, aunque hubiera preferido más ejemplos prácticos. De todas formas, lo recomiendo.',
      helpful: 12,
    },
    {
      author: 'Ana Jiménez',
      date: 'hace 2 semanas',
      rating: 5,
      comment: 'Perfecto para estudiar. Los temas están bien organizados y la explicación es clara. ¡Gracias por compartir!',
      helpful: 18,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link to="/app" className="hover:text-[#0066CC]">Inicio</Link>
        <span>/</span>
        <Link to="/app/resources" className="hover:text-[#0066CC]">Recursos</Link>
        <span>/</span>
        <span className="text-gray-900">Examen Final 2025</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="blue">Examen</Badge>
                  <Badge variant="orange">Medio</Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Examen Final 2025 - Resuelto
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Algoritmos y Estructuras de Datos I
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <RatingStars rating={4.8} size={18} />
                  <span className="font-semibold text-gray-900">4.8</span>
                  <span className="text-gray-500">(127 calificaciones)</span>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bookmark className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="bg-gray-100 rounded-lg aspect-[4/3] flex items-center justify-center mb-6">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Vista Previa PDF</p>
                <p className="text-sm text-gray-500">24 páginas</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <Button variant="primary" className="flex-1 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Descargar Recurso
              </Button>
              <Button variant="secondary" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Compartir
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="font-semibold text-lg text-gray-900 mb-3">Descripción</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Examen final del curso de Algoritmos y Estructuras de Datos I del primer semestre de 2025. Incluye soluciones detalladas para todos los ejercicios con explicaciones paso a paso.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Los temas cubiertos incluyen: análisis de complejidad, estructuras de datos lineales (listas, pilas, colas), árboles binarios, y algoritmos de ordenamiento. Ideal para prepararse para el examen final.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-5 h-5 text-[#0066CC]" />
                <span className="font-medium text-gray-900">¿Te ayudó este recurso?</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-semibold text-green-600">89%</span> de los estudiantes lo encontraron útil
              </p>
              <div className="flex gap-3">
                <Button variant="primary" size="sm">Sí, me ayudó</Button>
                <Button variant="secondary" size="sm">No mucho</Button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-lg text-gray-900">
                Reseñas y Comentarios ({comments.length})
              </h2>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Agregar tu reseña</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu calificación
                </label>
                <RatingStars rating={0} interactive onRate={(rating) => console.log(rating)} size={24} />
              </div>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] resize-none"
                rows={4}
                placeholder="Comparte tu experiencia con este recurso..."
              />
              <div className="flex justify-end mt-3">
                <Button variant="primary" size="sm">Publicar Reseña</Button>
              </div>
            </div>

            <div className="space-y-4">
              {comments.map((comment, idx) => (
                <CommentBlock key={idx} {...comment} />
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Información del Recurso</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Subido por</p>
                  <p className="font-medium text-gray-900">María González</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de subida</p>
                  <p className="font-medium text-gray-900">30 de Marzo, 2026</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Profesor</p>
                  <p className="font-medium text-gray-900">Dr. Ramírez</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Semestre</p>
                  <p className="font-medium text-gray-900">I Semestre 2025</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Descargas</p>
                  <p className="font-medium text-gray-900">234 veces</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tipo de archivo</p>
                  <p className="font-medium text-gray-900">PDF (2.4 MB)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Etiquetas</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="blue">Algoritmos</Badge>
                <Badge variant="green">Examen</Badge>
                <Badge variant="purple">Final</Badge>
                <Badge variant="gray">2025</Badge>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Recursos Relacionados</h4>
              <div className="space-y-3">
                <Link to="/app/resources/2" className="block p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <p className="font-medium text-sm text-gray-900 mb-1">Examen Parcial 1 - 2025</p>
                  <p className="text-xs text-gray-500">234 descargas</p>
                </Link>
                <Link to="/app/resources/3" className="block p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <p className="font-medium text-sm text-gray-900 mb-1">Guía de Estudio Final</p>
                  <p className="text-xs text-gray-500">189 descargas</p>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
