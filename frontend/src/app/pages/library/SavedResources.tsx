import { Bookmark, Trash2 } from 'lucide-react';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { Button } from '../../components/ui/Button';

export function SavedResources() {
  const savedResources = [
    {
      id: '1',
      title: 'Examen Final 2025 - Resuelto',
      course: 'Algoritmos y Estructuras de Datos I',
      type: 'Exam',
      rating: 4.8,
      downloads: 234,
      views: 1205,
      author: 'María González',
      date: 'hace 2 días',
      difficulty: 'Medium' as const,
      professor: 'Dr. Ramírez',
    },
    {
      id: '2',
      title: 'Apuntes Completos de Cálculo II',
      course: 'Cálculo Diferencial e Integral II',
      type: 'Notes',
      rating: 4.9,
      downloads: 567,
      views: 2341,
      author: 'Carlos Mora',
      date: 'hace 1 semana',
      difficulty: 'Hard' as const,
      professor: 'Dra. Fernández',
    },
    {
      id: '3',
      title: 'Ejercicios Prácticos OOP en Java',
      course: 'Programación Orientada a Objetos',
      type: 'Exercises',
      rating: 4.7,
      downloads: 432,
      views: 1876,
      author: 'Ana Jiménez',
      date: 'hace 3 días',
      difficulty: 'Easy' as const,
      professor: 'Ing. Castro',
    },
    {
      id: '4',
      title: 'Proyecto Final - Sistema de Inventario',
      course: 'Bases de Datos I',
      type: 'Code',
      rating: 4.6,
      downloads: 189,
      views: 945,
      author: 'Pedro Vargas',
      date: 'hace 5 días',
      difficulty: 'Medium' as const,
      professor: 'Dr. González',
    },
    {
      id: '5',
      title: 'Resumen Completo - Redes de Computadoras',
      course: 'Redes de Computadoras',
      type: 'Summary',
      rating: 4.8,
      downloads: 378,
      views: 1654,
      author: 'Laura Solís',
      date: 'hace 1 semana',
      difficulty: 'Medium' as const,
      professor: 'Dr. Ramírez',
    },
    {
      id: '6',
      title: 'Examen Parcial 1 - Solución Detallada',
      course: 'Física para Ingenieros',
      type: 'Exam',
      rating: 4.9,
      downloads: 421,
      views: 1987,
      author: 'Roberto Méndez',
      date: 'hace 4 días',
      difficulty: 'Hard' as const,
      professor: 'Dra. Fernández',
    },
  ];

  const collections = [
    { name: 'Exámenes Finales', count: 8 },
    { name: 'Estructuras de Datos', count: 5 },
    { name: 'Recursos de Cálculo', count: 12 },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Recursos Guardados</h1>
        <p className="text-[#666666]">Tus materiales de estudio marcados en un solo lugar</p>
      </div>

      <div className="flex gap-6">
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 sticky top-20 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Bookmark className="w-5 h-5 text-[#0066CC]" />
              <h2 className="font-semibold text-[#1a1a1a]">Colecciones</h2>
            </div>

            <div className="space-y-1 mb-6">
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#E3F2FD] text-[#0066CC] font-semibold">
                <span>Todos los Guardados</span>
                <span className="text-sm">24</span>
              </button>
              {collections.map((collection) => (
                <button
                  key={collection.name}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#E3F2FD]/50 text-[#1a1a1a] transition-colors"
                >
                  <span>{collection.name}</span>
                  <span className="text-sm text-[#666666]">{collection.count}</span>
                </button>
              ))}
            </div>

            <Button variant="secondary" size="sm" className="w-full">
              + Nueva Colección
            </Button>

            <div className="mt-6 pt-6 border-t border-[#E0E0E0]">
              <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Limpiar Todo</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-[#666666]">Mostrando {savedResources.length} recursos</span>
            </div>
            <select className="px-4 py-2.5 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC] bg-white text-[#1a1a1a]">
              <option>Guardados Recientemente</option>
              <option>Alfabético</option>
              <option>Más Descargados</option>
              <option>Mejor Calificados</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResources.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
