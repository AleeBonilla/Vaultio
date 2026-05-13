import { Mail, BookOpen, Upload, Star, Calendar, Edit } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { Link } from 'react-router';

export function UserProfile() {
  const uploadedResources = [
    {
      id: '1',
      title: 'Examen Final 2025 - Resuelto',
      course: 'Algoritmos y Estructuras de Datos I',
      type: 'Exam',
      rating: 4.8,
      downloads: 234,
      views: 1205,
      author: 'Cristiano Ronaldo',
      date: 'hace 2 semanas',
      difficulty: 'Medium' as const,
    },
    {
      id: '2',
      title: 'Proyecto Final - Sistema de Gestión',
      course: 'Bases de Datos I',
      type: 'Code',
      rating: 4.6,
      downloads: 123,
      views: 567,
      author: 'Cristiano Ronaldo',
      date: 'hace 1 mes',
      difficulty: 'Hard' as const,
    },
  ];

  const recentActivity = [
    { action: 'Subió', resource: 'Examen Final 2025 - Resuelto', date: 'hace 2 semanas' },
    { action: 'Calificó', resource: 'Apuntes de Cálculo II', date: 'hace 3 semanas' },
    { action: 'Comentó en', resource: 'Ejercicios OOP', date: 'hace 1 mes' },
    { action: 'Guardó', resource: 'Resumen de Redes', date: 'hace 1 mes' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 mb-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0066CC] to-[#004A99] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
              CR
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Cristiano Ronaldo</h1>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 text-[#666666]">
                  <Mail className="w-4 h-4" />
                  <span>cristiano.ronaldo@itcr.ac.cr</span>
                </div>
                <span className="text-[#CCCCCC]">•</span>
                <div className="flex items-center gap-2 text-[#666666]">
                  <Calendar className="w-4 h-4" />
                  <span>Se unió en Marzo 2024</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="blue">Ingeniería en Computación</Badge>
                <Badge variant="green">Colaborador Activo</Badge>
              </div>
            </div>
          </div>
          <Link to="/app/profile/edit">
            <Button variant="secondary" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar Perfil
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-[#E5E5E5]">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Upload className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div className="text-2xl font-bold text-[#0066CC]">7</div>
            <div className="text-sm text-[#666666]">Recursos Subidos</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div className="text-2xl font-bold text-[#0066CC]">24</div>
            <div className="text-sm text-[#666666]">Recursos Guardados</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div className="text-2xl font-bold text-[#0066CC]">32</div>
            <div className="text-sm text-[#666666]">Reseñas Dadas</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div className="text-2xl font-bold text-[#0066CC]">4.7</div>
            <div className="text-sm text-[#666666]">Calificación Promedio</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#000000] mb-6">Recursos Subidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {uploadedResources.map((resource) => (
                <ResourceCard key={resource.id} {...resource} />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 sticky top-20 shadow-sm">
            <h2 className="text-xl font-semibold text-[#000000] mb-6">Actividad Reciente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-8 h-8 bg-[#E3F2FD] rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-[#0066CC] rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#000000]">
                      <span className="font-medium">{activity.action}</span>{' '}
                      <span className="text-[#0066CC] hover:underline cursor-pointer">
                        {activity.resource}
                      </span>
                    </p>
                    <p className="text-xs text-[#999999] mt-1">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
