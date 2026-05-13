import { Search } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  large?: boolean;
}

export function SearchBar({ large = false, className = '', ...props }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-[#999999] ${large ? 'w-5 h-5' : 'w-4 h-4'}`}
      />
      <input
        type="search"
        className={`w-full bg-white border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC] transition-colors ${
          large ? 'pl-12 pr-4 py-3.5 text-lg' : 'pl-10 pr-4 py-2'
        }`}
        placeholder="Buscar cursos, recursos, temas..."
        {...props}
      />
    </div>
  );
}