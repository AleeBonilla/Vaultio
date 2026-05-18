import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../lib/auth-context";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.258c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

export function LoginPage() {
  const {
    firebaseUser,
    profile,
    loading,
    error,
    configError,
    signInWithGoogle,
    signInWithEmail,
    sendPasswordReset,
    clearError,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  if (!loading && firebaseUser && profile) {
    return <Navigate to="/app" replace />;
  }

  const handleGoogle = async () => {
    setGoogleSubmitting(true);
    clearError();
    setLocalError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "No se pudo iniciar sesión con Google");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    clearError();
    setLocalError(null);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setLocalError("Ingresá tu correo para recibir el enlace de recuperación.");
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      toast.success("Te enviamos un correo para restablecer tu contraseña.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "No se pudo enviar el correo");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#0066CC] rounded-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-2xl text-[#1a1a1a]">Vaultio</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">Iniciá sesión</h1>
          <p className="text-[#666666]">Accedé a tus recursos académicos del TEC.</p>
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

          <Button
            type="button"
            variant="secondary"
            className="w-full flex items-center justify-center gap-3 py-3 mb-5"
            onClick={handleGoogle}
            disabled={googleSubmitting || Boolean(configError)}
          >
            <GoogleIcon />
            <span className="font-medium text-[#1a1a1a]">
              {googleSubmitting ? "Conectando con Google..." : "Continuar con Google"}
            </span>
          </Button>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-5">
            <span className="h-px flex-1 bg-gray-200" />
            <span>o con correo</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
              autoComplete="current-password"
              required
            />

            <div className="flex justify-between text-sm">
              <button type="button" onClick={handleReset} className="text-[#0066CC] hover:text-[#004A99]">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={submitting || Boolean(configError)}>
              {submitting ? "Iniciando..." : "Iniciar sesión"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#666666]">
            ¿No tenés cuenta?{" "}
            <Link to="/register" className="text-[#0066CC] hover:text-[#004A99] font-semibold">
              Crear una
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-[#666666]">
          <Link to="/" className="text-[#666666] hover:text-[#1a1a1a]">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
