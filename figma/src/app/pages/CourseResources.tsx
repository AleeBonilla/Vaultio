import { SlidersHorizontal, Grid, List, ChevronRight, ArrowLeft, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ResourceCard } from '../components/ResourceCard';
import { FilterPanel } from '../components/FilterPanel';
import { Button } from '../components/ui/Button';

export function CourseResources() {
  const { careerId, courseId } = useParams();
  const [showFilters, setShowFilters] = useState(true);

  // Mock data - en producción vendría de una API
  const courseData = {
    name: 'Algoritmos y Estructuras de Datos I',
    professor: 'Dr. Ramírez',
    careerName: 'Ingeniería en Computación',
  };

  const filterSections = [
    {
      title: 'Tipo de Recurso',
      type: 'checkbox' as const,
      options: [
        { label: 'Exámenes', value: 'exam', count: 18 },
        { label: 'Apuntes', value: 'notes', count: 25 },
        { label: 'Ejercicios', value: 'exercises', count: 21 },
        { label: 'Código', value: 'code', count: 14 },
        { label: 'Resúmenes', value: 'summary', count: 12 },
      ],
    },
    {
      title: 'Dificultad',
      type: 'radio' as const,
      options: [
        { label: 'Todos los Niveles', value: 'all' },
        { label: 'Fácil', value: 'easy', count: 32 },
        { label: 'Medio', value: 'medium', count: 41 },
        { label: 'Difícil', value: 'hard', count: 17 },
      ],
    },
    {
      title: 'Semestre',
      type: 'checkbox' as const,
      options: [
        { label: 'I Semestre 2026', value: '2026-1', count: 45 },
        { label: 'II Semestre 2025', value: '2025-2', count: 38 },
        { label: 'I Semestre 2025', value: '2025-1', count: 27 },
      ],
    },
    {
      title: 'Calificación',
      type: 'radio' as const,
      options: [
        { label: '4+ estrellas', value: '4+', count: 56 },
        { label: '3+ estrellas', value: '3+', count: 78 },
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
      id: '3',
      title: 'Ejercicios Prácticos - Ordenamiento',
      course: 'Algoritmos y Estructuras de Datos I',
      type: 'Exercises',
      rating: 4.7,
      downloads: 432,
      views: 1876,
      author: 'Ana Jiménez',
      date: 'hace 3 días',
      difficulty: 'Easy' as const,
      professor: 'Dr. Ramírez',
    },
    {
      id: '7',
      title: 'Apuntes Completos - Árboles Binarios',
      course: 'Algoritmos y Estructuras de Datos I',
      type: 'Notes',
      rating: 4.9,
      downloads: 567,
      views: 2341,
      author: 'Carlos Mora',
      date: 'hace 5 días',
      difficulty: 'Medium' as const,
      professor: 'Dr. Ramírez',
    },
    {
      id: '8',
      title: 'Código de Práctica - Listas Enlazadas',
      course: 'Algoritmos y Estructuras de Datos I',
      type: 'Code',
      rating: 4.6,
      downloads: 189,
      views: 945,
      author: 'Diego Rojas',
      date: 'hace 1 semana',
      difficulty: 'Medium' as const,
      professor: 'Dr. Ramírez',
    },
    {
      id: '9',
      title: 'Resumen - Complejidad Algorítmica',
      course: 'Algoritmos y Estructuras de Datos I',
      type: 'Summary',
      rating: 4.8,
      downloads: 378,
      views: 1654,
      author: 'Laura Solís',
      date: 'hace 1 semana',
      difficulty: 'Easy' as const,
      professor: 'Dr. Ramírez',
    },
    {
      id: '10',
      title: 'Examen Parcial 1 - Solución Detallada',
      course: 'Algoritmos y Estructuras de Datos I',
      type: 'Exam',
      rating: 4.9,
      downloads: 421,
      views: 1987,
      author: 'Roberto Méndez',
      date: 'hace 2 semanas',
      difficulty: 'Hard' as const,
      professor: 'Dr. Ramírez',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-sm text-[#666666] mb-4">
          <Link to="/app" className="hover:text-[#0066CC] transition-colors">Inicio</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/app/courses" className="hover:text-[#0066CC] transition-colors">Carreras</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/app/courses/${careerId}`} className="hover:text-[#0066CC] transition-colors">
            {courseData.careerName}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1a1a1a] font-medium">{courseData.name}</span>
        </nav>

        <Link
          to={`/app/courses/${careerId}`}
          className="inline-flex items-center gap-2 text-[#0066CC] hover:text-[#004A99] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a {courseData.careerName}
        </Link>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-[#E3F2FD] rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8 text-[#0066CC]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">{courseData.name}</h1>
            <p className="text-[#666666]">Prof. {courseData.professor} • 90 recursos disponibles</p>
          </div>
        </div>
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
          <select className="px-4 py-2.5 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC] bg-white text-[#1a1a1a] transition-all">
            <option>Más Recientes</option>
            <option>Mejor Calificados</option>
            <option>Más Descargados</option>
            <option>Más Vistos</option>
          </select>

          <div className="flex items-center gap-1 border border-[#E0E0E0] rounded-lg p-1 bg-white">
            <button className="p-2 bg-[#E3F2FD] text-[#0066CC] rounded-lg transition-colors">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#E3F2FD]/50 text-[#666666] rounded-lg transition-colors">
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
              <Button variant="primary" size="sm">1</Button>
              <Button variant="ghost" size="sm">2</Button>
              <Button variant="ghost" size="sm">3</Button>
              <Button variant="secondary" size="sm">Siguiente</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
