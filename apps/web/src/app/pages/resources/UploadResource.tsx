import { CheckCircle, FileText, Link as LinkIcon, Upload } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { catalogApi, resourcesApi, storageApi, type Course, type CreateResourceInput } from "../../lib/api";

type Option = { id: number; name: string };
type Professor = { id: number; firstName: string; lastName: string; courseIds: number[] };
type UploadMode = "file" | "link";

const MAX_FILE_SIZE_MB = 50;

export function UploadResource() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<UploadMode>("file");
  const [dragActive, setDragActive] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [resourceTypes, setResourceTypes] = useState<Option[]>([]);
  const [periods, setPeriods] = useState<Option[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resourceUrl, setResourceUrl] = useState("");
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
  const originHintId = useId();
  const uploadIntroId = useId();
  const fileDropHintId = useId();
  const detailsHintId = useId();
  const linkHintId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      .catch(() => setError("No se pudieron cargar los catalogos"));
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
    if (mode === "file" && !selectedFile) return;
    if (mode === "link" && !resourceUrl.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      let metadata: Partial<CreateResourceInput> = {};

      if (mode === "file" && selectedFile) {
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
        if (!uploadResponse.ok) throw new Error(`Fallo al subir el archivo (HTTP ${uploadResponse.status})`);

        metadata = {
          originalFilename: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type || "application/octet-stream",
          storageProvider: presigned.provider,
          storageBucket: presigned.bucket,
          storageKey: presigned.storageKey,
          publicUrl: presigned.publicUrl,
        };
      } else {
        const parsed = new URL(resourceUrl.trim());
        metadata = {
          externalUrl: parsed.toString(),
          originalFilename: parsed.hostname,
          fileSize: 0,
          mimeType: "text/uri-list",
        };
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
        ...metadata,
      });

      setCreatedResourceId(created.id);
      setStep(3);
      toast.success("Recurso publicado");
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
        <div
          className="rounded-2xl border border-blue-100 bg-white/85 p-12 text-center shadow-sm shadow-blue-900/5"
          role="status"
          aria-live="polite"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle aria-hidden="true" className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-slate-900">Recurso publicado</h1>
          <p className="mb-8 text-slate-600">Tu material ya está disponible para el resto de la comunidad.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="secondary"
              className="rounded-full border-blue-100 hover:bg-blue-50"
              onClick={() => window.location.reload()}
            >
              Subir otro
            </Button>
            <Button
              variant="primary"
              className="rounded-full bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                navigate(createdResourceId ? `/app/resources/${createdResourceId}` : "/app/resources")
              }
            >
              Ver recurso
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canContinue = mode === "file" ? Boolean(selectedFile) : Boolean(resourceUrl.trim());
  const canSubmit =
    !submitting &&
    title.trim() &&
    description.trim() &&
    courseId &&
    resourceTypeId &&
    (mode === "file" ? selectedFile : resourceUrl.trim());

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className="mb-8 rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-sm shadow-blue-900/5"
        aria-labelledby="upload-resource-title"
        aria-describedby={uploadIntroId}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Contribuir</p>
        <h1
          id="upload-resource-title"
          className="mb-3 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500"
        >
          Subir recurso
        </h1>
        <p id={uploadIntroId} className="text-slate-600">
          Comparte tus materiales de estudio con otros estudiantes. Primero elegi si vas a subir un
          archivo o registrar un link externo; luego completa los datos academicos del recurso.
        </p>
      </div>

      <ol className="mb-8 flex flex-wrap items-center gap-4" aria-label="Progreso de subida de recurso">
        {[1, 2].map((s) => (
          <li key={s} className="flex items-center gap-2" aria-current={step === s ? "step" : undefined}>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step >= s
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-blue-50 text-slate-500"
              }`}
            >
              {s}
            </span>
            <span className={`font-medium ${step >= s ? "text-slate-900" : "text-slate-500"}`}>
              {s === 1 ? "Origen del recurso" : "Detalles del recurso"}
            </span>
            {s < 2 && <span aria-hidden="true" className="ml-2 h-0.5 w-16 bg-blue-100" />}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-blue-100 bg-white/85 p-8 shadow-sm shadow-blue-900/5">
        {error && (
          <div
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="mb-6 text-xl font-semibold text-slate-900">
              Subir recurso: selecciona el origen del recurso
            </h2>
            <p id={originHintId} className="sr-only">
              Elija si va a subir un archivo desde su computadora o registrar un link externo. Ambas
              opciones se pueden seleccionar con Tab y Enter.
            </p>

            <div
              role="group"
              aria-label="Origen del recurso"
              aria-describedby={originHintId}
              className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-2"
            >
              <button
                type="button"
                aria-pressed={mode === "file"}
                aria-label="Subir archivo desde la computadora"
                onClick={() => setMode("file")}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  mode === "file" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/70"
                }`}
              >
                <Upload aria-hidden="true" className="h-4 w-4" />
                Archivo
              </button>
              <button
                type="button"
                aria-pressed={mode === "link"}
                aria-label="Registrar link externo"
                onClick={() => setMode("link")}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  mode === "link" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/70"
                }`}
              >
                <LinkIcon aria-hidden="true" className="h-4 w-4" />
                Link
              </button>
            </div>

            {mode === "file" ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-blue-100 hover:border-blue-300"
                }`}
                aria-describedby={fileDropHintId}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Upload aria-hidden="true" className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="mb-2 font-medium text-slate-900">Arrastra y suelta tu archivo aqui</h3>
                <p className="mb-4 text-sm text-slate-500">o</p>
                <p id={fileDropHintId} className="sr-only">
                  Puede arrastrar un archivo a esta zona o usar el boton Seleccionar archivo. El limite
                  es de {MAX_FILE_SIZE_MB} megabytes.
                </p>
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  aria-label="Seleccionar archivo"
                  tabIndex={-1}
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.zip,.rar,.tar,.tgz,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.svg,.js,.ts,.py,.java,.c,.cpp,.cs,.html,.css,.json"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) chooseFile(file);
                  }}
                />
                <button
                  type="button"
                  aria-describedby={fileDropHintId}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Seleccionar archivo
                </button>
                <p className="mt-4 text-xs text-slate-500">
                  Maximo {MAX_FILE_SIZE_MB} MB. Documentos, hojas de calculo, presentaciones, codigo,
                  comprimidos e imagenes.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
                <Input
                  label="URL del recurso"
                  type="url"
                  value={resourceUrl}
                  onChange={(event) => setResourceUrl(event.target.value)}
                  placeholder="https://..."
                  aria-describedby={linkHintId}
                  required
                />
                <p id={linkHintId} className="mt-2 text-xs text-slate-500">
                  Pegue un enlace completo, por ejemplo https://sitio.com/recurso.
                </p>
              </div>
            )}

            {mode === "file" && selectedFile && (
              <div
                className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
                role="status"
                aria-live="polite"
              >
                <FileText aria-hidden="true" className="w-10 h-10 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500">
                    {selectedFile.size < 1024 * 1024
                      ? `${Math.max(1, Math.round(selectedFile.size / 1024))} KB`
                      : `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`}
                  </p>
                </div>
                <Badge variant="green">Listo</Badge>
              </div>
            )}

            {mode === "link" && resourceUrl.trim() && (
              <div
                className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
                role="status"
                aria-live="polite"
              >
                <LinkIcon aria-hidden="true" className="w-10 h-10 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-slate-900">{resourceUrl.trim()}</p>
                  <p className="text-sm text-slate-500">Se abrira como enlace externo</p>
                </div>
                <Badge variant="green">Listo</Badge>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button
                variant="primary"
                aria-label="Continuar a los detalles del recurso"
                onClick={() => setStep(2)}
                disabled={!canContinue}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              Subir recurso: completa los detalles del recurso
            </h2>
            <p id={detailsHintId} className="mb-6 text-sm text-slate-600">
              Los campos titulo, descripcion, curso y tipo de recurso son obligatorios. Profesor,
              semestre y etiquetas son opcionales.
            </p>

            <div className="space-y-4" aria-describedby={detailsHintId}>
              <Input
                label="Titulo"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="ej. Examen final 2026 - resuelto"
                required
              />

              <div>
                <label htmlFor={descriptionId} className="mb-1.5 block text-sm font-medium text-slate-900">
                  Descripcion
                </label>
                <textarea
                  id={descriptionId}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full resize-none rounded-md border border-blue-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="course" className="mb-1.5 block text-sm font-medium text-slate-900">
                  Curso
                </label>
                <select
                  id="course"
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  className="w-full rounded-md border border-blue-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-slate-900">
                  Tipo de recurso
                </label>
                <select
                  id="type"
                  value={resourceTypeId}
                  onChange={(event) => setResourceTypeId(event.target.value)}
                  className="w-full rounded-md border border-blue-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona el tipo</option>
                  {resourceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="professor" className="mb-1.5 block text-sm font-medium text-slate-900">
                    Profesor
                  </label>
                  <select
                    id="professor"
                    value={professorId}
                    onChange={(event) => setProfessorId(event.target.value)}
                    className="w-full rounded-md border border-blue-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label htmlFor="period" className="mb-1.5 block text-sm font-medium text-slate-900">
                    Semestre
                  </label>
                  <select
                    id="period"
                    value={periodId}
                    onChange={(event) => setPeriodId(event.target.value)}
                    className="w-full rounded-md border border-blue-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <p className="mt-6 text-sm text-blue-600" role="status" aria-live="polite">
                {uploadProgress}
              </p>
            )}

            <div className="flex gap-3 mt-8">
              <Button
                variant="secondary"
                aria-label="Volver al paso de origen del recurso"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border-blue-100 hover:bg-blue-50"
                disabled={submitting}
              >
                Atras
              </Button>
              <Button
                variant="primary"
                aria-label="Publicar recurso en Vaultio"
                onClick={handleSubmit}
                className="flex-1 rounded-full bg-blue-600 shadow-lg shadow-blue-600/15 hover:bg-blue-700"
                disabled={!canSubmit}
              >
                {submitting ? (mode === "file" ? "Subiendo..." : "Publicando...") : "Publicar recurso"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
