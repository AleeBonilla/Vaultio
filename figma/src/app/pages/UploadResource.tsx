import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export function UploadResource() {
  const [step, setStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">¡Recurso Subido!</h1>
          <p className="text-[#666666] mb-8">
            Tu recurso ha sido subido exitosamente y ahora está disponible para otros estudiantes.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Subir Otro
            </Button>
            <Button variant="primary" onClick={() => window.location.href = '/app'}>
              Ir al Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Subir Recurso</h1>
        <p className="text-[#666666]">Comparte tus materiales de estudio con otros estudiantes</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  step >= s ? 'bg-[#0066CC] text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              <span className={`font-medium ${step >= s ? 'text-[#1a1a1a]' : 'text-gray-500'}`}>
                {s === 1 ? 'Subir Archivo' : 'Detalles del Recurso'}
              </span>
              {s < 2 && <div className="w-16 h-0.5 bg-gray-300 ml-2" />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E0E0E0] rounded-lg p-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6">Sube tu archivo</h2>

            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-[#0066CC] bg-[#E3F2FD]'
                  : 'border-gray-300 hover:border-[#0066CC]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-[#E3F2FD] rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-[#0066CC]" />
              </div>
              <h3 className="font-medium text-[#1a1a1a] mb-2">
                Arrastra y suelta tu archivo aquí
              </h3>
              <p className="text-sm text-gray-500 mb-4">o</p>
              <Button variant="secondary">Seleccionar Archivos</Button>
              <p className="text-xs text-gray-500 mt-4">
                Formatos soportados: PDF, DOCX, PPTX, ZIP (Máximo 50MB)
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FileText className="w-10 h-10 text-[#0066CC]" />
                <div className="flex-1">
                  <p className="font-medium text-[#1a1a1a]">examen_final_algoritmos.pdf</p>
                  <p className="text-sm text-gray-500">2.4 MB</p>
                </div>
                <Badge variant="green">Listo</Badge>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="primary" onClick={() => setStep(2)}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6">Detalles del Recurso</h2>

            <div className="space-y-4">
              <Input label="Título" placeholder="ej. Examen Final 2025 - Resuelto" required />

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Descripción
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] resize-none"
                  rows={4}
                  placeholder="Describe qué contiene este recurso y cómo puede ayudar a otros estudiantes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Curso
                </label>
                <select className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                  <option>Selecciona un curso</option>
                  <option>Algoritmos y Estructuras de Datos I</option>
                  <option>Programación Orientada a Objetos</option>
                  <option>Bases de Datos I</option>
                  <option>Cálculo Diferencial e Integral II</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Tipo de Recurso
                </label>
                <select className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                  <option>Selecciona el tipo</option>
                  <option>Examen</option>
                  <option>Apuntes</option>
                  <option>Ejercicios</option>
                  <option>Código</option>
                  <option>Resumen</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Profesor
                  </label>
                  <select className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                    <option>Selecciona el profesor</option>
                    <option>Dr. Ramírez</option>
                    <option>Dra. Fernández</option>
                    <option>Ing. Castro</option>
                    <option>Dr. González</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Dificultad
                  </label>
                  <select className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                    <option>Selecciona la dificultad</option>
                    <option>Fácil</option>
                    <option>Medio</option>
                    <option>Difícil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Etiquetas (opcional)
                </label>
                <Input placeholder="ej. final, 2025, algoritmos" />
                <p className="text-xs text-gray-500 mt-1">Separa las etiquetas con comas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Semestre
                </label>
                <select className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                  <option>I Semestre 2026</option>
                  <option>II Semestre 2025</option>
                  <option>I Semestre 2025</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                Atrás
              </Button>
              <Button variant="primary" onClick={() => setStep(3)} className="flex-1">
                Subir Recurso
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}