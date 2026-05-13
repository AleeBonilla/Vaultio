import { CheckCircle, FileText, Upload } from 'lucide-react';
import { useId, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function UploadResource() {
  const [step, setStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const fileInputId = useId();
  const descriptionId = useId();
  const courseId = useId();
  const resourceTypeId = useId();
  const professorId = useId();
  const difficultyId = useId();
  const periodId = useId();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-12 text-center" role="status" aria-live="polite">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle aria-hidden="true" className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">Recurso subido</h1>
          <p className="text-[#666666] mb-8">
            Tu recurso ha sido subido exitosamente y ahora esta disponible para otros estudiantes.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Subir otro
            </Button>
            <Button variant="primary" onClick={() => window.location.href = '/app'}>
              Ir al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Subir recurso</h1>
        <p className="text-[#666666]">Comparte tus materiales de estudio con otros estudiantes</p>
      </div>

      <ol className="mb-8 flex flex-wrap items-center gap-4" aria-label="Progreso de subida">
        {[1, 2].map((s) => (
          <li key={s} className="flex items-center gap-2" aria-current={step === s ? 'step' : undefined}>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step >= s ? 'bg-[#0066CC] text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </span>
            <span className={`font-medium ${step >= s ? 'text-[#1a1a1a]' : 'text-gray-500'}`}>
              {s === 1 ? 'Subir archivo' : 'Detalles del recurso'}
            </span>
            {s < 2 && <span aria-hidden="true" className="w-16 h-0.5 bg-gray-300 ml-2" />}
          </li>
        ))}
      </ol>

      <div className="bg-white border border-[#E0E0E0] rounded-lg p-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6">Sube tu archivo</h2>

            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? 'border-[#0066CC] bg-[#E3F2FD]' : 'border-gray-300 hover:border-[#0066CC]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-[#E3F2FD] rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload aria-hidden="true" className="w-8 h-8 text-[#0066CC]" />
              </div>
              <h3 className="font-medium text-[#1a1a1a] mb-2">Arrastra y suelta tu archivo aqui</h3>
              <p className="text-sm text-gray-500 mb-4">o</p>
              <input id={fileInputId} type="file" className="sr-only" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" />
              <label
                htmlFor={fileInputId}
                className="inline-flex cursor-pointer rounded-md border border-[#E0E0E0] bg-white px-4 py-2 font-medium text-[#0066CC] transition-colors hover:bg-[#F5F7FA] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#0066CC] focus-within:ring-offset-2"
              >
                Seleccionar archivos
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Formatos soportados: PDF, DOCX, PPTX, ZIP. Maximo 50 MB.
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FileText aria-hidden="true" className="w-10 h-10 text-[#0066CC]" />
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
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6">Detalles del recurso</h2>

            <div className="space-y-4">
              <Input label="Titulo" placeholder="ej. Examen Final 2025 - Resuelto" required />

              <div>
                <label htmlFor={descriptionId} className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Descripcion
                </label>
                <textarea
                  id={descriptionId}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] resize-none"
                  rows={4}
                  placeholder="Describe que contiene este recurso y como puede ayudar a otros estudiantes..."
                />
              </div>

              <div>
                <label htmlFor={courseId} className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Curso
                </label>
                <select id={courseId} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                  <option>Selecciona un curso</option>
                  <option>Algoritmos y Estructuras de Datos I</option>
                  <option>Programacion Orientada a Objetos</option>
                  <option>Bases de Datos I</option>
                  <option>Calculo Diferencial e Integral II</option>
                </select>
              </div>

              <div>
                <label htmlFor={resourceTypeId} className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Tipo de recurso
                </label>
                <select id={resourceTypeId} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                  <option>Selecciona el tipo</option>
                  <option>Examen</option>
                  <option>Apuntes</option>
                  <option>Ejercicios</option>
                  <option>Codigo</option>
                  <option>Resumen</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={professorId} className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Profesor
                  </label>
                  <select id={professorId} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                    <option>Selecciona el profesor</option>
                    <option>Dr. Ramirez</option>
                    <option>Dra. Fernandez</option>
                    <option>Ing. Castro</option>
                    <option>Dr. Gonzalez</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={difficultyId} className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Dificultad
                  </label>
                  <select id={difficultyId} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                    <option>Selecciona la dificultad</option>
                    <option>Facil</option>
                    <option>Medio</option>
                    <option>Dificil</option>
                  </select>
                </div>
              </div>

              <div>
                <Input label="Etiquetas (opcional)" placeholder="ej. final, 2025, algoritmos" />
                <p className="text-xs text-gray-500 mt-1">Separa las etiquetas con comas</p>
              </div>

              <div>
                <label htmlFor={periodId} className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Semestre
                </label>
                <select id={periodId} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                  <option>I Semestre 2026</option>
                  <option>II Semestre 2025</option>
                  <option>I Semestre 2025</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                Atras
              </Button>
              <Button variant="primary" onClick={() => setStep(3)} className="flex-1">
                Subir recurso
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
