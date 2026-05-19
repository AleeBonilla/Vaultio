import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { VaultioLogo } from "../../components/ui/VaultioLogo";
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
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [careerId, setCareerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    catalogApi
      .careers()
      .then(setCareers)
      .catch(() => setCareers([]));
  }, []);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setUsername(profile.username || "");
      if (profile.careerIds[0]) setCareerId(String(profile.careerIds[0]));
    }
  }, [profile]);

  const hasSession = Boolean(firebaseUser && profile);

  // Completa carrera automáticamente apenas el perfil llega tras el signUp.
  // Debe declararse antes del early return para no romper las reglas de hooks.
  useEffect(() => {
    if (!hasSession || !profile) return;
    if (profile.careerIds.length > 0) return;
    if (!careerId) return;
    (async () => {
      try {
        await updateProfile({
          username: username.trim().toLowerCase() || profile.username,
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

  if (!loading && firebaseUser && profile && profile.careerIds.length > 0) {
    return <Navigate to="/app" replace />;
  }
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
          username: username.trim().toLowerCase(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          careerIds: [Number(careerId)],
        });
        toast.success("¡Bienvenido a Vaultio!");
        navigate("/app");
        return;
      }

      if (!username.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !password) {
        setLocalError("Completá todos los campos para registrarte.");
        return;
      }
      if (!/^[a-z0-9_]{3,30}$/.test(username.trim().toLowerCase())) {
        setLocalError("El username debe tener 3 a 30 caracteres y solo usar letras, numeros o guion bajo.");
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

      await signUpWithEmail({
        email: email.trim(),
        password,
        username: username.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      // Una vez autenticado, vamos a completar la carrera. Esperamos al efecto del onAuthStateChanged
      // y luego este mismo componente, al re-render, hará el updateProfile con el careerId actual.
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6 text-slate-900">
      <div className="absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[120px]" />
      <div className="absolute -right-64 top-1/3 h-[420px] w-[420px] rounded-full bg-cyan-300/20 blur-[110px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" className="mb-8 inline-flex items-center gap-2">
            <VaultioLogo />
          </Link>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500">
            {heading}
          </h1>
          <p className="text-slate-600">{subheading}</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white/85 p-8 shadow-2xl shadow-blue-900/10 backdrop-blur">
          {configError && (
            <div
              className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
              role="alert"
            >
              {configError}
            </div>
          )}
          {localError && !configError && (
            <div
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
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

            <Input
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value.toLowerCase())}
              autoComplete="username"
              placeholder="andres_tec"
              required
            />

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
              <label htmlFor="career" className="mb-2 block text-sm font-medium text-slate-900">
                Carrera
              </label>
              <select
                id="career"
                value={careerId}
                onChange={(event) => setCareerId(event.target.value)}
                required
                className="w-full rounded-md border border-blue-100 bg-white px-4 py-2.5 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value="">Seleccioná tu carrera</option>
                {careers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="mt-6 w-full rounded-full bg-blue-600 shadow-lg shadow-blue-600/15 hover:bg-blue-700"
              disabled={submitting || Boolean(configError)}
            >
              {submitting ? "Guardando..." : hasSession ? "Guardar y continuar" : "Crear cuenta"}
            </Button>
          </form>

          {hasSession ? (
            <button
              type="button"
              onClick={() => signOut().then(() => navigate("/login"))}
              className="mt-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          ) : (
            <p className="mt-6 text-center text-sm text-slate-600">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800">
                Iniciá sesión
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
