import { ChevronRight, BookOpen, FileText, Code, Brain, FileCheck, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';

export function CourseNavigation() {
  const { careerId } = useParams();

  const allCareers = [
    {
      id: '1',
      name: 'Ingeniería en Computación',
      icon: '💻',
      courses: [
        { id: 'c1', name: 'Algoritmos y Estructuras de Datos I', resources: 234, professor: 'Dr. Ramírez' },
        { id: 'c2', name: 'Programación Orientada a Objetos', resources: 189, professor: 'Ing. Castro' },
        { id: 'c3', name: 'Bases de Datos I', resources: 156, professor: 'Dr. González' },
        { id: 'c4', name: 'Redes de Computadoras', resources: 143, professor: 'Dr. Ramírez' },
        { id: 'c5', name: 'Arquitectura de Computadores', resources: 121, professor: 'Ing. López' },
        { id: 'c6', name: 'Algoritmos y Estructuras de Datos II', resources: 198, professor: 'Dr. Ramírez' },
        { id: 'c7', name: 'Sistemas Op', resources: 167, professor: 'Dra. Martínez' },
      ],
    },
    {
      id: '2',
      name: 'Ingeniería Electrónica',
      icon: '⚡',
      courses: [
        { id: 'c8', name: 'Circuitos Eléctricos I', resources: 176, professor: 'Dr. Herrera' },
        { id: 'c9', name: 'Sistemas Digitales', resources: 145, professor: 'Ing. Solís' },
        { id: 'c10', name: 'Electrónica Analógica', resources: 134, professor: 'Dr. Herrera' },
        { id: 'c11', name: 'Microprocesadores', resources: 112, professor: 'Dra. Vargas' },
      ],
    },
    {
      id: '3',
      name: 'Administración de Empresas',
      icon: '📊',
      courses: [
        { id: 'c12', name: 'Contabilidad Financiera', resources: 156, professor: 'Dra. Rojas' },
        { id: 'c13', name: 'Mercadotecnia', resources: 143, professor: 'Ing. Fernández' },
        { id: 'c14', name: 'Administración de Recursos Humanos', resources: 128, professor: 'Dra. Rojas' },
        { id: 'c15', name: 'Finanzas Corporativas', resources: 134, professor: 'Dr. Mora' },
      ],
    },
    {
      id: '4',
      name: 'Ingeniería en Producción Industrial',
      icon: '🏭',
      courses: [
        { id: 'c16', name: 'Gestión de Producción', resources: 145, professor: 'Ing. Castro' },
        { id: 'c17', name: 'Control de Calidad', resources: 123, professor: 'Dra. Méndez' },
        { id: 'c18', name: 'Logística Industrial', resources: 109, professor: 'Ing. Castro' },
      ],
    },
    {
      id: '5',
      name: 'Ingeniería en Diseño Industrial',
      icon: '🎨',
      courses: [
        { id: 'c19', name: 'Diseño de Productos', resources: 98, professor: 'Arq. Jiménez' },
        { id: 'c20', name: 'Materiales y Procesos', resources: 87, professor: 'Ing. Torres' },
        { id: 'c21', name: 'Ergonomía', resources: 76, professor: 'Arq. Jiménez' },
      ],
    },
    {
      id: '6',
      name: 'Ingeniería en Construcción',
      icon: '🏗️',
      courses: [
        { id: 'c22', name: 'Estructuras de Concreto', resources: 134, professor: 'Ing. Pérez' },
        { id: 'c23', name: 'Geotecnia', resources: 112, professor: 'Dr. Sánchez' },
        { id: 'c24', name: 'Administración de Proyectos', resources: 98, professor: 'Ing. Pérez' },
      ],
    },
  ];

  const selectedCareer = allCareers.find(career => career.id === careerId);

  if (!careerId || !selectedCareer) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Explorar por Carrera</h1>
          <p className="text-[#666666]">Selecciona tu carrera para ver los cursos disponibles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCareers.map((career) => (
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
                    <span>{career.courses.length} cursos</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#999999] group-hover:text-[#0066CC] transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const resourceCategories = [
    { icon: FileText, name: 'Exámenes', count: 45, color: 'blue' },
    { icon: BookOpen, name: 'Apuntes', count: 67, color: 'green' },
    { icon: Brain, name: 'Ejercicios', count: 52, color: 'purple' },
    { icon: Code, name: 'Código', count: 38, color: 'orange' },
    { icon: FileCheck, name: 'Resúmenes', count: 32, color: 'blue' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-sm text-[#666666] mb-4">
          <Link to="/app" className="hover:text-[#0066CC] transition-colors">Inicio</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/app/courses" className="hover:text-[#0066CC] transition-colors">Carreras</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1a1a1a] font-medium">{selectedCareer.name}</span>
        </nav>

        <Link
          to="/app/courses"
          className="inline-flex items-center gap-2 text-[#0066CC] hover:text-[#004A99] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Carreras
        </Link>

        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-[#0066CC] rounded-md flex items-center justify-center text-2xl">
            {selectedCareer.icon}
          </div>
          <h1 className="text-3xl font-bold text-[#000000]">{selectedCareer.name}</h1>
        </div>
        <p className="text-[#333333]">Selecciona un curso para explorar sus recursos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedCareer.courses.map((course) => (
          <Link
            key={course.id}
            to={`/app/courses/${careerId}/${course.id}`}
            className="bg-white border border-[#E0E0E0] rounded-lg p-6 hover:border-[#0066CC] transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-[#E3F2FD] rounded-md flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-[#0066CC]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1a1a1a] group-hover:text-[#0066CC] transition-colors mb-1">
                    {course.name}
                  </h3>
                  <p className="text-sm text-[#666666]">Prof. {course.professor}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#999999] group-hover:text-[#0066CC] transition-colors flex-shrink-0 mt-1" />
            </div>
            <div className="pt-4 border-t border-[#E0E0E0]">
              <p className="text-sm text-[#333333] font-medium">{course.resources} recursos disponibles</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
