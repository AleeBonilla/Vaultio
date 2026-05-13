import { BookOpen } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function RegisterPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/app";
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="w-10 h-10 bg-[#0066CC] rounded-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-2xl text-[#1a1a1a]">
              Vaultio
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">
            Crea tu cuenta
          </h1>
          <p className="text-[#666666]">
            Únete a miles de estudiantes
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E0E0E0] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nombre Completo"
              type="text"
              placeholder="Cristiano Ronaldo"
              required
            />
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu correoooo"
              required
            />
            <Input
              label="Carrera"
              type="text"
              placeholder="Ingeniería en Computación"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Crea una contraseña segura"
              required
            />

            <div className="flex items-start gap-2 text-sm pt-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] rounded focus:ring-2 focus:ring-[#0066CC] mt-0.5"
              />
              <span className="text-[#666666]">
                Acepto los{" "}
                <a
                  href="#"
                  className="text-[#0066CC] hover:text-[#004A99] font-medium transition-colors"
                >
                  Términos de Servicio
                </a>{" "}
                y la{" "}
                <a
                  href="#"
                  className="text-[#0066CC] hover:text-[#004A99] font-medium transition-colors"
                >
                  Política de Privacidad
                </a>
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
            >
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-[#666666]">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="text-[#0066CC] hover:text-[#004A99] font-semibold transition-colors"
            >
              Inicia Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}