import { BookOpen, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { catalogApi, type Career } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    firebaseUser,
    profile,
    loading,
    error,
    configError,
    signOut,
    signUpWithEmail,
    updateProfile,
    clearError,
  } = useAuth();

  const [careers, setCareers] = useState<Career[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [careerId, setCareerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    catalogApi.careers().then(setCareers).catch(() => setCareers([]));
  }, []);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      if (profile.careerIds[0]) setCareerId(String(profile.careerIds[0]));
    }
  }, [profile]);

  if (!loading && firebaseUser && profile && profile.careerIds.length > 0) {
    return <Navigate to="/app" replace />;
  }

  const hasSession = Boolean(firebaseUser && profile);
  const heading = hasSession ? "Completá tu perfil" : "Crear cuenta";
  const subheading = hasSession
    ? `Hola ${profile?.email || firebaseUser?.email || ""}. Solo necesitamos un par de datos más.`
    : "Creá tu cuenta con correo y contraseña.";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    clearError();
    setLocalError(null);

    try {
      if (hasSession) {
        if (!careerId) {
          setLocalError("Seleccioná tu carrera para continuar.");
          return;
        }
        await updateProfile({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          careerIds: [Number(careerId)],
        });
        toast.success("¡Bienvenido a Vaultio!");
        navigate("/app");
        return;
      }

      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
        setLocalError("Completá todos los campos para registrarte.");
        return;
      }
      if (password.length < 6) {
        setLocalError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setLocalError("Las contraseñas no coinciden.");
        return;
      }
      if (!careerId) {
        setLocalError("Seleccioná tu carrera.");
        return;
      }

      await signUpWithEmail({ email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim() });
      // Una vez autenticado, vamos a completar la carrera. Esperamos al efecto del onAuthStateChanged
      // y luego este mismo componente, al re-render, hará el updateProfile con el careerId actual.
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  // Completa carrera automáticamente apenas el perfil llega tras el signUp
  useEffect(() => {
    if (!hasSession || !profile) return;
    if (profile.careerIds.length > 0) return;
    if (!careerId) return;
    (async () => {
      try {
        await updateProfile({
          firstName: firstName.trim() || profile.firstName,
          lastName: lastName.trim() || profile.lastName,
          careerIds: [Number(careerId)],
        });
        toast.success("¡Bienvenido a Vaultio!");
        navigate("/app");
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "No se pudo guardar la carrera");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, hasSession]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#0066CC] rounded-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-2xl text-[#1a1a1a]">Vaultio</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">{heading}</h1>
          <p className="text-[#666666]">{subheading}</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E0E0E0] p-8">
          {configError && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
              {configError}
            </div>
          )}
          {localError && !configError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                required
              />
              <Input
                label="Apellido"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                required
              />
            </div>

            {!hasSession && (
              <>
                <Input
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
                <Input
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
                <Input
                  label="Repetí la contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </>
            )}

            <div>
              <label htmlFor="career" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Carrera
              </label>
              <select
                id="career"
                value={careerId}
                onChange={(event) => setCareerId(event.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:border-[#0066CC] bg-white"
              >
                <option value="">Seleccioná tu carrera</option>
                {careers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-6" disabled={submitting || Boolean(configError)}>
              {submitting ? "Guardando..." : hasSession ? "Guardar y continuar" : "Crear cuenta"}
            </Button>
          </form>

          {hasSession ? (
            <button
              type="button"
              onClick={() => signOut().then(() => navigate("/login"))}
              className="mt-6 text-sm text-[#666666] hover:text-[#1a1a1a] inline-flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          ) : (
            <p className="mt-6 text-center text-sm text-[#666666]">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="text-[#0066CC] hover:text-[#004A99] font-semibold">
                Iniciá sesión
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
