import { CheckCircle, FileText, Upload } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { catalogApi, resourcesApi, storageApi, type Course } from "../../lib/api";

type Option = { id: number; name: string };
type Professor = { id: number; firstName: string; lastName: string; courseIds: number[] };

const MAX_FILE_SIZE_MB = 50;

export function UploadResource() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [resourceTypes, setResourceTypes] = useState<Option[]>([]);
  const [periods, setPeriods] = useState<Option[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [createdResourceId, setCreatedResourceId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [resourceTypeId, setResourceTypeId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [tags, setTags] = useState("");

  const fileInputId = useId();
  const descriptionId = useId();

  useEffect(() => {
    Promise.all([
      catalogApi.courses(),
      catalogApi.resourceTypes(),
      catalogApi.academicPeriods(),
      catalogApi.professors(),
    ])
      .then(([loadedCourses, loadedTypes, loadedPeriods, loadedProfessors]) => {
        setCourses(loadedCourses);
        setResourceTypes(loadedTypes);
        setPeriods(loadedPeriods);
        setProfessors(loadedProfessors);
      })
      .catch(() => setError("No se pudieron cargar los catálogos"));
  }, []);

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === "dragenter" || event.type === "dragover");
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) chooseFile(file);
  };

  const chooseFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`El archivo supera ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setSubmitting(true);
    setError(null);

    try {
      setUploadProgress("Generando enlace de subida...");
      const presigned = await storageApi.createUploadUrl({
        originalFilename: selectedFile.name,
        mimeType: selectedFile.type || "application/octet-stream",
      });

      setUploadProgress("Subiendo archivo a MinIO...");
      const uploadResponse = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: { "content-type": selectedFile.type || "application/octet-stream" },
        body: selectedFile,
      });
      if (!uploadResponse.ok) {
        throw new Error(`Fallo al subir el archivo (HTTP ${uploadResponse.status})`);
      }

      setUploadProgress("Registrando recurso...");
      const created = await resourcesApi.create({
        title: title.trim(),
        description: description.trim(),
        courseId: Number(courseId),
        resourceTypeId: Number(resourceTypeId),
        academicPeriodId: periodId ? Number(periodId) : undefined,
        professorId: professorId ? Number(professorId) : undefined,
        tags,
        originalFilename: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type || "application/octet-stream",
        storageProvider: presigned.provider,
        storageBucket: presigned.bucket,
        storageKey: presigned.storageKey,
        publicUrl: presigned.publicUrl,
      } as any);

      setCreatedResourceId(created.id);
      setStep(3);
      toast.success("¡Recurso publicado!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo subir el recurso";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-12 text-center" role="status" aria-live="polite">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle aria-hidden="true" className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">Recurso publicado</h1>
          <p className="text-[#666666] mb-8">Tu material ya está disponible para el resto de la comunidad.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Subir otro
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(createdResourceId ? `/app/resources/${createdResourceId}` : "/app/resources")}
            >
              Ver recurso
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canContinue = Boolean(selectedFile);
  const canSubmit =
    !submitting && title.trim() && description.trim() && courseId && resourceTypeId && selectedFile;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Subir recurso</h1>
        <p className="text-[#666666]">Compartí tus materiales de estudio con otros estudiantes.</p>
      </div>

      <ol className="mb-8 flex flex-wrap items-center gap-4" aria-label="Progreso de subida">
        {[1, 2].map((s) => (
          <li key={s} className="flex items-center gap-2" aria-current={step === s ? "step" : undefined}>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step >= s ? "bg-[#0066CC] text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {s}
            </span>
            <span className={`font-medium ${step >= s ? "text-[#1a1a1a]" : "text-gray-500"}`}>
              {s === 1 ? "Seleccionar archivo" : "Detalles del recurso"}
            </span>
            {s < 2 && <span aria-hidden="true" className="w-16 h-0.5 bg-gray-300 ml-2" />}
          </li>
        ))}
      </ol>

      <div className="bg-white border border-[#E0E0E0] rounded-lg p-8">
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6">Seleccioná tu archivo</h2>

            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? "border-[#0066CC] bg-[#E3F2FD]" : "border-gray-300 hover:border-[#0066CC]"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-[#E3F2FD] rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload aria-hidden="true" className="w-8 h-8 text-[#0066CC]" />
              </div>
              <h3 className="font-medium text-[#1a1a1a] mb-2">Arrastrá y soltá tu archivo aquí</h3>
              <p className="text-sm text-gray-500 mb-4">o</p>
              <input
                id={fileInputId}
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.png,.jpg,.jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) chooseFile(file);
                }}
              />
              <label
                htmlFor={fileInputId}
                className="inline-flex cursor-pointer rounded-md border border-[#E0E0E0] bg-white px-4 py-2 font-medium text-[#0066CC] transition-colors hover:bg-[#F5F7FA]"
              >
                Seleccionar archivo
              </label>
              <p className="text-xs text-gray-500 mt-4">Máximo {MAX_FILE_SIZE_MB} MB. PDF, DOCX, PPTX, ZIP, imágenes.</p>
            </div>

            {selectedFile && (
              <div className="mt-6 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FileText aria-hidden="true" className="w-10 h-10 text-[#0066CC]" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1a1a1a] truncate">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedFile.size < 1024 * 1024
                      ? `${Math.max(1, Math.round(selectedFile.size / 1024))} KB`
                      : `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`}
                  </p>
                </div>
                <Badge variant="green">Listo</Badge>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button variant="primary" onClick={() => setStep(2)} disabled={!canContinue}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-6">Detalles del recurso</h2>

            <div className="space-y-4">
              <Input
                label="Título"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="ej. Examen final 2026 - resuelto"
                required
              />

              <div>
                <label htmlFor={descriptionId} className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Descripción
                </label>
                <textarea
                  id={descriptionId}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066CC] resize-none"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="course" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Curso
                </label>
                <select
                  id="course"
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  required
                >
                  <option value="">Seleccioná un curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                  Tipo de recurso
                </label>
                <select
                  id="type"
                  value={resourceTypeId}
                  onChange={(event) => setResourceTypeId(event.target.value)}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  required
                >
                  <option value="">Seleccioná el tipo</option>
                  {resourceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="professor" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Profesor
                  </label>
                  <select
                    id="professor"
                    value={professorId}
                    onChange={(event) => setProfessorId(event.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  >
                    <option value="">Sin profesor</option>
                    {professors.map((professor) => (
                      <option key={professor.id} value={professor.id}>
                        {professor.firstName} {professor.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Semestre
                  </label>
                  <select
                    id="period"
                    value={periodId}
                    onChange={(event) => setPeriodId(event.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  >
                    <option value="">Sin especificar</option>
                    {periods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Etiquetas (separadas por coma)"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="ej. final, 2026, algoritmos"
              />
            </div>

            {uploadProgress && (
              <p className="mt-6 text-sm text-[#0066CC]" role="status" aria-live="polite">
                {uploadProgress}
              </p>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1" disabled={submitting}>
                Atrás
              </Button>
              <Button variant="primary" onClick={handleSubmit} className="flex-1" disabled={!canSubmit}>
                {submitting ? "Subiendo..." : "Publicar recurso"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
