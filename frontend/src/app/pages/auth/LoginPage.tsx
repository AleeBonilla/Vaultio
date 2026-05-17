import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('maria@estudiantec.cr');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await authApi.login({ email, password });
      navigate('/app');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesion');
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
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">Bienvenido de nuevo</h1>
          <p className="text-[#666666]">Inicia sesion para acceder a tus recursos de estudio</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E0E0E0] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <Input
              label="Correo Electronico"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="maria@estudiantec.cr"
              required
            />
            <Input
              label="Contrasena"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contrasena"
              required
            />

            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] rounded focus:ring-2 focus:ring-[#0066CC]"
                />
                <span className="text-[#666666]">Recordarme</span>
              </label>
              <span className="text-[#666666]">Demo local</span>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-6" disabled={submitting}>
              {submitting ? 'Iniciando...' : 'Iniciar Sesion'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-[#666666]">
            No tienes una cuenta?{' '}
            <Link to="/register" className="text-[#0066CC] hover:text-[#004A99] font-semibold transition-colors">
              Registrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
