import { BookOpen } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function LoginPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/app';
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
          <p className="text-[#666666]">Inicia sesión para acceder a tus recursos de estudio</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E0E0E0] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="Su correo bro"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa tu contraseña"
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
              <a href="#" className="text-[#0066CC] hover:text-[#004A99] font-medium transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-6">
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-[#666666]">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-[#0066CC] hover:text-[#004A99] font-semibold transition-colors">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
