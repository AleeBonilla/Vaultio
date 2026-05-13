import { TrendingUp, Clock, Star, BookOpen, ChevronRight, FileText } from 'lucide-react';
import { SearchBar } from '../../components/ui/SearchBar';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router';

export function Dashboard() {
  const careers = [
    {
      id: '1',
      name: 'Ingeniería en Computación',
      icon: '💻',
      courses: 45,
      resources: 1234,
      color: 'from-blue-400 to-blue-600',
    },
    {
      id: '2',
      name: 'Ingeniería Electrónica',
      icon: '⚡',
      courses: 38,
      resources: 892,
      color: 'from-purple-400 to-purple-600',
    },
    {
      id: '3',
      name: 'Administración de Empresas',
      icon: '📊',
      courses: 42,
      resources: 756,
      color: 'from-green-400 to-green-600',
    },
    {
      id: '4',
      name: 'Ingeniería en Producción Industrial',
      icon: '🏭',
      courses: 40,
      resources: 621,
      color: 'from-orange-400 to-orange-600',
    },
    {
      id: '5',
      name: 'Ingeniería en Diseño Industrial',
      icon: '🎨',
      courses: 36,
      resources: 543,
      color: 'from-pink-400 to-pink-600',
    },
    {
      id: '6',
      name: 'Ingeniería en Construcción',
      icon: '🏗️',
      courses: 39,
      resources: 487,
      color: 'from-yellow-400 to-yellow-600',
    },
  ];

  const recommendedResources = [
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
  ];

  const trendingResources = [
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
    },
  ];

  const recentResources = [
    {
      id: '7',
      title: 'Guía de Estudio - Arquitectura de Computadores',
      course: 'Arquitectura de Computadores',
      type: 'Notes',
      rating: 4.5,
      downloads: 123,
      views: 567,
      author: 'Sofia Hernández',
      date: 'hace 1 día',
    },
    {
      id: '8',
      title: 'Código de Práctica - Árbol Binario de Búsqueda',
      course: 'Algoritmos y Estructuras de Datos II',
      type: 'Code',
      rating: 4.7,
      downloads: 267,
      views: 834,
      author: 'Diego Rojas',
      date: 'hace 2 días',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">¡Bienvenido de nuevo, Cristiano!</h1>
        <p className="text-[#666666]">Descubre y organiza tus materiales de estudio</p>
      </div>

      <div className="mb-10">
        <SearchBar large />
      </div>

      {/* Botón de acceso rápido a todos los recursos */}
      <div className="mb-12">
        <Link 
          to="/app/resources"
          className="bg-gradient-to-r from-[#0066CC] to-[#004A99] text-white rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Explorar Todos los Recursos</h3>
              <p className="text-white/90 text-sm">Descubre más de 2,000 recursos académicos disponibles</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#0066CC]" />
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Explorar por Carrera</h2>
          </div>
          <Link to="/app/courses" className="text-[#0066CC] hover:text-[#004A99] font-medium transition-colors">
            Ver todas
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {careers.map((career) => (
            <Link
              key={career.id}
              to={`/app/courses/${career.id}`}
              className="bg-white border border-[#E0E0E0] rounded-lg p-6 hover:border-[#0066CC] transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0066CC] rounded-md flex items-center justify-center text-2xl flex-shrink-0">
                  {career.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#0066CC] transition-colors">
                    {career.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-[#666666]">
                    <span>{career.courses} cursos</span>
                    <span>•</span>
                    <span>{career.resources} recursos</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#999999] group-hover:text-[#0066CC] transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Recomendados para ti</h2>
          <a href="/app/resources" className="text-[#0066CC] hover:text-[#004A99] font-medium transition-colors">
            Ver todos
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedResources.map((resource) => (
            <ResourceCard key={resource.id} {...resource} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-6 h-6 text-[#0066CC]" />
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Subidos recientemente</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentResources.map((resource) => (
            <ResourceCard key={resource.id} {...resource} />
          ))}
        </div>
      </section>
    </div>
  );
}
