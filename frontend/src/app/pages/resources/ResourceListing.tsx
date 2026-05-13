import { SlidersHorizontal, Grid, List } from 'lucide-react';
import { useState } from 'react';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { FilterPanel } from '../../components/filters/FilterPanel';
import { Button } from '../../components/ui/Button';

export function ResourceListing() {
  const [showFilters, setShowFilters] = useState(true);

  const filterSections = [
    {
      title: 'Tipo de Recurso',
      type: 'checkbox' as const,
      options: [
        { label: 'Exámenes', value: 'exam', count: 45 },
        { label: 'Apuntes', value: 'notes', count: 67 },
        { label: 'Ejercicios', value: 'exercises', count: 52 },
        { label: 'Código', value: 'code', count: 38 },
        { label: 'Resúmenes', value: 'summary', count: 32 },
      ],
    },
    {
      title: 'Dificultad',
      type: 'radio' as const,
      options: [
        { label: 'Todos los Niveles', value: 'all' },
        { label: 'Fácil', value: 'easy', count: 89 },
        { label: 'Medio', value: 'medium', count: 112 },
        { label: 'Difícil', value: 'hard', count: 33 },
      ],
    },
    {
      title: 'Profesor',
      type: 'checkbox' as const,
      options: [
        { label: 'Dr. Ramírez', value: 'ramirez', count: 34 },
        { label: 'Dra. Fernández', value: 'fernandez', count: 28 },
        { label: 'Ing. Castro', value: 'castro', count: 41 },
        { label: 'Dr. González', value: 'gonzalez', count: 19 },
      ],
    },
    {
      title: 'Calificación',
      type: 'radio' as const,
      options: [
        { label: '4+ estrellas', value: '4+', count: 145 },
        { label: '3+ estrellas', value: '3+', count: 198 },
        { label: 'Todas', value: 'all' },
      ],
    },
  ];

  const resources = [
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#000000] mb-2">Todos los Recursos</h1>
        <p className="text-[#333333]">234 recursos encontrados</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>

        <div className="flex items-center gap-4">
          <select className="px-4 py-2.5 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] bg-white text-[#333333] transition-all shadow-sm">
            <option>Más Recientes</option>
            <option>Mejor Calificados</option>
            <option>Más Descargados</option>
            <option>Más Vistos</option>
          </select>

          <div className="flex items-center gap-1 border border-[#E5E5E5] rounded-lg p-1 bg-white shadow-sm">
            <button className="p-2 bg-[#FDECEA] text-[#CC0000] rounded-lg transition-colors">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#FDECEA]/50 text-[#666666] rounded-lg transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {showFilters && (
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-20">
              <FilterPanel sections={filterSections} />
            </div>
          </aside>
        )}

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">Anterior</Button>
              <Button variant="ghost" size="sm">1</Button>
              <Button variant="primary" size="sm">2</Button>
              <Button variant="ghost" size="sm">3</Button>
              <Button variant="ghost" size="sm">4</Button>
              <Button variant="secondary" size="sm">Siguiente</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
