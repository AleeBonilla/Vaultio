import { User } from 'lucide-react';
import { SearchBar } from '../ui/SearchBar';
import { Link } from 'react-router';

export function TopNav() {
  return (
    <header className="h-16 bg-white border-b border-[#E0E0E0] fixed top-0 left-64 right-0 z-10">
      <div className="h-full px-8 flex items-center gap-4">
        <SearchBar className="flex-1 max-w-2xl" />

        <div className="flex items-center gap-2">
          <Link 
            to="/app/profile"
            className="flex items-center gap-2 px-3 py-2 hover:bg-[#F5F7FA] rounded-md transition-colors"
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