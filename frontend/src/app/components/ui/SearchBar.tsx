import { Search } from 'lucide-react';
import { InputHTMLAttributes, useId } from 'react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  large?: boolean;
  label?: string;
}

export function SearchBar({ large = false, className = '', label = 'Buscar', id, ...props }: SearchBarProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden="true"
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-[#999999] ${large ? 'w-5 h-5' : 'w-4 h-4'}`}
      />
      <input
        id={inputId}
        type="search"
        className={`w-full bg-white border border-[#E0E0E0] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:border-[#0066CC] transition-colors ${
          large ? 'pl-12 pr-4 py-3.5 text-lg' : 'pl-10 pr-4 py-2'
        }`}
        placeholder="Buscar cursos, recursos, temas..."
        {...props}
      />
    </div>
  );
}
