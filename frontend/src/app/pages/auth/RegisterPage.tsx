import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authApi, catalogApi, type Career } from "../../lib/api";

export function RegisterPage() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState<Career[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [careerId, setCareerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    catalogApi.careers().then(setCareers).catch(() => setCareers([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await authApi.register({
        firstName,
        lastName,
        email,
        password,
        careerId: careerId ? Number(careerId) : undefined,
      });
      navigate("/app");
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">Crea tu cuenta</h1>
          <p className="text-[#666666]">Unete a la comunidad academica del TEC</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E0E0E0] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nombre" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              <Input label="Apellido" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
            </div>
            <Input
              label="Correo Electronico"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu.usuario@estudiantec.cr"
              required
            />

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
                <option value="">Selecciona tu carrera</option>
                {careers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Contrasena"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Crea una contrasena segura"
              required
            />

            <div className="flex items-start gap-2 text-sm pt-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] rounded focus:ring-2 focus:ring-[#0066CC] mt-0.5"
              />
              <span className="text-[#666666]">Acepto los terminos de uso para la demo local.</span>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-6" disabled={submitting}>
              {submitting ? "Creando..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-[#666666]">
            Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-[#0066CC] hover:text-[#004A99] font-semibold transition-colors">
              Inicia Sesion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
