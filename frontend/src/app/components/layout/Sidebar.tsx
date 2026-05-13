import { Home, BookOpen, Upload, Bookmark, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/app' },
    { icon: BookOpen, label: 'Carreras', path: '/app/courses' },
    { icon: Upload, label: 'Subir', path: '/app/upload' },
    { icon: Bookmark, label: 'Guardados', path: '/app/saved' },
    { icon: User, label: 'Perfil', path: '/app/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden w-64 bg-white border-r border-[#E0E0E0] h-screen fixed left-0 top-0 lg:flex flex-col">
      <div className="p-6 border-b border-[#E0E0E0]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#0066CC] rounded-md flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-xl text-[#1a1a1a]">Vaultio</span>
        </Link>
      </div>

      <nav aria-label="Navegacion principal" className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2 ${
                  isActive(item.path)
                    ? 'bg-[#E3F2FD] text-[#0066CC] font-medium'
                    : 'text-[#666666] hover:bg-[#F5F7FA]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#E0E0E0]">
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-md text-[#666666] hover:bg-[#F5F7FA] w-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2">
          <LogOut aria-hidden="true" className="w-5 h-5" />
          <span>Cerrar Sesion</span>
        </button>
      </div>
    </aside>
  );
}
