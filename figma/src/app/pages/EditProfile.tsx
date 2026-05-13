import { ArrowLeft, Upload, User } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export function EditProfile() {
  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/app/profile"
        className="inline-flex items-center gap-2 text-[#0066CC] hover:text-[#004A99] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Perfil
      </Link>

      <div className="bg-white border border-[#E0E0E0] rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Editar Perfil</h1>
        <p className="text-[#666666] mb-8">Actualiza tu información personal</p>

        <div className="space-y-8">
          {/* Foto de Perfil */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-4">
              Foto de Perfil
            </label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#0066CC] to-[#004A99] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                CR
              </div>
              <div>
                <Button variant="secondary" className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4" />
                  Cambiar Foto
                </Button>
                <p className="text-xs text-[#666666]">JPG, PNG o GIF. Tamaño máximo 2MB</p>
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre Completo"
              placeholder="Cristiano Ronaldo"
              defaultValue="Cristiano Ronaldo"
              required
            />
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="cristiano.ronaldo@itcr.ac.cr"
              defaultValue="cristiano.ronaldo@itcr.ac.cr"
              required
            />
          </div>

          {/* Carrera */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Carrera
            </label>
            <select className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC] bg-white text-[#1a1a1a] transition-all">
              <option>Ingeniería en Computación</option>
              <option>Ingeniería Electrónica</option>
              <option>Administración de Empresas</option>
              <option>Ingeniería en Producción Industrial</option>
              <option>Ingeniería en Diseño Industrial</option>
              <option>Ingeniería en Construcción</option>
            </select>
          </div>

          {/* Biografía */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Biografía
            </label>
            <textarea
              className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC] resize-none"
              rows={4}
              placeholder="Cuéntanos un poco sobre ti..."
            />
            <p className="text-xs text-[#666666] mt-1">Máximo 200 caracteres</p>
          </div>

          {/* Notificaciones */}
          <div>
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Preferencias de Notificación</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] rounded focus:ring-[#0066CC]"
                />
                <span className="text-[#1a1a1a]">Notificarme cuando alguien comente en mis recursos</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] rounded focus:ring-[#0066CC]"
                />
                <span className="text-[#1a1a1a]">Notificarme sobre nuevos recursos en mis cursos</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] rounded focus:ring-[#0066CC]"
                />
                <span className="text-[#1a1a1a]">Recibir boletín semanal de recursos destacados</span>
              </label>
            </div>
          </div>

          {/* Privacidad */}
          <div>
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Configuración de Privacidad</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] rounded focus:ring-[#0066CC]"
                />
                <span className="text-[#1a1a1a]">Mostrar mi perfil públicamente</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] rounded focus:ring-[#0066CC]"
                />
                <span className="text-[#1a1a1a]">Permitir que otros estudiantes me contacten</span>
              </label>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-6 border-t border-[#E0E0E0]">
            <Link to="/app/profile" className="flex-1">
              <Button variant="secondary" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button variant="primary" className="flex-1">
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
