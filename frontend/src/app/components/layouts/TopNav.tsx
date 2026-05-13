import { User } from 'lucide-react';
import { SearchBar } from '../ui/SearchBar';
import { Link } from 'react-router';

export function TopNav() {
  return (
    <header className="h-16 bg-white border-b border-[#E0E0E0] fixed top-0 left-0 right-0 z-10 lg:left-64">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        <SearchBar label="Buscar cursos, recursos o temas" className="flex-1 max-w-2xl" />

        <div className="flex items-center gap-2">
          <Link 
            to="/app/profile"
            className="flex items-center gap-2 px-3 py-2 hover:bg-[#F5F7FA] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2"
            aria-label="Abrir perfil de usuario"
          >
            <div className="w-8 h-8 bg-[#0066CC] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-[#1a1a1a]">Cristiano Ronaldo</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
