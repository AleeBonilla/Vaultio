import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { catalogApi, type Career } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

export function EditProfile() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [careerId, setCareerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    catalogApi.careers().then(setCareers).catch(() => setCareers([]));
  }, []);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setBio(profile.bio || "");
      setCareerId(profile.careerIds[0] ? String(profile.careerIds[0]) : "");
    }
  }, [profile]);

  if (!profile) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        careerIds: careerId ? [Number(careerId)] : [],
      });
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

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/app/profile"
        className="inline-flex items-center gap-2 text-[#0066CC] hover:text-[#004A99] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al perfil
      </Link>

      <div className="bg-white border border-[#E0E0E0] rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Editar perfil</h1>
        <p className="text-[#666666] mb-8">Actualizá tu información pública en Vaultio.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

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

          <Input label="Correo electrónico" type="email" value={profile.email} disabled readOnly />

          <div>
            <label htmlFor="career" className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Carrera
            </label>
            <select
              id="career"
              value={careerId}
              onChange={(event) => setCareerId(event.target.value)}
              className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:border-[#0066CC] bg-white"
            >
              <option value="">Sin carrera asignada</option>
              {careers.map((career) => (
                <option key={career.id} value={career.id}>
                  {career.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Biografía
            </label>
            <textarea
              id="bio"
              value={bio}
              maxLength={280}
              onChange={(event) => setBio(event.target.value)}
              className="w-full px-4 py-3 border border-[#E0E0E0] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:border-[#0066CC] resize-none"
              rows={4}
              placeholder="Contanos un poco sobre vos (opcional)"
            />
            <p className="text-xs text-[#666666] mt-1">{bio.length}/280 caracteres</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
            <Link to="/app/profile" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
