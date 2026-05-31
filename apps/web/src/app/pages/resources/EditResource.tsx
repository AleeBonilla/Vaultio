import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { catalogApi, resourcesApi, type Course, type ResourceDetail } from "../../lib/api";

type Option = { id: number; name: string };
type Professor = { id: number; firstName: string; lastName: string; courseIds: number[] };

export function EditResource() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [resourceTypes, setResourceTypes] = useState<Option[]>([]);
  const [periods, setPeriods] = useState<Option[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [resourceTypeId, setResourceTypeId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) return;
    setLoading(true);
    Promise.all([
      resourcesApi.detail(id),
      catalogApi.courses(),
      catalogApi.resourceTypes(),
      catalogApi.academicPeriods(),
      catalogApi.professors(),
    ])
      .then(([loadedResource, loadedCourses, loadedTypes, loadedPeriods, loadedProfessors]) => {
        if (!active) return;
        setResource(loadedResource);
        setCourses(loadedCourses);
        setResourceTypes(loadedTypes);
        setPeriods(loadedPeriods);
        setProfessors(loadedProfessors);
        setTitle(loadedResource.title);
        setDescription(loadedResource.description);
        setCourseId(String(loadedResource.courseId));
        setResourceTypeId(String(loadedResource.resourceTypeId));
        setProfessorId(loadedResource.professorId ? String(loadedResource.professorId) : "");
        setPeriodId(loadedResource.academicPeriod ? String(loadedResource.academicPeriod.id) : "");
        setTags(loadedResource.tags.join(", "));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "No se pudo cargar el recurso");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resource) return;
    setSubmitting(true);
    setError(null);
    try {
      await resourcesApi.update(resource.id, {
        title: title.trim(),
        description: description.trim(),
        courseId: Number(courseId),
        resourceTypeId: Number(resourceTypeId),
        academicPeriodId: periodId ? Number(periodId) : null,
        professorId: professorId ? Number(professorId) : null,
        tags,
      });
      toast.success("Recurso actualizado");
      navigate("/app/profile");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el recurso";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-slate-600" role="status" aria-live="polite">
          Cargando recurso...
        </p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "Recurso no encontrado"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/app/profile"
        className="mb-6 inline-flex items-center gap-2 rounded-sm text-blue-600 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Volver al perfil
      </Link>

      <div className="rounded-3xl border border-blue-100 bg-white/85 p-8 shadow-sm shadow-blue-900/5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Recurso propio</p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">
          Editar recurso
        </h1>
        <p className="mb-8 text-slate-600">
          Puedes editar la información del recurso. El archivo o link original solo puede eliminarse borrando
          el recurso.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>
          )}

          <Input label="Titulo" value={title} onChange={(event) => setTitle(event.target.value)} required />

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-900">
              Descripcion
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="w-full resize-none rounded-md border border-blue-100 px-4 py-3 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="Curso" value={courseId} onChange={setCourseId} required>
              <option value="">Selecciona un curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </SelectField>

            <SelectField label="Tipo de recurso" value={resourceTypeId} onChange={setResourceTypeId} required>
              <option value="">Selecciona un tipo</option>
              {resourceTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="Profesor" value={professorId} onChange={setProfessorId}>
              <option value="">Sin profesor</option>
              {professors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.firstName} {professor.lastName}
                </option>
              ))}
            </SelectField>

            <SelectField label="Semestre" value={periodId} onChange={setPeriodId}>
              <option value="">Sin especificar</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </SelectField>
          </div>

          <Input
            label="Etiquetas"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="final, algoritmos"
          />

          <div className="flex gap-3 border-t border-blue-100 pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/app/profile")}
              className="flex-1 rounded-full border-blue-100 hover:bg-blue-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  required,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-900">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-md border border-blue-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
    </div>
  );
}
