import { ArrowLeft, Camera } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { catalogApi, storageApi, usersApi, type Career, type Course } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

export function EditProfile() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [careerId, setCareerId] = useState("");
  const [careerQuery, setCareerQuery] = useState("");
  const [courseIds, setCourseIds] = useState<number[]>([]);
  const [courseQuery, setCourseQuery] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const careerSearchId = useId();
  const careerListboxId = useId();
  const careerHelpId = useId();
  const courseSearchId = useId();
  const courseListboxId = useId();
  const courseHelpId = useId();

  useEffect(() => {
    Promise.all([catalogApi.careers(), catalogApi.courses(), usersApi.courses()])
      .then(([loadedCareers, loadedCourses, selectedCourses]) => {
        setCareers(loadedCareers);
        setCourses(loadedCourses);
        setCourseIds(selectedCourses.map((course) => course.id));
      })
      .catch(() => {
        setCareers([]);
        setCourses([]);
      });
  }, []);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setUsername(profile.username);
      setBio(profile.bio || "");
      setCareerId(profile.careerIds[0] ? String(profile.careerIds[0]) : "");
    }
  }, [profile]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const matchingCareers = useMemo(() => {
    const normalized = careerQuery.trim().toLowerCase();
    if (!normalized) return [];
    return careers
      .filter((career) => `${career.code} ${career.name}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [careers, careerQuery]);

  const matchingCourses = useMemo(() => {
    const normalized = courseQuery.trim().toLowerCase();
    if (!normalized) return [];
    return courses
      .filter((course) => !courseIds.includes(course.id))
      .filter((course) => `${course.code} ${course.name}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [courses, courseIds, courseQuery]);

  if (!profile) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let photoUrl = profile.photoUrl || null;
      if (photoFile) {
        const upload = await storageApi.createUploadUrl({
          originalFilename: `avatar-${profile.id}-${photoFile.name}`,
          mimeType: photoFile.type || "application/octet-stream",
          scope: "profile-photo",
        });
        await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: { "content-type": photoFile.type || "application/octet-stream" },
          body: photoFile,
        });
        photoUrl = `${storageApi.publicObjectUrl(upload.storageKey)}&v=${Date.now()}`;
      }

      await updateProfile({
        username: username.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        photoUrl,
        careerIds: careerId ? [Number(careerId)] : [],
      });
      await usersApi.updateCourses(courseIds);
      toast.success("Perfil actualizado");
      navigate("/app/profile");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el perfil";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCourse = (id: number) => {
    setCourseIds((current) =>
      current.includes(id) ? current.filter((courseId) => courseId !== id) : [...current, id],
    );
  };

  const selectedCourses = courses.filter((course) => courseIds.includes(course.id));
  const selectedCareer = careers.find((career) => String(career.id) === careerId);

  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || profile.email?.[0]?.toUpperCase() || "?";
  const avatarUrl = photoPreview || profile.photoUrl;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/app/profile"
        className="mb-6 inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al perfil
      </Link>

      <div className="rounded-3xl border border-blue-100 bg-white/85 p-8 shadow-sm shadow-blue-900/5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Perfil</p>
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">
          Editar perfil
        </h1>
        <p className="mb-8 text-slate-600">Actualizá tu información pública en Vaultio.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-4 sm:flex-row sm:items-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="h-24 w-24 rounded-full object-cover shadow-lg shadow-blue-900/10"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-3xl font-bold text-white shadow-lg shadow-blue-600/20">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <label htmlFor="profilePhoto" className="mb-2 block text-sm font-medium text-slate-900">
                Foto de perfil
              </label>
              <button
                type="button"
                aria-label="Seleccionar nueva foto de perfil"
                onClick={() => photoInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <Camera className="h-4 w-4" />
                Subir foto
              </button>
              <input
                id="profilePhoto"
                ref={photoInputRef}
                type="file"
                aria-label="Subir foto de perfil"
                tabIndex={-1}
                accept="image/*"
                className="sr-only"
                onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
              />
              {photoFile && (
                <p className="mt-2 text-xs text-slate-500" role="status" aria-live="polite">
                  Foto seleccionada: {photoFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
            <Input
              label="Apellido"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </div>

          <Input
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            autoComplete="username"
            required
          />

          <Input label="Correo electrónico" type="email" value={profile.email} disabled readOnly />

          <div>
            <label htmlFor={careerSearchId} className="mb-2 block text-sm font-medium text-slate-900">
              Carrera
            </label>
            <div className="rounded-2xl border border-blue-100 bg-white/80 p-3">
              {selectedCareer && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                  <div>
                    <span className="block text-sm font-semibold text-blue-900">{selectedCareer.code}</span>
                    <span className="block text-xs text-slate-600">{selectedCareer.name}</span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Quitar carrera ${selectedCareer.name}`}
                    onClick={() => {
                      setCareerId("");
                      setCareerQuery("");
                    }}
                    className="rounded-full px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Quitar
                  </button>
                </div>
              )}
              <Input
                id={careerSearchId}
                label="Buscar carrera"
                value={careerQuery}
                onChange={(event) => setCareerQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    setCareerQuery("");
                  }
                }}
                placeholder="Buscar por codigo o nombre..."
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={Boolean(careerQuery.trim())}
                aria-controls={careerQuery.trim() ? careerListboxId : undefined}
                aria-describedby={careerHelpId}
              />
              <p id={careerHelpId} className="sr-only">
                Escriba parte del codigo o nombre de la carrera. Use Tab para recorrer las opciones
                y Enter para seleccionar. Presione Escape para cerrar la lista.
              </p>
              {careerQuery.trim() && (
                <div
                  id={careerListboxId}
                  role="listbox"
                  aria-label="Opciones de carrera"
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.stopPropagation();
                      setCareerQuery("");
                    }
                  }}
                  className="mt-3 grid max-h-72 grid-cols-1 gap-2 overflow-y-auto"
                >
                  {matchingCareers.map((career) => (
                    <button
                      type="button"
                      key={career.id}
                      role="option"
                      aria-selected={String(career.id) === careerId}
                      onClick={() => {
                        setCareerId(String(career.id));
                        setCareerQuery("");
                      }}
                      className="rounded-xl border border-transparent p-3 text-left transition-colors hover:border-blue-100 hover:bg-blue-50/50"
                    >
                      <span className="block text-sm font-semibold text-slate-900">{career.code}</span>
                      <span className="block text-xs text-slate-600">{career.name}</span>
                    </button>
                  ))}
                  {matchingCareers.length === 0 && (
                    <p className="p-3 text-sm text-slate-500">Sin carreras para esa busqueda.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <label htmlFor={courseSearchId} className="block text-sm font-medium text-slate-900">
                Cursos que estoy llevando
              </label>
              <span className="text-xs text-slate-500">{courseIds.length} seleccionados</span>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white/80 p-3">
              {selectedCourses.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedCourses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      aria-label={`Quitar curso ${course.code} ${course.name}`}
                      onClick={() => toggleCourse(course.id)}
                      className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-left text-xs text-blue-900 hover:bg-blue-100"
                      title="Click para desmarcar"
                    >
                      <span className="font-semibold">{course.code}</span> · {course.name}
                    </button>
                  ))}
                </div>
              )}
              <Input
                id={courseSearchId}
                label="Buscar curso"
                value={courseQuery}
                onChange={(event) => setCourseQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    setCourseQuery("");
                  }
                }}
                placeholder="Buscar por codigo o nombre..."
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={Boolean(courseQuery.trim())}
                aria-controls={courseQuery.trim() ? courseListboxId : undefined}
                aria-describedby={courseHelpId}
              />
              <p id={courseHelpId} className="sr-only">
                Escriba parte del codigo o nombre del curso. Use Tab para recorrer las opciones
                y Enter para seleccionar. Los cursos seleccionados aparecen antes del buscador y se
                pueden quitar con Enter. Presione Escape para cerrar la lista.
              </p>
              {courseQuery.trim() && (
                <div
                  id={courseListboxId}
                  role="listbox"
                  aria-label="Opciones de curso"
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.stopPropagation();
                      setCourseQuery("");
                    }
                  }}
                  className="mt-3 grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2"
                >
                  {matchingCourses.map((course) => (
                    <button
                      type="button"
                      key={course.id}
                      role="option"
                      aria-selected={courseIds.includes(course.id)}
                      onClick={() => {
                        toggleCourse(course.id);
                        setCourseQuery("");
                      }}
                      className="rounded-xl border border-transparent p-3 text-left transition-colors hover:border-blue-100 hover:bg-blue-50/50"
                    >
                      <span className="block text-sm font-semibold text-slate-900">{course.code}</span>
                      <span className="block text-xs text-slate-600">{course.name}</span>
                    </button>
                  ))}
                  {matchingCourses.length === 0 && (
                    <p className="p-3 text-sm text-slate-500">Sin cursos para esa busqueda.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-medium text-slate-900">
              Biografía
            </label>
            <textarea
              id="bio"
              value={bio}
              maxLength={280}
              onChange={(event) => setBio(event.target.value)}
              className="w-full resize-none rounded-md border border-blue-100 px-4 py-3 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
              rows={4}
              placeholder="Contanos un poco sobre vos (opcional)"
            />
            <p className="mt-1 text-xs text-slate-500">{bio.length}/280 caracteres</p>
          </div>

          <div className="flex gap-3 border-t border-blue-100 pt-4">
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
              className="flex-1 rounded-full bg-blue-600 shadow-lg shadow-blue-600/15 hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
